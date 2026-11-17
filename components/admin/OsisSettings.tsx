"use client";

import { useState } from "react";
import type { OsisSection } from "@/lib/osis";

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default function OsisSettings({
  initialSections,
}: {
  initialSections: OsisSection[];
}) {
  const [sections, setSections] = useState<OsisSection[]>(initialSections);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function patchSection(index: number, patch: Partial<OsisSection>) {
    setSections((current) =>
      current.map((section, i) =>
        i === index ? { ...section, ...patch } : section,
      ),
    );
    setMessage("");
  }

  function patchPerson(
    sectionIndex: number,
    personIndex: number,
    patch: { nama?: string; jabatan?: string },
  ) {
    setSections((current) =>
      current.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          people: section.people.map((person, p) =>
            p === personIndex ? { ...person, ...patch } : person,
          ),
        };
      }),
    );
    setMessage("");
  }

  function addPerson(sectionIndex: number) {
    setSections((current) =>
      current.map((section, i) =>
        i === sectionIndex
          ? { ...section, people: [...section.people, { nama: "", jabatan: "" }] }
          : section,
      ),
    );
    setMessage("");
  }

  function removePerson(sectionIndex: number, personIndex: number) {
    setSections((current) =>
      current.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              people: section.people.filter((_, p) => p !== personIndex),
            }
          : section,
      ),
    );
    setMessage("");
  }

  function addSection() {
    setSections((current) => [
      ...current,
      {
        bagian: "Bagian baru",
        sub: "Keterangan bagian",
        grup: true,
        people: [{ nama: "", jabatan: "" }],
      },
    ]);
    setMessage("");
  }

  function removeSection(index: number) {
    if (sections.length <= 1) {
      setError("Struktur OSIS minimal punya satu bagian.");
      return;
    }
    if (!window.confirm(`Hapus bagian "${sections[index].bagian}"?`)) return;
    setSections((current) => current.filter((_, i) => i !== index));
    setMessage("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/osis", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal simpan struktur OSIS.");
        return;
      }
      setSections(data.sections as OsisSection[]);
      setMessage("Tersimpan. Halaman siswa langsung pakai struktur baru.");
    } catch {
      setError("Gagal simpan. Cek koneksi ke Google Sheets.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="settings-toolbar">
        <div>
          <p className="settings-note">
            Nama dan jabatan di sini yang tampil di halaman{" "}
            <strong>Kenalan sama OSIS</strong>. Kosongkan nama buat baris yang
            gak dipakai, atau hapus anggotanya.
          </p>
          {message && <p className="settings-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Nyimpen..." : "Simpan perubahan"}
        </button>
      </div>

      <div className="settings-list">
        {sections.map((section, sectionIndex) => (
          <section className="settings-card" key={sectionIndex}>
            <header className="settings-card-head">
              <div className="settings-section-fields">
                <label className="label" htmlFor={`bagian-${sectionIndex}`}>
                  Nama bagian
                </label>
                <input
                  id={`bagian-${sectionIndex}`}
                  className="input"
                  value={section.bagian}
                  maxLength={60}
                  onChange={(event) =>
                    patchSection(sectionIndex, { bagian: event.target.value })
                  }
                />
                <label className="label" htmlFor={`sub-${sectionIndex}`}>
                  Keterangan
                </label>
                <input
                  id={`sub-${sectionIndex}`}
                  className="input"
                  value={section.sub}
                  maxLength={120}
                  onChange={(event) =>
                    patchSection(sectionIndex, { sub: event.target.value })
                  }
                />
              </div>

              <div className="settings-card-side">
                <label className="settings-check">
                  <input
                    type="checkbox"
                    checked={section.grup}
                    onChange={(event) =>
                      patchSection(sectionIndex, { grup: event.target.checked })
                    }
                  />
                  <span>Masuk grup Seksi Bidang</span>
                </label>
                <button
                  type="button"
                  className="settings-remove-section"
                  onClick={() => removeSection(sectionIndex)}
                >
                  Hapus bagian
                </button>
              </div>
            </header>

            <ul className="settings-members">
              {section.people.map((person, personIndex) => (
                <li key={personIndex} className="settings-member">
                  <span className="settings-avatar" aria-hidden="true">
                    {initial(person.nama)}
                  </span>
                  <input
                    className="input"
                    placeholder="Nama anggota"
                    aria-label={`Nama anggota ${personIndex + 1} ${section.bagian}`}
                    maxLength={80}
                    value={person.nama}
                    onChange={(event) =>
                      patchPerson(sectionIndex, personIndex, {
                        nama: event.target.value,
                      })
                    }
                  />
                  <input
                    className="input settings-role-input"
                    placeholder="Jabatan (opsional)"
                    aria-label={`Jabatan ${personIndex + 1} ${section.bagian}`}
                    maxLength={60}
                    value={person.jabatan}
                    onChange={(event) =>
                      patchPerson(sectionIndex, personIndex, {
                        jabatan: event.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    className="settings-icon"
                    aria-label={`Hapus ${person.nama || "anggota"}`}
                    onClick={() => removePerson(sectionIndex, personIndex)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="settings-add"
              onClick={() => addPerson(sectionIndex)}
            >
              + Tambah anggota
            </button>
          </section>
        ))}
      </div>

      <div className="settings-foot">
        <button type="button" className="settings-add-section" onClick={addSection}>
          + Tambah bagian
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Nyimpen..." : "Simpan perubahan"}
        </button>
      </div>
    </>
  );
}
