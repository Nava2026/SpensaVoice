import { NextResponse } from "next/server";
import { DEFAULT_OSIS } from "@/lib/osis";
import { listOsis } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Struktur OSIS untuk halaman siswa. Kalau bridge bermasalah, pakai data default. */
export async function GET() {
  try {
    const sections = await listOsis();
    return NextResponse.json(
      { sections: sections.length ? sections : DEFAULT_OSIS },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[osisPublic]", error);
    return NextResponse.json(
      { sections: DEFAULT_OSIS },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
