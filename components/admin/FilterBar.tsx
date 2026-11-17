"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { STATUS_LABEL, STATUS_OPTIONS, TOPIK_OPTIONS } from "@/lib/constants";
import { filtersToQuery } from "@/lib/filters";
import type { AspirasiFilters } from "@/lib/types";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Semua status" },
  ...STATUS_OPTIONS.map((status) => ({
    value: status,
    label: STATUS_LABEL[status],
  })),
];

const TOPIK_FILTER_OPTIONS = [
  { value: "", label: "Semua topik" },
  ...TOPIK_OPTIONS.map((topik) => ({ value: topik, label: topik })),
];

const ANONIM_FILTER_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "ya", label: "Anonim" },
  { value: "tidak", label: "Pakai nama" },
];

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
  const [status, setStatus] = useState(filters.status ?? "");
  const [topik, setTopik] = useState(filters.topik ?? "");
  const [anonim, setAnonim] = useState(filters.anonim ?? "");

  useEffect(() => {
    setStatus(filters.status ?? "");
    setTopik(filters.topik ?? "");
    setAnonim(filters.anonim ?? "");
  }, [filters.status, filters.topik, filters.anonim]);

  return (
    <form className="filters" action="/admin" method="get">
      <div className="filter-grid">
        <div className="field">
          <label className="label" htmlFor="f-status">
            Status
          </label>
          <Select
            id="f-status"
            name="status"
            value={status}
            onChange={setStatus}
            options={STATUS_FILTER_OPTIONS}
            ariaLabel="Filter status"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="f-topik">
            Topik
          </label>
          <Select
            id="f-topik"
            name="topik"
            value={topik}
            onChange={setTopik}
            options={TOPIK_FILTER_OPTIONS}
            ariaLabel="Filter topik"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="f-anonim">
            Anonim
          </label>
          <Select
            id="f-anonim"
            name="anonim"
            value={anonim}
            onChange={setAnonim}
            options={ANONIM_FILTER_OPTIONS}
            ariaLabel="Filter anonim"
          />
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
