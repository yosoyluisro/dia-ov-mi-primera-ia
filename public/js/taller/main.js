import {
  CLASSES,
  loadLandmarker,
  startCamera,
  detect,
  toFeatures,
  drawHand,
} from "./vision.js";
import { trainModel, predict, evaluate } from "./classifier.js";
import { save, load, clear } from "./storage.js";
import { runTrainTheater } from "./theater.js";

/* ---------------- estado ---------------- */
const state = {
  screen: "home",
  samples: [],
  evalSamples: [],
  model: null,
  lm: null,
  lastSeen: 0,
  burst: null,
  busy: false,
  round: 1,
  you: 0,
  ai: 0,
};

const TARGET_TRAIN = 8;
const MIN_TRAIN = 6;
const TARGET_EVAL = 5;
const RULES = { piedra: "tijera", papel: "piedra", tijera: "papel" };
const EMOJI = { piedra: "✊", papel: "✋", tijera: "✌️" };

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- pantallas ---------------- */
const SCREENS = ["home", "capture", "train", "play", "eval"];
const STEP = { capture: 1, train: 2, play: 3, eval: 4 };

function show(name) {
  stopBurst();
  state.screen = name;
  for (const s of SCREENS) {
    const el = $("s-" + s);
    if (el) el.hidden = s !== name;
  }
  const step = STEP[name] || 0;
  document.querySelectorAll(".steps li").forEach((li) => {
    const n = Number(li.dataset.step);
    li.classList.toggle("on", n === step);
    li.classList.toggle("done", step > 0 && n < step);
  });
  window.scrollTo({ top: 0, behavior: "instant" });
}

/* ---------------- cámara ---------------- */
const PAIRS = {
  capture: ["video", "overlay"],
  play: ["video-play", "overlay-play"],
  eval: ["video-eval", "overlay-eval"],
};

function loop() {
  const pair = PAIRS[state.screen];
  if (pair) {
    const v = $(pair[0]);
    if (v && v.readyState >= 2) {
      const d = detect(v);
      state.lm = d;
      if (d) state.lastSeen = performance.now();
      const c = $(pair[1]);
      if (c && v.videoWidth && c.width !== v.videoWidth) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;
      }
      drawHand(c, d ? d.landmarks : null);
    }
  }
  requestAnimationFrame(loop);
}

function updateCamMsg() {
  const visible = !!state.lm;
  const idle = performance.now() - state.lastSeen > 600;
  const map = { capture: "cam-msg", play: "cam-msg-play", eval: "cam-msg-eval" };
  const el = $(map[state.screen] || "");
  if (!el) return;
  if (visible) el.hidden = true;
  else if (idle) {
    el.hidden = false;
    el.textContent = state.stream ? "Pon tu mano frente a la cámara" : "Cámara apagada";
  }
}
setInterval(updateCamMsg, 400);

/* ---------------- portada ---------------- */
async function onStart() {
  if (state.busy) return;
  state.busy = true;
  $("btn-start").disabled = true;
  try {
    state.stream = await startCamera([$("video"), $("video-play"), $("video-eval")]);
    try {
      await navigator.wakeLock?.request("screen");
    } catch {}
    show("capture");
    $("cap-hint").textContent = "Toca una etiqueta y mantén la seña.";
  } catch (e) {
    console.error(e);
    $("hint-load").textContent =
      "No pudimos abrir la cámara. Revisa el permiso del navegador y recarga.";
  } finally {
    state.busy = false;
    $("btn-start").disabled = false;
  }
}

/* ---------------- captura ---------------- */
function counts(kind) {
  const list = kind === "train" ? state.samples : state.evalSamples;
  const out = {};
  for (const c of CLASSES) out[c] = list.filter((s) => s.label === c).length;
  return out;
}

function paintCounts(kind) {
  const prefix = kind === "train" ? "labels" : "labels-eval";
  const target = kind === "train" ? TARGET_TRAIN : TARGET_EVAL;
  const c = counts(kind);
  $(prefix)
    ?.querySelectorAll(".label")
    .forEach((btn) => {
      const label = btn.dataset.label;
      btn.querySelector(".count").textContent = `${Math.min(c[label], target)}/${target}`;
      btn.classList.toggle("is-done", c[label] >= target);
    });
  if (kind === "train") {
    const ready = CLASSES.every((x) => c[x] >= MIN_TRAIN);
    $("btn-train").disabled = !ready;
  }
}

