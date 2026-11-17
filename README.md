# SpensaVoice

Kotak aspirasi digital OSIS SMP Negeri 1 Dander (Spensada), Bojonegoro.
Siswa kirim aspirasi tanpa login (bisa anonim), OSIS kelola lewat dashboard, semua data masuk Google Sheets.

## Stack

- Next.js 15 (App Router) — client & dashboard dalam satu app
- Google Sheets + Apps Script Web App sebagai database (tanpa Google Cloud, tanpa API key)
- Deploy: Vercel (atau Node.js host apa pun)

## Struktur

```
app/
  (client)/page.tsx              # landing siswa: intro, hero, tulis, status, OSIS
  (admin)/layout.tsx             # shell dashboard (header + logout)
  (admin)/admin/page.tsx         # login / overview + statistik + filter + list
  (admin)/admin/aspirasi/[kode]/ # detail aspirasi, ubah status & balasan
  (admin)/admin/pengaturan/      # editor struktur & anggota OSIS
  api/aspirasi/                  # POST submit (public), GET cek status by kode
  api/osis/                      # GET struktur OSIS untuk siswa
  api/admin/login|logout/        # sesi admin
  api/admin/aspirasi/            # list & detail/update admin
  api/admin/osis/                # GET & PUT struktur OSIS
  api/admin/export/              # export CSV sesuai filter
components/
  client/                        # layar sisi siswa (intro, hero, tulis, status, OSIS)
  admin/                         # komponen dashboard + editor OSIS
  ui/                            # Button + ripple, Select custom
google-apps-script/Code.gs       # script yang ditempel ke spreadsheet
lib/
  sheets.ts                      # panggil Web App Apps Script (aspirasi + OSIS)
  osis.ts                        # tipe, data default, validasi struktur OSIS
  history.ts                     # riwayat kode di localStorage browser
  auth.ts                        # password admin + cookie sesi bertanda tangan
  validation.ts                  # validasi input & normalisasi kode
  rate-limit.ts                  # cooldown submit per IP
  request-meta.ts                # IP, device, masking
  filters.ts                     # filter daftar admin
styles/                          # tokens + CSS client/admin
```

## Setup

### 1. Spreadsheet

1. Buat spreadsheet bernama **SpensaVoice**.
2. Buat sheet bernama **aspirasi** (boleh nanti dibuat otomatis oleh `setup()`).
   Sheet **osis** untuk struktur pengurus juga dibuat otomatis oleh `setup()`.

### 2. Apps Script

1. Di spreadsheet: **Extensions → Apps Script**.
2. Hapus isi `Code.gs`, tempel seluruh isi [`google-apps-script/Code.gs`](google-apps-script/Code.gs), lalu **Save**.
3. Pilih fungsi **setup** di dropdown → **Run** → izinkan akses saat diminta.
4. Buka **Executions / Log**: di situ tercetak `SHARED_SECRET: ...` (simpan) dan nama sheet aktif.
5. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin URL yang berakhiran **`/exec`**.
7. Setiap kali `Code.gs` diubah: **Deploy → Manage deployments → Edit → Version: New version → Deploy**, supaya URL yang sama memakai kode terbaru.

`setup()` membuat sheet `aspirasi` dan `osis` beserta baris header otomatis. Header `aspirasi` yang dipakai:

```
id  kode  created_at  updated_at  nama  kelas  topik  isi  anonim  status  balasan  ip  user_agent  device
```

### 3. Environment

Salin `.env.example` ke `.env.local` lalu isi:

| Variable | Isi |
|---|---|
| `ADMIN_PASSWORD` | password tunggal dashboard `/admin` |
| `SESSION_SECRET` | string acak panjang untuk tanda tangan cookie |
| `SHEETS_WEBAPP_URL` | URL Web App Apps Script (`.../exec`) |
| `SHEETS_SHARED_SECRET` | secret dari log `setup()` |
| `SUBMIT_COOLDOWN_HOURS` | opsional, jeda kirim per IP dalam jam (default `2`, isi `0` untuk mematikan) |

Generate `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Jalankan:

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # cek production build
```

### 4. Deploy Vercel

Import repo, tambahkan keempat env variable di atas ke project Vercel, deploy. Tidak perlu konfigurasi tambahan.

## Alur

**Siswa** — intro animasi → hero → tulis pesan di mode kertas → kirim (animasi kotak) → toast berisi kode `SV-XXXX` (bisa disalin) → cek status kapan saja lewat kode. Layar **Kenalan sama OSIS** menampilkan struktur pengurus dari sheet `osis`. Kode yang pernah didapat otomatis disimpan di `localStorage` browser dan muncul sebagai riwayat di hero + layar status.

**Admin** — buka `/admin`, masuk pakai `ADMIN_PASSWORD`, lihat statistik & daftar, filter (status, topik, tanggal, anonim, keyword), klik kartu untuk detail, ubah status + tulis balasan, export CSV. Menu **Pengaturan** dipakai mengubah bagian, nama, dan jabatan anggota OSIS; simpan langsung menulis ulang sheet `osis`.

## Catatan

- Status: `baru`, `diproses`, `selesai`, `ditolak`. Default saat submit: `baru`.
- Pesan minimal 10 dan maksimal 500 karakter. Anonim menyembunyikan nama dari siswa & daftar admin; IP/UA tetap dicatat untuk antispam (ditampilkan tersamar di detail admin).
- Pilihan kelas: VII, VIII, dan IX, masing-masing A–H (24 kelas).
- Cooldown submit: 1 kiriman per IP per 2 jam (in-memory, best-effort per instance). Atur lewat `SUBMIT_COOLDOWN_HOURS`.
  **Penting:** semua perangkat di satu wifi/NAT sekolah memakai IP publik yang sama, jadi cooldown per IP akan memblokir siswa lain. Untuk pemakaian di lab/sekolah, turunkan nilainya (mis. `0.1`) atau matikan (`0`) dan andalkan moderasi admin.
- Struktur OSIS disimpan sebagai baris datar di sheet `osis` (`bagian, sub, grup, urutan, nama, jabatan, urutan_anggota`). Kalau sheet kosong atau bridge error, layar siswa memakai data default lengkap dari `lib/osis.ts` (48 pengurus dan anggota).
- URL Web App bersifat publik, jadi keamanan bergantung pada `SHEETS_SHARED_SECRET`; jangan tampilkan nilai itu di client dan jangan commit `.env.local`.
- Jika URL `/exec` dibuka di browser, muncul `{"ok":true,"service":"spensavoice-bridge"}` — artinya bridge hidup.
- Kuota gratis Google: ±20.000 panggilan `fetch`/hari dan 90 menit runtime script/hari untuk akun biasa; lebih dari cukup untuk skala sekolah.
