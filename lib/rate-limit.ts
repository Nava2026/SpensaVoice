const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMITS = 3;

const buckets = new Map<string, number[]>();

/** Batasi submit berulang dari IP yang sama (best-effort, per instance). */
export function allowSubmit(ip: string): boolean {
  const now = Date.now();
  const key = ip || "unknown";
  const recent = (buckets.get(key) ?? []).filter(
    (time) => now - time < WINDOW_MS,
  );

  if (recent.length >= MAX_SUBMITS) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);
  return true;
}
