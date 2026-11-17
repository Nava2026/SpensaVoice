"use client";

import { useEffect, useState } from "react";
import { normalizeKode } from "@/lib/validation";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";
import type { AspirasiPublic } from "@/lib/types";
import Button from "@/components/ui/Button";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function TrackPanel({ onClose }: { onClose: () => void }) {
  const [kode, setKode] = useState("");
  const [result, setResult] = useState<AspirasiPublic | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleCheck() {
    const normalized = normalizeKode(kode);
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
      );
      const data = await res.json();
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

  return (
    <div
      className="track-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Cek status aspirasi"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="track-card">
        <div className="page-head" style={{ marginBottom: "0.25rem" }}>
          <div>
            <h2 className="track-title">Cek status</h2>
            <p className="track-sub">
              Masukin kode tracking yang kamu dapet setelah kirim pesan.
            </p>
          </div>
          <button
            type="button"
            className="paper-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div className="field">
          <label className="label" htmlFor="kode">
            Kode tracking
          </label>
          <input
            id="kode"
            className={`input${error ? " input-error" : ""}`}
            placeholder="SV-XXXX"
            value={kode}
            autoFocus
            autoComplete="off"
            onChange={(event) => {
              setKode(event.target.value.toUpperCase());
              if (error) setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCheck();
            }}
          />
        </div>

        <Button
          className="btn-block"
          onClick={handleCheck}
          disabled={loading}
        >
          {loading ? "Ngecek..." : "Cek status"}
        </Button>

        {error && <div className="track-message error">{error}</div>}

        {result && (
          <div className="track-result">
            <div className="track-result-top">
              <div>
                <div className="track-code">{result.kode}</div>
                <div className="track-meta">
                  {formatDate(result.created_at)}
                  {result.topik ? ` · ${result.topik}` : ""}
                </div>
              </div>
              <span className={`badge ${STATUS_BADGE[result.status]}`}>
                {STATUS_LABEL[result.status]}
              </span>
            </div>

            {result.balasan ? (
              <div className="reply-box">
                <div className="reply-label">JAWABAN OSIS</div>
                <div className="reply-text">{result.balasan}</div>
              </div>
            ) : (
              <div className="track-body">
                Belum ada balasan. Pesanmu udah dicatat sama OSIS.
              </div>
            )}
          </div>
        )}

        <p className="track-hint">
          Kode ini cuma buat kamu. Jangan dikasih ke orang lain ya.
        </p>
      </div>
    </div>
  );
}
