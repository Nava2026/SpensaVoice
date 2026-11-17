import { isAdmin } from "@/lib/auth";
import { listAspirasi } from "@/lib/sheets";
import { SHEET_HEADER } from "@/lib/constants";
import { filtersFromParams } from "@/lib/filters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return new Response("Belum login.", { status: 401 });
  }

  try {
    const filters = filtersFromParams(new URL(request.url).searchParams);
    const items = await listAspirasi(filters);

    const lines = [
      SHEET_HEADER.map(csvCell).join(","),
      ...items.map((item) =>
        SHEET_HEADER.map((key) => csvCell(item[key])).join(","),
      ),
    ];

    const date = new Date().toISOString().slice(0, 10);
    return new Response(`\uFEFF${lines.join("\r\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="spensavoice-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[adminExport]", error);
    return new Response("Gagal bikin export CSV.", { status: 500 });
  }
}
