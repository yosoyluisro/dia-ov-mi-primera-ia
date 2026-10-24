import { SLIDES } from "./slides.js";

const stage = document.getElementById("stage");
const notes = document.getElementById("notes");
const progress = document.getElementById("progress");
const cur = document.getElementById("cur");

document.getElementById("total").textContent = SLIDES.length;

let idx = Number(sessionStorage.getItem("mpi.slide") || 0);
if (!Number.isFinite(idx)) idx = 0;
idx = Math.max(0, Math.min(idx, SLIDES.length - 1));

const tallerURL = location.origin + "/taller";

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

function build(slide, i) {
  const sec = el("section", "slide");
  sec.dataset.i = i;

  sec.appendChild(el("p", "slide-kicker", slide.kicker));

  const mid = el("div", "slide-mid");
  mid.appendChild(el("h1", "slide-title", slide.title));
  mid.appendChild(el("p", "slide-body", slide.body));
  sec.appendChild(mid);

  const foot = el("div", "slide-foot");
  if (slide.demo) {
    const a = el("a", "btn slide-demo", slide.demoLabel || "PROBARLO");
    a.href = "/taller";
    a.addEventListener("click", () => sessionStorage.setItem("mpi.slide", String(i)));
    foot.appendChild(a);
  } else {
    foot.appendChild(el("span"));
  }

  if (slide.qr) {
    const box = el("div", "qrbox");
    const img = el("img");
    img.src = "/assets/img/qr.png";
    img.alt = "Código QR al taller";
    img.width = 150;
    img.height = 150;
    box.appendChild(img);
    box.appendChild(
      el("div", "qrtext", `<b>Entra al taller</b><span>${tallerURL.replace("https://", "")}</span>`)
    );
    foot.appendChild(box);
  } else {
    foot.appendChild(el("span"));
  }

  sec.appendChild(foot);
  return sec;
}

SLIDES.forEach((s, i) => stage.appendChild(build(s, i)));

function show(i) {
  idx = (i + SLIDES.length) % SLIDES.length;
  document.querySelectorAll(".slide").forEach((s) => s.classList.toggle("on", Number(s.dataset.i) === idx));
  cur.textContent = idx + 1;
  progress.style.width = ((idx + 1) / SLIDES.length) * 100 + "%";
  notes.textContent = SLIDES[idx].note || "";
  sessionStorage.setItem("mpi.slide", String(idx));
}

document.addEventListener("keydown", (e) => {
  if (["ArrowRight", "PageDown", " "].includes(e.key)) {
    e.preventDefault();
    show(idx + 1);
  } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
    e.preventDefault();
    show(idx - 1);
  } else if (e.key === "Home") {
    show(0);
  } else if (e.key === "End") {
    show(SLIDES.length - 1);
  } else if (e.key.toLowerCase() === "n") {
    notes.hidden = !notes.hidden;
  } else if (e.key.toLowerCase() === "p") {
    window.print();
  } else if (e.key === "Escape") {
    notes.hidden = true;
  }
});

// clic en la mitad derecha / izquierda (útil con control remoto de presentaciones)
stage.addEventListener("click", (e) => {
  if (e.target.closest("a,button")) return;
  show(e.clientX > window.innerWidth * 0.5 ? idx + 1 : idx - 1);
});

show(idx);
