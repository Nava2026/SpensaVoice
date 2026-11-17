"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";
import { STATUS_LABEL, STATUS_OPTIONS } from "@/lib/constants";
import type { Status } from "@/lib/types";

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map((status) => ({
  value: status,
  label: STATUS_LABEL[status],
}));

export default function DetailEditor({
  kode,
  initialStatus,
  initialBalasan,
}: {
  kode: string;
  initialStatus: Status;
  initialBalasan: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [balasan, setBalasan] = useState(initialBalasan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const changed =
    status !== initialStatus || balasan !== initialBalasan;

  async function save() {
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(
        `/api/admin/aspirasi/${encodeURIComponent(kode)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, balasan }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal nyimpen perubahan.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Gagal nyimpen. Cek koneksi kamu ya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="detail-panel">
      <div className="panel-title">Tindak lanjut</div>

      <div className="field">
        <label className="label" htmlFor="status">
          Status
        </label>
        <Select
          id="status"
          value={status}
          onChange={(next) => {
            setStatus(next as Status);
            setSaved(false);
          }}
          options={STATUS_SELECT_OPTIONS}
          ariaLabel="Status aspirasi"
        />
      </div>

      <div className="field" style={{ marginBottom: "0.5rem" }}>
        <label className="label" htmlFor="balasan">
          Balasan OSIS
        </label>
        <textarea
          id="balasan"
          className="textarea"
          placeholder="Tulis balasan buat siswa ini..."
          value={balasan}
          maxLength={2000}
          onChange={(event) => {
            setBalasan(event.target.value);
            setSaved(false);
          }}
        />
        <div className="counter-row" style={{ color: "var(--text-muted)" }}>
          <span>Balasan ini bakal kelihatan siswa lewat kode.</span>
          <span>{balasan.length}/2000</span>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {saved && <p className="saved-note">Perubahan kesimpen ✓</p>}

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={save}
        disabled={loading || !changed}
        style={{ marginTop: "0.5rem" }}
      >
        {loading ? "Nyimpen..." : "Simpan perubahan"}
      </button>
    </section>
  );
}
