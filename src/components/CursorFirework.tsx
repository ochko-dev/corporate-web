"use client";

import { useEffect,useState, useRef } from "react";

const MAX_PARTICLES = 220;
const SPRITE_SIZE = 32;
const SCROLL_IDLE_MS = 150;

function lighten(hex: string, amount: number) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  sprite: HTMLCanvasElement;
};

export default function CursorFirework() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
   const isTouchDevice =
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches;

  if (isTouchDevice) {
    setEnabled(false);
    return;
  }

  setEnabled(true);

  const canvas = canvasRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!canvas || !dot || !ring) return;

    if (window.matchMedia("(hover: none)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const primary =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim() || "#075d87";

    const COLORS = [
      primary,
      lighten(primary, 0.25),
      lighten(primary, 0.45),
      lighten(primary, 0.65),
    ];

    const sprites = COLORS.map((color) => {
      const c = document.createElement("canvas");

      c.width = SPRITE_SIZE;
      c.height = SPRITE_SIZE;

      const g = c.getContext("2d")!;

      const grad = g.createRadialGradient(
        SPRITE_SIZE / 2,
        SPRITE_SIZE / 2,
        0,
        SPRITE_SIZE / 2,
        SPRITE_SIZE / 2,
        SPRITE_SIZE / 2
      );

      grad.addColorStop(0, color);
      grad.addColorStop(0.35, color + "aa");
      grad.addColorStop(1, color + "00");

      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

      return c;
    });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let ringX = mouseX;
    let ringY = mouseY;

    let prevX = mouseX;
    let prevY = mouseY;

    let distAccum = 0;

    let isScrolling = false;
    let scrollStopTimer = 0;

    let rafId = 0;

    const particles: Particle[] = [];

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


    /**
     * Canvas resize
     * FIX: sync CSS size + DPR
     */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };


    /**
     * Convert mouse viewport coordinate
     * into canvas coordinate
     */
    const getPosition = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();

      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };


    const spawnParticle = (
      x: number,
      y: number,
      speedBoost: number
    ) => {
      if (particles.length >= MAX_PARTICLES) {
        particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;

      const speed =
        (0.2 + Math.random() * 0.6) *
        (1 + speedBoost * 0.05);

      particles.push({
        x,
        y,

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.1,

        life: 1,
        decay: 0.008 + Math.random() * 0.01,

        size: 0.8 + Math.random() * 1.4,

        sprite:
          sprites[
            Math.floor(Math.random() * sprites.length)
          ],
      });
    };


    const onMouseMove = (e: MouseEvent) => {
      const pos = getPosition(e);

      mouseX = pos.x;
      mouseY = pos.y;


      const dist = Math.hypot(
        pos.x - prevX,
        pos.y - prevY
      );


      prevX = pos.x;
      prevY = pos.y;


      if (isScrolling) return;


      distAccum += dist;


      if (distAccum > 7) {
        distAccum = 0;


        spawnParticle(
          pos.x + (Math.random() - 0.5) * 4,
          pos.y + (Math.random() - 0.5) * 4,
          dist
        );


        if (dist > 25) {
          spawnParticle(
            pos.x + (Math.random() - 0.5) * 6,
            pos.y + (Math.random() - 0.5) * 6,
            dist
          );
        }
      }
    };


    const onScroll = () => {
      isScrolling = true;

      particles.length = 0;

      window.clearTimeout(scrollStopTimer);

      scrollStopTimer = window.setTimeout(() => {
        isScrolling = false;
      }, SCROLL_IDLE_MS);
    };


    const onOver = (e: MouseEvent) => {
      if (
        (e.target as HTMLElement)
          .closest("a, button, [role='button']")
      ) {
        ring.classList.add(
          "cursor-ring--hovered"
        );
      }
    };


    const onOut = (e: MouseEvent) => {
      if (
        (e.target as HTMLElement)
          .closest("a, button, [role='button']")
      ) {
        ring.classList.remove(
          "cursor-ring--hovered"
        );
      }
    };


    const animate = () => {

      dot.style.transform =
        `translate(${mouseX}px, ${mouseY}px)
         translate(-50%, -50%)`;


      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;


      ring.style.transform =
        `translate(${ringX}px, ${ringY}px)
         translate(-50%, -50%)`;


      ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );


      if (!reduceMotion) {

        ctx.globalCompositeOperation = "lighter";


        for (
          let i = particles.length - 1;
          i >= 0;
          i--
        ) {

          const p = particles[i];


          p.x += p.vx;
          p.y += p.vy;

          p.vy += 0.012;

          p.vx *= 0.985;
          p.vy *= 0.985;


          p.life -= p.decay;


          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }


          const s =
            p.size *
            p.life *
            8;


          ctx.globalAlpha =
            p.life * p.life;


          ctx.drawImage(
            p.sprite,
            p.x - s / 2,
            p.y - s / 2,
            s,
            s
          );
        }


        ctx.globalAlpha = 1;

        ctx.globalCompositeOperation =
          "source-over";
      }


      rafId = requestAnimationFrame(
        animate
      );
    };


    resize();

    rafId = requestAnimationFrame(
      animate
    );


    window.addEventListener(
      "mousemove",
      onMouseMove
    );

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      resize
    );

    document.addEventListener(
      "mouseover",
      onOver
    );

    document.addEventListener(
      "mouseout",
      onOut
    );


    document.documentElement.classList.add(
      "has-custom-cursor"
    );


    return () => {

setEnabled(false);

      cancelAnimationFrame(rafId);

      window.clearTimeout(
        scrollStopTimer
      );

      window.removeEventListener(
        "mousemove",
        onMouseMove
      );

      window.removeEventListener(
        "scroll",
        onScroll
      );

      window.removeEventListener(
        "resize",
        resize
      );

      document.removeEventListener(
        "mouseover",
        onOver
      );

      document.removeEventListener(
        "mouseout",
        onOut
      );


      document.documentElement.classList.remove(
        "has-custom-cursor"
      );
    };

  }, []);
if (!enabled) return null;

  return (
    <>
      <style>{`

      
        .has-custom-cursor,
        .has-custom-cursor body,
        .has-custom-cursor a,
        .has-custom-cursor button {
          cursor:none;
        }

        .cursor-fx {
          position:fixed;
          inset:0;
          pointer-events:none;
          z-index:9997;
        }

        .cursor-dot {
          position:fixed;
          width:6px;
          height:6px;
          background:white;
          border-radius:50%;
          pointer-events:none;
          z-index:9999;
        }

        .cursor-ring {
          position:fixed;
          width:18px;
          height:18px;
          border:1.5px solid rgba(255,255,255,.7);
          border-radius:50%;
          pointer-events:none;
          z-index:9998;
          mix-blend-mode:difference;
        }

        .cursor-ring--hovered {
          width:60px;
          height:60px;
          background:rgba(255,255,255,.15);
          border-color:transparent;
        }

       @media (hover:none), (pointer:coarse) {
  .cursor-dot,
  .cursor-ring,
  .cursor-fx {
    display:none !important;
  }
}
      `}</style>

      <canvas
        ref={canvasRef}
        className="cursor-fx"
      />

      <div
        ref={dotRef}
        className="cursor-dot"
      />

      <div
        ref={ringRef}
        className="cursor-ring"
      />
    </>
  );
}