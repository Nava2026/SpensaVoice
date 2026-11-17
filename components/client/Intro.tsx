"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MaskText from "./MaskText";

const INTRO_MS = 4100;
const REDUCED_MS = 700;
const BAR_COUNT = 23;

export default function Intro({ onDone }: { onDone: () => void }) {
  const [percent, setPercent] = useState(0);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const total = reduce ? REDUCED_MS : INTRO_MS;
    const startedAt = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / total);
      const eased = 1 - Math.pow(1 - progress, 2.2);
      setPercent(Math.round(eased * 100));
      if (progress >= 1) {
        finish();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [finish]);

  return (
    <section className="screen intro" aria-label="Intro SpensaVoice">
      <button type="button" className="intro-skip" onClick={finish}>
        Lewati
      </button>

      <MaskText
        text="SpensaVoice"
        className="brand intro-brand"
        delay={0.35}
      />

      <p className="intro-sub">Suaramu penting. Tak harus lantang.</p>

      <div className="intro-eq" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <i
            key={index}
            style={
              {
                "--k": index,
                "--h": (0.25 + Math.abs(Math.sin(index * 0.7)) * 0.75).toFixed(2),
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="intro-progress" aria-hidden="true">
        <span>{percent}%</span>
        <div className="intro-track">
          <i style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
      </div>
    </section>
  );
}
