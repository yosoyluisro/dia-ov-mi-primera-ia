// Cámara + MediaPipe HandLandmarker + normalización de features
import { FilesetResolver, HandLandmarker } from "/vendor/tasks-vision.mjs";

export const CLASSES = ["piedra", "papel", "tijera"];

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

let landmarker = null;

export async function loadLandmarker() {
  if (landmarker) return landmarker;
  const fileset = await FilesetResolver.forVisionTasks("/vendor/wasm");
  const opts = {
    baseOptions: {
      modelAssetPath: "/vendor/models/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };
  try {
    landmarker = await HandLandmarker.createFromOptions(fileset, opts);
  } catch (e) {
    console.warn("GPU no disponible, usando CPU", e);
    opts.baseOptions.delegate = "CPU";
    landmarker = await HandLandmarker.createFromOptions(fileset, opts);
  }
  return landmarker;
}

export async function startCamera(videos) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
  for (const v of videos) {
    if (!v) continue;
    v.srcObject = stream;
    await v.play().catch(() => {});
  }
  return stream;
}

let lastTs = -1;

export function detect(video) {
  if (!landmarker || !video || video.readyState < 2) return null;
  // Video en vivo exige timestamps crecientes
  const ts = performance.now();
  if (ts <= lastTs) return null;
  lastTs = ts;
  const res = landmarker.detectForVideo(video, ts);
  if (!res || !res.landmarks || !res.landmarks.length) return null;
  const hand = res.handedness?.[0]?.[0]?.categoryName || "Right";
  return { landmarks: res.landmarks[0], hand };
}

// 21 puntos -> 63 números: centrado en la muñeca y escalado por la palma
export function toFeatures(landmarks, hand) {
  const w = landmarks[0];
  const m = landmarks[9];
  const s = Math.hypot(m.x - w.x, m.y - w.y) || 1e-6;
  const out = new Float32Array(63);
  for (let i = 0; i < 21; i++) {
    let x = (landmarks[i].x - w.x) / s;
    const y = (landmarks[i].y - w.y) / s;
    const z = (landmarks[i].z - w.z) / s;
    if (hand === "Left") x = -x; // misma geometría para ambas manos
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

export function drawHand(canvas, landmarks) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (!landmarks) return;

  ctx.lineWidth = Math.max(2, W / 220);
  ctx.strokeStyle = "rgba(243,229,0,.95)";
  ctx.lineCap = "round";
  for (const [a, b] of CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(landmarks[a].x * W, landmarks[a].y * H);
    ctx.lineTo(landmarks[b].x * W, landmarks[b].y * H);
    ctx.stroke();
  }
  for (let i = 0; i < landmarks.length; i++) {
    const r = i === 0 ? W / 55 : W / 80;
    ctx.beginPath();
    ctx.arc(landmarks[i].x * W, landmarks[i].y * H, r, 0, Math.PI * 2);
    ctx.fillStyle = i % 4 === 0 ? "#00b8ac" : "#fff4d8";
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, W / 300);
    ctx.strokeStyle = "#172e2d";
    ctx.stroke();
  }
}
