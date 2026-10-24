// Clasificador: vecinos más cercanos sobre landmarks normalizados
export const TAU = 0.08;
export const CONF_MIN = 0.55;
export const MARGIN_MIN = 0.015;

function rms(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s / a.length);
}

function centroid(vectors) {
  const c = new Float32Array(63);
  for (const v of vectors) for (let i = 0; i < 63; i++) c[i] += v[i];
  for (let i = 0; i < 63; i++) c[i] /= vectors.length;
  return c;
}

export function trainModel(samples, classes) {
  const centroids = {};
  const byClass = {};
  for (const c of classes) {
    const vs = samples.filter((s) => s.label === c).map((s) => s.v);
    if (!vs.length) continue;
    byClass[c] = vs;
    centroids[c] = centroid(vs);
  }
  return { classes: classes.filter((c) => centroids[c]), centroids, byClass, samples: samples.slice() };
}

export function predict(model, v, k = 3) {
  const ds = [];
  for (const c of model.classes) {
    const vs = model.byClass[c];
    const dists = vs.map((s) => rms(v, s)).sort((a, b) => a - b);
    const kk = Math.min(k, dists.length);
    let sum = 0;
    for (let i = 0; i < kk; i++) sum += dists[i];
    ds.push({ c, d: sum / kk });
  }
  ds.sort((a, b) => a.d - b.d);
  const best = ds[0];
  const second = ds[1] || { d: best.d + 1 };

  const exps = ds.map((x) => Math.exp(-x.d / TAU));
  const total = exps.reduce((a, b) => a + b, 0) || 1;
  const probs = ds.map((x, i) => ({ c: x.c, p: exps[i] / total }));

  return {
    label: best.c,
    confidence: probs[0].p,
    margin: second.d - best.d,
    probs,
    sure: probs[0].p >= CONF_MIN && second.d - best.d >= MARGIN_MIN,
  };
}

export function evaluate(model, evalSamples) {
  let ok = 0;
  const per = {};
  const wrong = [];
  for (const s of evalSamples) {
    const p = predict(model, s.v);
    const hit = p.sure && p.label === s.label;
    if (hit) ok++;
    per[s.label] = per[s.label] || { ok: 0, n: 0 };
    per[s.label].n++;
    if (hit) per[s.label].ok++;
    if (!hit) wrong.push({ expected: s.label, got: p.sure ? p.label : "?", conf: p.confidence });
  }
  return { ok, n: evalSamples.length, per, wrong, acc: evalSamples.length ? ok / evalSamples.length : 0 };
}

// Distancia entre centroides: sirve para avisar "esta seña se parece a..."
export function separability(model, label) {
  const c = model.centroids[label];
  if (!c) return [];
  return model.classes
    .filter((x) => x !== label)
    .map((x) => ({ label: x, d: rms(c, model.centroids[x]) }))
    .sort((a, b) => a.d - b.d);
}
