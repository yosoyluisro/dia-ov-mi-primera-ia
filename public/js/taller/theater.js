// La escena del entrenamiento. El cálculo real ocurre en 50 ms; esto es el show.
const LINES = [
  "leyendo tus ejemplos…",
  "agrupando las 63 coordenadas…",
  "separando piedra, papel y tijera…",
  "comparando cada mano con tus fotos…",
  "ajustando la frontera entre gestos…",
  "revisando los casos difíciles…",
  "listo: ya reconoce tu mano",
];

export function runTrainTheater({ sampleCount = 24, duration = 8000 }) {
  const bar = document.getElementById("bar-fill");
  const epoch = document.getElementById("epoch");
  const log = document.getElementById("train-log");
  const neurons = document.getElementById("neurons");

  if (neurons && !neurons.childElementCount) {
    for (let i = 0; i < 14; i++) neurons.appendChild(document.createElement("i"));
  }
  if (log) log.innerHTML = "";
  if (bar) bar.style.width = "0%";

  const start = performance.now();
  let lineIdx = 0;

  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / duration);
      const pct = Math.round(t * 100);
      if (bar) bar.style.width = pct + "%";

      if (t < 0.2) {
        if (epoch) epoch.textContent = "Preparando ejemplos…";
      } else if (t < 0.85) {
        const ep = Math.min(10, 1 + Math.floor(((t - 0.2) / 0.65) * 10));
        if (epoch) epoch.textContent = `Época ${ep}/10 · pérdida ${(0.92 - ep * 0.072).toFixed(3)}`;
      } else {
        if (epoch) epoch.textContent = "Listo";
      }

      const want = Math.min(LINES.length, Math.floor(t * LINES.length) + 1);
      while (lineIdx < want) {
        const li = document.createElement("li");
        li.textContent = "› " + LINES[lineIdx];
        log?.appendChild(li);
        lineIdx++;
      }

      if (t >= 1) {
        clearInterval(timer);
        if (log) {
          const li = document.createElement("li");
          li.textContent = `› ${sampleCount} ejemplos · 3 etiquetas · 0 nubes`;
          log.appendChild(li);
        }
        setTimeout(resolve, 350);
      }
    }, 100);
  });
}
