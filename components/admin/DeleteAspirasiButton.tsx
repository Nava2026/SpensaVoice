"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAspirasiButton({ kode }: { kode: string }) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, deleting]);

  function close() {
    if (deleting) return;
    setOpen(false);
    setError("");
    triggerRef.current?.focus();
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/aspirasi/${encodeURIComponent(kode)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal hapus aspirasi.");
        return;
      }
      setOpen(false);
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Gagal hapus. Cek koneksi ke Google Sheets.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        Hapus aspirasi
      </button>

      {open && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
          >
            <div className="modal-eyebrow">Konfirmasi hapus</div>
            <h2 className="modal-title" id="delete-title">
              Hapus aspirasi {kode}?
            </h2>
            <p className="modal-text" id="delete-desc">
              Aspirasi ini bakal dihapus permanen dari Google Sheet, termasuk
              isi pesan, balasan, dan statusnya. Tindakan ini gak bisa
              dibatalkan.
            </p>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button
                ref={cancelRef}
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={close}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Ngehapus..." : "Ya, hapus permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
