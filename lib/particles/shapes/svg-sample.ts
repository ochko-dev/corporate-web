const SVG_NS = "http://www.w3.org/2000/svg";

/** SVGPathElement geometry methods (getTotalLength/getPointAtLength) work on
 *  a path that's never been attached to the document — no DOM insertion or
 *  layout pass needed, just the path's own `d` data. */
function createPathElement(d: string): SVGPathElement {
  const el = document.createElementNS(SVG_NS, "path");
  el.setAttribute("d", d);
  return el;
}

export type Point2D = { x: number; y: number };

/** Uniformly-spaced points along a path's outline (arc-length parameterized,
 *  not just evenly spaced in `t`, so dense curve segments aren't
 *  under-sampled relative to straight ones). A small jitter along the
 *  parameter keeps the result from looking like a perfectly even dashed
 *  line. */
export function samplePathOutline(d: string, count: number, rand: () => number): Point2D[] {
  if (count <= 0) return [];
  const el = createPathElement(d);
  const total = el.getTotalLength();
  const points: Point2D[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.min(1, Math.max(0, (i + rand() * 0.6) / count));
    const p = el.getPointAtLength(t * total);
    points.push({ x: p.x, y: p.y });
  }
  return points;
}

/** Rejection-sampled points inside a path's filled interior, for volumetric
 *  density rather than a pure outline skeleton. */
export function sampleShapeFill(
  d: string,
  count: number,
  bbox: { x: number; y: number; width: number; height: number },
  rand: () => number,
): Point2D[] {
  if (count <= 0) return [];
  const path2d = new Path2D(d);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const points: Point2D[] = [];
  const maxAttempts = count * 60;
  let attempts = 0;
  while (points.length < count && attempts < maxAttempts) {
    attempts++;
    const x = bbox.x + rand() * bbox.width;
    const y = bbox.y + rand() * bbox.height;
    if (ctx.isPointInPath(path2d, x, y)) points.push({ x, y });
  }
  return points;
}

export function pathTotalLength(d: string): number {
  return createPathElement(d).getTotalLength();
}
