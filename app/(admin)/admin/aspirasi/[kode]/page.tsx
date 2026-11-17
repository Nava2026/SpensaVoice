import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteAspirasiButton from "@/components/admin/DeleteAspirasiButton";
import DetailEditor from "@/components/admin/DetailEditor";
import SetupNotice from "@/components/admin/SetupNotice";
import { isAdmin } from "@/lib/auth";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { maskIp, shortUserAgent } from "@/lib/request-meta";
import { getAspirasiByKode } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function AspirasiDetailPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  if (!(await isAdmin())) {
    redirect("/admin");
  }

  const { kode } = await params;

  try {
    const item = await getAspirasiByKode(kode);

    if (!item) {
      return (
        <main className="admin-main">
          <Link className="back-link" href="/admin">
            ← Balik ke daftar
          </Link>
          <div className="card empty-state">
            <div className="empty-emoji">🔍</div>
            <div className="font-display" style={{ fontSize: "1.1rem" }}>
              Aspirasi gak ketemu
            </div>
            <p style={{ fontSize: "0.88rem", marginTop: "0.4rem" }}>
              Kode <strong>{kode}</strong> gak ada di sheet. Mungkin udah
              dihapus atau kodenya salah.
            </p>
          </div>
        </main>
      );
    }

    return (
      <main className="admin-main">
        <Link className="back-link" href="/admin">
          ← Balik ke daftar
        </Link>

        <div className="detail-grid">
          <div>
            <section className="detail-panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div className="detail-code">{item.kode}</div>
                  <div className="detail-sub">
                    {formatDateTime(item.created_at)}
                    {item.topik ? ` · ${item.topik}` : ""}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[item.status]}`}>
                  {STATUS_LABEL[item.status]}
                </span>
              </div>

              <div className="detail-isi">{item.isi}</div>

              <div className="detail-actions">
                <DeleteAspirasiButton kode={item.kode} />
              </div>
            </section>

            <section className="detail-panel">
              <div className="panel-title">Info pengirim</div>
              <dl className="kv">
                <dt>Nama</dt>
                <dd>
                  {item.anonim ? "Anonim" : item.nama || "Gak diisi"}
                </dd>
                <dt>Kelas</dt>
                <dd>{item.kelas || "Gak diisi"}</dd>
                <dt>Topik</dt>
                <dd>{item.topik || "Gak diisi"}</dd>
                <dt>Anonim</dt>
                <dd>{item.anonim ? "Ya" : "Tidak"}</dd>
                <dt>Kode</dt>
                <dd>{item.kode}</dd>
              </dl>
            </section>
          </div>

          <div>
            <DetailEditor
              kode={item.kode}
              initialStatus={item.status}
              initialBalasan={item.balasan}
            />

            <section className="detail-panel">
              <div className="panel-title">Meta tracking</div>
              <div className="meta-row">
                <div className="meta-key">IP address</div>
                <div className="meta-value">{maskIp(item.ip)}</div>
              </div>
              <div className="meta-row">
                <div className="meta-key">User agent</div>
                <div className="meta-value">
                  {shortUserAgent(item.user_agent)}
                </div>
              </div>
              <div className="meta-row">
                <div className="meta-key">Device</div>
                <div className="meta-value">{item.device}</div>
              </div>
              <div className="meta-row">
                <div className="meta-key">Terakhir diubah</div>
                <div className="meta-value">
                  {formatDateTime(item.updated_at)}
                </div>
              </div>
              <p className="hint" style={{ marginTop: "0.75rem" }}>
                Meta cuma buat internal OSIS. Jangan ditampilin ke siswa.
              </p>
            </section>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[adminDetailPage]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Gagal ambil detail dari Google Sheets.";
    return <SetupNotice message={message} />;
  }
}
