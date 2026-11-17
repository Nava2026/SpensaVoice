/**
 * SpensaVoice — jembatan Google Apps Script untuk spreadsheet aspirasi.
 *
 * Cara pakai:
 * 1. Buka spreadsheet SpensaVoice → Extensions → Apps Script.
 * 2. Ganti isi Code.gs dengan file ini, lalu Save.
 * 3. Jalankan fungsi setup() sekali (pilih setup di dropdown → Run, izinkan akses).
 *    Fungsi ini membuat sheet + header dan membuat SHARED_SECRET acak.
 * 4. Lihat Executions / Log untuk menyalin SHARED_SECRET.
 * 5. Deploy → New deployment → Web app:
 *      Execute as: Me
 *      Who has access: Anyone
 *    Salin URL yang berakhiran /exec ke SHEETS_WEBAPP_URL.
 *
 * Jangan bagikan URL /exec maupun secret ke publik. URL hanya dipanggil dari server Next.js.
 */

const HEADER = [
  'id',
  'kode',
  'created_at',
  'updated_at',
  'nama',
  'kelas',
  'topik',
  'isi',
  'anonim',
  'status',
  'balasan',
  'ip',
  'user_agent',
  'device',
];

const DEFAULT_SHEET_NAME = 'aspirasi';
const OSIS_SHEET_NAME = 'osis';
const OSIS_HEADER = [
  'bagian',
  'sub',
  'grup',
  'urutan',
  'nama',
  'jabatan',
  'urutan_anggota',
];
const STATUSES = ['baru', 'diproses', 'selesai', 'ditolak'];

/** Jalankan sekali dari editor Apps Script. */
function setup(secret) {
  const props = PropertiesService.getScriptProperties();
  if (secret) props.setProperty('SHARED_SECRET', secret);

  let current = props.getProperty('SHARED_SECRET');
  if (!current) {
    current = Utilities.getUuid().replace(/-/g, '');
    props.setProperty('SHARED_SECRET', current);
  }

  const sheet = getSheet_();
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    sheet.setFrozenRows(1);
  } else {
    const firstRow = sheet.getRange(1, 1, 1, HEADER.length).getValues()[0];
    if (firstRow.join('|') !== HEADER.join('|')) {
      Logger.log('PERINGATAN: header baris 1 tidak sama dengan skema. Periksa manual.');
    }
  }

  const osisSheet = getOsisSheet_();

  Logger.log('SHARED_SECRET: ' + current);
  Logger.log('Sheet aktif: ' + sheet.getName() + ' (baris: ' + sheet.getLastRow() + ')');
  Logger.log(
    'Sheet struktur OSIS: ' + osisSheet.getName() + ' (baris: ' + osisSheet.getLastRow() + ')',
  );
  Logger.log(
    'Lanjut: Deploy > New deployment > Web app > Execute as Me > Who has access Anyone > Deploy, lalu salin URL /exec.',
  );
}

function doGet() {
  return json_({ ok: true, service: 'spensavoice-bridge' });
}

