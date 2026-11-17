import AspirasiCard from "./AspirasiCard";
import FilterBar from "./FilterBar";
import type { Aspirasi, AspirasiFilters } from "@/lib/types";

export default function AdminDashboard({
  items,
  all,
  filters,
}: {
  items: Aspirasi[];
  all: Aspirasi[];
  filters: AspirasiFilters;
}) {
  const count = (status: Aspirasi["status"]) =>
    all.filter((item) => item.status === status).length;

  const stats = [
    { label: "Total", value: all.length, sub: "Aspirasi masuk", color: undefined },
    { label: "Baru", value: count("baru"), sub: "Belum dibaca", color: "var(--primary)" },
    {
      label: "Diproses",
      value: count("diproses"),
      sub: "Lagi didengerin",
      color: "var(--info)",
    },
    {
      label: "Selesai",
      value: count("selesai"),
      sub: "Udah dijawab",
      color: "var(--success)",
    },
    {
      label: "Ditolak",
      value: count("ditolak"),
      sub: "Gak dilanjut",
      color: "var(--danger)",
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Dashboard OSIS</div>
          <h1 className="page-title">Aspirasi masuk</h1>
          <p className="page-desc">
            Semua suara siswa di satu tempat. Klik kartu buat baca detail dan
            bales.
          </p>
        </div>
      </div>

      <div className="stats">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      <FilterBar filters={filters} total={all.length} shown={items.length} />

      {items.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-emoji">📭</div>
          <div className="font-display" style={{ fontSize: "1.1rem" }}>
            Belum ada aspirasi
          </div>
          <p style={{ fontSize: "0.88rem", marginTop: "0.4rem" }}>
            {all.length === 0
              ? "Kalau siswa udah mulai kirim, aspirasinya bakal muncul di sini."
              : "Gak ada yang cocok sama filter kamu. Coba longgarin filternya."}
          </p>
        </div>
      ) : (
        <div className="list-grid">
          {items.map((item) => (
            <AspirasiCard key={item.id || item.kode} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
