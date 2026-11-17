"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  kode?: string;
  error?: string;
  onClose: () => void;
  onTrack?: () => void;
}

export default function Toast({ kode, error, onClose, onTrack }: ToastProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(onClose, 8000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  async function copyKode() {
    if (!kode) return;
    try {
      await navigator.clipboard.writeText(kode);
      setCopied(true);
    } catch {
      const area = document.createElement("textarea");
      area.value = kode;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      setCopied(true);
    }
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="toast-wrap">
      <div
        className={`toast${error ? " toast-error" : ""}`}
        role="status"
        aria-live="polite"
      >
        <div className="toast-body">
          <b>{error ? "Gagal kirim" : "Pesanmu udah masuk"}</b>
          {error ? (
            <span className="toast-code toast-code-error">{error}</span>
          ) : (
            <span className="toast-code">{kode}</span>
          )}
        </div>

        {!error && kode && (
          <div className="toast-actions">
            <button type="button" onClick={copyKode}>
              {copied ? "Tersalin" : "Salin"}
            </button>
            {onTrack && (
              <button type="button" className="toast-cta" onClick={onTrack}>
                Cek status
              </button>
            )}
          </div>
        )}

        {error && (
          <button type="button" className="toast-cta" onClick={onClose}>
            Tutup
          </button>
        )}

        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
