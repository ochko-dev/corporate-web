import type { ParticleAttrs, SceneBlend } from "./types";
import { clamp01, lerp, mulberry32, randomUnitVector, rotate } from "./random";
import { ACCENT_ORANGE, colorAt } from "./color";

export type MeshConfig = {
  /** Index pairs into the particle pool that get a thin structural line. */
  edges: [number, number][];
  /** Thicker, always-on links (e.g. sphere cluster backbones). */
  backboneEdges?: [number, number][];
  /** How many traveling "data packet" dots ride the mesh. Defaults to ~35%
   *  of the edge count. */
  packetCount?: number;
};

export type EngineOptions = {
  seed?: number;
  /** Particle indices to mark as the sparing brand-orange accent highlight.
   *  If omitted, a small random fraction is chosen instead. */
  accentIndices?: number[];
  mesh?: MeshConfig;
  /** Radians/second of auto-rotation. Volumetric shapes (a sphere) read fine
   *  spinning briskly — it reveals depth. A mostly-flat shape (the logo)
   *  needs to stay slow, or a normal viewing session accumulates enough
   *  rotation to periodically foreshorten it edge-on and read as a blob
   *  instead of a recognizable mark. Defaults to the sphere's original rate. */
  rotationSpeed?: number;
  /** Multiplies every particle's base dot size. A sparser pool (e.g. a small
   *  logo cluster) needs bigger dots than a dense one (the sphere) to read
   *  clearly at the same alpha. Defaults to 1. */
  sizeScale?: number;
};

type Packet = { edgeIndex: number; speed: number; phase: number; accent: boolean };

type Projected = { sx: number; sy: number; z: number; scale: number };

const BUCKETS = 6;
const CAM_DIST = 4.2;
const PITCH = 0.18;
const DEFAULT_ROTATION_SPEED = 0.045;

/**
 * Owns a fixed-size particle pool (static per-particle attributes assigned
 * once, never reallocated) and renders one frame at a time from a
 * `SceneBlend` description. Every consumer (Hero's sphere/chaos/drift scenes,
 * About's arrival/logo scenes, any future section) drives the same engine —
 * only the shapes and blend curve differ.
 */
export class ParticleEngine {
  readonly count: number;
  private attrs: ParticleAttrs[];
  private projected: Projected[];
  private mesh?: MeshConfig;
  private packets: Packet[];
  private rotationSpeed: number;

