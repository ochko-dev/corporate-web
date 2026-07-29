"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";

type Vec3 = { x: number; y: number; z: number };

type SphereNode = {
  base: Vec3;
  size: number;
  density: number;
  phase: number;
  speed: number;
  accent: boolean;
  /** Entrance: scatter position as a fraction of the canvas half-size.
   *  Values can exceed 1 — those particles start in "deep space", fully
   *  off-canvas, and fly into frame. */
  entryX: number;
  entryY: number;
  /** Pseudo camera depth of the scattered particle (0 = far background
   *  speck, 1 = big soft foreground bokeh). Only affects the chaos phase. */
  entryDepth: number;
  /** Streamers drift in loose directional currents (flowing information
   *  streams) instead of hovering in place. */
  streamer: boolean;
  streamVX: number;
  streamVY: number;
  /** Staggered activation + flight length, in normalized assembly
   *  progress (0-1), so particles launch and land in waves, not lockstep. */
  entryDelay: number;
  entryDuration: number;
  /** Curve bend direction/strength for the node's flight path. */
  entryBend: number;
};

type SphereEdge = {
  a: number;
  b: number;
  backbone: boolean;
  flicker: boolean;
  phase: number;
  cycle: number;
};

type Packet = { edge: number; t: number; speed: number; accent: boolean };

type Satellite = {
  u: Vec3;
  v: Vec3;
  r: number;
  speed: number;
  phase: number;
  size: number;
  accent: boolean;
};

const NODE_COUNT = 2200;
const CLUSTER_COUNT = 14;
const PACKET_COUNT = 140;
const SATELLITE_COUNT = 84;

/** The canvas is drawn this many times larger than its host element so the
 *  chaos phase can fill (roughly) the whole viewport, not just the sphere's
 *  box. The sphere itself still forms at the host element's size/center. */
const OVERSCAN = 3;

/** Full length of the chaos → intelligence sequence, in seconds. */
const ASSEMBLE_DURATION = 7.4;

/** Back-to-front lighting ramp: violet in the far depth, brand deep blue
 *  through the mid volume, brand cyan on the near face. */
const COLOR_STOPS: [number, number, number][] = [
  [109, 74, 255], // violet (deep back)
  [7, 93, 135], // deep blue — brand #075D87
  [22, 132, 158], // mid transition
  [47, 183, 195], // cyan (front) — brand #2FB7C3
];

const ACCENT_ORANGE = "rgb(255,127,26)"; // brand #FF7F1A, used sparingly

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function randomUnitVector(rand: () => number): Vec3 {
  const theta = rand() * Math.PI * 2;
  const z = rand() * 2 - 1;
  const r = Math.sqrt(1 - z * z);
  return { x: r * Math.cos(theta), y: r * Math.sin(theta), z };
}

