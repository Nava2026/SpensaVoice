import Link from "next/link";
import { STATUS_LABEL, STATUS_OPTIONS, TOPIK_OPTIONS } from "@/lib/constants";
import { filtersToQuery } from "@/lib/filters";
import type { AspirasiFilters } from "@/lib/types";

export default function FilterBar({
  filters,
  total,
  shown,
}: {
  filters: AspirasiFilters;
  total: number;
  shown: number;
}) {
  const query = filtersToQuery(filters);
  const hasFilter = query.length > 0;

  return (
    <form className="filters" action="/admin" method="get">
      <div className="filter-grid">
        <div className="field">
          <label className="label" htmlFor="f-status">
            Status
          </label>
          <select
            id="f-status"
            name="status"
            className="select"
            defaultValue={filters.status ?? ""}
          >
            <option value="">Semua status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="f-topik">
            Topik
          </label>
          <select
            id="f-topik"
            name="topik"
            className="select"
            defaultValue={filters.topik ?? ""}
          >
            <option value="">Semua topik</option>
            {TOPIK_OPTIONS.map((topik) => (
              <option key={topik} value={topik}>
                {topik}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="f-anonim">
            Anonim
          </label>
          <select
            id="f-anonim"
            name="anonim"
            className="select"
            defaultValue={filters.anonim ?? ""}
          >
            <option value="">Semua</option>
            <option value="ya">Anonim</option>
            <option value="tidak">Pakai nama</option>
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="f-q">
            Keyword
          </label>
          <input
            id="f-q"
            name="q"
            className="input"
            placeholder="Kode, isi, kelas, nama..."
            defaultValue={filters.q ?? ""}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="f-from">
            Dari tanggal
          </label>
          <input
            id="f-from"
            type="date"
            name="from"
            className="input"
            defaultValue={filters.from ?? ""}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="f-to">
            Sampai tanggal
          </label>
          <input
            id="f-to"
            type="date"
            name="to"
            className="input"
            defaultValue={filters.to ?? ""}
          />
        </div>
      </div>

      <div className="filter-actions">
        <div className="filter-meta">
          Nampilin {shown} dari {total} aspirasi
        </div>
        <div className="filter-buttons">
          {hasFilter && (
            <Link href="/admin" className="btn btn-ghost btn-sm">
              Reset
            </Link>
          )}
          <a
            className="btn btn-secondary btn-sm"
            href={`/api/admin/export${query ? `?${query}` : ""}`}
          >
            Export CSV
          </a>
          <button type="submit" className="btn btn-primary btn-sm">
            Terapkan
          </button>
        </div>
      </div>
    </form>
  );
}
