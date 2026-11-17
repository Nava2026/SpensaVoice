"use client";

import { useState } from "react";

interface ToastProps {
  kode?: string;
  error?: string;
  onClose: () => void;
  onTrack?: () => void;
}

export default function Toast({ kode, error, onClose, onTrack }: ToastProps) {
  const [copied, setCopied] = useState(false);

  async function copyKode() {
    if (!kode) return;
    try {
      await navigator.clipboard.writeText(kode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="toast-wrap">
      <div className="toast" role="alert">
        <div className={`toast-icon${error ? " error" : ""}`}>
          {error ? "!" : "✓"}
        </div>
        <div className="toast-body">
          {error ? (
            <>
              <div className="toast-title">Gagal kirim</div>
              <div className="toast-text">{error}</div>
            </>
          ) : (
            <>
              <div className="toast-title">Pesanmu udah masuk</div>
              <div className="toast-text">
                Simpen kode ini buat ngecek statusnya nanti ya.
              </div>
              <div className="toast-actions">
                <span className="tracking">{kode}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={copyKode}
                >
                  {copied ? "Kesalin ✓" : "Salin"}
                </button>
                {onTrack && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={onTrack}
                  >
                    Cek status
                  </button>
                )}
              </div>
            </>
          )}
        </div>
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
