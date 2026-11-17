import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLogin from "@/components/admin/AdminLogin";
import SetupNotice from "@/components/admin/SetupNotice";
import { isAdmin } from "@/lib/auth";
import { filtersFromParams } from "@/lib/filters";
import { filterAspirasi, listAspirasi } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isAdmin())) {
    return <AdminLogin />;
  }

  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) query.set(key, value);
  }
  const filters = filtersFromParams(query);

  try {
    const all = await listAspirasi();
    const items = filterAspirasi(all, filters);
    return (
      <main className="admin-main">
        <AdminDashboard items={items} all={all} filters={filters} />
      </main>
    );
  } catch (error) {
    console.error("[adminPage]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Gagal ambil data dari Google Sheets.";
    return <SetupNotice message={message} />;
  }
}
