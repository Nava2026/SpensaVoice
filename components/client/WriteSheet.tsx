"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { KELAS_OPTIONS, TOPIK_OPTIONS } from "@/lib/constants";

export interface WritePayload {
  isi: string;
  nama: string;
  kelas: string;
  topik: string;
  anonim: boolean;
}

const MAX_ISI = 500;
const MIN_ISI = 10;

const KELAS_SELECT_OPTIONS = [
  { value: "", label: "Pilih kelas" },
  ...KELAS_OPTIONS.map((kelas) => ({ value: kelas, label: kelas })),
];

const TOPIK_SELECT_OPTIONS = TOPIK_OPTIONS.map((topik) => ({
  value: topik,
  label: topik,
}));

export default function WriteSheet({
  onClose,
  onSubmit,
  initial,
}: {
  onClose: () => void;
  onSubmit: (payload: WritePayload) => void;
  initial?: WritePayload;
}) {
  const [isi, setIsi] = useState(initial?.isi ?? "");
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [kelas, setKelas] = useState(initial?.kelas ?? "");
  const [topik, setTopik] = useState(initial?.topik || "Fasilitas");
  const [anonim, setAnonim] = useState(initial?.anonim ?? true);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const paperRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => textareaRef.current?.focus({ preventScroll: true }),
      500,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = isi.trim();

    if (trimmed.length < MIN_ISI) {
      setError(`Pesan minimal ${MIN_ISI} karakter ya.`);
      paperRef.current?.classList.remove("shake");
      void paperRef.current?.offsetWidth;
      paperRef.current?.classList.add("shake");
      textareaRef.current?.focus();
      return;
    }
    if (trimmed.length > MAX_ISI) {
      setError("Pesan maksimal 500 karakter.");
      return;
    }

    setError("");
    onSubmit({
      isi: trimmed,
      nama: anonim ? "" : nama.trim(),
      kelas,
      topik,
      anonim,
    });
  }

  const length = isi.length;
  const enough = length >= MIN_ISI;

  return (
    <section className="screen write-screen" aria-label="Tulis pesan">
      <form className="write-paper" ref={paperRef} onSubmit={handleSubmit} noValidate>
        <h2 className="write-title">Tulis pesan</h2>
        <p className="write-hint">Unek-unek, saran, atau keluhan. Bebas, asal sopan ya.</p>

        <div className="write-field">
          <label className="write-label" htmlFor="isi">
            Pesanmu
          </label>
          <textarea
            id="isi"
            ref={textareaRef}
            className={`ruled${error ? " ruled-error" : ""}`}
            placeholder="Ceritain di sini..."
            maxLength={MAX_ISI}
            value={isi}
            onChange={(event) => {
              setIsi(event.target.value);
              if (error) setError("");
            }}
          />
          <div className={`write-counter${length >= MAX_ISI ? " over" : ""}`}>
            <span>{enough ? "sip, udah cukup" : `minimal ${MIN_ISI} huruf`}</span>
            <span>
              <b>{length}</b>/{MAX_ISI}
            </span>
          </div>
          {error && <p className="write-error">{error}</p>}
        </div>

        <div className="write-row">
          <div className="write-field">
            <label className="write-label" htmlFor="nama">
              Nama (opsional)
            </label>
            <input
              id="nama"
              className="write-input"
              placeholder={anonim ? "Anonim" : "Nama kamu"}
              autoComplete="off"
              maxLength={50}
              disabled={anonim}
              value={anonim ? "" : nama}
              onChange={(event) => setNama(event.target.value)}
            />
          </div>

          <div className="write-field">
            <label className="write-label" htmlFor="kelas">
              Kelas (opsional)
            </label>
            <Select
              id="kelas"
              value={kelas}
              onChange={setKelas}
              options={KELAS_SELECT_OPTIONS}
              placeholder="Pilih kelas"
              tone="paper"
            />
          </div>
        </div>

        <div className="write-field">
          <label className="write-label" htmlFor="topik">
            Topik
          </label>
          <Select
            id="topik"
            value={topik}
            onChange={setTopik}
            options={TOPIK_SELECT_OPTIONS}
            ariaLabel="Topik"
            tone="paper"
          />
        </div>

        <label className="anon-toggle">
          <input
            type="checkbox"
            checked={anonim}
            onChange={(event) => {
              setAnonim(event.target.checked);
              if (event.target.checked) setNama("");
            }}
          />
          <span className="anon-switch" aria-hidden="true" />
          <span>
            {anonim
              ? "Anonim, namamu nggak disimpan"
              : "Namamu ikut dikirim"}
          </span>
        </label>

        <div className="write-actions">
          <Button type="button" variant="ghost" className="paper-plain" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">Kirim</Button>
        </div>
      </form>
    </section>
  );
}