/** Evenly spread points across the sphere so clusters don't clump by chance. */
function fibonacciSpherePoint(i: number, count: number): Vec3 {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / (count - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
}

function colorAt(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (COLOR_STOPS.length - 1);
  const i = Math.min(COLOR_STOPS.length - 2, Math.floor(scaled));
  const localT = scaled - i;
  const [r1, g1, b1] = COLOR_STOPS[i];
  const [r2, g2, b2] = COLOR_STOPS[i + 1];
  return [r1 + (r2 - r1) * localT, g1 + (g2 - g1) * localT, b1 + (b2 - b1) * localT];
}

function buildSphere(seed: number) {
  const rand = mulberry32(seed);

  const clusters = Array.from({ length: CLUSTER_COUNT }, (_, i) => {
    const lattice = fibonacciSpherePoint(i, CLUSTER_COUNT);
    const jitter = randomUnitVector(rand);
    const jitterAmount = 0.18;
    return {
      center: normalize({
        x: lattice.x + jitter.x * jitterAmount,
        y: lattice.y + jitter.y * jitterAmount,
        z: lattice.z + jitter.z * jitterAmount,
      }),
      radius: 0.16 + rand() * 0.22,
      weight: 0.5 + rand() * 0.5,
    };
  });

  // Three loose "currents" so streaming chaos particles drift in coherent
  // flows instead of pure noise.
  const streamAngles = [rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2];

  const nodes: SphereNode[] = [];
  const clusterHub: (number | null)[] = clusters.map(() => null);
  const clusterHubDensity: number[] = clusters.map(() => -Infinity);

  for (let i = 0; i < NODE_COUNT; i++) {
    let dir: Vec3;
    let density: number;
    let clusterIndex = -1;

    if (rand() < 0.26) {
      dir = randomUnitVector(rand);
      density = 0.15 + rand() * 0.2;
    } else {
      const totalWeight = clusters.reduce((sum, c) => sum + c.weight, 0);
      let pick = rand() * totalWeight;
      let cluster = clusters[0];
      clusterIndex = 0;
      for (let c = 0; c < clusters.length; c++) {
        pick -= clusters[c].weight;
        if (pick <= 0) {
          cluster = clusters[c];
          clusterIndex = c;
          break;
        }
      }
      const jitter = randomUnitVector(rand);
      const jitterSpread = cluster.radius * 1.9;
      const pull = 1 - cluster.radius * (0.6 + rand() * 0.5);
      dir = normalize({
        x: cluster.center.x * (1 + pull) + jitter.x * jitterSpread,
        y: cluster.center.y * (1 + pull) + jitter.y * jitterSpread,
        z: cluster.center.z * (1 + pull) + jitter.z * jitterSpread,
      });
      const dot =
        dir.x * cluster.center.x + dir.y * cluster.center.y + dir.z * cluster.center.z;
      density = Math.max(0.3, Math.min(1, dot)) * cluster.weight;
    }

    // Under half the nodes form the crisp outer shell; the rest fill the
    // interior at every depth so the sphere reads as a solid volume, never
    // a hollow shell.
    const isShell = rand() < 0.42;
    const radiusScale = isShell ? 0.94 + rand() * 0.06 : rand() * 0.92;
    const base: Vec3 = {
      x: dir.x * radiusScale,
      y: dir.y * radiusScale,
      z: dir.z * radiusScale,
    };

    const coreBoost = isShell ? 0 : 0.18 + (1 - radiusScale) * 0.32;
    density = Math.min(1, density + coreBoost);

    // ---- Entrance scatter ------------------------------------------------
    // ~1/3 of particles start in "deep space" — pushed out along the canvas'
    // rectangular boundary, fully off-screen, flying into frame later. The
    // rest are seeded anywhere across the whole (oversized) canvas: edges,
    // corners, top, bottom — but held out of the small central zone where
    // the sphere will form, so nothing looks like it spawned "from" it.
    let entryX: number;
    let entryY: number;
    if (rand() < 0.35) {
      const entryAngle = rand() * Math.PI * 2;
      const dx = Math.cos(entryAngle);
      const dy = Math.sin(entryAngle);
      const edgeDist = 1 / Math.max(Math.abs(dx), Math.abs(dy), 1e-6);
      const push = 1.12 + Math.pow(rand(), 1.6) * 1.4;
      entryX = dx * edgeDist * push;
      entryY = dy * edgeDist * push;
    } else {
      entryX = (rand() * 2 - 1) * 1.08;
      entryY = (rand() * 2 - 1) * 1.08;
      const d = Math.hypot(entryX, entryY);
      if (d < 0.38) {
        const s = (0.38 + rand() * 0.3) / (d || 1);
        entryX *= s;
        entryY *= s;
      }
    }

    // Pseudo camera depth for the chaos phase: background specks vs. big
    // soft foreground motes.
    const entryDepth = Math.pow(rand(), 1.4);

    // ~30% of scattered particles ride one of three slow currents, forming
    // visible information streams through the chaos.
    const streamer = rand() < 0.3;
    const streamAngle =
      streamAngles[i % streamAngles.length] + (rand() - 0.5) * 0.55;
    const streamMag = 0.05 + rand() * 0.09;

    // Guaranteed shared idle window (0 – 0.14) where everything just drifts,
    // unorganized, before the "intelligence field" starts pulling in waves.
    const entryDelay = 0.14 + rand() * 0.5;
    const entryDuration =
      0.18 + rand() * Math.max(0.08, 0.9 - entryDelay - 0.18);
    const entryBend = (rand() * 2 - 1) * 1.2;

    nodes.push({
      base,
      size: 0.9 + density * 1.3 + rand() * 0.5 + coreBoost * 0.7,
      density,
      phase: rand() * Math.PI * 2,
      speed: 0.6 + rand() * 1.1,
      accent: false,
      entryX,
      entryY,
      entryDepth,
      streamer,
      streamVX: Math.cos(streamAngle) * streamMag,
      streamVY: Math.sin(streamAngle) * streamMag,
      entryDelay,
      entryDuration,
      entryBend,
    });

    if (isShell && clusterIndex >= 0 && density > clusterHubDensity[clusterIndex]) {
      clusterHubDensity[clusterIndex] = density;
      clusterHub[clusterIndex] = nodes.length - 1;
    }
  }

  // One glowing "hub" accent per cluster keeps the orange highlight sparing.
  for (const hub of clusterHub) {
    if (hub !== null) nodes[hub].accent = true;
  }

  const edges: SphereEdge[] = [];
  const seen = new Set<string>();
  const maxDist = 0.46;

  for (let i = 0; i < nodes.length; i++) {
    const distances: { j: number; d: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dx = nodes[i].base.x - nodes[j].base.x;
      const dy = nodes[i].base.y - nodes[j].base.y;
      const dz = nodes[i].base.z - nodes[j].base.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < maxDist) distances.push({ j, d });
    }
    distances.sort((a, b) => a.d - b.d);
    for (const { j } of distances.slice(0, 2)) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({
          a: i,
          b: j,
          backbone: false,
          flicker: true,
          phase: rand() * Math.PI * 2,
          cycle: 0.1 + rand() * 0.3,
        });
      }
    }
  }

  for (let i = 0; i < clusters.length; i++) {
    const distances = clusters
      .map((c, j) => ({
        j,
        d:
          j === i
            ? Infinity
            : Math.hypot(
                c.center.x - clusters[i].center.x,
                c.center.y - clusters[i].center.y,
                c.center.z - clusters[i].center.z,
              ),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);

    for (const { j } of distances) {
      let bestA = 0;
      let bestB = 0;
      let bestD = Infinity;
      nodes.forEach((n, idx) => {
        const da = Math.hypot(
          n.base.x - clusters[i].center.x,
          n.base.y - clusters[i].center.y,
          n.base.z - clusters[i].center.z,
        );
        if (da < bestD) {
          bestD = da;
          bestA = idx;
        }
      });
      bestD = Infinity;
      nodes.forEach((n, idx) => {
        const db = Math.hypot(
          n.base.x - clusters[j].center.x,
          n.base.y - clusters[j].center.y,
          n.base.z - clusters[j].center.z,
        );
        if (db < bestD) {
          bestD = db;
          bestB = idx;
        }
      });
      const key = `hub-${Math.min(bestA, bestB)}-${Math.max(bestA, bestB)}`;
      if (!seen.has(key) && bestA !== bestB) {
        seen.add(key);
        edges.push({
          a: bestA,
          b: bestB,
          backbone: true,
          flicker: false,
          phase: 0,
          cycle: 0,
        });
      }
    }
  }

  const packets: Packet[] = Array.from({ length: PACKET_COUNT }, () => ({
    edge: Math.floor(rand() * edges.length),
    t: rand(),
    speed: 0.15 + rand() * 0.35,
    accent: rand() < 0.1,
  }));

  // Intelligent satellites: extra particles on tilted circular orbits just
  // outside the sphere. They fade in once the structure has formed.
  const satellites: Satellite[] = Array.from({ length: SATELLITE_COUNT }, () => {
    const normal = randomUnitVector(rand);
    const ref: Vec3 =
      Math.abs(normal.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
    const u = normalize(cross(normal, ref));
    const v = cross(normal, u);
    return {
      u,
      v,
      r: 1.08 + rand() * 0.34,
      speed: (0.1 + rand() * 0.28) * (rand() < 0.5 ? -1 : 1),
      phase: rand() * Math.PI * 2,
      size: 0.8 + rand() * 1.1,
      accent: rand() < 0.06,
    };
  });

  return { nodes, edges, packets, satellites };
}

function easeOutCubic(t: number): number {
  const u = 1 - t;
  return 1 - u * u * u;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

function wrapRange(v: number, min: number, max: number): number {
  const span = max - min;
  return ((((v - min) % span) + span) % span) + min;
}

function rotate(p: Vec3, yaw: number, pitch: number): Vec3 {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = p.x * cosY + p.z * sinY;
  const z1 = -p.x * sinY + p.z * cosY;

  const cosX = Math.cos(pitch);
  const sinX = Math.sin(pitch);
  const y2 = p.y * cosX - z1 * sinX;
  const z2 = p.y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

export function DataSphere({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const context = ctx2d;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { nodes, edges, packets, satellites } = buildSphere(11);

    let width = 0;
    let height = 0;
    // The canvas is OVERSCAN× the host box, so cap DPR a little lower to
    // keep the pixel budget sane.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function resize() {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width * OVERSCAN;
      height = rect.height * OVERSCAN;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let targetYaw = 0;
    let targetPitch = 0;
    let mouseYaw = 0;
    let mousePitch = 0;
    let autoYaw = 0;

    function handlePointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      targetYaw = dx * 0.9;
      targetPitch = dy * -0.5;
    }
    function handlePointerLeave() {
      targetYaw = 0;
      targetPitch = 0;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    const projected = nodes.map(() => ({
      x: 0,
      y: 0,
      z: 0,
      sx: 0,
      sy: 0,
      factor: 1,
      arrival: 1,
      entryScale: 1,
    }));
    const nodeHeat = new Float32Array(nodes.length);
    /** 1 while a particle is still loose (idle or mid-flight) this frame —
     *  only loose particles take part in the ephemeral chaos connections. */
    const freeFlag = new Uint8Array(nodes.length);

    /** Deterministic, closed-form idle drift so a particle's flight can
     *  start exactly where its drift left off — no position pop when the
     *  pull activates. Streamers ride a wrapping current; the rest hover. */
    function idleFraction(node: SphereNode, t: number) {
      let fx: number;
      let fy: number;
      if (node.streamer) {
        fx =
          wrapRange(node.entryX + node.streamVX * t, -1.3, 1.3) +
          Math.sin(t * 0.5 + node.phase) * 0.02;
        fy =
          wrapRange(node.entryY + node.streamVY * t, -1.3, 1.3) +
          Math.cos(t * 0.42 + node.phase * 1.4) * 0.02;
      } else {
        fx =
          node.entryX +
          Math.sin(t * 0.16 + node.phase) * 0.05 +
          Math.sin(t * 0.06 + node.phase * 2.1) * 0.025;
        fy =
          node.entryY +
          Math.cos(t * 0.13 + node.phase * 1.3) * 0.05 +
          Math.cos(t * 0.08 + node.phase * 0.6) * 0.025;
      }
      return { fx, fy };
    }

    // Start with the vignette fully relaxed so scattered particles reach the
    // canvas corners; it tightens into the circular mask as the sphere forms.
    const setMask = (inner: number, outer: number) => {
      const mask = `radial-gradient(circle at center, black 0%, black ${inner}%, transparent ${outer}%)`;
      canvas.style.maskImage = mask;
      
      canvas.style.webkitMaskImage = mask;
    };
    setMask(reduceMotion ? 33 : 90, reduceMotion ? 48 : 120);

    let raf = 0;
    let last = performance.now();
    const mountTime = last;

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const time = now / 1000;
      const elapsed = (now - mountTime) / 1000;

      // ---- Story clock ----------------------------------------------------
      // 0.00–0.14  chaos: everything drifts, unorganized
      // 0.14–0.9   waves of particles get "pulled" along curved flights
      // 0.58–0.92  mesh + backbone + packets fade in (organization)
      // 0.80–1.0   satellites wake up, vignette tightens, camera settles
      const assembleRaw = reduceMotion
        ? 1
        : Math.min(1, elapsed / ASSEMBLE_DURATION);
      const assembling = assembleRaw < 1;
      const assembleFade = reduceMotion
        ? 1
        : clamp01((assembleRaw - 0.58) / 0.3);
      const chaosLinkAlpha =
        reduceMotion || !assembling
          ? 0
          : 1 - clamp01((assembleRaw - 0.4) / 0.3);
      const satFade = reduceMotion ? 1 : clamp01((assembleRaw - 0.8) / 0.2);

      // One-time "ignition" swell as the sphere completes — a brief global
      // brightening that then decays (driven by elapsed time, so it ends).
      const swellCenter = ASSEMBLE_DURATION * 0.94;
      const swell = reduceMotion
        ? 0
        : Math.exp(-Math.pow((elapsed - swellCenter) / 0.5, 2));
      const alphaBoost = 1 + swell * 0.45;

      // Cinematic camera: slow dolly-in while the structure forms.
      const camT = easeInOutCubic(clamp01(assembleRaw / 0.9));
      const camDist = 4.5 - 1.1 * camT;

      const autoSpeed = reduceMotion ? 0.01 : 0.055 + swell * 0.12;
      autoYaw += autoSpeed * dt;
      mouseYaw += (targetYaw - mouseYaw) * 0.04;
      mousePitch += (targetPitch - mousePitch) * 0.04;

      const yaw = autoYaw + mouseYaw;
      const pitch = 0.18 + mousePitch;

      // ---- Motion blur ----------------------------------------------------
      // During chaos and flight, the previous frame is only partially erased,
      // leaving luminous streaks behind fast-moving particles. The trail
      // shortens to nothing as the sphere locks in, so the final structure
      // stays crisp.
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      let trail = 1;
      if (!reduceMotion && assembling) {
        trail = 0.3 + 0.7 * clamp01((assembleRaw - 0.8) / 0.2);
      }
      if (trail >= 0.999) {
        context.clearRect(0, 0, width, height);
      } else {
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = `rgba(0,0,0,${trail})`;
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = "source-over";
      }

      const cx = width / 2;
      const cy = height / 2;
      const breathe = reduceMotion
        ? 1
        : 1 + Math.sin(time * 0.12) * 0.02 + Math.sin(time * 0.037) * 0.015;
      const R =
        (Math.min(width, height) / OVERSCAN) *
        0.46 *
        breathe *
        (0.88 + 0.12 * camT) *
        (1 + swell * 0.03);

      // Soft core light behind the assembled sphere.
      if (assembleFade > 0.01) {
        const glow = context.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.6);
        glow.addColorStop(0, `rgba(14,127,176,${0.1 * assembleFade})`);
        glow.addColorStop(0.6, `rgba(47,183,195,${0.04 * assembleFade})`);
        glow.addColorStop(1, "rgba(47,183,195,0)");
        context.globalAlpha = 1;
        context.fillStyle = glow;
        context.fillRect(cx - R * 1.6, cy - R * 1.6, R * 3.2, R * 3.2);
      }

      nodeHeat.fill(0);

      // ---- Project every node: idle drift → curved flight → sphere --------
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const rotated = rotate(node.base, yaw, pitch);
        const factor = camDist / (camDist - rotated.z);
        const targetSx = cx + rotated.x * R * factor;
        const targetSy = cy + rotated.y * R * factor;

        projected[i].x = rotated.x;
        projected[i].y = rotated.y;
        projected[i].z = rotated.z;
        projected[i].factor = factor;

        if (!assembling) {
          projected[i].sx = targetSx;
          projected[i].sy = targetSy;
          projected[i].arrival = 1;
          projected[i].entryScale = 1;
          freeFlag[i] = 0;
          continue;
        }

        const idleScale = 0.35 + node.entryDepth * 1.05;
        const idleAlpha = 0.16 + node.entryDepth * 0.14;

        if (assembleRaw < node.entryDelay) {
          // Chaos: raw, dim, independent data drifting across the whole
          // scene — nothing has pulled it yet.
          const { fx, fy } = idleFraction(node, elapsed);
          projected[i].sx = cx + fx * (width / 2);
          projected[i].sy = cy + fy * (height / 2);
          projected[i].arrival = idleAlpha;
          projected[i].entryScale = idleScale;
          freeFlag[i] = 1;
          continue;
        }

        // Pulled: the intelligence field has activated for this particle —
        // fly from wherever its drift left it toward its live spot on the
        // forming, already-rotating sphere, along a curved path with organic
        // wobble that settles out as it arrives and organizes.
        const p = clamp01((assembleRaw - node.entryDelay) / node.entryDuration);
        const eased = easeOutCubic(p);

        const start = idleFraction(node, node.entryDelay * ASSEMBLE_DURATION);
        const startSx = cx + start.fx * (width / 2);
        const startSy = cy + start.fy * (height / 2);

        const dx = targetSx - startSx;
        const dy = targetSy - startSy;
        const dist = Math.hypot(dx, dy) || 1;
        const bend = node.entryBend * dist * 0.35;
        const ctrlSx = (startSx + targetSx) / 2 - (dy / dist) * bend;
        const ctrlSy = (startSy + targetSy) / 2 + (dx / dist) * bend;

        const u = 1 - eased;
        let sx = u * u * startSx + 2 * u * eased * ctrlSx + eased * eased * targetSx;
        let sy = u * u * startSy + 2 * u * eased * ctrlSy + eased * eased * targetSy;

        if (!reduceMotion) {
          const jitterAmp = (1 - eased) * R * 0.06;
          sx += Math.sin(time * 2.6 + node.phase) * jitterAmp;
          sy += Math.cos(time * 2.1 + node.phase * 1.7) * jitterAmp;
        }

        projected[i].sx = sx;
        projected[i].sy = sy;
        projected[i].arrival = idleAlpha + (1 - idleAlpha) * Math.min(1, p / 0.6);
        projected[i].entryScale = idleScale + (1 - idleScale) * eased;
        freeFlag[i] = p < 0.8 ? 1 : 0;

        // Brief flash as the particle snaps into the structure.
        if (p > 0.7) {
          const flash = Math.sin(((p - 0.7) / 0.3) * Math.PI) * 0.85;
          if (flash > nodeHeat[i]) nodeHeat[i] = flash;
        }
      }

      // ---- Ephemeral chaos connections ------------------------------------
      // Short-lived links flicker between nearby loose particles — hints of
      // structure appearing and dissolving in the chaos, cross-fading into
      // the real mesh as the sphere organizes.
      if (chaosLinkAlpha > 0.01) {
        const cell = Math.max(48, width * 0.045);
        const linkR = cell * 0.92;
        const linkR2 = linkR * linkR;
        const grid = new Map<number, number[]>();
        const margin = 60;

        for (let i = 0; i < nodes.length; i += 2) {
          if (!freeFlag[i]) continue;
          const p = projected[i];
          if (
            p.sx < -margin ||
            p.sx > width + margin ||
            p.sy < -margin ||
            p.sy > height + margin
          )
            continue;
          const gx = Math.floor((p.sx + margin) / cell);
          const gy = Math.floor((p.sy + margin) / cell);
          const key = gx + gy * 2048;
          const bucket = grid.get(key);
          if (bucket) bucket.push(i);
          else grid.set(key, [i]);
        }

        const linkPath = new Path2D();
        let linkCount = 0;

        outer: for (const [key, indices] of grid) {
          const gx = key % 2048;
          const gy = (key / 2048) | 0;
          for (const i of indices) {
            const a = projected[i];
            for (let ox = 0; ox <= 1; ox++) {
              for (let oy = ox === 0 ? 0 : -1; oy <= 1; oy++) {
                const neighbors = grid.get(gx + ox + (gy + oy) * 2048);
                if (!neighbors) continue;
                for (const j of neighbors) {
                  if (j <= i) continue;
                  const b = projected[j];
                  const dx = a.sx - b.sx;
                  const dy = a.sy - b.sy;
                  if (dx * dx + dy * dy > linkR2) continue;
                  // Deterministic per-pair flicker so links blink in and out.
                  const h = ((i * 2654435761) ^ (j * 40503)) >>> 0;
                  const fl =
                    0.5 +
                    0.5 *
                      Math.sin(time * (0.8 + (h % 100) / 60) + (h % 628) / 100);
                  if (fl < 0.45) continue;
                  linkPath.moveTo(a.sx, a.sy);
                  linkPath.lineTo(b.sx, b.sy);
                  if (++linkCount > 700) break outer;
                }
              }
            }
          }
        }

        context.strokeStyle = "rgb(120,200,215)";
        context.globalAlpha = 0.13 * chaosLinkAlpha;
        context.lineWidth = 0.6;
        context.stroke(linkPath);
      }

      // ---- Mesh edges, bucketed by depth for batched strokes ---------------
      const BUCKETS = 6;
      if (assembleFade > 0.005) {
        const bucketPaths: Path2D[] = Array.from(
          { length: BUCKETS },
          () => new Path2D(),
        );
        const backbonePath = new Path2D();

        for (const edge of edges) {
          const a = projected[edge.a];
          const b = projected[edge.b];
          const depth = (a.z + b.z) / 2;
          const depthT = clamp01((depth + 1) / 2);

          if (edge.backbone) {
            backbonePath.moveTo(a.sx, a.sy);
            backbonePath.lineTo(b.sx, b.sy);
            continue;
          }

          if (edge.flicker && !reduceMotion) {
            const activity = 0.5 + 0.5 * Math.sin(time * edge.cycle + edge.phase);
            if (activity < 0.35) continue;
          }

          const bucket = Math.min(BUCKETS - 1, Math.floor(depthT * BUCKETS));
          bucketPaths[bucket].moveTo(a.sx, a.sy);
          bucketPaths[bucket].lineTo(b.sx, b.sy);
        }

        for (let i = 0; i < BUCKETS; i++) {
          const t = (i + 0.5) / BUCKETS;
          const [r, g, b] = colorAt(t);
          context.strokeStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
          context.globalAlpha = (0.04 + t * 0.22) * assembleFade;
          context.lineWidth = 0.6;
          context.stroke(bucketPaths[i]);
        }

        context.strokeStyle = "rgba(155,225,232,0.55)";
        context.globalAlpha = 0.4 * assembleFade;
        context.lineWidth = 1.1;
        context.stroke(backbonePath);
      }

      // ---- Satellites (computed once, drawn split by depth) ----------------
      type SatPoint = {
        sx: number;
        sy: number;
        px: number;
        py: number;
        z: number;
        radius: number;
        accent: boolean;
      };
      const satBack: SatPoint[] = [];
      const satFront: SatPoint[] = [];
      if (satFade > 0.01) {
        for (const sat of satellites) {
          const theta = sat.phase + time * sat.speed;
          const prev = theta - sat.speed * 0.12;
          const pos: Vec3 = {
            x: (sat.u.x * Math.cos(theta) + sat.v.x * Math.sin(theta)) * sat.r,
            y: (sat.u.y * Math.cos(theta) + sat.v.y * Math.sin(theta)) * sat.r,
            z: (sat.u.z * Math.cos(theta) + sat.v.z * Math.sin(theta)) * sat.r,
          };
          const posPrev: Vec3 = {
            x: (sat.u.x * Math.cos(prev) + sat.v.x * Math.sin(prev)) * sat.r,
            y: (sat.u.y * Math.cos(prev) + sat.v.y * Math.sin(prev)) * sat.r,
            z: (sat.u.z * Math.cos(prev) + sat.v.z * Math.sin(prev)) * sat.r,
          };
          const rot = rotate(pos, yaw, pitch);
          const rotPrev = rotate(posPrev, yaw, pitch);
          const factor = camDist / (camDist - rot.z);
          const factorPrev = camDist / (camDist - rotPrev.z);
          const point: SatPoint = {
            sx: cx + rot.x * R * factor,
            sy: cy + rot.y * R * factor,
            px: cx + rotPrev.x * R * factorPrev,
            py: cy + rotPrev.y * R * factorPrev,
            z: rot.z,
            radius: Math.max(0.5, sat.size * factor * 0.8),
            accent: sat.accent,
          };
          (rot.z < 0 ? satBack : satFront).push(point);
        }
      }

      const drawSatellites = (points: SatPoint[]) => {
        for (const s of points) {
          const depthT = clamp01((s.z + 1) / 2);
          const alpha = (0.2 + depthT * 0.55) * satFade;
          // Short comet tail along the orbit.
          context.strokeStyle = s.accent ? ACCENT_ORANGE : "rgb(150,224,232)";
          context.globalAlpha = alpha * 0.35;
          context.lineWidth = s.radius * 0.9;
          context.beginPath();
          context.moveTo(s.px, s.py);
          context.lineTo(s.sx, s.sy);
          context.stroke();
          context.fillStyle = s.accent ? ACCENT_ORANGE : "rgba(214,246,250,0.95)";
          context.globalAlpha = alpha;
          context.beginPath();
          context.arc(s.sx, s.sy, s.radius, 0, Math.PI * 2);
          context.fill();
        }
      };

      drawSatellites(satBack);

      // ---- Streaming data packets ------------------------------------------
      context.globalAlpha = 1;
      if (assembleFade > 0.005) {
        for (const packet of packets) {
          if (!reduceMotion) {
            packet.t += packet.speed * dt;
            if (packet.t > 1) {
              packet.t = 0;
              packet.edge = Math.floor(Math.random() * edges.length);
            }
          }
          const edge = edges[packet.edge];
          if (!edge) continue;
          const a = projected[edge.a];
          const b = projected[edge.b];
          const px = a.sx + (b.sx - a.sx) * packet.t;
          const py = a.sy + (b.sy - a.sy) * packet.t;
          const depthT = clamp01(((a.z + b.z) / 2 + 1) / 2);
          context.beginPath();
          context.fillStyle = packet.accent ? ACCENT_ORANGE : "rgba(224,248,250,0.95)";
          context.globalAlpha =
            ((packet.accent ? 0.5 : 0.25) + depthT * 0.55) * assembleFade;
          context.arc(px, py, packet.accent ? 1.6 : 1.3, 0, Math.PI * 2);
          context.fill();

          if (packet.t > 0.82) {
            const received = (packet.t - 0.82) / 0.18;
            nodeHeat[edge.b] = Math.max(nodeHeat[edge.b], received);
          } else if (packet.t < 0.18) {
            const sent = 1 - packet.t / 0.18;
            nodeHeat[edge.a] = Math.max(nodeHeat[edge.a], sent * 0.7);
          }
        }
      }

      // ---- Nodes, back to front, bucketed by depth --------------------------
      const order = nodes
        .map((_, i) => i)
        .sort((i, j) => projected[i].z - projected[j].z);

      const nodeBuckets: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      const nodeBucketMeta: { alpha: number; t: number }[] = Array.from(
        { length: BUCKETS },
        () => ({ alpha: 0, t: 0 }),
      );
      const accentPath = new Path2D();
      let accentAlpha = 0;

      const hotPath = new Path2D();
      let hotAlpha = 0;

      for (const i of order) {
        const node = nodes[i];
        const p = projected[i];
        const depthT = clamp01((p.z + 1) / 2);
        const heat = nodeHeat[i];
        const pulse = reduceMotion
          ? 0.75
          : 0.55 + 0.45 * Math.sin(time * node.speed + node.phase);
        const alpha = Math.min(
          1,
          (0.2 + depthT * 0.7) *
            (0.4 + node.density * 0.6) *
            pulse *
            p.arrival *
            alphaBoost,
        );
        const radius =
          Math.max(0.4, node.size * p.factor * (0.5 + depthT * 0.6) * (1 + heat * 0.5)) *
          p.entryScale;

        if (heat > 0.08) {
          const hotRadius = radius * (1.4 + heat * 0.8);
          hotPath.moveTo(p.sx + hotRadius, p.sy);
          hotPath.arc(p.sx, p.sy, hotRadius, 0, Math.PI * 2);
          hotAlpha = Math.max(hotAlpha, heat);
        }

        if (node.accent) {
          accentPath.moveTo(p.sx + radius, p.sy);
          accentPath.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
          accentAlpha = Math.max(accentAlpha, alpha);
          continue;
        }

        const bucket = Math.min(BUCKETS - 1, Math.floor(depthT * BUCKETS));
        const path = nodeBuckets[bucket];
        path.moveTo(p.sx + radius, p.sy);
        path.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        nodeBucketMeta[bucket].alpha = Math.max(nodeBucketMeta[bucket].alpha, alpha);
        nodeBucketMeta[bucket].t = depthT;
      }

      for (let i = 0; i < BUCKETS; i++) {
        const t = (i + 0.5) / BUCKETS;
        const [r, g, b] = colorAt(t);
        context.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        context.globalAlpha = nodeBucketMeta[i].alpha || 0.5;
        context.fill(nodeBuckets[i]);
      }

      context.fillStyle = ACCENT_ORANGE;
      context.globalAlpha = accentAlpha || 0.6;
      context.fill(accentPath);

      context.fillStyle = "rgba(226,250,255,0.95)";
      context.globalAlpha = Math.min(1, hotAlpha * 0.85 * alphaBoost);
      context.fill(hotPath);
      context.globalAlpha = 1;

      drawSatellites(satFront);

      // ---- Vignette ---------------------------------------------------------
      // Relaxed to (almost) the full canvas during chaos so scattered
      // particles reach the corners, then tightens into the circular mask as
      // the sphere finishes forming. Percentages are relative to the
      // oversized canvas, so the resting values are the original 66/96
      // divided by OVERSCAN.
      const maskT = assembling ? clamp01((assembleRaw - 0.62) / 0.32) : 1;
      setMask(33 + (1 - maskT) * 57, 48 + (1 - maskT) * 72);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-visible",
        className,
      )}
    >
      {/* Oversized canvas: the sphere forms at the host box's center/size,
          while the chaos phase spills far beyond it toward the viewport
          edges. The Hero section's overflow-hidden crops it cleanly. */}
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${OVERSCAN * 100}%`, height: `${OVERSCAN * 100}%` }}
      />
    </div>
  );
}