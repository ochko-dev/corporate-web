"use client";

import { useEffect, useRef, useState } from "react";

const MAX_PARTICLES = 220;
const SPRITE_SIZE = 32;
const SCROLL_IDLE_MS = 150;

function lighten(hex: string, amount: number) {
  const num = parseInt(hex.slice(1), 16);

  const r = Math.min(
    255,
    (num >> 16) + Math.round(255 * amount)
  );

  const g = Math.min(
    255,
    ((num >> 8) & 0xff) + Math.round(255 * amount)
  );

  const b = Math.min(
    255,
    (num & 0xff) + Math.round(255 * amount)
  );

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

  const [isTouchDevice, setIsTouchDevice] =
    useState(true);


  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const dotRef =
    useRef<HTMLDivElement>(null);

  const ringRef =
    useRef<HTMLDivElement>(null);



  /**
   * Detect mobile/touch device
   */
  useEffect(() => {

    const media =
      window.matchMedia(
        "(hover: none), (pointer: coarse)"
      );


    setIsTouchDevice(media.matches);


    const handler = () =>
      setIsTouchDevice(media.matches);


    media.addEventListener(
      "change",
      handler
    );


    return () =>
      media.removeEventListener(
        "change",
        handler
      );

  }, []);



  /**
   * Disable completely on mobile
   */
  useEffect(() => {

    if (isTouchDevice) return;


    const canvas = canvasRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;


    if (!canvas || !dot || !ring)
      return;


    const ctx =
      canvas.getContext("2d");


    if (!ctx) return;



    const primary =
      getComputedStyle(
        document.documentElement
      )
        .getPropertyValue("--primary")
        .trim() || "#075d87";



    const COLORS = [
      primary,
      lighten(primary,0.25),
      lighten(primary,0.45),
      lighten(primary,0.65),
    ];



    const sprites =
      COLORS.map(color => {

        const c =
          document.createElement("canvas");


        c.width = SPRITE_SIZE;
        c.height = SPRITE_SIZE;


        const g =
          c.getContext("2d")!;


        const grad =
          g.createRadialGradient(
            SPRITE_SIZE / 2,
            SPRITE_SIZE / 2,
            0,
            SPRITE_SIZE / 2,
            SPRITE_SIZE / 2,
            SPRITE_SIZE / 2
          );


        grad.addColorStop(
          0,
          color
        );

        grad.addColorStop(
          0.35,
          color + "aa"
        );

        grad.addColorStop(
          1,
          color + "00"
        );


        g.fillStyle = grad;

        g.fillRect(
          0,
          0,
          SPRITE_SIZE,
          SPRITE_SIZE
        );


        return c;

      });



    let mouseX =
      window.innerWidth / 2;

    let mouseY =
      window.innerHeight / 2;


    let ringX = mouseX;
    let ringY = mouseY;


    let prevX = mouseX;
    let prevY = mouseY;


    let distAccum = 0;

    let rafId = 0;


    let scrolling = false;

    let scrollTimer = 0;



    const particles: Particle[] = [];



    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;



    /**
     * Resize canvas
     */
    const resize = () => {

      const dpr =
        Math.min(
          window.devicePixelRatio || 1,
          2
        );


      const width =
        window.innerWidth;


      const height =
        window.innerHeight;


      canvas.style.width =
        `${width}px`;


      canvas.style.height =
        `${height}px`;



      canvas.width =
        width * dpr;


      canvas.height =
        height * dpr;



      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

    };



    const getMousePosition =
      (e: MouseEvent) => {

        const rect =
          canvas.getBoundingClientRect();


        return {
          x:
            e.clientX - rect.left,

          y:
            e.clientY - rect.top,
        };

      };




    const spawnParticle =
      (
        x:number,
        y:number,
        speed:number
      ) => {


        if(
          particles.length >= MAX_PARTICLES
        ) {
          particles.shift();
        }



        const angle =
          Math.random() *
          Math.PI *
          2;



        const velocity =
          (
            0.2 +
            Math.random() * 0.6
          )
          *
          (
            1 +
            speed * 0.05
          );



        particles.push({

          x,
          y,

          vx:
            Math.cos(angle)
            *
            velocity,

          vy:
            Math.sin(angle)
            *
            velocity
            -
            0.1,


          life:1,

          decay:
            0.008 +
            Math.random() * 0.01,


          size:
            0.8 +
            Math.random() * 1.4,


          sprite:
            sprites[
              Math.floor(
                Math.random()
                *
                sprites.length
              )
            ]

        });

      };



    const mouseMove =
      (e:MouseEvent)=>{


        const pos =
          getMousePosition(e);


        mouseX = pos.x;
        mouseY = pos.y;



        const distance =
          Math.hypot(
            pos.x - prevX,
            pos.y - prevY
          );


        prevX = pos.x;
        prevY = pos.y;



        if(scrolling)
          return;



        distAccum += distance;



        if(distAccum > 7){

          distAccum = 0;


          spawnParticle(
            pos.x,
            pos.y,
            distance
          );

        }

      };




    const scroll = () => {

      scrolling = true;

      particles.length = 0;


      clearTimeout(scrollTimer);


      scrollTimer =
        window.setTimeout(
          ()=>{
            scrolling=false;
          },
          SCROLL_IDLE_MS
        );

    };




    const animate = () => {


      dot.style.transform =
        `
        translate(${mouseX}px,${mouseY}px)
        translate(-50%,-50%)
        `;



      ringX +=
        (mouseX-ringX)
        *
        0.15;


      ringY +=
        (mouseY-ringY)
        *
        0.15;



      ring.style.transform =
        `
        translate(${ringX}px,${ringY}px)
        translate(-50%,-50%)
        `;



      ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );



      if(!reduceMotion){


        ctx.globalCompositeOperation =
          "lighter";



        particles.forEach(
          (p,index)=>{


            p.x += p.vx;
            p.y += p.vy;


            p.vy += 0.012;


            p.vx *= 0.985;
            p.vy *= 0.985;


            p.life -= p.decay;



            if(p.life<=0){

              particles.splice(
                index,
                1
              );

              return;

            }



            const size =
              p.size *
              p.life *
              8;



            ctx.globalAlpha =
              p.life * p.life;



            ctx.drawImage(
              p.sprite,
              p.x-size/2,
              p.y-size/2,
              size,
              size
            );

          }
        );


        ctx.globalAlpha = 1;


        ctx.globalCompositeOperation =
          "source-over";

      }



      rafId =
        requestAnimationFrame(
          animate
        );

    };



    resize();

    animate();



    window.addEventListener(
      "mousemove",
      mouseMove
    );


    window.addEventListener(
      "resize",
      resize
    );


    window.addEventListener(
      "scroll",
      scroll,
      {passive:true}
    );



    document.documentElement.classList.add(
      "has-custom-cursor"
    );



    return ()=>{

      cancelAnimationFrame(
        rafId
      );


      clearTimeout(
        scrollTimer
      );


      window.removeEventListener(
        "mousemove",
        mouseMove
      );


      window.removeEventListener(
        "resize",
        resize
      );


      window.removeEventListener(
        "scroll",
        scroll
      );


      document.documentElement.classList.remove(
        "has-custom-cursor"
      );

    };


  },[isTouchDevice]);



  if(isTouchDevice)
    return null;



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
  position: fixed;
  width: 6px;
  height: 6px;
  background: var(--cursor-color);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
}

:root {
  --cursor-color: black;
}

.dark {
  --cursor-color: white;
}

      @media (hover:none),
      (pointer:coarse){
        .cursor-dot,
        .cursor-ring,
        .cursor-fx{
          display:none!important;
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