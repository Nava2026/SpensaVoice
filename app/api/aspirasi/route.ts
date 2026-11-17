import { NextResponse } from "next/server";
import {
  createAspirasi,
  getAspirasiByKode,
  toPublic,
} from "@/lib/sheets";
import { validateSubmit } from "@/lib/validation";
import { getClientIp, getDevice } from "@/lib/request-meta";
import { allowSubmit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    if (!allowSubmit(ip)) {
      return NextResponse.json(
        {
          error:
            "Kamu udah kirim beberapa pesan barusan. Coba lagi 10 menit lagi ya.",
        },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const result = validateSubmit(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    const item = await createAspirasi({
      ...result.payload,
      ip,
      userAgent,
      device: getDevice(userAgent),
    });

    return NextResponse.json({ ok: true, kode: item.kode }, { status: 201 });
  } catch (error) {
    console.error("[submitAspirasi]", error);
    return NextResponse.json(
      { error: "Pesan gagal disimpan. Coba lagi sebentar lagi ya." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const kode = new URL(request.url).searchParams.get("kode") ?? "";
  if (!kode) {
    return NextResponse.json({ error: "Kode tracking kosong." }, { status: 400 });
  }

  try {
    const item = await getAspirasiByKode(kode);
    if (!item) {
      return NextResponse.json(
        { error: "Kode tidak ditemukan. Cek lagi tulisannya ya." },
        { status: 404 },
      );
    }
    return NextResponse.json({ aspirasi: toPublic(item) });
  } catch (error) {
    console.error("[getByKode]", error);
    return NextResponse.json(
      { error: "Gagal ngecek kode. Coba lagi sebentar lagi ya." },
      { status: 500 },
    );
  }
}