  constructor(count: number, options: EngineOptions = {}) {
    this.count = count;
    this.rotationSpeed = options.rotationSpeed ?? DEFAULT_ROTATION_SPEED;
    const sizeScale = options.sizeScale ?? 1;
    const rand = mulberry32(options.seed ?? 1);
    const accentSet = new Set(options.accentIndices ?? []);
    const useRandomAccent = !options.accentIndices;

    this.attrs = Array.from({ length: count }, (_, i) => ({
      size: (0.9 + rand() * 1.4) * sizeScale,
      density: 0.35 + rand() * 0.65,
      phase: rand() * Math.PI * 2,
      speed: 0.5 + rand() * 1.0,
      accent: accentSet.has(i) || (useRandomAccent && rand() < 0.012),
      chaosDir: randomUnitVector(rand),
      chaosMagnitude: 0.6 + rand() * 1.1,
      delay: rand() * 0.35,
    }));

    this.projected = Array.from({ length: count }, () => ({ sx: 0, sy: 0, z: 0, scale: 1 }));

    this.mesh = options.mesh;
    const edgeCount = options.mesh?.edges.length ?? 0;
    const packetCount = options.mesh?.packetCount ?? Math.round(edgeCount * 0.35);
    this.packets = Array.from({ length: edgeCount > 0 ? packetCount : 0 }, () => ({
      edgeIndex: Math.floor(rand() * edgeCount),
      speed: 0.1 + rand() * 0.2,
      phase: rand(),
      accent: rand() < 0.12,
    }));
  }

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    blend: SceneBlend,
    opts: { reduceMotion?: boolean; overscan?: number } = {},
  ) {
    const { shapeFrom, shapeTo, mix, chaosAmount, elapsed } = blend;
    const reduceMotion = opts.reduceMotion ?? false;
    // `width`/`height` are the (possibly overscanned) canvas pixel size, so
    // the sphere/logo/etc. render at the intended visual size relative to
    // the host box, not the inflated canvas — only the chaos/scatter shapes
    // are meant to use the extra overscanned room.
    const overscan = opts.overscan ?? 1;

    const cx = width / 2;
    const cy = height / 2;
    const R = (Math.min(width, height) / overscan) * 0.46;

    const yaw = reduceMotion ? 0 : elapsed * this.rotationSpeed;
    const breathe = reduceMotion
      ? 1
      : 1 + Math.sin(elapsed * 0.12) * 0.02 + Math.sin(elapsed * 0.037) * 0.015;

    for (let i = 0; i < this.count; i++) {
      const a = this.attrs[i];
      const from = shapeFrom[i % shapeFrom.length];
      const to = shapeTo[i % shapeTo.length];

      const localMix = clamp01((mix - a.delay) / Math.max(0.001, 1 - a.delay));

      let x = lerp(from.x, to.x, localMix);
      let y = lerp(from.y, to.y, localMix);
      let z = lerp(from.z, to.z, localMix);

      x += a.chaosDir.x * a.chaosMagnitude * chaosAmount * 0.9;
      y += a.chaosDir.y * a.chaosMagnitude * chaosAmount * 0.9;
      z += a.chaosDir.z * a.chaosMagnitude * chaosAmount * 0.6;

      if (!reduceMotion) {
        const idleAmp = 0.018 + 0.02 * chaosAmount;
        x += Math.sin(elapsed * 0.4 + a.phase) * idleAmp;
        y += Math.cos(elapsed * 0.33 + a.phase * 1.3) * idleAmp;
      }

      const rotated = rotate({ x, y, z }, yaw, PITCH);
      const factor = (CAM_DIST / (CAM_DIST - rotated.z)) * breathe;
      const p = this.projected[i];
      p.sx = cx + rotated.x * R * factor;
      p.sy = cy + rotated.y * R * factor;
      p.z = rotated.z;
      p.scale = factor;
    }

    const meshAlpha = blend.structureAlpha ?? clamp01(mix - chaosAmount * 0.8);
    if (this.mesh && meshAlpha > 0.01) this.drawMesh(ctx, meshAlpha);
    if (this.mesh && meshAlpha > 0.05) this.drawPackets(ctx, elapsed, reduceMotion);
    this.drawNodes(ctx);
  }

  private drawMesh(ctx: CanvasRenderingContext2D, alpha: number) {
    const mesh = this.mesh;
    if (!mesh) return;

    const bucketPaths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
    for (const [a, b] of mesh.edges) {
      const pa = this.projected[a];
      const pb = this.projected[b];
      const depthT = clamp01(((pa.z + pb.z) / 2 + 1) / 2);
      const bucket = Math.min(BUCKETS - 1, Math.floor(depthT * BUCKETS));
      bucketPaths[bucket].moveTo(pa.sx, pa.sy);
      bucketPaths[bucket].lineTo(pb.sx, pb.sy);
    }
    for (let i = 0; i < BUCKETS; i++) {
      const t = (i + 0.5) / BUCKETS;
      const [r, g, b] = colorAt(t);
      ctx.strokeStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      ctx.globalAlpha = (0.04 + t * 0.2) * alpha;
      ctx.lineWidth = 0.6;
      ctx.stroke(bucketPaths[i]);
    }

    if (mesh.backboneEdges?.length) {
      const backbonePath = new Path2D();
      for (const [a, b] of mesh.backboneEdges) {
        const pa = this.projected[a];
        const pb = this.projected[b];
        backbonePath.moveTo(pa.sx, pa.sy);
        backbonePath.lineTo(pb.sx, pb.sy);
      }
      ctx.strokeStyle = "rgba(155,225,232,0.55)";
      ctx.globalAlpha = 0.4 * alpha;
      ctx.lineWidth = 1.1;
      ctx.stroke(backbonePath);
    }
    ctx.globalAlpha = 1;
  }

  private drawPackets(ctx: CanvasRenderingContext2D, elapsed: number, reduceMotion: boolean) {
    const mesh = this.mesh;
    if (!mesh || this.packets.length === 0) return;

    for (const packet of this.packets) {
      const edge = mesh.edges[packet.edgeIndex];
      if (!edge) continue;
      const a = this.projected[edge[0]];
      const b = this.projected[edge[1]];
      const t = reduceMotion ? packet.phase : (packet.phase + elapsed * packet.speed) % 1;
      const px = a.sx + (b.sx - a.sx) * t;
      const py = a.sy + (b.sy - a.sy) * t;
      const depthT = clamp01(((a.z + b.z) / 2 + 1) / 2);

      ctx.beginPath();
      ctx.fillStyle = packet.accent ? ACCENT_ORANGE : "rgba(224,248,250,0.95)";
      ctx.globalAlpha = (packet.accent ? 0.5 : 0.25) + depthT * 0.55;
      ctx.arc(px, py, packet.accent ? 1.6 : 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawNodes(ctx: CanvasRenderingContext2D) {
    const order = this.attrs.map((_, i) => i).sort((i, j) => this.projected[i].z - this.projected[j].z);

    const buckets: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
    const bucketAlpha: number[] = Array.from({ length: BUCKETS }, () => 0);
    const accentPath = new Path2D();
    let accentAlpha = 0;

    for (const i of order) {
      const a = this.attrs[i];
      const p = this.projected[i];
      const depthT = clamp01((p.z + 1) / 2);
      const alpha = Math.min(1, (0.25 + depthT * 0.7) * (0.45 + a.density * 0.55));
      const radius = Math.max(0.4, a.size * p.scale * (0.5 + depthT * 0.6));

      if (a.accent) {
        accentPath.moveTo(p.sx + radius, p.sy);
        accentPath.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        accentAlpha = Math.max(accentAlpha, alpha);
        continue;
      }

      const bucket = Math.min(BUCKETS - 1, Math.floor(depthT * BUCKETS));
      buckets[bucket].moveTo(p.sx + radius, p.sy);
      buckets[bucket].arc(p.sx, p.sy, radius, 0, Math.PI * 2);
      bucketAlpha[bucket] = Math.max(bucketAlpha[bucket], alpha);
    }

    for (let i = 0; i < BUCKETS; i++) {
      const t = (i + 0.5) / BUCKETS;
      const [r, g, b] = colorAt(t);
      ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      ctx.globalAlpha = bucketAlpha[i] || 0.5;
      ctx.fill(buckets[i]);
    }

    ctx.fillStyle = ACCENT_ORANGE;
    ctx.globalAlpha = accentAlpha || 0.6;
    ctx.fill(accentPath);
    ctx.globalAlpha = 1;
  }
}
