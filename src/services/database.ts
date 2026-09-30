import * as SQLite from 'expo-sqlite';
import { DATABASE } from '@/types/mahasiswa';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const db = await SQLite.openDatabaseAsync(DATABASE.NAME);
    await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    await initSchema(db);
    await seedInitialData(db);
    dbInstance = db;
    return db;
  })();

  return initPromise;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      token TEXT,
      expires_at TEXT,
      is_logged_in INTEGER NOT NULL DEFAULT 1,
      username TEXT NOT NULL,
      login_time INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS semesters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      aktif INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mahasiswa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nim TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      fakultas TEXT NOT NULL,
      gender TEXT NOT NULL,
      tahun_masuk TEXT NOT NULL DEFAULT '2021',
      status TEXT NOT NULL DEFAULT 'Aktif',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dosen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nidn TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      fakultas TEXT NOT NULL,
      gender TEXT NOT NULL,
      telepon TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mata_kuliah (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      sks INTEGER NOT NULL CHECK(sks >= 1 AND sks <= 6),
      fakultas TEXT NOT NULL,
      dosen_id INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (dosen_id) REFERENCES dosen (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS jadwal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mata_kuliah_id INTEGER NOT NULL,
      hari TEXT NOT NULL,
      jam_mulai TEXT NOT NULL,
      jam_selesai TEXT NOT NULL,
      ruangan TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS krs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mahasiswa_id INTEGER NOT NULL,
      semester_id INTEGER NOT NULL,
      mata_kuliah_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(mahasiswa_id, semester_id, mata_kuliah_id),
      FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa (id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE,
      FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS presensi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mata_kuliah_id INTEGER NOT NULL,
      semester_id INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      mahasiswa_id INTEGER NOT NULL,
      status_kehadiran TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah (id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE,
      FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS nilai (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mahasiswa_id INTEGER NOT NULL,
      semester_id INTEGER NOT NULL,
      mata_kuliah_id INTEGER NOT NULL,
      tugas REAL DEFAULT 0,
      uts REAL DEFAULT 0,
      uas REAL DEFAULT 0,
      akhir REAL DEFAULT 0,
      huruf TEXT DEFAULT 'E',
      bobot REAL DEFAULT 0,
      nilai_huruf TEXT,
      nilai_angka REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(mahasiswa_id, semester_id, mata_kuliah_id),
      FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa (id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE,
      FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah (id) ON DELETE CASCADE
    );
  `);

  const nilaiCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(nilai);');
  const existingColNames = nilaiCols.map((c) => c.name);
  if (!existingColNames.includes('tugas')) {
    await db.runAsync('ALTER TABLE nilai ADD COLUMN tugas REAL DEFAULT 0;');
  }
  if (!existingColNames.includes('uts')) {
    await db.runAsync('ALTER TABLE nilai ADD COLUMN uts REAL DEFAULT 0;');
  }
  if (!existingColNames.includes('uas')) {
    await db.runAsync('ALTER TABLE nilai ADD COLUMN uas REAL DEFAULT 0;');
  }
  if (!existingColNames.includes('akhir')) {
    await db.runAsync('ALTER TABLE nilai ADD COLUMN akhir REAL DEFAULT 0;');
  }
  if (!existingColNames.includes('huruf')) {
    await db.runAsync('ALTER TABLE nilai ADD COLUMN huruf TEXT DEFAULT \'E\';');
  }
  const sessionCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(sessions);');
  const existingSessionCols = sessionCols.map((c) => c.name);
  if (!existingSessionCols.includes('username')) {
    await db.runAsync('ALTER TABLE sessions ADD COLUMN username TEXT;');
  }
  if (!existingSessionCols.includes('user_id')) {
    await db.runAsync('ALTER TABLE sessions ADD COLUMN user_id TEXT;');
  }
  if (!existingSessionCols.includes('token')) {
    await db.runAsync('ALTER TABLE sessions ADD COLUMN token TEXT;');
  }
  if (!existingSessionCols.includes('expires_at')) {
    await db.runAsync('ALTER TABLE sessions ADD COLUMN expires_at TEXT;');
  }
  if (!existingSessionCols.includes('login_time')) {
    await db.runAsync('ALTER TABLE sessions ADD COLUMN login_time INTEGER DEFAULT 0;');
  }
  if (!existingSessionCols.includes('is_logged_in')) {
    await db.runAsync('ALTER TABLE sessions ADD COLUMN is_logged_in INTEGER DEFAULT 1;');
  }
}

async function seedInitialData(db: SQLite.SQLiteDatabase): Promise<void> {
  const now = new Date().toISOString();

  // 1. Check Semesters
  const semesterCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM semesters;'
  );

  let activeSemesterId = 1;

  if (!semesterCount || semesterCount.count === 0) {
    const semResult = await db.runAsync(
      `INSERT INTO semesters (nama, aktif, created_at, updated_at) VALUES (?, 1, ?, ?);`,
      ['Ganjil 2025/2026', now, now]
    );
    activeSemesterId = semResult.lastInsertRowId;

    await db.runAsync(
      `INSERT INTO semesters (nama, aktif, created_at, updated_at) VALUES (?, 0, ?, ?);`,
      ['Genap 2024/2025', now, now]
    );
  } else {
    const activeSem = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM semesters WHERE aktif = 1 LIMIT 1;'
    );
    if (activeSem) activeSemesterId = activeSem.id;
  }

  // 2. Check Dosen
  const dosenCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM dosen;'
  );

  if (!dosenCount || dosenCount.count === 0) {
    const seedDosen = [
      { nidn: '0101010101', nama: 'Dr. Budi Santoso', fakultas: 'Sains dan Teknologi', gender: 'PRIA', telepon: '08111111111' },
      { nidn: '0202020202', nama: 'Prof. Siti Aminah', fakultas: 'Sains dan Teknologi', gender: 'WANITA', telepon: '08222222222' },
      { nidn: '0303030303', nama: 'Ir. Agus Setiawan, M.T.', fakultas: 'Sains dan Teknologi', gender: 'PRIA', telepon: '08333333333' },
      { nidn: '0404040404', nama: 'Ratna Sari, M.Sc.', fakultas: 'Sains dan Teknologi', gender: 'WANITA', telepon: '08444444444' },
      { nidn: '0505050505', nama: 'Dr. Hendra Gunawan', fakultas: 'Bisnis', gender: 'PRIA', telepon: '08555555555' },
      { nidn: '0606060606', nama: 'Maya Indah, M.B.A.', fakultas: 'Bisnis', gender: 'WANITA', telepon: '08666666666' },
      { nidn: '0707070707', nama: 'Dr. Iwan Fals', fakultas: 'Ilmu Komunikasi dan Desain', gender: 'PRIA', telepon: '08777777777' },
      { nidn: '0808080808', nama: 'Dr. Dian Sastro', fakultas: 'Ilmu Komunikasi dan Desain', gender: 'WANITA', telepon: '08888888888' },
    ];

    for (const d of seedDosen) {
      await db.runAsync(
        `INSERT INTO dosen (nidn, nama, fakultas, gender, telepon, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [d.nidn, d.nama, d.fakultas, d.gender, d.telepon, now, now]
      );
    }
  }

  // 3. Check Mata Kuliah
  const matkulCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM mata_kuliah;'
  );

  if (!matkulCount || matkulCount.count === 0) {
    const dosens = await db.getAllAsync<{ id: number; nama: string }>('SELECT id, nama FROM dosen;');
    const getDosenId = (namaSubstring: string) => {
      const match = dosens.find((d) => d.nama.includes(namaSubstring));
      return match ? match.id : null;
    };

    const seedMatkul = [
      { kode: 'IF101', nama: 'Algoritma dan Pemrograman', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: getDosenId('Budi') },
      { kode: 'IF102', nama: 'Struktur Data', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: getDosenId('Siti Aminah') },
      { kode: 'IF103', nama: 'Basis Data', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: getDosenId('Budi') },
      { kode: 'TK201', nama: 'Fisika Dasar', sks: 2, fakultas: 'Sains dan Teknologi', dosenId: getDosenId('Agus') },
      { kode: 'TK202', nama: 'Kalkulus', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: getDosenId('Ratna') },
      { kode: 'TK203', nama: 'Rangkaian Listrik', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: getDosenId('Agus') },
      { kode: 'EK301', nama: 'Pengantar Ekonomi', sks: 2, fakultas: 'Bisnis', dosenId: getDosenId('Hendra') },
      { kode: 'EK302', nama: 'Manajemen Bisnis', sks: 3, fakultas: 'Bisnis', dosenId: getDosenId('Maya') },
      { kode: 'EK303', nama: 'Akuntansi Dasar', sks: 3, fakultas: 'Bisnis', dosenId: getDosenId('Hendra') },
      { kode: 'IK401', nama: 'Pengantar Jurnalistik', sks: 2, fakultas: 'Ilmu Komunikasi dan Desain', dosenId: getDosenId('Iwan') },
      { kode: 'IK402', nama: 'Public Relations', sks: 3, fakultas: 'Ilmu Komunikasi dan Desain', dosenId: getDosenId('Dian') },
      { kode: 'IK403', nama: 'Komunikasi Massa', sks: 3, fakultas: 'Ilmu Komunikasi dan Desain', dosenId: getDosenId('Iwan') },
    ];

    for (const m of seedMatkul) {
      await db.runAsync(
        `INSERT INTO mata_kuliah (kode, nama, sks, fakultas, dosen_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [m.kode, m.nama, m.sks, m.fakultas, m.dosenId, now, now]
      );
    }
  }

  // 4. Check Mahasiswa
  const mhsCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM mahasiswa;'
  );

  if (!mhsCount || mhsCount.count === 0) {
    const seedMahasiswa = [
      { nim: '2021010001', nama: 'Dewi', gender: 'WANITA', fakultas: 'Sains dan Teknologi', tahun: '2021', status: 'Aktif' },
      { nim: '2021010002', nama: 'Yanti', gender: 'WANITA', fakultas: 'Bisnis', tahun: '2021', status: 'Aktif' },
      { nim: '2021010003', nama: 'Melati', gender: 'WANITA', fakultas: 'Ilmu Komunikasi dan Desain', tahun: '2021', status: 'Aktif' },
      { nim: '2021010005', nama: 'Mawar', gender: 'WANITA', fakultas: 'Sains dan Teknologi', tahun: '2021', status: 'Aktif' },
      { nim: '2021010007', nama: 'Komarudin', gender: 'PRIA', fakultas: 'Sains dan Teknologi', tahun: '2021', status: 'Aktif' },
      { nim: '2021010008', nama: 'Jaka', gender: 'PRIA', fakultas: 'Sains dan Teknologi', tahun: '2021', status: 'Aktif' },
      { nim: '2021010010', nama: 'Riska', gender: 'WANITA', fakultas: 'Sosial dan Humaniora', tahun: '2021', status: 'Aktif' },
    ];

    for (const m of seedMahasiswa) {
      await db.runAsync(
        `INSERT INTO mahasiswa (nim, nama, gender, fakultas, tahun_masuk, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [m.nim, m.nama, m.gender, m.fakultas, m.tahun, m.status, now, now]
      );
    }
  }

  // 5. Check Jadwal
  const jadwalCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM jadwal;'
  );

  if (!jadwalCount || jadwalCount.count === 0) {
    const matkuls = await db.getAllAsync<{ id: number; nama: string }>('SELECT id, nama FROM mata_kuliah;');
    const getMatkulId = (nama: string) => {
      const match = matkuls.find((m) => m.nama.toLowerCase() === nama.toLowerCase());
      return match ? match.id : 1;
    };

    const seedJadwal = [
      { matkul: 'Algoritma dan Pemrograman', hari: 'Senin', jamMulai: '08:00', jamSelesai: '10:30', ruangan: 'LAB-01' },
      { matkul: 'Struktur Data', hari: 'Senin', jamMulai: '13:00', jamSelesai: '15:30', ruangan: 'R-101' },
      { matkul: 'Basis Data', hari: 'Selasa', jamMulai: '08:00', jamSelesai: '10:30', ruangan: 'LAB-02' },
      { matkul: 'Fisika Dasar', hari: 'Selasa', jamMulai: '10:00', jamSelesai: '11:40', ruangan: 'R-102' },
      { matkul: 'Kalkulus', hari: 'Rabu', jamMulai: '08:00', jamSelesai: '10:30', ruangan: 'R-103' },
      { matkul: 'Rangkaian Listrik', hari: 'Rabu', jamMulai: '13:00', jamSelesai: '15:30', ruangan: 'LAB-03' },
      { matkul: 'Pengantar Ekonomi', hari: 'Kamis', jamMulai: '08:00', jamSelesai: '09:40', ruangan: 'R-201' },
      { matkul: 'Manajemen Bisnis', hari: 'Kamis', jamMulai: '10:00', jamSelesai: '12:30', ruangan: 'R-202' },
      { matkul: 'Pengantar Jurnalistik', hari: 'Jumat', jamMulai: '08:00', jamSelesai: '10:30', ruangan: 'R-301' },
      { matkul: 'Public Relations', hari: 'Jumat', jamMulai: '13:00', jamSelesai: '15:30', ruangan: 'R-302' },
    ];

    for (const j of seedJadwal) {
      const mkId = getMatkulId(j.matkul);
      await db.runAsync(
        `INSERT INTO jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruangan, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [mkId, j.hari, j.jamMulai, j.jamSelesai, j.ruangan, now, now]
      );
    }
  }

  // 6. Check KRS, Presensi & Nilai (Seed sample data for Dewi & Komarudin)
  const krsCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM krs;'
  );

  if (!krsCount || krsCount.count === 0) {
    const allMhs = await db.getAllAsync<{ id: number; nim: string }>('SELECT id, nim FROM mahasiswa;');
    const allMatkul = await db.getAllAsync<{ id: number; kode: string }>('SELECT id, kode FROM mata_kuliah;');

    const dewi = allMhs.find((m) => m.nim === '2021010001');
    const komarudin = allMhs.find((m) => m.nim === '2021010007');

    const if101 = allMatkul.find((m) => m.kode === 'IF101');
    const if102 = allMatkul.find((m) => m.kode === 'IF102');
    const if103 = allMatkul.find((m) => m.kode === 'IF103');

    if (dewi && if101 && if102) {
      await db.runAsync(
        `INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?);`,
        [dewi.id, activeSemesterId, if101.id, now, now]
      );
      await db.runAsync(
        `INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?);`,
        [dewi.id, activeSemesterId, if102.id, now, now]
      );

      // Presensi sample
      await db.runAsync(
        `INSERT INTO presensi (mata_kuliah_id, semester_id, tanggal, mahasiswa_id, status_kehadiran, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [if101.id, activeSemesterId, '2026-10-01', dewi.id, 'Hadir', now, now]
      );
      await db.runAsync(
        `INSERT INTO presensi (mata_kuliah_id, semester_id, tanggal, mahasiswa_id, status_kehadiran, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [if102.id, activeSemesterId, '2026-10-01', dewi.id, 'Hadir', now, now]
      );

      // Nilai sample
      await db.runAsync(
        `INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, nilai_huruf, nilai_angka, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [dewi.id, activeSemesterId, if101.id, 'A', 4.0, now, now]
      );
      await db.runAsync(
        `INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, nilai_huruf, nilai_angka, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [dewi.id, activeSemesterId, if102.id, 'B+', 3.5, now, now]
      );
    }

    if (komarudin && if101 && if103) {
      await db.runAsync(
        `INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?);`,
        [komarudin.id, activeSemesterId, if101.id, now, now]
      );
      await db.runAsync(
        `INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?);`,
        [komarudin.id, activeSemesterId, if103.id, now, now]
      );

      await db.runAsync(
        `INSERT INTO presensi (mata_kuliah_id, semester_id, tanggal, mahasiswa_id, status_kehadiran, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [if101.id, activeSemesterId, '2026-10-01', komarudin.id, 'Hadir', now, now]
      );

      await db.runAsync(
        `INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, nilai_huruf, nilai_angka, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [komarudin.id, activeSemesterId, if101.id, 'A', 4.0, now, now]
      );
    }
  }
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM presensi;
    DELETE FROM nilai;
    DELETE FROM krs;
    DELETE FROM jadwal;
    DELETE FROM mata_kuliah;
    DELETE FROM dosen;
    DELETE FROM mahasiswa;
    DELETE FROM sessions;
  `);
  await seedInitialData(db);
}

export async function resetOperationalData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM presensi;
    DELETE FROM nilai;
    DELETE FROM krs;
    DELETE FROM jadwal;
  `);
}
