import { KELAS_OPTIONS, TOPIK_OPTIONS } from "./constants";

export interface SubmitPayload {
  isi: string;
  nama: string;
  kelas: string;
  topik: string;
  anonim: boolean;
}

export type ValidationResult =
  | { ok: true; payload: SubmitPayload }
  | { ok: false; error: string };

/** Validasi server-side untuk submit aspirasi. */
export function validateSubmit(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Data yang dikirim gak valid." };
  }

  const raw = body as Record<string, unknown>;
  const isi = typeof raw.isi === "string" ? raw.isi.trim() : "";
  const anonim = raw.anonim !== false;

  if (isi.length < 10) {
    return { ok: false, error: "Pesan minimal 10 karakter ya." };
  }
  if (isi.length > 500) {
    return { ok: false, error: "Pesan maksimal 500 karakter." };
  }

  let nama = typeof raw.nama === "string" ? raw.nama.trim() : "";
  if (nama.length > 50) {
    return { ok: false, error: "Nama maksimal 50 karakter." };
  }
  if (anonim) nama = "";

  const kelas = typeof raw.kelas === "string" ? raw.kelas.trim() : "";
  if (kelas && !KELAS_OPTIONS.includes(kelas)) {
    return { ok: false, error: "Kelas gak dikenali." };
  }

  const topik = typeof raw.topik === "string" ? raw.topik.trim() : "";
  if (topik && !TOPIK_OPTIONS.includes(topik as never)) {
    return { ok: false, error: "Topik gak dikenali." };
  }

  return { ok: true, payload: { isi, nama, kelas, topik, anonim } };
}

/** Format kode tracking ke bentuk SV-XXXX. */
export function normalizeKode(input: string): string {
  const clean = input.trim().toUpperCase().replace(/\s+/g, "");
  if (!clean) return "";
  return clean.startsWith("SV-") ? clean : `SV-${clean.replace(/^SV/, "")}`;
}
