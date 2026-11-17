import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { DEFAULT_OSIS, normalizeOsisSections } from "@/lib/osis";
import { listOsis, saveOsis } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  try {
    const sections = await listOsis();
    return NextResponse.json({ sections: sections.length ? sections : DEFAULT_OSIS });
  } catch (error) {
    console.error("[adminOsisGet]", error);
    return NextResponse.json(
      { error: "Gagal ambil struktur OSIS dari Google Sheets." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    sections?: unknown;
  } | null;

  let sections;
  try {
    sections = normalizeOsisSections(body?.sections);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Struktur OSIS gak valid.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await saveOsis(sections);
    return NextResponse.json({ ok: true, sections });
  } catch (error) {
    console.error("[adminOsisPut]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Gagal simpan struktur OSIS ke Google Sheets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
