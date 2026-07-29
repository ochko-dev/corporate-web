"use client";

import { useEffect, useRef } from "react";

/**
 * Firework cursor — Next.js (App Router) client component.
 *
 * Хэрэглэх заавар:
 * 1. Энэ файлыг app/components/CursorFirework.tsx гэж хадгална
 * 2. app/layout.tsx дотор import хийж <body> дотор нэмнэ:
 *
 *    import CursorFirework from "./components/CursorFirework";
 *    ...
 *    <body>
 *      <CursorFirework />
 *      {children}
 *    </body>
 */

const MAX_PARTICLES = 220;
const SPRITE_SIZE = 32;
// Time with no scroll events before the firework is allowed to spawn again.
const SCROLL_IDLE_MS = 150;

function lighten(hex: string, amount: number) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!canvas || !dot || !ring) return;

    // Touch төхөөрөмж дээр юу ч хийхгүй
    if (window.matchMedia("(hover: none)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ---- Үндсэн (primary) өнгийг --primary CSS хувьсагчаас авна ---- */
    const primary =
      getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() ||
      "#075d87";
    const COLORS = [primary, lighten(primary, 0.25), lighten(primary, 0.45), lighten(primary, 0.65)];

    /* ---- Гэрэлтсэн очны sprite-уудыг нэг удаа урьдчилж зурна ---- */
    const sprites = COLORS.map((color) => {
      const c = document.createElement("canvas");
      c.width = c.height = SPRITE_SIZE;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(
        SPRITE_SIZE / 2, SPRITE_SIZE / 2, 0,
        SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2
      );
      grad.addColorStop(0, color);
      grad.addColorStop(0.35, color + "aa");
      grad.addColorStop(1, color + "00");
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      return c;
    });

    /* ---- Төлөв ---- */
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

    /* ---- Canvas хэмжээ ---- */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ---- Оч үүсгэх ---- */
    const spawnParticle = (x: number, y: number, speedBoost: number) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.2 + Math.random() * 0.6) * (1 + speedBoost * 0.05);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.1,
        life: 1,
        decay: 0.008 + Math.random() * 0.01,
        size: 0.8 + Math.random() * 1.4,
        sprite: sprites[Math.floor(Math.random() * sprites.length)],
      });
    };

    /* ---- Event handlers ---- */
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const dist = Math.hypot(e.clientX - prevX, e.clientY - prevY);
      prevX = e.clientX;
      prevY = e.clientY;

      if (isScrolling) return;

      // 7px тутамд 1 оч; хурдан үед нэмэлт 1
      distAccum += dist;
      if (distAccum > 7) {
        distAccum = 0;
        spawnParticle(
          e.clientX + (Math.random() - 0.5) * 4,
          e.clientY + (Math.random() - 0.5) * 4,
          dist
        );
        if (dist > 25) {
          spawnParticle(
            e.clientX + (Math.random() - 0.5) * 6,
            e.clientY + (Math.random() - 0.5) * 6,
            dist
          );
        }
      }
    };

    // Scroll хийж байх хугацаанд оч үүсгэхийг зогсооно; сая үүссэн
    // очнуудыг ч шууд арчина. SCROLL_IDLE_MS хугацаанд scroll ирэхгүй
    // бол дахин идэвхжинэ.
    const onScroll = () => {
      isScrolling = true;
      particles.length = 0;
      window.clearTimeout(scrollStopTimer);
      scrollStopTimer = window.setTimeout(() => {
        isScrolling = false;
      }, SCROLL_IDLE_MS);
    };

    // Линк/товч дээр цагираг томрох (event delegation —
    // Next.js-ийн route солигдоход шинэ линкүүд дээр ч ажиллана)
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button, [role='button']")) {
        ring.classList.add("cursor-ring--hovered");
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button, [role='button']")) {
        ring.classList.remove("cursor-ring--hovered");
      }
    };

    /* ---- Render loop ---- */
    const animate = () => {
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (!reduceMotion) {
        ctx.globalCompositeOperation = "lighter";

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.012;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.life -= p.decay;

          if (p.life <= 0) {
            particles[i] = particles[particles.length - 1];
            particles.pop();
            continue;
          }

          const s = p.size * p.life * 8;
          ctx.globalAlpha = p.life * p.life;
          ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.documentElement.classList.add("has-custom-cursor");

    /* ---- Cleanup: component unmount хийхэд бүгдийг цэвэрлэнэ ---- */
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(scrollStopTimer);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <style>{`
        .has-custom-cursor,
        .has-custom-cursor body,
        .has-custom-cursor a,
        .has-custom-cursor button {
          cursor: none;
        }
        .cursor-fx {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9997;
        }
        .cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 6px; height: 6px;
          background: #fff;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
        }
        .cursor-ring {
          position: fixed;
          top: 0; left: 0;
          width: 18px; height: 18px;
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%);
          transition: width .25s ease, height .25s ease,
                      background-color .25s ease, border-color .25s ease;
          mix-blend-mode: difference;
        }
        .cursor-ring--hovered {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.15);
          border-color: transparent;
        }
        @media (hover: none) {
          .cursor-dot, .cursor-ring, .cursor-fx { display: none; }
          .has-custom-cursor,
          .has-custom-cursor body,
          .has-custom-cursor a,
          .has-custom-cursor button { cursor: auto; }
        }
      `}</style>
      <canvas ref={canvasRef} className="cursor-fx" />
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}