"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export default function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!canvas || !glow) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = reduceQuery.matches;
    const onReduceChange = () => {
      reduce = reduceQuery.matches;
    };
    reduceQuery.addEventListener("change", onReduceChange);

    let width = 0;
    let height = 0;
    let ratio = 1;
    let frame = 0;

    const particles: Particle[] = Array.from(
      { length: window.innerWidth < 600 ? 22 : 44 },
      () => ({
        x: Math.random(),
        y: Math.random(),
        size: 2 + Math.random() * 3,
        speed: 0.00012 + Math.random() * 0.0003,
        alpha: 0.12 + Math.random() * 0.4,
      }),
    );

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let glowX = pointerX;
    let glowY = pointerY;

    function onPointerMove(event: PointerEvent) {
      pointerX = event.clientX;
      pointerY = event.clientY;
    }

    function resize() {
      ratio = window.devicePixelRatio || 1;
      width = canvas!.width = window.innerWidth * ratio;
      height = canvas!.height = window.innerHeight * ratio;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
    }

    function draw(time: number) {
      const clock = reduce ? 0 : time / 1000;

      glowX += (pointerX - glowX) * 0.06;
      glowY += (pointerY - glowY) * 0.06;
      glow!.style.transform = `translate(${glowX}px, ${glowY}px)`;

      context!.clearRect(0, 0, width, height);

      for (let wave = 0; wave < 3; wave += 1) {
        context!.beginPath();
        context!.moveTo(0, height);
        for (let x = 0; x <= width; x += 12 * ratio) {
          const progress = x / width;
          context!.lineTo(
            x,
            height * (0.86 + wave * 0.03) +
              Math.sin(
                progress * (5 + wave * 2) +
                  clock * (0.5 + wave * 0.25) +
                  wave,
              ) *
                height *
                0.018 *
                (1 + Math.sin(progress * 3 + clock * 0.4)),
          );
        }
        context!.lineTo(width, height);
        context!.closePath();
        context!.fillStyle = `rgba(91, 157, 255, ${0.07 + wave * 0.04})`;
        context!.fill();
      }

      for (const particle of particles) {
        if (!reduce) {
          particle.y -= particle.speed;
          if (particle.y < -0.05) {
            particle.y = 1.05;
            particle.x = Math.random();
          }
        }
        context!.fillStyle = `rgba(190, 215, 255, ${particle.alpha})`;
        context!.fillRect(
          particle.x * width +
            Math.sin(clock + particle.y * 9) * 6 * ratio,
          particle.y * height,
          particle.size * ratio,
          particle.size * ratio,
        );
      }

      frame = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      reduceQuery.removeEventListener("change", onReduceChange);
    };
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-blob blob-one" />
      <div className="backdrop-blob blob-two" />
      <div className="backdrop-glow" ref={glowRef} />
      <canvas className="backdrop-canvas" ref={canvasRef} />
    </div>
  );
}
