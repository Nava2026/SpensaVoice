import Link from "next/link";
import { redirect } from "next/navigation";
import OsisSettings from "@/components/admin/OsisSettings";
import SetupNotice from "@/components/admin/SetupNotice";
import { isAdmin } from "@/lib/auth";
import { DEFAULT_OSIS } from "@/lib/osis";
import { listOsis } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  if (!(await isAdmin())) {
    redirect("/admin");
  }

  try {
    const sections = await listOsis();
    return (
      <main className="admin-main">
        <Link className="back-link" href="/admin">
          ← Balik ke daftar aspirasi
        </Link>

        <div className="page-head">
          <div>
            <div className="page-eyebrow">Dashboard OSIS</div>
            <h1 className="page-title">Pengaturan</h1>
            <p className="page-desc">
              Atur struktur dan anggota OSIS yang tampil ke siswa.
            </p>
          </div>
        </div>

        <OsisSettings
          initialSections={sections.length ? sections : DEFAULT_OSIS}
        />
      </main>
    );
  } catch (error) {
    console.error("[adminPengaturanPage]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Gagal ambil struktur OSIS dari Google Sheets.";
    return <SetupNotice message={message} />;
  }
}
