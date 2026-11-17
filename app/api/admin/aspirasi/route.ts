import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listAspirasi } from "@/lib/sheets";
import { filtersFromParams } from "@/lib/filters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  try {
    const filters = filtersFromParams(new URL(request.url).searchParams);
    const items = await listAspirasi(filters);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[adminList]", error);
    return NextResponse.json(
      { error: "Gagal ambil data aspirasi." },
      { status: 500 },
    );
  }
}
