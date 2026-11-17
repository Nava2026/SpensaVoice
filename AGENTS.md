# AGENTS.md — SpensaVoice

Dokumen ini untuk agent/AI yang mulai kerja di repo ini. Baca dulu sebelum mengubah kode.
Ditulis dalam bahasa Indonesia karena pemilik proyek dan seluruh UI berbahasa Indonesia.

## Apa ini

**SpensaVoice** adalah kotak aspirasi digital OSIS SMP Negeri 1 Dander (Spensada), Bojonegoro.
Siswa mengirim aspirasi tanpa login (boleh anonim) dan mengecek status dengan kode `SV-XXXX`.
OSIS mengelola aspirasi lewat dashboard `/admin`. Semua data disimpan di **Google Sheets**
lewat **Apps Script Web App**, bukan database biasa dan tanpa Google Cloud/service account.

Repo: https://github.com/Nava2026/SpensaVoice (branch `main`, sudah ter-push).

## Stack & batasan

- Next.js 15 App Router + React 19 + TypeScript. Satu app untuk sisi siswa dan admin.
- **Tanpa Tailwind, tanpa UI library.** CSS vanilla di `styles/` (tokens, base, client, admin).
- **Tanpa database eksternal.** Satu-satunya dependensi runtime selain Next/React: tidak ada.
  Jangan tambah dependensi kalau bisa diselesaikan dengan yang sudah ada.
- Deploy target: Vercel (atau Node host apa pun). Semua API route memakai `runtime = "nodejs"`.
- Bahasa UI: Indonesia santai ("kamu", "udah", "gak"), bukan formal. Kode/komentar: Indonesia singkat.
- Desain dark-first dengan aksen biru, plus "mode kertas" terang; mobile-first untuk siswa.

