import type { AspirasiFilters } from "./types";

export function filtersFromParams(params: URLSearchParams): AspirasiFilters {
  return {
    status: params.get("status") ?? "",
    topik: params.get("topik") ?? "",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    anonim: params.get("anonim") ?? "",
    q: params.get("q") ?? "",
  };
}

/** Bangun query string dari filter yang aktif (untuk link export). */
export function filtersToQuery(filters: AspirasiFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}
