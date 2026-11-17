import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getAspirasiByKode, updateAspirasi } from "@/lib/sheets";
import { STATUS_OPTIONS } from "@/lib/constants";
import type { Status } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ kode: string }> };

export async function GET(_request: Request, context: Context) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const { kode } = await context.params;
  try {
    const item = await getAspirasiByKode(kode);
    if (!item) {
      return NextResponse.json(
        { error: "Aspirasi gak ketemu." },
        { status: 404 },
      );
    }
    return NextResponse.json({ aspirasi: item });
  } catch (error) {
    console.error("[adminDetail]", error);
    return NextResponse.json(
      { error: "Gagal ambil detail aspirasi." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const { kode } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    status?: unknown;
    balasan?: unknown;
  } | null;

  const patch: { status?: Status; balasan?: string } = {};

  if (body?.status !== undefined) {
    if (
      typeof body.status !== "string" ||
      !STATUS_OPTIONS.includes(body.status as Status)
    ) {
      return NextResponse.json({ error: "Status gak valid." }, { status: 400 });
    }
    patch.status = body.status as Status;
  }

  if (body?.balasan !== undefined) {
    if (typeof body.balasan !== "string") {
      return NextResponse.json({ error: "Balasan gak valid." }, { status: 400 });
    }
    if (body.balasan.length > 2000) {
      return NextResponse.json(
        { error: "Balasan maksimal 2000 karakter." },
        { status: 400 },
      );
    }
    patch.balasan = body.balasan.trim();
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Gak ada perubahan yang dikirim." },
      { status: 400 },
    );
  }

  try {
    const item = await updateAspirasi(kode, patch);
    return NextResponse.json({ ok: true, aspirasi: item });
  } catch (error) {
    console.error("[adminUpdate]", error);
    const message =
      error instanceof Error ? error.message : "Gagal nyimpen perubahan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
