import { NextResponse } from "next/server";
import {
  createAspirasi,
  getAspirasiByKode,
  toPublic,
} from "@/lib/sheets";
import { validateSubmit } from "@/lib/validation";
import { getClientIp, getDevice } from "@/lib/request-meta";
import { beginSubmit, cancelSubmit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);

    const body = await request.json().catch(() => null);
    const result = validateSubmit(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const gate = beginSubmit(ip);
    if (!gate.allowed) {
      const minutes = Math.max(1, Math.ceil(gate.retryAfterMs / 60000));
      const wait =
        minutes >= 60
          ? `${Math.ceil(minutes / 60)} jam`
          : `${minutes} menit`;
      return NextResponse.json(
        {
          error: `Kamu baru kirim pesan dari jaringan ini. Coba lagi ${wait} lagi ya.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(gate.retryAfterMs / 1000)) },
        },
      );
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    let item;
    try {
      item = await createAspirasi({
        ...result.payload,
        ip,
        userAgent,
        device: getDevice(userAgent),
      });
    } catch (error) {
      // Jangan hanguskan cooldown kalau penyimpanan ke Sheets gagal.
      cancelSubmit(ip);
      throw error;
    }

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
