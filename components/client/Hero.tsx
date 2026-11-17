"use client";

import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { formatDate } from "@/lib/format";
import type { HistoryItem } from "@/lib/history";
import MaskText from "./MaskText";

interface HeroProps {
  onWrite: () => void;
  onTrack: () => void;
  onOsis: () => void;
  history: HistoryItem[];
  onOpenCode: (kode: string) => void;
  onClearHistory: () => void;
}

export default function Hero({
  onWrite,
  onTrack,
  onOsis,
  history,
  onOpenCode,
  onClearHistory,
}: HeroProps) {
  return (
    <section className="screen hero-screen" aria-label="Beranda">
      <div className="hero-theme">
        <ThemeToggle />
      </div>

      <div className="hero-inner">
        <span className="eyebrow">OSIS SMPN 1 DANDER</span>

        <MaskText text="SpensaVoice" className="brand hero-brand" delay={0.1} />

        <p className="hero-desc">
          Kotak aspirasi digital buat kamu. Buat yang males bilang langsung,
          tulis aja di sini.
        </p>

        <div className="hero-ctas">
          <Button size="lg" onClick={onWrite}>
            Tulis pesan
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="btn-line"
            onClick={onTrack}
          >
            Cek status
          </Button>
        </div>

        <button type="button" className="osis-link" onClick={onOsis}>
          Kenalan sama OSIS
        </button>

        {history.length > 0 && (
          <section className="history" aria-label="Riwayat kode pesanmu">
            <div className="history-head">
              <span>Riwayat kamu</span>
              <button
                type="button"
                className="history-clear"
                onClick={onClearHistory}
              >
                Hapus
              </button>
            </div>
            <ul className="history-list">
              {history.slice(0, 4).map((item) => (
                <li key={item.kode}>
                  <button
                    type="button"
                    className="history-item"
                    onClick={() => onOpenCode(item.kode)}
                  >
                    <span className="history-code">{item.kode}</span>
                    <span className="history-meta">
                      {formatDate(item.created_at)}
                      {item.topik ? ` · ${item.topik}` : ""}
                    </span>
                    <span className="history-open">Cek →</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="history-note">
              Tersimpan di browser ini aja, biar kodenya gak ilang.
            </p>
          </section>
        )}

        <p className="hero-foot">
          OSIS SMPN 1 Dander · Bojonegoro
        </p>
      </div>
    </section>
  );
}
