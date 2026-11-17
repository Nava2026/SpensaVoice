"use client";

import { useEffect, useState } from "react";
import { KELAS_OPTIONS, TOPIK_OPTIONS } from "@/lib/constants";
import Button from "@/components/ui/Button";

export interface WritePayload {
  isi: string;
  nama: string;
  kelas: string;
  topik: string;
  anonim: boolean;
}

const MAX_ISI = 500;

export default function WriteSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: WritePayload) => void;
}) {
  const [isi, setIsi] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [topik, setTopik] = useState("");
  const [anonim, setAnonim] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  function handleSubmit() {
    const trimmed = isi.trim();
    if (trimmed.length < 5) {
      setError("Pesan minimal 5 karakter ya.");
      return;
    }
    if (trimmed.length > MAX_ISI) {
      setError("Pesan maksimal 500 karakter.");
      return;
    }
    setError("");
    onSubmit({
      isi: trimmed,
      nama: nama.trim(),
      kelas,
      topik,
      anonim,
    });
  }

  const remaining = MAX_ISI - isi.length;

  return (
    <div
      className="sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Tulis pesan"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="paper">
        <div className="paper-head">
          <div>
            <div className="paper-eyebrow">OSIS SMPN 1 DANDER</div>
            <h2 className="paper-title">Tulis pesan</h2>
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
          <label className="label" htmlFor="isi">
            Isi pesan
          </label>
          <textarea
            id="isi"
            className={`textarea${error ? " input-error" : ""}`}
            placeholder="Tulis ide, keluhan, atau usul kamu di sini..."
            maxLength={MAX_ISI + 50}
            value={isi}
            autoFocus
            onChange={(event) => {
              setIsi(event.target.value);
              if (error) setError("");
            }}
          />
          <div className="counter-row">
            <span>Minimal 5 karakter</span>
            <span className={remaining < 0 ? "over" : ""}>
              {isi.length}/{MAX_ISI}
            </span>
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="paper-toggle">
          <div>
            <div className="paper-toggle-label">Kirim anonim</div>
            <div className="paper-toggle-sub">
              Nama kamu gak bakal disimpan
            </div>
          </div>
          <button
            type="button"
            className={`toggle${anonim ? " on" : ""}`}
            role="switch"
            aria-checked={anonim}
            aria-label="Kirim anonim"
            onClick={() => setAnonim((value) => !value)}
          />
        </div>

        {!anonim && (
          <div className="field">
            <label className="label" htmlFor="nama">
              Nama (boleh kosong)
            </label>
            <input
              id="nama"
              className="input"
              placeholder="Nama kamu..."
              maxLength={50}
              value={nama}
              onChange={(event) => setNama(event.target.value)}
            />
          </div>
        )}

        <div className="paper-grid">
          <div className="field">
            <label className="label" htmlFor="kelas">
              Kelas
            </label>
            <select
              id="kelas"
              className="select"
              value={kelas}
              onChange={(event) => setKelas(event.target.value)}
            >
              <option value="">Pilih kelas</option>
              {KELAS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="topik">
              Topik
            </label>
            <select
              id="topik"
              className="select"
              value={topik}
              onChange={(event) => setTopik(event.target.value)}
            >
              <option value="">Pilih topik</option>
              {TOPIK_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="paper-actions">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Kirim pesan</Button>
        </div>

        <p className="hint" style={{ marginTop: "0.8rem", textAlign: "center" }}>
          Santai aja, bisa anonim kok 👌
        </p>
      </div>
    </div>
  );
}
