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
- Desain dengan tema gelap/terang (toggle `ThemeToggle`, tersimpan di `localStorage` sebagai
  `sv_theme`, kunjungan pertama ikut `prefers-color-scheme`), plus "mode kertas" terang untuk
  form tulis/status; mobile-first untuk siswa.

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
- Apps Script menerima `{ secret, action, payload }` dengan `action` = `list` | `create` | `update` |
  `delete` | `getOsis` | `saveOsis`, dan membalas `{ ok: true, items | item }` atau
  `{ ok: false, error }`. `delete` menerima `{ kode }` dan menghapus satu baris aspirasi.
- Struktur OSIS dibaca/tulis seluruhnya: `saveOsis` menghapus isi sheet `osis` lalu menulis ulang
  semua baris. Jangan simpan sebagian.
- Kode tracking dibuat di **Next.js** (`lib/sheets.ts`), bukan di Apps Script: alfabet
  `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (tanpa I/O/0/1), retry maksimal 5x jika bridge membalas
  `KODE_DUPLIKAT`.
- `GET /` di URL Web App hanya health check: `{"ok":true,"service":"spensavoice-bridge"}`.

## Peta file

```
app/(client)/page.tsx                 # halaman siswa
components/client/                    # StudentApp, Backdrop, Intro, Hero, WriteSheet, SendAnimation,
                                      #   TrackPanel, OsisScreen, Toast, MaskText
components/ui/ThemeToggle.tsx         # tombol tema terang/gelap (dipakai siswa & admin)
app/(admin)/layout.tsx                # shell admin (header + logout + link Pengaturan)
app/(admin)/admin/page.tsx            # login atau dashboard (statistik, filter, daftar)
app/(admin)/admin/aspirasi/[kode]/    # detail: status, balasan, meta tracking
app/(admin)/admin/pengaturan/         # editor struktur & anggota OSIS
components/admin/                     # AdminLogin, AdminDashboard, FilterBar, AspirasiCard, DetailEditor,
                                      #   OsisSettings, SetupNotice
app/api/aspirasi/route.ts             # POST submit publik, GET cek status by kode
app/api/osis/route.ts                 # GET struktur OSIS publik (fallback default)
app/api/admin/login|logout/route.ts   # sesi admin
app/api/admin/aspirasi/route.ts       # GET daftar + statistik
app/api/admin/aspirasi/[kode]/route.ts# GET detail, PATCH status/balasan, DELETE hapus
app/api/admin/osis/route.ts           # GET & PUT struktur OSIS (auth + validasi)
app/api/admin/export/route.ts         # CSV sesuai filter
lib/sheets.ts                         # bridge + mapping + filter + create/update + OSIS
lib/osis.ts                            # tipe, DEFAULT_OSIS, normalizeOsisSections
lib/history.ts                         # riwayat kode di localStorage (maks 12)
lib/auth.ts                           # password, token HMAC, cookie sv_admin (8 jam)
lib/validation.ts                     # validasi submit & normalisasi kode
lib/request-meta.ts                   # IP, device, mask IP, ringkas UA
lib/rate-limit.ts                     # cooldown submit per IP (default 2 jam)
lib/constants.ts, lib/types.ts         # opsi kelas/topik/status, skema data
lib/filters.ts, lib/format.ts          # filter query & format tanggal id-ID
google-apps-script/Code.gs             # bridge yang ditempel ke spreadsheet
styles/                                # tokens, base, client, client-screens, admin
```

## Skema sheet `aspirasi`

Header urut: `id, kode, created_at, updated_at, nama, kelas, topik, isi, anonim, status, balasan, ip, user_agent, device`.

- `status`: `baru` (default) | `diproses` | `selesai` | `ditolak`.
- `topik`: `Fasilitas` | `Belajar` | `OSIS` | `Kebersihan` | `Lainnya` (boleh kosong).
- `kelas`: salah satu dari `KELAS_OPTIONS` (VII A … IX H, total 24 kelas) atau kosong.
- Anonim: `nama` dipaksa `""` di server saat `anonim` true. IP dan user agent **tetap dicatat**
  untuk antispam, hanya terlihat admin dan IP-nya disamarkan (`103.xxx.xxx.42`).
- Respons publik (`toPublic`) hanya membocorkan `kode, created_at, topik, status, balasan`.
  Jangan pernah mengirim `ip`, `nama`, atau `user_agent` ke endpoint publik.
- Validasi submit: `isi` 10–500 karakter, nama maks 50, kelas/topik harus dari daftar.

## Skema sheet `osis`

Header: `bagian, sub, grup, urutan, nama, jabatan, urutan_anggota`.

- Satu baris = satu anggota. `bagian` dipakai sebagai identitas tab; nama bagian yang sama
  digabung saat dibaca. Urutan tab dari `urutan`, urutan anggota dari `urutan_anggota`.
- `grup` (`TRUE`/`FALSE`) menandai bagian yang tampil di bawah label "Seksi bidang".
- `jabatan` opsional; kalau kosong, UI memakai nama bagian.
- `DEFAULT_OSIS` di `lib/osis.ts` adalah fallback saat sheet kosong atau bridge gagal. Admin
  melihat data default itu saat sheet masih kosong, lalu bisa langsung menyimpannya.
- `saveOsis` menulis ulang seluruh sheet. Baris dengan `nama` kosong dibuang oleh validasi.
- Riwayat kode siswa **hanya** di `localStorage` (`sv_history_v1`), tidak pernah dikirim ke server.

## Auth & keamanan

- Satu password (`ADMIN_PASSWORD`), dicek dengan perbandingan timing-safe.
- Sesi = cookie `sv_admin`, httpOnly, sameSite lax, secure di production, HMAC-SHA256, TTL 8 jam.
- Semua route `/api/admin/*` harus memanggil `isAdmin()` dan membalas 401 bila gagal.
- Jangan menaruh secret Apps Script di client. URL Web App memang publik, keamanannya ada di
  `SHEETS_SHARED_SECRET`.
- Cooldown submit (`lib/rate-limit.ts`) default 1 kiriman / IP / 2 jam, diatur lewat
  `SUBMIT_COOLDOWN_HOURS` (0 = mati). In-memory per instance, jadi tidak ketat di serverless.
  Cooldown dikunci sebelum simpan dan dibatalkan kalau bridge gagal, supaya error tidak
  menghanguskan jatah siswa.
- **Risiko IP bersama:** siswa di wifi/NAT sekolah punya IP publik sama. Cooldown per IP bisa
  memblokir seluruh kelas setelah satu kiriman. Untuk acara sekolah, set nilai kecil atau 0
  dan andalkan moderasi admin.
- Admin OSIS boleh mengubah struktur yang tampil ke siswa; validasi tetap di server
  (`normalizeOsisSections`) dan bridge juga membatasi jumlah bagian/anggota.

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

Upgrade prototipe v2 sudah masuk: layar penuh `intro | hero | write | send | status | osis`,
riwayat kode di localStorage, editor OSIS di `/admin/pengaturan`, sheet `osis`, dan cooldown
submit per IP. `Code.gs` berubah, jadi deployment Apps Script wajib dibuat **New version**.

Kandidat upgrade berikutnya (belum dikerjakan, pilih sesuai permintaan user):

- Operasional: rate limit persisten (Redis/Upstash) kalau cooldown per instance dirasa lemah.
- Dashboard: grafik statistik, sorting, aksi massal, notifikasi.
- Deploy: Vercel + domain, verifikasi end-to-end di production.
- Backup sheet terjadwal dan audit log perubahan status.
