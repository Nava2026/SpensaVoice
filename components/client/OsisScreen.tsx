"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { OsisSection } from "@/lib/osis";

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/** Satu orang yang diberi sorotan tipis di daftar. */
function isFeatured(name: string): boolean {
  return name.trim().toUpperCase() === "NAVARO ALBANI PRASETYO";
}

export default function OsisScreen({
  sections,
  onBack,
}: {
  sections: OsisSection[];
  onBack: () => void;
}) {
  const [tab, setTab] = useState(0);
  const active = sections[tab] ?? sections[0];

  return (
    <section className="screen osis-screen" aria-label="Struktur OSIS">
      <div className="osis-shell">
        <header className="osis-head">
          <div>
            <h2 className="osis-title">Kenalan sama OSIS</h2>
            <p className="osis-lede">
              Mereka yang baca dan nindaklanjutin pesanmu.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="btn-line"
            onClick={onBack}
          >
            Balik
          </Button>
        </header>

        {sections.length === 0 ? (
          <div className="osis-empty">
            <p>Struktur OSIS belum diatur. Coba cek lagi nanti ya.</p>
          </div>
        ) : (
          <div className="osis-body">
            <nav
              className="osis-nav"
              role="tablist"
              aria-label="Bagian OSIS"
            >
              {sections.map((section, index) => (
                <span className="osis-tab-wrap" key={`${section.bagian}-${index}`}>
                  {section.grup && !sections[index - 1]?.grup && (
                    <span className="osis-group-label">Seksi bidang</span>
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={index === tab}
                    aria-controls={`osis-pane-${index}`}
                    id={`osis-tab-${index}`}
                    className="osis-tab"
                    onClick={() => setTab(index)}
                  >
                    {section.bagian}
                  </button>
                </span>
              ))}
            </nav>

            {active && (
              <div
                className="osis-pane"
                role="tabpanel"
                id={`osis-pane-${tab}`}
                aria-labelledby={`osis-tab-${tab}`}
                key={`${active.bagian}-${tab}`}
              >
                <h3 className="osis-pane-title">{active.bagian}</h3>
                <p className="osis-pane-count">
                  {active.people.length > 0
                    ? `${active.sub} · ${active.people.length} anggota`
                    : active.sub}
                </p>

                {active.people.length === 0 ? (
                  <p className="osis-empty-member">
                    Belum ada anggota di bagian ini.
                  </p>
                ) : active.people.length <= 2 ? (
                  <div className="osis-feature">
                    {active.people.map((person, index) => (
                      <div
                        className={`osis-person-feature${isFeatured(person.nama) ? " is-featured" : ""}`}
                        key={`${person.nama}-${index}`}
                        style={{ "--i": index } as React.CSSProperties}
                      >
                        <span className="osis-avatar big" aria-hidden="true">
                          {initial(person.nama)}
                        </span>
                        <div>
                          <div className="osis-role">
                            {person.jabatan || active.bagian}
                          </div>
                          <div className="osis-name">{person.nama}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="osis-members">
                    {active.people.map((person, index) => (
                      <li
                        className={isFeatured(person.nama) ? "is-featured" : undefined}
                        key={`${person.nama}-${index}`}
                        style={{ "--i": index } as React.CSSProperties}
                      >
                        <span className="osis-avatar" aria-hidden="true">
                          {initial(person.nama)}
                        </span>
                        <span className="osis-member-name">{person.nama}</span>
                        {person.jabatan && (
                          <em className="osis-member-role">{person.jabatan}</em>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
