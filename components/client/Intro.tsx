"use client";

import { useEffect } from "react";

const TITLE = "SpensaVoice";

export default function Intro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1900);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-eyebrow">OSIS SMPN 1 DANDER</div>
      <div className="intro-title">
        {TITLE.split("").map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={`intro-letter${index >= 6 ? " accent" : ""}`}
            style={{ ["--i" as string]: index }}
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="intro-sub">Suaramu, didengerin.</div>
    </div>
  );
}