function stopBurst() {
  if (state.burst?.timer) clearInterval(state.burst.timer);
  if (state.burst) {
    document
      .querySelectorAll(".label.is-active")
      .forEach((el) => el.classList.remove("is-active"));
  }
  state.burst = null;
  document.querySelectorAll(".label").forEach((el) => (el.disabled = false));
}

function startBurst(kind, label, btn) {
  const target = kind === "train" ? TARGET_TRAIN : TARGET_EVAL;
  const list = kind === "train" ? state.samples : state.evalSamples;
  if (list.filter((s) => s.label === label).length >= target) return;

  if (state.burst && state.burst.kind === kind && state.burst.label === label) {
    stopBurst();
    return;
  }
  stopBurst();
  document.querySelectorAll(".label").forEach((el) => (el.disabled = true));
  btn.disabled = false;
  btn.classList.add("is-active");

  state.burst = { kind, label, target, timer: null };
  if (kind === "train") {
    $("cap-hint").textContent = `Capturando «${label}»… mantén la seña.`;
  }

  state.burst.timer = setInterval(() => {
    if (!state.lm) return;
    const f = toFeatures(state.lm.landmarks, state.lm.hand);
    list.push({ label, v: f });
    paintCounts(kind);
    const n = list.filter((s) => s.label === label).length;
    if (n >= target) {
      stopBurst();
      if (kind === "train") finishClass(label);
    }
  }, 420);
}

function finishClass(label) {
  const n = state.samples.filter((s) => s.label === label).length;
  if (n >= MIN_TRAIN) {
    $("cap-hint").textContent = `«${label}» listo (${n} fotos). Elige otra etiqueta.`;
  }
}

/* ---------------- entrenar ---------------- */
async function onTrain() {
  if (state.busy) return;
  state.busy = true;
  stopBurst();
  state.model = trainModel(state.samples, CLASSES);
  save({ samples: state.samples, model: state.model, evalSamples: state.evalSamples });
  show("train");
  await runTrainTheater({ sampleCount: state.samples.length });
  $("btn-play").hidden = false;
  state.busy = false;
}

/* ---------------- jugar ---------------- */
function setPlayMsg(t) {
  $("play-msg").textContent = t;
}

function setPick(text, cls, conf) {
  const el = $("pick-label");
  el.textContent = text;
  el.className = "pick " + (cls || "");
  $("conf-fill").style.width = Math.round((conf || 0) * 100) + "%";
}

async function countdown(el) {
  for (const n of ["3", "2", "1", "¡YA!"]) {
    el.hidden = false;
    el.textContent = n;
    await sleep(n === "¡YA!" ? 400 : 520);
  }
  el.hidden = true;
}

async function playRound() {
  if (state.busy) return;
  if (!state.model) {
    setPlayMsg("Primero entrena tu modelo.");
    return;
  }
  state.busy = true;
  window.__mpi && (window.__mpi.phase = "countdown");
  $("btn-round").disabled = true;
  setPick("—", "", 0);
  setPlayMsg("Muestra tu mano…");

  await countdown($("countdown"));
  window.__mpi && (window.__mpi.phase = "sampling");

  const votes = {};
  let best = null;
  await new Promise((resolve) => {
    const t0 = performance.now();
    const tick = () => {
      if (state.lm) {
        const p = predict(state.model, toFeatures(state.lm.landmarks, state.lm.hand));
        if (p.sure) {
          votes[p.label] = (votes[p.label] || 0) + 1;
          if (!best || p.confidence > best.confidence) best = p;
        }
      }
      if (performance.now() - t0 < 650) setTimeout(tick, 40);
      else resolve();
    };
    tick();
  });

  window.__mpi && (window.__mpi.phase = "branch");
  const aiPick = CLASSES[Math.floor(Math.random() * CLASSES.length)];

  if (!best || !Object.keys(votes).length) {
    setPick("no estoy seguro", "unsure", 0);
    setPlayMsg(`La IA eligió ${EMOJI[aiPick]} ${aiPick}. Acércate y repite la seña.`);
    state.busy = false;
    $("btn-round").disabled = false;
    return;
  }

  const human = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
  let result;
  if (human === aiPick) result = "tie";
  else if (RULES[human] === aiPick) result = "win";
  else result = "lose";

  if (result === "win") state.you++;
  if (result === "lose") state.ai++;
  state.round++;

  $("score-you").textContent = state.you;
  $("score-ai").textContent = state.ai;
  $("round").textContent = state.round;

  setPick(`${EMOJI[human]} ${human}`, result === "win" ? "win" : result === "lose" ? "lose" : "", best.confidence);

  const rival = `La IA eligió ${EMOJI[aiPick]} ${aiPick}. `;
  setPlayMsg(
    result === "win"
      ? rival + "¡Ganaste la ronda!"
      : result === "lose"
      ? rival + "La IA gana la ronda."
      : rival + "Empate: nadie suma."
  );

  state.busy = false;
  $("btn-round").disabled = false;
}

