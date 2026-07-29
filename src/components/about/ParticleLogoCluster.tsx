"use client";

import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";
import { ParticleField } from "../shared/particle-field";
import { buildLogoShape } from "@/src/lib/particles/shapes/logo";
import type { SceneBlend, Shape } from "@/src/lib/particles/types";

const CLUSTER_PARTICLE_COUNT = 1400;

type ClusterShapes = {
  logo: Shape;
  accentIndices: number[];
  edges: [number, number][];
};

function buildClusterShapes(): ClusterShapes {
  const { points: logo, accentFlags, edges } = buildLogoShape(CLUSTER_PARTICLE_COUNT, 77);
  const accentIndices = accentFlags.reduce<number[]>((acc, isAccent, i) => {
    if (isAccent) acc.push(i);
    return acc;
  }, []);
  return { logo, accentIndices, edges };
}

function computeClusterBlend(shapes: ClusterShapes, elapsed: number): SceneBlend {
  return { shapeFrom: shapes.logo, shapeTo: shapes.logo, mix: 1, chaosAmount: 0, elapsed };
}

export type ParticleLogoClusterProps = {
  className?: string;
};

/**
 * The About section's top-left decorative element: the same particle
 * engine Hero's sphere uses, sampling target positions straight off
 * Logo.tsx's real path data (see lib/particles/shapes/logo.ts) instead of a
 * sphere. Always fully formed — no scroll-driven assembly — so the logo is
 * already complete the moment the section comes into view.
 */
export function ParticleLogoCluster({ className }: ParticleLogoClusterProps) {
  const [shapes, setShapes] = useState<ClusterShapes | null>(null);

  // SVG path sampling needs `document`/`Path2D`, which don't exist during
  // SSR — deferred to a client-only effect rather than a render-time
  // useMemo, which would also desync the initial client render from the
  // server-rendered (particle-less) markup.
  useEffect(() => {
    setShapes(buildClusterShapes());
  }, []);

  if (!shapes) return null;

  return (
    <ParticleField
      count={CLUSTER_PARTICLE_COUNT}
      computeBlend={(_progress, elapsed) => computeClusterBlend(shapes, elapsed)}
      engineOptions={{
        seed: 99,
        accentIndices: shapes.accentIndices,
        rotationSpeed: 0.5,
        sizeScale: 1.7,
        mesh: { edges: shapes.edges },
      }}
      overscan={1.4}
      className={cn(
        "pointer-events-none absolute top-24 left-1/2 z-0 h-90 w-90 -translate-x-1/2 origin-top-left sm:top-16 sm:left-16 sm:h-115 sm:w-115 sm:translate-x-0",
        className,
      )}
    />
  );
}
