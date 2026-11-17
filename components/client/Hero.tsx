"use client";

import Button from "@/components/ui/Button";

interface HeroProps {
  onWrite: () => void;
  onTrack: () => void;
}

export default function Hero({ onWrite, onTrack }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-eyebrow">OSIS SMPN 1 DANDER</div>
      <h1 className="hero-title">
        Spensa<span>Voice</span>
      </h1>
      <p className="hero-desc">
        Punya ide atau keluhan? Lempar aja ke sini. Bisa anonim, nanti OSIS
        yang dengerin.
      </p>
      <div className="hero-actions">
        <Button size="lg" onClick={onWrite}>
          Tulis pesan
        </Button>
        <Button size="lg" variant="secondary" onClick={onTrack}>
          Cek status
        </Button>
      </div>
      <p className="hero-tip">Buat yang males bilang langsung.</p>
    </section>
  );
}