/* ---------------- evaluación ---------------- */
function paintAccuracy() {
  const total = CLASSES.reduce(
    (n, c) => n + state.evalSamples.filter((s) => s.label === c).length,
    0
  );
  const ready = CLASSES.every(
    (c) => state.evalSamples.filter((s) => s.label === c).length >= TARGET_EVAL
  );
  if (!ready || !state.model) {
    $("accuracy").hidden = true;
    return;
  }
  const r = evaluate(state.model, state.evalSamples);
  $("accuracy").hidden = false;
  $("acc-num").textContent = Math.round(r.acc * 100) + "%";
  $("acc-lbl").textContent = `${r.ok} de ${r.n} · ${total} fotos nuevas`;
  save({ samples: state.samples, model: state.model, evalSamples: state.evalSamples });
}

/* ---------------- reset ---------------- */
function resetAll() {
  stopBurst();
  clear();
  state.samples = [];
  state.evalSamples = [];
  state.model = null;
  state.you = 0;
  state.ai = 0;
  state.round = 1;
  $("score-you").textContent = "0";
  $("score-ai").textContent = "0";
  $("round").textContent = "1";
  $("btn-play").hidden = true;
  $("accuracy").hidden = true;
  paintCounts("train");
  paintCounts("eval");
  setPick("—", "", 0);
  show("home");
}

/* ---------------- arranque ---------------- */
function init() {
  show("home");
  paintCounts("train");
  paintCounts("eval");
  window.__mpi = { state, phase: "home" };
  requestAnimationFrame(loop);

  $("btn-start").addEventListener("click", onStart);
  $("btn-train").addEventListener("click", onTrain);
  $("btn-play").addEventListener("click", () => {
    show("play");
    setPlayMsg("Muestra tu mano y pulsa JUGAR RONDA.");
  });
  $("btn-round").addEventListener("click", playRound);
  $("btn-reset").addEventListener("click", resetAll);

  $("btn-eval").addEventListener("click", () => {
    show("eval");
    paintCounts("eval");
    paintAccuracy();
  });
  $("btn-eval-back").addEventListener("click", () => show("play"));

  for (const kind of ["train", "eval"]) {
    const box = $(kind === "train" ? "labels" : "labels-eval");
    box?.querySelectorAll(".label").forEach((btn) => {
      btn.addEventListener("click", () => startBurst(kind, btn.dataset.label, btn));
    });
  }

  // dataset previo (si recargan sin querer)
  const saved = load();
  if (saved?.samples?.length) {
    state.samples = saved.samples;
    state.evalSamples = saved.evalSamples || [];
    state.model = trainModel(state.samples, CLASSES);
    paintCounts("train");
    paintCounts("eval");
    $("cap-hint").textContent = "Recuperamos tus fotos anteriores. Puedes seguir capturando.";
  }

  loadLandmarker()
    .then(() => {
      $("hint-load").textContent = "Detector listo · funciona sin internet";
    })
    .catch((e) => {
      console.error(e);
      $("hint-load").textContent = "No se pudo cargar el detector. Recarga la página.";
    });
}

init();
