import type { Shape } from "../types";
import { mulberry32 } from "../random";
import { LOGO_ACCENT_PATH, LOGO_OUTER_PATH, LOGO_VIEWBOX } from "./logo-paths";
import { pathTotalLength, sampleShapeFill, samplePathOutline } from "./svg-sample";

export type LogoShapeResult = {
  points: Shape;
  /** Parallel to `points` — true where the point was sampled from the
   *  brand-orange accent path, for sparing highlight coloring. */
  accentFlags: boolean[];
  /** Index pairs into `points`, used to draw the structural mesh tracing the
   *  logo's outline. */
  edges: [number, number][];
};

const OUTLINE_FRACTION = 0.72;
/** Never let the (much shorter) accent path vanish from the outline mix. */
const MIN_ACCENT_OUTLINE_FRACTION = 0.16;
const FILL_ACCENT_FRACTION = 0.22;
/** Rejects the rare edge that would otherwise jump across a gap between two
 *  disconnected subpaths (LOGO_OUTER_PATH is 3 subpaths) — real neighboring
 *  outline samples always land far closer than this in normalized space. */
const MAX_OUTLINE_EDGE_DIST = 0.15;

/** Connects each consecutive pair of outline samples (`offset..offset+count`)
 *  in arc-length order, wrapping the last point back to the first — so the
 *  mesh traces the sampled subpath(s) as a closed loop instead of a cloud of
 *  disconnected dots. Distance-filtered so a wrap/jump across an unrelated
 *  subpath boundary never draws a stray line clear across the shape. */
function connectOutlineRing(points: Shape, offset: number, count: number): [number, number][] {
  const edges: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const a = points[offset + i];
    const b = points[offset + ((i + 1) % count)];
    const dist = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    if (dist < MAX_OUTLINE_EDGE_DIST) edges.push([offset + i, offset + ((i + 1) % count)]);
  }
  return edges;
}

/**
 * Samples the real Logo.tsx paths into a normalized point cloud: most points
 * trace the outline of both paths (arc-length parameterized, weighted by
 * each path's own length so fine detail isn't under-sampled), the rest fill
 * the interior via rejection sampling for volumetric density — the same
 * shell/interior mix `buildSphereShape` uses for the hero sphere. Points are
 * centered and scaled to the same [-1, 1]-ish unit space every other shape
 * uses, preserving the logo's exact proportions and silhouette.
 */
export function buildLogoShape(count: number, seed: number): LogoShapeResult {
  const rand = mulberry32(seed);

  const outerLen = pathTotalLength(LOGO_OUTER_PATH);
  const accentLen = pathTotalLength(LOGO_ACCENT_PATH);

  const outlineCount = Math.round(count * OUTLINE_FRACTION);
  const fillCount = count - outlineCount;

  const accentOutlineFrac = Math.max(
    MIN_ACCENT_OUTLINE_FRACTION,
    accentLen / (accentLen + outerLen),
  );
  const accentOutlineCount = Math.round(outlineCount * accentOutlineFrac);
  const outerOutlineCount = outlineCount - accentOutlineCount;

  const fillAccentCount = Math.round(fillCount * FILL_ACCENT_FRACTION);
  const fillOuterCount = fillCount - fillAccentCount;

  const raw: { x: number; y: number; accent: boolean }[] = [];

  for (const p of samplePathOutline(LOGO_OUTER_PATH, outerOutlineCount, rand)) {
    raw.push({ ...p, accent: false });
  }
  for (const p of samplePathOutline(LOGO_ACCENT_PATH, accentOutlineCount, rand)) {
    raw.push({ ...p, accent: true });
  }

  const bbox = { x: 0, y: 0, width: LOGO_VIEWBOX.width, height: LOGO_VIEWBOX.height };
  for (const p of sampleShapeFill(LOGO_OUTER_PATH, fillOuterCount, bbox, rand)) {
    raw.push({ ...p, accent: false });
  }
  for (const p of sampleShapeFill(LOGO_ACCENT_PATH, fillAccentCount, bbox, rand)) {
    raw.push({ ...p, accent: true });
  }

  // Pad up to `count` if rejection sampling came up short (tiny paths/counts)
  // by recycling already-sampled points rather than leaving gaps.
  const sampled = raw.length;
  for (let i = 0; sampled > 0 && raw.length < count; i++) {
    raw.push(raw[i % sampled]);
  }

  const cx = LOGO_VIEWBOX.width / 2;
  const cy = LOGO_VIEWBOX.height / 2;
  const scale = 2 / Math.max(LOGO_VIEWBOX.width, LOGO_VIEWBOX.height);

  const points: Shape = [];
  const accentFlags: boolean[] = [];
  for (const p of raw) {
    points.push({
      x: (p.x - cx) * scale,
      y: (p.y - cy) * scale,
      z: (rand() - 0.5) * 0.18,
    });
    accentFlags.push(p.accent);
  }

  const edges = [
    ...connectOutlineRing(points, 0, outerOutlineCount),
    ...connectOutlineRing(points, outerOutlineCount, accentOutlineCount),
  ];

  return { points, accentFlags, edges };
}
