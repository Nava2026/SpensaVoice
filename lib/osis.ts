export interface OsisPerson {
  nama: string;
  jabatan: string;
}

export interface OsisSection {
  bagian: string;
  sub: string;
  grup: boolean;
  people: OsisPerson[];
}

const person = (nama: string, jabatan = ""): OsisPerson => ({ nama, jabatan });

/** Struktur awal OSIS. Dipakai kalau sheet `osis` masih kosong. */
export const DEFAULT_OSIS: OsisSection[] = [
  {
    bagian: "Pimpinan",
    sub: "Ketua dan wakil ketua OSIS",
    grup: false,
    people: [
      person("IDZA ALIFFIANTO PUTRA", "Ketua OSIS"),
      person("TIARA RIZKIYA PUTRI", "Wakil Ketua OSIS"),
    ],
  },
  {
    bagian: "Sekretaris",
    sub: "Sekretaris OSIS",
    grup: false,
    people: [
      person("MUHAMMAD ARGA ANDROMEDA AULIA RAMADHAN", "Sekretaris"),
      person("ANGELICA CAHYANI DEBITA PUTRI", "Sekretaris"),
    ],
  },
  {
    bagian: "Bendahara",
    sub: "Bendahara OSIS",
    grup: false,
    people: [
      person("ARIYANDRA IBNU WIRA BUDIMAN", "Bendahara"),
      person("MUHAMMAD RIZKY SEPTIYANTO", "Bendahara"),
    ],
  },
  {
    bagian: "Kedisiplinan",
    sub: "Sekbid Kedisiplinan dalam Lingkungan Sekolah",
    grup: true,
    people: [
      "ANGEL FEBBY GRACIA OLLA SITANGGANG",
      "ASYIFA DWI SYAFANA AL-HUSNI",
      "ATIKA ELA YUHANA",
      "DHANY PRATAMA",
      "LANDANO VITO AVIANSYAH",
      "MICHELE CHIKYTA AZZAHRA",
      "NAURA ROFIF KIRANA",
      "NICHO SAPUTRA W",
      "THALITA APRILLYA",
    ].map((nama) => person(nama)),
  },
  {
    bagian: "Ketuhanan & Ketakwaan",
    sub: "Sekbid Ketuhanan dan Ketakwaan kepada Tuhan Yang Maha Esa",
    grup: true,
    people: [
      "AHAMAD DZIKRI ROFI A_LA",
      "AHMAD ABI INDRANATA",
      "ANGGUN MADHINA AZZAHRA",
      "AULIA NOVITA AZ_ZAHRA",
      "CLARISSA RISTIANA",
      "MUHAMMAD AKBAR INDRAYANA",
      "NATASYA RIZKY",
      "QONITA IZZATUN NISA",
      "SILVYA AYU KEZYA",
      "TANIA AFIKA CLARASIFA",
    ].map((nama) => person(nama)),
  },
  {
    bagian: "Lingkungan & HAM",
    sub: "Sekbid Lingkungan dan Hak Asasi Manusia",
    grup: true,
    people: [
      "ARGAREZQI CELLHO PRATAMA",
      "ARRAZZAQ DWI RAMLI ANJELITA",
      "DECHA NUR SHELIYA PUTRI",
      "MISBAKHUL NAFIAH",
      "NAJWA AZ-ZAHRA",
      "REGINA PUTRI NURUL HIDAYAH",
    ].map((nama) => person(nama)),
  },
  {
    bagian: "Olahraga, Seni & Sastra",
    sub: "Sekbid Olahraga, Seni, dan Sastra",
    grup: true,
    people: [
      "ALLANA ARYA RIMBA SAPUTRO",
      "CHIKA VERNANDA",
      "DINDA AURORA",
      "M.DIENIZ RAMDANI",
      "MUHAMMAD IQBAL HAMIM",
      "MUHAMMAD RAYHAN DEWA REVANO",
      "ZACKY ADITIYAR TIRTA NUGRAHA",
      "ZAHRA NOVI AR-RUBAYYI DONITA",
    ].map((nama) => person(nama)),
  },
  {
    bagian: "Teknologi & Informasi",
    sub: "Sekbid Teknologi dan Informasi",
    grup: true,
    people: [
      "AULIA NAVHESYA ARZAFANI",
      "AYUDHISTIRA FAABIANTI SETYAWAN",
      "M.IRFAN NUR HUDA",
      "MAULINA ANDINI",
      "MOCH AKBAR OTO DI LOVE VANOE",
      "NAVARO ALBANI PRASETYO",
      "NICHO SAPUTRA W.",
      "RAFIIF NARARYA KALASHNIKOVA",
      "ZYLZIAN VALDA CLEARESTA",
    ].map((nama) => person(nama)),
  },
];

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Validasi struktur dari admin sebelum disimpan ke sheet.
 * Melempar Error berisi pesan yang aman ditampilkan ke pengurus.
 */
export function normalizeOsisSections(input: unknown): OsisSection[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("Struktur OSIS minimal punya satu bagian.");
  }
  if (input.length > 24) {
    throw new Error("Bagian OSIS maksimal 24.");
  }

  const sections: OsisSection[] = [];
  let totalPeople = 0;

  for (const raw of input) {
    if (!raw || typeof raw !== "object") {
      throw new Error("Format bagian OSIS gak valid.");
    }
    const item = raw as Record<string, unknown>;
    const bagian = clean(item.bagian, 60);
    if (!bagian) throw new Error("Nama bagian OSIS wajib diisi.");

    const rawPeople = Array.isArray(item.people) ? item.people : [];
    if (rawPeople.length > 60) {
      throw new Error(`Anggota ${bagian} maksimal 60 orang.`);
    }

    const people: OsisPerson[] = [];
    for (const rawPerson of rawPeople) {
      const personInput =
        rawPerson && typeof rawPerson === "object"
          ? (rawPerson as Record<string, unknown>)
          : {};
      const nama = clean(personInput.nama, 80);
      if (!nama) continue;
      people.push({ nama, jabatan: clean(personInput.jabatan, 60) });
    }

    totalPeople += people.length;
    sections.push({
      bagian,
      sub: clean(item.sub, 120) || `Bagian ${bagian}`,
      grup: item.grup === true,
      people,
    });
  }

  if (totalPeople > 300) {
    throw new Error("Total anggota OSIS maksimal 300 orang.");
  }

  return sections;
}