## Cara menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build (wajib lolos sebelum push)
```

Tidak ada script `lint`/test. Verifikasi minimal: `npm run typecheck`; untuk perubahan besar
tambahkan `npm run build` dan `node --check google-apps-script/Code.gs` bila menyentuh bridge.

Akses dari HP/luar jaringan saat dev:

```bash
/tmp/cloudflared tunnel --url http://localhost:3000 --no-autoupdate
```

`next.config.ts` sudah punya `allowedDevOrigins: ["*.trycloudflare.com"]` — jangan hapus,
kalau tidak Next dev memblokir request dari domain tunnel. URL trycloudflare hanya hidup
selama proses cloudflared jalan.

## Environment

Salin `.env.example` → `.env.local`, lalu isi:

| Variable | Fungsi |
|---|---|
| `ADMIN_PASSWORD` | satu-satunya password dashboard `/admin` |
| `SESSION_SECRET` | kunci HMAC tanda tangan cookie sesi (string acak panjang) |
| `SHEETS_WEBAPP_URL` | URL Web App Apps Script, harus berakhiran `/exec` |
| `SHEETS_SHARED_SECRET` | secret yang dicetak `setup()` di log Apps Script |

Aturan keras:

- **Jangan pernah membaca, mencetak, atau meng-commit `.env.local`.** File itu sudah di-ignore.
- Jangan hardcode kredensial di kode, fixture, atau dokumentasi.
- `.env.example` hanya berisi placeholder.

## Arsitektur & alur data

```
Browser siswa ──POST/GET──> /api/aspirasi ──┐
Browser admin ──POST─────> /api/admin/*  ──┤──> lib/sheets.ts ──POST JSON──> Apps Script /exec ──> Google Sheet "aspirasi"
                                           │        (text/plain, shared secret)
                                      lib/auth.ts (cookie sv_admin)
```

- `lib/sheets.ts` adalah satu-satunya pintu ke Sheets. UI dan route lain tidak boleh `fetch` langsung.
- Apps Script menerima `{ secret, action, payload }` dengan `action` = `list` | `create` | `update`,
  dan membalas `{ ok: true, items | item }` atau `{ ok: false, error }`.
- Kode tracking dibuat di **Next.js** (`lib/sheets.ts`), bukan di Apps Script: alfabet
  `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (tanpa I/O/0/1), retry maksimal 5x jika bridge membalas
  `KODE_DUPLIKAT`.
- `GET /` di URL Web App hanya health check: `{"ok":true,"service":"spensavoice-bridge"}`.

## Peta file

```
app/(client)/page.tsx                 # halaman siswa
components/client/                    # Intro, Hero, WriteSheet, SendAnimation, TrackPanel, Toast, Particles
app/(admin)/layout.tsx                # shell admin (header + logout)
app/(admin)/admin/page.tsx            # login atau dashboard (statistik, filter, daftar)
app/(admin)/admin/aspirasi/[kode]/    # detail: status, balasan, meta tracking
components/admin/                     # AdminLogin, AdminDashboard, FilterBar, AspirasiCard, DetailEditor, SetupNotice
app/api/aspirasi/route.ts             # POST submit publik, GET cek status by kode
app/api/admin/login|logout/route.ts   # sesi admin
app/api/admin/aspirasi/route.ts       # GET daftar + statistik
app/api/admin/aspirasi/[kode]/route.ts# GET detail, PATCH status/balasan
app/api/admin/export/route.ts         # CSV sesuai filter
lib/sheets.ts                         # bridge + mapping + filter + create/update
lib/auth.ts                           # password, token HMAC, cookie sv_admin (8 jam)
lib/validation.ts                     # validasi submit & normalisasi kode
lib/request-meta.ts                   # IP, device, mask IP, ringkas UA
lib/rate-limit.ts                     # 3 submit / IP / 10 menit (in-memory)
lib/constants.ts, lib/types.ts         # opsi kelas/topik/status, skema data
lib/filters.ts, lib/format.ts          # filter query & format tanggal id-ID
google-apps-script/Code.gs             # bridge yang ditempel ke spreadsheet
styles/                                # tokens.css, base.css, client.css, admin.css
```

## Skema sheet `aspirasi`

Header urut: `id, kode, created_at, updated_at, nama, kelas, topik, isi, anonim, status, balasan, ip, user_agent, device`.

- `status`: `baru` (default) | `diproses` | `selesai` | `ditolak`.
- `topik`: `Fasilitas` | `Belajar` | `OSIS` | `Kebersihan` | `Lainnya` (boleh kosong).
- `kelas`: salah satu dari `KELAS_OPTIONS` (VII A … IX C) atau kosong.
- Anonim: `nama` dipaksa `""` di server saat `anonim` true. IP dan user agent **tetap dicatat**
  untuk antispam, hanya terlihat admin dan IP-nya disamarkan (`103.xxx.xxx.42`).
- Respons publik (`toPublic`) hanya membocorkan `kode, created_at, topik, status, balasan`.
  Jangan pernah mengirim `ip`, `nama`, atau `user_agent` ke endpoint publik.
- Validasi submit: `isi` 5–500 karakter, nama maks 50, kelas/topik harus dari daftar.

## Auth & keamanan

- Satu password (`ADMIN_PASSWORD`), dicek dengan perbandingan timing-safe.
- Sesi = cookie `sv_admin`, httpOnly, sameSite lax, secure di production, HMAC-SHA256, TTL 8 jam.
- Semua route `/api/admin/*` harus memanggil `isAdmin()` dan membalas 401 bila gagal.
- Jangan menaruh secret Apps Script di client. URL Web App memang publik, keamanannya ada di
  `SHEETS_SHARED_SECRET`.
- Rate limit submit bersifat in-memory per instance (best-effort). Kalau butuh yang tahan
  serverless/multi-instance, itu perubahan arsitektur — diskusikan dulu.

## Konvensi

- Ikuti gaya file sekitar: komponen client `"use client"`, tipe di `lib/types.ts`, teks UI Indonesia.
- CSS baru masuk ke file yang sesuai; pakai variabel dari `styles/tokens.css`, jangan hardcode warna.
- Jangan ubah skema sheet tanpa memperbarui bersamaan: `SHEET_HEADER`, `Code.gs` HEADER,
  `lib/types.ts`, `mapItem`/`createItem_`, detail admin, dan export CSV.
- Setiap perubahan `google-apps-script/Code.gs` wajib di-deploy ulang sebagai **New version**
  di deployment yang sama, kalau tidak URL `/exec` masih menjalankan kode lama.
- Jangan commit `.env.local`, `node_modules`, `.next`, atau `tsconfig.tsbuildinfo`.
- Commit message spesifik dan singkat; repo memakai gaya kalimat perintah bahasa Inggris.

## Jebakan yang sudah pernah kena

- Tanpa `allowedDevOrigins`, akses dev lewat trycloudflare gagal/blokir.
- Apps Script harus di-deploy "Execute as: Me" dan "Who has access: Anyone", URL berakhiran `/exec`.
- `fetch` ke Apps Script mengirim `Content-Type: text/plain` untuk menghindari preflight CORS;
  jangan diganti `application/json`.
- Bridge punya timeout 20 detik dan `cache: "no-store"`.
- Kuota gratis Apps Script ±20.000 fetch/hari dan 90 menit runtime/hari; cukup untuk skala sekolah.
- Data contoh/latihan sebaiknya jangan ditulis ke sheet asli tanpa izin pemilik.

## Status & arah lanjutan

Fitur inti sudah selesai dan teruji end-to-end memakai mock bridge lokal: submit, cek kode,
login admin, daftar, filter, detail, ubah status + balasan, export CSV, submit anonim.
Bridge Apps Script asli pernah diverifikasi hidup lewat `/api/aspirasi` (kode tak dikenal → 404).

Kandidat upgrade berikutnya (belum dikerjakan, pilih sesuai permintaan user):

- UX siswa: animasi/transisi, aksesibilitas, dukungan reduced-motion, PWA/offline ringan.
- Dashboard: grafik statistik, sorting, aksi massal, pencarian yang lebih baik, notifikasi.
- Operasional: backup sheet, anti-spam lebih kuat, rate limit persisten, audit log perubahan status.
- Deploy: Vercel + domain, verifikasi end-to-end di production.