function doPost(e) {
  try {
    const expected = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!expected) throw new Error('SHARED_SECRET belum di-set. Jalankan setup() dulu.');

    const body = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : null;

    if (!body || body.secret !== expected) throw new Error('Tidak diizinkan.');

    if (body.action === 'list') {
      return json_({ ok: true, items: readItems_() });
    }
    if (body.action === 'create') {
      return json_(createItem_(body.payload));
    }
    if (body.action === 'update') {
      return json_(updateItem_(body.payload));
    }
    if (body.action === 'delete') {
      return json_(deleteItem_(body.payload));
    }
    if (body.action === 'getOsis') {
      return json_({ ok: true, items: readOsis_() });
    }
    if (body.action === 'saveOsis') {
      return json_(saveOsis_(body.payload));
    }

    throw new Error('Aksi gak dikenal: ' + body.action);
  } catch (err) {
    return json_({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const name = props.getProperty('SHEET_NAME') || DEFAULT_SHEET_NAME;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function getOsisSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(OSIS_SHEET_NAME) || ss.insertSheet(OSIS_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, OSIS_HEADER.length).setValues([OSIS_HEADER]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Server lagi sibuk. Coba lagi sebentar lagi.');
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function text_(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return value == null ? '' : String(value);
}

function readItems_() {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return [];

  const values = sheet.getRange(2, 1, last - 1, HEADER.length).getValues();
  const items = [];

  for (var i = 0; i < values.length; i += 1) {
    const row = values[i];
    const item = {};
    for (var j = 0; j < HEADER.length; j += 1) item[HEADER[j]] = text_(row[j]);

    item.anonim = String(item.anonim).toLowerCase() === 'true';
    if (!item.status) item.status = 'baru';
    if (!item.device) item.device = 'unknown';
    if (item.kode || item.isi) items.push(item);
  }

  return items;
}

function createItem_(payload) {
  return withLock_(function () {
    if (!payload || !payload.kode) throw new Error('Payload create gak lengkap.');

    const kode = String(payload.kode).toUpperCase();
    const items = readItems_();
    const duplicate = items.some(function (item) {
      return String(item.kode).toUpperCase() === kode;
    });
    if (duplicate) return { ok: false, error: 'KODE_DUPLIKAT' };

    const now = new Date().toISOString();
    const item = {
      id: payload.id ? String(payload.id) : Utilities.getUuid(),
      kode: kode,
      created_at: payload.created_at ? String(payload.created_at) : now,
      updated_at: now,
      nama: text_(payload.nama),
      kelas: text_(payload.kelas),
      topik: text_(payload.topik),
      isi: text_(payload.isi),
      anonim: payload.anonim !== false,
      status: 'baru',
      balasan: '',
      ip: text_(payload.ip),
      user_agent: text_(payload.user_agent),
      device: text_(payload.device) || 'unknown',
    };
    if (item.anonim) item.nama = '';

    const row = HEADER.map(function (key) {
      return typeof item[key] === 'boolean' ? (item[key] ? 'TRUE' : 'FALSE') : item[key];
    });

    getSheet_().appendRow(row);
    return { ok: true, item: item };
  });
}

function updateItem_(payload) {
  return withLock_(function () {
    if (!payload || !payload.kode) throw new Error('Kode aspirasi kosong.');
    if (payload.status && STATUSES.indexOf(payload.status) === -1) {
      throw new Error('Status gak dikenal.');
    }

    const sheet = getSheet_();
    const last = sheet.getLastRow();
    if (last < 2) return { ok: false, error: 'Kode aspirasi gak ketemu.' };

    const kode = String(payload.kode).toUpperCase();
    const kodes = sheet.getRange(2, 2, last - 1, 1).getValues();
    let rowNumber = 0;
    for (var i = 0; i < kodes.length; i += 1) {
      if (String(kodes[i][0]).trim().toUpperCase() === kode) {
        rowNumber = i + 2;
        break;
      }
    }
    if (!rowNumber) return { ok: false, error: 'Kode aspirasi gak ketemu.' };

    const row = sheet.getRange(rowNumber, 1, 1, HEADER.length).getValues()[0];
    const item = {};
    for (var j = 0; j < HEADER.length; j += 1) item[HEADER[j]] = text_(row[j]);

    const next = {
      id: item.id || Utilities.getUuid(),
      kode: item.kode,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nama: item.nama,
      kelas: item.kelas,
      topik: item.topik,
      isi: item.isi,
      anonim: String(item.anonim).toLowerCase() === 'true',
      status: payload.status ? String(payload.status) : item.status || 'baru',
      balasan: payload.balasan != null ? String(payload.balasan).trim() : item.balasan || '',
      ip: item.ip,
      user_agent: item.user_agent,
      device: item.device || 'unknown',
    };

    const values = HEADER.map(function (key) {
      return typeof next[key] === 'boolean' ? (next[key] ? 'TRUE' : 'FALSE') : next[key];
    });

    sheet.getRange(rowNumber, 1, 1, HEADER.length).setValues([values]);
    return { ok: true, item: next };
  });
}

function deleteItem_(payload) {
  return withLock_(function () {
    if (!payload || !payload.kode) throw new Error('Kode aspirasi kosong.');

    const sheet = getSheet_();
    const last = sheet.getLastRow();
    if (last < 2) return { ok: false, error: 'Kode aspirasi gak ketemu.' };

    const kode = String(payload.kode).trim().toUpperCase();
    const kodes = sheet.getRange(2, 2, last - 1, 1).getValues();
    let rowNumber = 0;
    for (var i = 0; i < kodes.length; i += 1) {
      if (String(kodes[i][0]).trim().toUpperCase() === kode) {
        rowNumber = i + 2;
        break;
      }
    }
    if (!rowNumber) return { ok: false, error: 'Kode aspirasi gak ketemu.' };

    sheet.deleteRow(rowNumber);
    return { ok: true, kode: kode };
  });
}

function readOsis_() {
  const sheet = getOsisSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return [];

  const values = sheet.getRange(2, 1, last - 1, OSIS_HEADER.length).getValues();
  const rows = [];

  for (var i = 0; i < values.length; i += 1) {
    const row = values[i];
    const item = {};
    for (var j = 0; j < OSIS_HEADER.length; j += 1) item[OSIS_HEADER[j]] = text_(row[j]);
    if (item.bagian) rows.push(item);
  }

  return rows;
}

function saveOsis_(payload) {
  return withLock_(function () {
    const sections = payload && payload.sections;
    if (!sections || !sections.length) throw new Error('Struktur OSIS kosong.');
    if (sections.length > 24) throw new Error('Bagian OSIS maksimal 24.');

    const rows = [];
    for (var s = 0; s < sections.length; s += 1) {
      const section = sections[s] || {};
      const people = Array.isArray(section.people) ? section.people : [];
      if (people.length > 60) throw new Error('Anggota satu bagian maksimal 60.');

      for (var p = 0; p < people.length; p += 1) {
        const anggota = people[p] || {};
        rows.push([
          text_(section.bagian),
          text_(section.sub),
          section.grup === true ? 'TRUE' : 'FALSE',
          s,
          text_(anggota.nama),
          text_(anggota.jabatan),
          p,
        ]);
      }

      // Bagian tanpa anggota tetap disimpan sebagai baris penanda supaya
      // tab kosong tidak hilang setelah disimpan.
      if (!people.length) {
        rows.push([
          text_(section.bagian),
          text_(section.sub),
          section.grup === true ? 'TRUE' : 'FALSE',
          s,
          '',
          '',
          0,
        ]);
      }
    }

    const sheet = getOsisSheet_();
    sheet.clearContents();
    sheet.getRange(1, 1, 1, OSIS_HEADER.length).setValues([OSIS_HEADER]);
    if (rows.length) {
      sheet.getRange(2, 1, rows.length, OSIS_HEADER.length).setValues(rows);
    }

    return { ok: true, items: readOsis_() };
  });
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
