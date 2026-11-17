import { randomUUID } from "node:crypto";
import type { OsisSection } from "./osis";
import type {
  Aspirasi,
  AspirasiFilters,
  AspirasiPublic,
  Device,
  Status,
} from "./types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_CODE_ATTEMPTS = 5;
const BRIDGE_TIMEOUT_MS = 20_000;

type RawItem = Record<string, unknown>;

interface BridgeResponse {
  ok: boolean;
  error?: string;
  items?: RawItem[];
  item?: RawItem;
}

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum di-set. Cek file .env kamu.`);
  return value;
}

/** Panggil Web App Apps Script (satu pintu untuk semua baca/tulis sheet). */
async function callBridge(
  action: "list" | "create" | "update" | "getOsis" | "saveOsis",
  payload?: unknown,
): Promise<BridgeResponse> {
  const url = env("SHEETS_WEBAPP_URL");
  const secret = env("SHEETS_SHARED_SECRET");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, action, payload }),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(BRIDGE_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[sheets] gagal hubungi Apps Script", error);
    throw new Error(
      "Gak bisa nyambung ke Google Sheet. Cek SHEETS_WEBAPP_URL dan akses Web App.",
    );
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "Balasan Apps Script gak valid. Pastikan URL berakhiran /exec dan akses Web App = Anyone.",
    );
  }

  const result = data as BridgeResponse;
  if (!result || typeof result.ok !== "boolean") {
    throw new Error("Balasan Apps Script gak dikenali.");
  }
  if (!result.ok) {
    throw new Error(result.error || "Apps Script nolak permintaan.");
  }
  return result;
}

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function mapItem(raw: RawItem): Aspirasi {
  const anonimRaw = raw.anonim;
  return {
    id: text(raw.id),
    kode: text(raw.kode),
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    nama: text(raw.nama),
    kelas: text(raw.kelas),
    topik: text(raw.topik) as Aspirasi["topik"],
    isi: text(raw.isi),
    anonim:
      anonimRaw === true || text(anonimRaw).toLowerCase() === "true",
    status: (text(raw.status) || "baru") as Status,
    balasan: text(raw.balasan),
    ip: text(raw.ip),
    user_agent: text(raw.user_agent),
    device: (text(raw.device) || "unknown") as Device,
  };
}

export async function listAspirasi(
  filters: AspirasiFilters = {},
): Promise<Aspirasi[]> {
  const res = await callBridge("list");
  const items = (res.items ?? [])
    .map(mapItem)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return filterAspirasi(items, filters);
}

export function filterAspirasi(
  items: Aspirasi[],
  filters: AspirasiFilters,
): Aspirasi[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
  const to = filters.to ? new Date(`${filters.to}T23:59:59`) : null;

  return items.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.topik && item.topik !== filters.topik) return false;
    if (filters.anonim === "ya" && !item.anonim) return false;
    if (filters.anonim === "tidak" && item.anonim) return false;

    if (from || to) {
      const created = new Date(item.created_at);
      if (Number.isNaN(created.getTime())) return false;
      if (from && created < from) return false;
      if (to && created > to) return false;
    }

    if (q) {
      const haystack = [
        item.kode,
        item.isi,
        item.kelas,
        item.nama,
        item.topik,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export async function getAspirasiByKode(
  kode: string,
): Promise<Aspirasi | null> {
  const target = kode.trim().toUpperCase();
  if (!target) return null;
  const all = await listAspirasi();
  return all.find((item) => item.kode.toUpperCase() === target) ?? null;
}

export function toPublic(item: Aspirasi): AspirasiPublic {
  return {
    kode: item.kode,
    created_at: item.created_at,
    topik: item.topik,
    status: item.status,
    balasan: item.balasan,
  };
}

function randomKode(): string {
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `SV-${code}`;
}

export async function createAspirasi(input: {
  isi: string;
  nama: string;
  kelas: string;
  topik: string;
  anonim: boolean;
  ip: string;
  userAgent: string;
  device: Device;
}): Promise<Aspirasi> {
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const item: Aspirasi = {
      id: randomUUID(),
      kode: randomKode(),
      created_at: now,
      updated_at: now,
      nama: input.anonim ? "" : input.nama,
      kelas: input.kelas,
      topik: input.topik as Aspirasi["topik"],
      isi: input.isi,
      anonim: input.anonim,
      status: "baru",
      balasan: "",
      ip: input.ip,
      user_agent: input.userAgent,
      device: input.device,
    };

    try {
      const res = await callBridge("create", item);
      return res.item ? mapItem(res.item) : item;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("KODE_DUPLIKAT")) continue;
      throw error;
    }
  }

  throw new Error("Gagal bikin kode unik. Coba lagi ya.");
}

export async function updateAspirasi(
  kode: string,
  patch: { status?: Status; balasan?: string },
): Promise<Aspirasi> {
  const res = await callBridge("update", {
    kode,
    status: patch.status,
    balasan: patch.balasan,
  });

  if (!res.item) throw new Error("Balasan update kosong.");
  return mapItem(res.item);
}

function number(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Baris sheet `osis` -> struktur yang dipakai halaman siswa & admin. */
function mapOsisSections(rows: RawItem[]): OsisSection[] {
  const parsed = rows
    .map((raw) => ({
      bagian: text(raw.bagian),
      sub: text(raw.sub),
      grup:
        raw.grup === true ||
        ["true", "ya", "1"].includes(text(raw.grup).toLowerCase()),
      urutan: number(raw.urutan),
      nama: text(raw.nama),
      jabatan: text(raw.jabatan),
      urutanAnggota: number(raw.urutan_anggota),
    }))
    .filter((row) => row.bagian)
    .sort(
      (a, b) =>
        a.urutan - b.urutan ||
        a.urutanAnggota - b.urutanAnggota ||
        a.nama.localeCompare(b.nama),
    );

  const sections: OsisSection[] = [];
  const byName = new Map<string, OsisSection>();

  for (const row of parsed) {
    let section = byName.get(row.bagian);
    if (!section) {
      section = {
        bagian: row.bagian,
        sub: row.sub || `Bagian ${row.bagian}`,
        grup: row.grup,
        people: [],
      };
      byName.set(row.bagian, section);
      sections.push(section);
    }
    if (row.nama) {
      section.people.push({ nama: row.nama, jabatan: row.jabatan });
    }
  }

  return sections;
}

/** Struktur OSIS dari sheet. Array kosong berarti sheet belum diisi. */
export async function listOsis(): Promise<OsisSection[]> {
  const res = await callBridge("getOsis");
  return mapOsisSections(res.items ?? []);
}

/** Ganti seluruh isi sheet `osis` dengan struktur dari admin. */
export async function saveOsis(sections: OsisSection[]): Promise<void> {
  await callBridge("saveOsis", { sections });
}
