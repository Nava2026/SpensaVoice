import type { Status, Topik } from "./types";

const KELAS_TINGKAT = ["VII", "VIII", "IX"] as const;
const KELAS_ROMBEL = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

export const KELAS_OPTIONS = KELAS_TINGKAT.flatMap((tingkat) =>
  KELAS_ROMBEL.map((rombel) => `${tingkat} ${rombel}`),
);

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
