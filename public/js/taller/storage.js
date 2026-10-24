// Persistencia local: nada sale del dispositivo
const KEY = "mpi.v1";
const EVAL_KEY = "mpi.eval.v1";

export function save({ samples, model, evalSamples }) {
  try {
    const data = {
      v: 1,
      samples: samples.map((s) => ({ label: s.label, v: Array.from(s.v) })),
      evalSamples: (evalSamples || []).map((s) => ({ label: s.label, v: Array.from(s.v) })),
      model: model
        ? {
            classes: model.classes,
            centroids: Object.fromEntries(
              Object.entries(model.centroids).map(([k, c]) => [k, Array.from(c)])
            ),
          }
        : null,
    };
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn("No se pudo guardar", e);
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== 1 || !Array.isArray(d.samples)) return null;
    return {
      samples: d.samples.map((s) => ({ label: s.label, v: Float32Array.from(s.v) })),
      evalSamples: (d.evalSamples || []).map((s) => ({ label: s.label, v: Float32Array.from(s.v) })),
    };
  } catch {
    return null;
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(EVAL_KEY);
  } catch {}
}
