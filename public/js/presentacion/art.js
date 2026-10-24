/* Visuales por slide · lenguaje gráfico de ¡OV! Arcade Edition */

const HANDS = {
  rock: { src: "/assets/img/hands/piedra.svg", alt: "Piedra" },
  paper: { src: "/assets/img/hands/papel.svg", alt: "Papel" },
  scissors: { src: "/assets/img/hands/tijeras.svg", alt: "Tijeras" },
};

export function handSVG(kind = "paper", cls = "") {
  const h = HANDS[kind] || HANDS.paper;
  return `<img class="hand ${cls}" src="${h.src}" alt="${h.alt}" draggable="false">`;
}

const POINTS = [
  [85, 166],
  [17, 80], [19, 90], [21, 99], [23, 106],
  [45, 88], [44, 76], [43, 62], [42, 48],
  [74, 88], [73, 70], [72, 50], [71, 28],
  [98, 88], [98, 72], [97, 55], [96, 38],
  [122, 90], [125, 75], [127, 60], [129, 42],
];

function handPointsSVG() {
  const dots = POINTS.map(
    ([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="2.2" fill="#00b8ac" stroke="#172e2d" stroke-width="1.1"/>`
  ).join("");
  return `<span class="hand-points">
    ${handSVG("paper", "hand--points")}
    <svg class="points-layer" viewBox="0 0 160 180" aria-hidden="true">${dots}</svg>
  </span>`;
}

const faceSVG = `<svg class="face" viewBox="0 0 120 120" aria-hidden="true">
  <g fill="none" stroke="var(--hand-stroke,#172e2d)" stroke-width="5" stroke-linecap="round">
    <circle cx="60" cy="62" r="38" fill="var(--hand-fill,#fff4d8)"/>
    <path d="M24 52c8-22 64-22 72 0" fill="none"/>
    <circle cx="47" cy="62" r="2.6" fill="currentColor" stroke="none"/>
    <circle cx="73" cy="62" r="2.6" fill="currentColor" stroke="none"/>
    <path d="M50 77q10 8 20 0"/>
  </g>
</svg>`;

const doodle = (name) => {
  const paths = {
    star: `<path d="M20 3l4.4 10.8L36 14.4l-8.2 7.8 2.3 11.6L20 28l-10.1 5.8 2.3-11.6L4 14.4l11.6-.6z"/>`,
    bolt: `<path d="M23 3L8 23h9l-3 14 16-22h-9z"/>`,
    crown: `<path d="M6 30h28l-3-16-7 6-4-10-4 10-7-6z"/>`,
    smile: `<circle cx="20" cy="20" r="15"/><path d="M13 24q7 6 14 0" fill="none"/><circle cx="15" cy="16" r="1.4" fill="currentColor" stroke="none"/><circle cx="25" cy="16" r="1.4" fill="currentColor" stroke="none"/>`,
    asterisk: `<path d="M20 6v28M8 13l24 14M32 13L8 27"/>`,
  };
  return `<span class="doodle doodle--${name}"><svg viewBox="0 0 40 40" aria-hidden="true">${paths[name]}</svg></span>`;
};

const glyph = (name) => {
  const g = {
    chat: `<path d="M7 9h22v13H14l-7 6z"/>`,
    pin: `<path d="M17 4c-6 0-10 4.4-10 10 0 7.5 10 17 10 17s10-9.5 10-17c0-5.6-4-10-10-10z"/><circle cx="17" cy="14" r="3.4"/>`,
    camera: `<rect x="4" y="9" width="26" height="18" rx="4"/><circle cx="17" cy="18" r="5.5"/><path d="M12 9l2.4-3h5.2L22 9"/>`,
    music: `<path d="M13 24V7l14-3v17"/><circle cx="9" cy="24" r="4"/><circle cx="23" cy="21" r="4"/>`,
    game: `<rect x="3" y="11" width="28" height="14" rx="7"/><path d="M10 18h6M13 15v6"/><circle cx="23" cy="16" r="1.8" fill="currentColor" stroke="none"/><circle cx="26" cy="20" r="1.8" fill="currentColor" stroke="none"/>`,
    play: `<rect x="4" y="5" width="26" height="22" rx="5"/><path d="M15 12l7 4-7 4z" fill="currentColor" stroke="none"/>`,
    text: `<path d="M6 8h22M6 14h22M6 20h16M6 26h10"/>`,
    image: `<rect x="4" y="6" width="26" height="20" rx="3"/><circle cx="12" cy="13" r="2.4"/><path d="M6 24l7-8 5 5 4-3 4 6"/>`,
    video: `<rect x="3" y="7" width="20" height="18" rx="4"/><path d="M23 13l8-4v14l-8-4z"/>`,
  };
  return `<svg viewBox="0 0 34 34" aria-hidden="true">${g[name]}</svg>`;
};

const digits63 = Array.from({ length: 63 }, (_, i) => (i * 37 + 11) % 10);

const wallTiles = Array.from({ length: 30 }, (_, i) => {
  const kinds = ["text", "image", "video"];
  return `<span class="wall-tile wall-tile--${kinds[i % 3]}">${glyph(kinds[i % 3])}</span>`;
}).join("");

const clusterDots = (cx, cy, pts) =>
  pts.map(([x, y]) => `<circle cx="${cx + x}" cy="${cy + y}" r="8.5"/>`).join("");

const c1 = [[0, 0], [22, -18], [30, 12], [8, 26], [-16, 20], [-24, -8], [4, -30], [38, -2]];
const c2 = [[0, 0], [26, 16], [42, -6], [18, -20], [-8, -24], [-26, 4], [-6, 30], [30, 30]];
const c3 = [[0, 0], [20, -22], [34, 4], [10, 24], [-14, 18], [-22, -10], [2, -34], [38, 24]];

function aiChipSVG() {
  const nodes = [
    [78, 88, "var(--orange)"],
    [124, 66, "var(--teal)"],
    [168, 94, "var(--yellow)"],
    [98, 128, "var(--yellow)"],
    [144, 124, "var(--orange)"],
    [116, 166, "var(--teal)"],
    [170, 158, "var(--orange)"],
  ];
  const links = [[0,1],[1,2],[0,3],[1,4],[2,4],[3,5],[4,5],[4,6],[2,6],[3,4]];
  const lines = links
    .map(([a, b]) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}"/>`)
    .join("");
  const dots = nodes
    .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${c}"/>`)
    .join("");
  const pins = [
    [68, 14, 16, 18], [112, 14, 16, 18], [156, 14, 16, 18],
    [68, 208, 16, 18], [112, 208, 16, 18], [156, 208, 16, 18],
    [14, 68, 18, 16], [14, 112, 18, 16], [14, 156, 18, 16],
    [208, 68, 18, 16], [208, 112, 18, 16], [208, 156, 18, 16],
  ]
    .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>`)
    .join("");
  return `<svg viewBox="0 0 240 240" aria-hidden="true">
    <g fill="var(--yellow)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round">${pins}</g>
    <rect x="37" y="37" width="180" height="180" rx="26" fill="var(--ink)"/>
    <rect x="30" y="30" width="180" height="180" rx="26" fill="var(--cream)" stroke="var(--ink)" stroke-width="6"/>
    <g stroke="var(--ink)" stroke-width="3.6" stroke-linecap="round">${lines}</g>
    <g stroke="var(--ink)" stroke-width="2.6">${dots}</g>
  </svg>`;
}

function treeHTML() {
  return `<div class="art art-tree">
    <div class="tr-node tr-root">INTELIGENCIA ARTIFICIAL</div>
    <div class="tr-stem"></div>
    <div class="tr-node tr-ml">MACHINE LEARNING</div>
    <div class="tr-fork"><i></i><i></i><i></i></div>
    <div class="tr-branches">
      <div class="tr-branch">
        <div class="tr-card"><span class="tr-tag">CON ETIQUETA</span><b>SUPERVISADO</b></div>
      </div>
      <div class="tr-branch">
        <div class="tr-card"><span class="tr-tag tr-tag--teal">SIN ETIQUETA</span><b>NO SUPERVISADO</b></div>
      </div>
      <div class="tr-branch tr-branch--small">
        <div class="tr-card tr-card--ghost"><span class="tr-tag tr-tag--ghost">PRUEBA Y ERROR</span><b>REFUERZO</b><small>solo mención</small></div>
      </div>
    </div>
  </div>`;
}

export const ART = {
  cover: () => `<div class="art art-cover">
    ${doodle("star")}${doodle("bolt")}${doodle("crown")}${doodle("asterisk")}${doodle("smile")}
    <div class="ai-chip">${aiChipSVG()}</div>
  </div>`,

  apps: () => `<div class="art art-apps">
    <div class="apps-grid">
      <span class="app-tile" style="--r:-5deg;--c:var(--yellow)">${glyph("chat")}</span>
      <span class="app-tile" style="--r:3deg;--c:var(--teal)">${glyph("pin")}</span>
      <span class="app-tile" style="--r:-2deg;--c:var(--cream)">${glyph("camera")}</span>
      <span class="app-tile" style="--r:4deg;--c:var(--orange)">${glyph("music")}</span>
      <span class="app-tile" style="--r:-3deg;--c:var(--cream)">${glyph("game")}</span>
      <span class="app-tile" style="--r:2deg;--c:var(--yellow)">${glyph("play")}</span>
    </div>
    <span class="apps-q">?</span>
  </div>`,

  timeline: () => `<div class="art art-timeline">
    <div class="tl-stops">
      <div class="tl-stop"><b>1990</b><span class="tl-dot">${glyph("pin")}</span><i>GPS</i></div>
      <div class="tl-stop"><b>2007</b><span class="tl-dot">${glyph("text")}</span><i>AUTOCORRECTOR</i></div>
      <div class="tl-stop"><b>2011</b><span class="tl-dot">${glyph("chat")}</span><i>SIRI</i></div>
      <div class="tl-stop tl-stop--now"><b>2022</b><span class="tl-dot">${glyph("play")}</span><i>CHATGPT</i></div>
    </div>
    <span class="tl-sticker sticker">MÁS DE 30 AÑOS</span>
  </div>`,

  shift: () => `<div class="art art-shift">
    <div class="sh-card">
      <span class="sh-label">ANTES</span>
      <div class="sh-code">si <b>mano</b> = «piedra»<br>y rival = «tijera»<br>→ <b>ganas</b></div>
      <span class="sh-note">la regla la escribe el programador</span>
    </div>
    <div class="sh-arrow">↓</div>
    <div class="sh-card sh-card--after">
      <span class="sh-label sh-label--teal">AHORA</span>
      <div class="sh-mini">
        <span><i class="sh-dot"></i>${handSVG("rock", "hand--xs")}</span>
        <span><i class="sh-dot"></i>${handSVG("paper", "hand--xs")}</span>
        <span><i class="sh-dot"></i>${handSVG("scissors", "hand--xs")}</span>
      </div>
      <span class="sh-note">la regla la escriben los ejemplos</span>
    </div>
  </div>`,

  rulecard: () => `<div class="art art-rule">
    <div class="rule-card">
      <span class="sticker rule-sticker">REGLA</span>
      <div class="rule-line">
        ${handSVG("rock", "hand--md")}
        <b>VENCE A</b>
        ${handSVG("scissors", "hand--md")}
      </div>
      <div class="rule-code">piedra → tijera</div>
    </div>
    <div class="rule-row">
      <span class="rule-chip">${handSVG("rock", "hand--xs")}</span>
      <span class="rule-chip">${handSVG("paper", "hand--xs")}</span>
      <span class="rule-chip">${handSVG("scissors", "hand--xs")}</span>
    </div>
  </div>`,

  handpoints: () => `<div class="art art-points">
    ${handPointsSVG()}
    <span class="points-badge points-badge--a">21 PUNTOS</span>
    <span class="points-badge points-badge--b">63 NÚMEROS</span>
    <span class="points-q">¿DÓNDE DICE «PIEDRA»?</span>
  </div>`,

  dataset: () => `<div class="art art-data">
    <div class="data-stack">
      ${["rock", "paper", "scissors", "rock", "rock", "paper", "scissors", "paper"]
        .map(
          (k, i) =>
            `<span class="data-card" style="--r:${(i % 3) - 1}deg">${handSVG(k, "hand--xs")}<i class="data-tag"></i></span>`
        )
        .join("")}
    </div>
    <span class="data-count">8<span>por gesto</span></span>
    <span class="data-arrow">→</span>
    <span class="data-model">MODELO</span>
  </div>`,

  tree: treeHTML,

  labeled: () => `<div class="art art-labeled">
    <div class="lab-card">
      ${handSVG("rock", "hand--md")}
      <span class="a-tag">PIEDRA</span>
    </div>
    <div class="lab-card">
      ${faceSVG}
      <span class="a-tag a-tag--teal">ANA</span>
    </div>
    <span class="lab-note">alguien ya dijo qué es cada cosa</span>
  </div>`,

  clusters: () => `<div class="art art-clusters">
    <svg viewBox="0 0 560 340" aria-hidden="true">
      <g class="cl cl--a"><ellipse cx="140" cy="110" rx="88" ry="74"/>${clusterDots(140, 110, c1)}</g>
      <g class="cl cl--b"><ellipse cx="400" cy="100" rx="84" ry="70"/>${clusterDots(400, 100, c2)}</g>
      <g class="cl cl--c"><ellipse cx="280" cy="250" rx="92" ry="68"/>${clusterDots(280, 250, c3)}</g>
      <text x="140" y="122" class="cl-q">?</text>
      <text x="400" y="112" class="cl-q">?</text>
      <text x="280" y="262" class="cl-q">?</text>
    </svg>
    <span class="clusters-note">nadie puso etiquetas</span>
  </div>`,

  tag: () => `<div class="art art-tag">
    <div class="tag-strip">
      ${digits63.map((d) => `<span>${d}</span>`).join("")}
    </div>
    <span class="tag-big">PIEDRA</span>
    <span class="tag-pin"></span>
    <span class="tag-note">la etiqueta la pones tú</span>
  </div>`,

  wall: () => `<div class="art art-wall">
    <div class="wall-grid">${wallTiles}</div>
    <span class="wall-badge">∞</span>
    <span class="wall-note">texto · imagen · video</span>
  </div>`,

  triptych: () => `<div class="art art-triptych">
    <div class="tri-card"><span class="tri-ic">${glyph("text")}</span><b>TEXTO</b></div>
    <div class="tri-card tri-card--mid"><span class="tri-ic">${glyph("image")}</span><b>IMAGEN</b></div>
    <div class="tri-card"><span class="tri-ic">${glyph("video")}</span><b>VIDEO</b></div>
  </div>`,

  mirror: () => `<div class="art art-mirror">
    <div class="mir-panel">
      <span class="mir-label">LO QUE LE DIMOS</span>
      <div class="mir-grid">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
    </div>
    <div class="mir-line"></div>
    <div class="mir-panel mir-panel--out">
      <span class="mir-label mir-label--orange">LO QUE PRODUCE</span>
      <div class="mir-grid mir-grid--out">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
    </div>
  </div>`,

  hands: () => `<div class="art art-hands">
    <span class="close-token close-token--1">${handSVG("rock", "hand--md")}</span>
    <span class="close-token close-token--2">${handSVG("paper", "hand--md")}</span>
    <span class="close-token close-token--3">${handSVG("scissors", "hand--md")}</span>
    <span class="close-arrow">→</span>
    <span class="close-phone">${glyph("camera")}</span>
  </div>`,
};
