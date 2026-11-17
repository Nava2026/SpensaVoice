export type Status = "baru" | "diproses" | "selesai" | "ditolak";
export type Device = "mobile" | "desktop" | "unknown";
export type Topik = "Fasilitas" | "Belajar" | "OSIS" | "Kebersihan" | "Lainnya" | "";

/** Satu baris di sheet `aspirasi`. */
export interface Aspirasi {
  id: string;
  kode: string;
  created_at: string;
  updated_at: string;
  nama: string;
  kelas: string;
  topik: Topik;
  isi: string;
  anonim: boolean;
  status: Status;
  balasan: string;
  ip: string;
  user_agent: string;
  device: Device;
}

/** Data yang boleh dilihat siswa lewat kode tracking. */
export type AspirasiPublic = Pick<
  Aspirasi,
  "kode" | "created_at" | "topik" | "status" | "balasan"
>;

export interface AspirasiFilters {
  status?: string;
  topik?: string;
  from?: string;
  to?: string;
  anonim?: string;
  q?: string;
}
