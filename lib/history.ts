export interface HistoryItem {
  kode: string;
  created_at: string;
  topik: string;
}

const KEY = "sv_history_v1";
const MAX_ITEMS = 12;

/** Riwayat kode disimpan lokal di browser siswa, tidak dikirim ke server. */
export function readHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(KEY) ?? "[]",
    );
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is HistoryItem => {
        if (!item || typeof item !== "object") return false;
        const row = item as Record<string, unknown>;
        return typeof row.kode === "string" && row.kode.startsWith("SV-");
      })
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function writeHistory(items: HistoryItem[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage penuh / diblokir: riwayat cuma fitur kenyamanan, jangan ganggu alur.
  }
}

export function addHistory(item: HistoryItem): HistoryItem[] {
  const next = [
    item,
    ...readHistory().filter((row) => row.kode !== item.kode),
  ].slice(0, MAX_ITEMS);
  writeHistory(next);
  return next;
}

export function clearHistory(): HistoryItem[] {
  writeHistory([]);
  return [];
}
