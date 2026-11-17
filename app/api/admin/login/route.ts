import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json({ error: "Password dulu ya." }, { status: 400 });
  }

  try {
    if (!checkPassword(password)) {
      return NextResponse.json(
        { error: "Password salah. Coba lagi." },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("[adminLogin]", error);
    return NextResponse.json(
      { error: "Server belum dikonfigurasi. Cek ADMIN_PASSWORD." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(),
    sessionCookieOptions,
  );
  return response;
}
