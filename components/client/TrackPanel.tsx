"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { HistoryItem } from "@/lib/history";
import type { AspirasiPublic } from "@/lib/types";
import { normalizeKode } from "@/lib/validation";

const STEPS = ["Diterima", "Lagi dibaca", "Diproses", "Selesai"];

const STATUS_STEP: Record<AspirasiPublic["status"], number> = {
  baru: 0,
  diproses: 2,
  selesai: 3,
  ditolak: 0,
};

const STATUS_HEADING: Record<AspirasiPublic["status"], string> = {
  baru: "Diterima",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Gak dilanjut",
};

export default function TrackPanel({
  onClose,
  initialKode,
  history,
  onClearHistory,
}: {
  onClose: () => void;
  initialKode?: string;
  history: HistoryItem[];
  onClearHistory: () => void;
}) {
  const [kode, setKode] = useState(initialKode ?? "");
  const [result, setResult] = useState<AspirasiPublic | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const autoRan = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function checkCode(raw: string) {
    const normalized = normalizeKode(raw);
    if (!normalized || normalized === "SV-") {
      setError("Isi kode tracking dulu ya.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `/api/aspirasi?kode=${encodeURIComponent(normalized)}`,
        { cache: "no-store" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Kode tidak ditemukan. Cek lagi tulisannya ya.");
      } else {
        setResult(data.aspirasi as AspirasiPublic);
      }
    } catch {
      setError("Gagal ngecek. Coba lagi sebentar lagi ya.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialKode && !autoRan.current) {
      autoRan.current = true;
      void checkCode(initialKode);
    }
    // Cek otomatis cuma sekali saat layar dibuka dari riwayat/toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!initialKode) inputRef.current?.focus({ preventScroll: true });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [initialKode]);

  const step = result ? STATUS_STEP[result.status] : -1;

  return (
    <section className="screen status-screen" aria-label="Cek status aspirasi">
      <div className="status-panel">
        <h2 className="status-title">Cek status</h2>
        <p className="status-hint">
          Masukin kode yang kamu dapat setelah kirim pesan.
        </p>

        <form
          className="status-form"
          onSubmit={(event) => {
            event.preventDefault();
            void checkCode(kode);
          }}
        >
          <input
            ref={inputRef}
            className="status-input"
            placeholder="SV-XXXX"
            aria-label="Kode pelacakan"
            autoComplete="off"
            maxLength={12}
            value={kode}
            onChange={(event) => {
              setKode(event.target.value.toUpperCase());
              if (error) setError("");
            }}
          />
          <Button type="submit" disabled={loading}>
            Cek
          </Button>
        </form>

        <div className="status-result" aria-live="polite">
          {loading && <p className="status-loading">Lagi nyari...</p>}

          {error && !loading && (
            <div className="status-empty">
              <p>{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="status-card">
              <div className="status-card-top">
                <span className="status-code">{result.kode}</span>
                <span className={`badge ${STATUS_BADGE[result.status]}`}>
                  {STATUS_LABEL[result.status]}
                </span>
              </div>
              <p className="status-stat">{STATUS_HEADING[result.status]}</p>
              <p className="status-meta">
                {formatDate(result.created_at)}
                {result.topik ? ` · ${result.topik}` : ""}
              </p>

              <div
                className="status-steps"
                aria-label={`Progres: ${STEPS[step] ?? STEPS[0]}`}
              >
                {STEPS.map((label, index) => (
                  <i
                    key={label}
                    className={index <= step ? "on" : ""}
                    style={{ "--n": index } as React.CSSProperties}
                    title={label}
                  />
                ))}
              </div>
              <div className="status-step-labels" aria-hidden="true">
                <span>{STEPS[0]}</span>
                <span>{STEPS[STEPS.length - 1]}</span>
              </div>

              {result.balasan ? (
                <div className="status-reply">
                  <span>BALASAN OSIS</span>
                  <p>{result.balasan}</p>
                </div>
              ) : (
                <p className="status-note">
                  Belum ada balasan. Pesanmu udah dicatat sama OSIS.
                </p>
              )}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="status-history">
            <div className="status-history-head">
              <span>Kode kamu sebelumnya</span>
              <button type="button" onClick={onClearHistory}>
                Hapus
              </button>
            </div>
            <div className="status-history-list">
              {history.slice(0, 6).map((item) => (
                <button
                  type="button"
                  key={item.kode}
                  className="status-history-item"
                  onClick={() => {
                    setKode(item.kode);
                    void checkCode(item.kode);
                  }}
                >
                  <b>{item.kode}</b>
                  <span>{formatDate(item.created_at)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="status-back">
          <Button variant="secondary" className="btn-line" onClick={onClose}>
            Balik
          </Button>
        </div>
      </div>
    </section>
  );
}
