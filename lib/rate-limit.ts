const HOUR_MS = 60 * 60 * 1000;
const MAX_TRACKED = 5000;

const lastSubmit = new Map<string, number>();

/**
 * Jeda antar kiriman dari satu IP. Default 2 jam, bisa diatur lewat
 * SUBMIT_COOLDOWN_HOURS (0 = matikan). Best-effort dan per instance server.
 */
function cooldownMs(): number {
  const raw = process.env.SUBMIT_COOLDOWN_HOURS;
  const hours = raw === undefined || raw === "" ? 2 : Number(raw);
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.min(hours, 24 * 7) * HOUR_MS;
}

function keyFor(ip: string): string {
  return ip || "unknown";
}

export interface SubmitGate {
  allowed: boolean;
  retryAfterMs: number;
}

/**
 * Cek sekaligus kunci cooldown supaya dua request bersamaan tidak lolos.
 * Panggil cancelSubmit() kalau penyimpanan gagal, biar siswa bisa coba lagi.
 */
export function beginSubmit(ip: string): SubmitGate {
  const windowMs = cooldownMs();
  if (!windowMs) return { allowed: true, retryAfterMs: 0 };

  const now = Date.now();
  const key = keyFor(ip);
  const last = lastSubmit.get(key);

  if (last !== undefined) {
    const remaining = windowMs - (now - last);
    if (remaining > 0) {
      return { allowed: false, retryAfterMs: remaining };
    }
  }

  if (lastSubmit.size > MAX_TRACKED) {
    for (const [entry, time] of lastSubmit) {
      if (now - time >= windowMs) lastSubmit.delete(entry);
    }
  }

  lastSubmit.set(key, now);
  return { allowed: true, retryAfterMs: 0 };
}

export function cancelSubmit(ip: string): void {
  lastSubmit.delete(keyFor(ip));
}
