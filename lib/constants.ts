import type { Status, Topik } from "./types";

export const KELAS_OPTIONS = [
  "VII A",
  "VII B",
  "VII C",
  "VIII A",
  "VIII B",
  "VIII C",
  "IX A",
  "IX B",
  "IX C",
];

export const TOPIK_OPTIONS: Exclude<Topik, "">[] = [
  "Fasilitas",
  "Belajar",
  "OSIS",
  "Kebersihan",
  "Lainnya",
];

export const STATUS_OPTIONS: Status[] = [
  "baru",
  "diproses",
  "selesai",
  "ditolak",
];

export const STATUS_LABEL: Record<Status, string> = {
  baru: "Baru masuk",
  diproses: "Lagi didengerin",
  selesai: "Udah dijawab",
  ditolak: "Gak dilanjut",
};

export const STATUS_BADGE: Record<Status, string> = {
  baru: "badge-new",
  diproses: "badge-process",
  selesai: "badge-done",
  ditolak: "badge-reject",
};

export const SHEET_HEADER = [
  "id",
  "kode",
  "created_at",
  "updated_at",
  "nama",
  "kelas",
  "topik",
  "isi",
  "anonim",
  "status",
  "balasan",
  "ip",
  "user_agent",
  "device",
] as const;
