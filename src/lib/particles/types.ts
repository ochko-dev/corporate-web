export type Vec3 = { x: number; y: number; z: number };

/** A target shape: a fixed-length array of normalized points (roughly within
 *  a [-1, 1] cube) that particles can be blended toward. Shapes don't need
 *  to share a length with the particle pool — the engine indexes into a
 *  shape with `i % shape.length`. */
export type Shape = Vec3[];

/** Static, per-particle random attributes assigned once at pool creation and
 *  never reallocated. */
export type ParticleAttrs = {
  size: number;
  density: number;
  phase: number;
  speed: number;
  accent: boolean;
  /** Unit vector biasing this particle's chaos-scatter direction, so an
   *  explosion reads as thousands of distinct trajectories instead of
   *  uniform noise. */
  chaosDir: Vec3;
  chaosMagnitude: number;
  /** Staggers when a particle starts responding to a blend (0-1 of the
   *  transition), so particles launch/land in waves, not lockstep. */
  delay: number;
};

/** Describes one frame's worth of blending for the whole field. */
export type SceneBlend = {
  shapeFrom: Shape;
  shapeTo: Shape;
  /** 0 = fully at shapeFrom, 1 = fully at shapeTo. */
  mix: number;
  /** 0-1 extra chaos-scatter layered on top of the interpolated position.
   *  Typically peaks mid-transition and relaxes to ~0 at either end. */
  chaosAmount: number;
  /** Seconds since the field mounted; drives idle drift/breathing/rotation
   *  independent of `mix`, so particles never sit perfectly still. */
  elapsed: number;
  /** 0-1, how visible the mesh/backbone should be this frame. Optional —
   *  defaults to a `mix`/`chaosAmount`-derived value. Pass this explicitly
   *  whenever a consumer sequences more than one shapeFrom/shapeTo pair
   *  across a single scroll range (e.g. assemble, then a rigid move, then a
   *  dissolve): each pair's own `mix` restarts at 0, which would otherwise
   *  make the mesh visibly flicker off and back on at every stage boundary
   *  even though the particles stayed fully coherent the whole time. */
  structureAlpha?: number;
};
