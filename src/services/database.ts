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
    try {
      const db = await SQLite.openDatabaseAsync(DATABASE.NAME);
      await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
      await initSchema(db);
      await seedInitialData(db);
      dbInstance = db;
      return db;
    } catch (error) {
      initPromise = null;
      dbInstance = null;
      throw error;
    }
  })();

  return initPromise;
}

export const initDatabase = getDatabase;

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
      foto_url TEXT,
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
      prodi TEXT,
      gelar TEXT,
      email TEXT,
      foto_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mata_kuliah (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      sks INTEGER NOT NULL CHECK(sks >= 1 AND sks <= 6),
      fakultas TEXT NOT NULL,
      semester INTEGER DEFAULT 1,
      dosen_id INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (dosen_id) REFERENCES dosen (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS jadwal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mata_kuliah_id INTEGER NOT NULL,
      dosen_id INTEGER,
      hari TEXT NOT NULL,
      jam_mulai TEXT NOT NULL,
      jam_selesai TEXT NOT NULL,
      ruangan TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah (id) ON DELETE CASCADE,
      FOREIGN KEY (dosen_id) REFERENCES dosen (id) ON DELETE SET NULL
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
      jadwal_id INTEGER,
      tanggal TEXT NOT NULL,
      mahasiswa_id INTEGER NOT NULL,
      status_kehadiran TEXT NOT NULL,
      pertemuan_ke INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah (id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE,
      FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa (id) ON DELETE CASCADE,
      FOREIGN KEY (jadwal_id) REFERENCES jadwal (id) ON DELETE SET NULL
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

  // Idempotent column migrations for existing databases
  try {
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
      await db.runAsync("ALTER TABLE nilai ADD COLUMN huruf TEXT DEFAULT 'E';");
    }
    if (!existingColNames.includes('bobot')) {
      await db.runAsync('ALTER TABLE nilai ADD COLUMN bobot REAL DEFAULT 0;');
    }
    if (!existingColNames.includes('nilai_huruf')) {
      await db.runAsync('ALTER TABLE nilai ADD COLUMN nilai_huruf TEXT;');
    }
    if (!existingColNames.includes('nilai_angka')) {
      await db.runAsync('ALTER TABLE nilai ADD COLUMN nilai_angka REAL;');
    }
  } catch (err) {
    console.warn('Error during nilai column migration:', err);
  }

  try {
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
  } catch (err) {
    console.warn('Error during sessions column migration:', err);
  }

  // Mahasiswa column migration: foto_url
  try {
    const mhsCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(mahasiswa);');
    const existingMhsCols = mhsCols.map((c) => c.name);
    if (!existingMhsCols.includes('foto_url')) {
      await db.runAsync('ALTER TABLE mahasiswa ADD COLUMN foto_url TEXT;');
    }
  } catch (err) {
    console.warn('Error during mahasiswa column migration:', err);
  }

  // Dosen column migrations: prodi, gelar, email, foto_url
  try {
    const dosenCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(dosen);');
    const existingDosenCols = dosenCols.map((c) => c.name);
    if (!existingDosenCols.includes('prodi')) {
      await db.runAsync('ALTER TABLE dosen ADD COLUMN prodi TEXT;');
    }
    if (!existingDosenCols.includes('gelar')) {
      await db.runAsync('ALTER TABLE dosen ADD COLUMN gelar TEXT;');
    }
    if (!existingDosenCols.includes('email')) {
      await db.runAsync('ALTER TABLE dosen ADD COLUMN email TEXT;');
    }
    if (!existingDosenCols.includes('foto_url')) {
      await db.runAsync('ALTER TABLE dosen ADD COLUMN foto_url TEXT;');
    }
  } catch (err) {
    console.warn('Error during dosen column migration:', err);
  }

  // Backfill foto_url for existing data if null or empty
  try {
    const defaultMhsPhotos: [string, string][] = [
      ['2021010001', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'],
      ['2021010002', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80'],
      ['2021010003', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'],
      ['2021010005', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80'],
      ['2021010007', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'],
      ['2021010008', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80'],
      ['2021010010', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'],
    ];

    for (const [nim, url] of defaultMhsPhotos) {
      await db.runAsync(
        'UPDATE mahasiswa SET foto_url = ? WHERE nim = ? AND (foto_url IS NULL OR foto_url = "");',
        [url, nim]
      );
    }

    await db.runAsync(`
      UPDATE mahasiswa 
      SET foto_url = CASE 
        WHEN gender = 'WANITA' THEN 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'
        ELSE 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
      END
      WHERE foto_url IS NULL OR foto_url = '';
    `);

    const defaultDosenPhotos: [string, string][] = [
      ['0101010101', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'],
      ['0202020202', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'],
      ['0303030303', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'],
      ['0404040404', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'],
      ['0505050505', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'],
      ['0606060606', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'],
      ['0707070707', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80'],
      ['0808080808', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80'],
    ];

    for (const [nidn, url] of defaultDosenPhotos) {
      await db.runAsync(
        'UPDATE dosen SET foto_url = ? WHERE nidn = ? AND (foto_url IS NULL OR foto_url = "");',
        [url, nidn]
      );
    }

    await db.runAsync(`
      UPDATE dosen 
      SET foto_url = CASE 
        WHEN gender = 'WANITA' THEN 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
        ELSE 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
      END
      WHERE foto_url IS NULL OR foto_url = '';
    `);
  } catch (err) {
    console.warn('Error during foto_url backfill migration:', err);
  }

  // Mata Kuliah column migration: semester
  try {
    const mkCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(mata_kuliah);');
    const existingMkCols = mkCols.map((c) => c.name);
    if (!existingMkCols.includes('semester')) {
      await db.runAsync('ALTER TABLE mata_kuliah ADD COLUMN semester INTEGER DEFAULT 1;');
    }
  } catch (err) {
    console.warn('Error during mata_kuliah column migration:', err);
  }

  // Presensi column migration: pertemuan_ke, jadwal_id
  try {
    const presensiCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(presensi);');
    const existingPresensiCols = presensiCols.map((c) => c.name);
    if (!existingPresensiCols.includes('pertemuan_ke')) {
      await db.runAsync('ALTER TABLE presensi ADD COLUMN pertemuan_ke INTEGER DEFAULT 1;');
    }
    if (!existingPresensiCols.includes('jadwal_id')) {
      await db.runAsync('ALTER TABLE presensi ADD COLUMN jadwal_id INTEGER;');
    }
  } catch (err) {
    console.warn('Error during presensi column migration:', err);
  }

  // Jadwal column migration: dosen_id
  try {
    const jadwalCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(jadwal);');
    const existingJadwalCols = jadwalCols.map((c) => c.name);
    if (!existingJadwalCols.includes('dosen_id')) {
      await db.runAsync('ALTER TABLE jadwal ADD COLUMN dosen_id INTEGER;');
    }
  } catch (err) {
    console.warn('Error during jadwal column migration:', err);
  }

  // 10 SQLite Indexes on Foreign Keys and High-Frequency Query Columns
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_krs_mahasiswa_semester ON krs(mahasiswa_id, semester_id);
    CREATE INDEX IF NOT EXISTS idx_krs_matakuliah ON krs(mata_kuliah_id);
    CREATE INDEX IF NOT EXISTS idx_nilai_mahasiswa_semester ON nilai(mahasiswa_id, semester_id);
    CREATE INDEX IF NOT EXISTS idx_nilai_matakuliah ON nilai(mata_kuliah_id);
    CREATE INDEX IF NOT EXISTS idx_jadwal_matakuliah ON jadwal(mata_kuliah_id);
    CREATE INDEX IF NOT EXISTS idx_jadwal_dosen ON jadwal(dosen_id);
    CREATE INDEX IF NOT EXISTS idx_jadwal_hari_ruangan ON jadwal(hari, ruangan);
    CREATE INDEX IF NOT EXISTS idx_presensi_jadwal_tanggal ON presensi(jadwal_id, tanggal);
    CREATE INDEX IF NOT EXISTS idx_presensi_mahasiswa ON presensi(mahasiswa_id);
    CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON mahasiswa(nim);

    -- Supplementary performance indexes for joined queries
    CREATE INDEX IF NOT EXISTS idx_mata_kuliah_dosen ON mata_kuliah(dosen_id);
    CREATE INDEX IF NOT EXISTS idx_presensi_matakuliah_tanggal ON presensi(mata_kuliah_id, tanggal);
  `);
}

async function seedInitialData(db: SQLite.SQLiteDatabase): Promise<void> {
  const inTx = false;

  const runSeed = async () => {
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
        { nidn: '0101010101', nama: 'Dr. Budi Santoso', fakultas: 'Sains dan Teknologi', prodi: 'Teknik Informatika', gelar: 'Dr.', email: 'budi.santoso@ubd.ac.id', gender: 'PRIA', telepon: '08111111111', foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
        { nidn: '0202020202', nama: 'Prof. Siti Aminah', fakultas: 'Sains dan Teknologi', prodi: 'Sistem Informasi', gelar: 'Prof. Dr.', email: 'siti.aminah@ubd.ac.id', gender: 'WANITA', telepon: '08222222222', foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
        { nidn: '0303030303', nama: 'Ir. Agus Setiawan, M.T.', fakultas: 'Sains dan Teknologi', prodi: 'Teknik Elektro', gelar: 'Ir., M.T.', email: 'agus.setiawan@ubd.ac.id', gender: 'PRIA', telepon: '08333333333', foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
        { nidn: '0404040404', nama: 'Ratna Sari, M.Sc.', fakultas: 'Sains dan Teknologi', prodi: 'Matematika', gelar: 'M.Sc.', email: 'ratna.sari@ubd.ac.id', gender: 'WANITA', telepon: '08444444444', foto_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80' },
        { nidn: '0505050505', nama: 'Dr. Hendra Gunawan', fakultas: 'Bisnis', prodi: 'Manajemen', gelar: 'Dr., M.M.', email: 'hendra.gunawan@ubd.ac.id', gender: 'PRIA', telepon: '08555555555', foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
        { nidn: '0606060606', nama: 'Maya Indah, M.B.A.', fakultas: 'Bisnis', prodi: 'Akuntansi', gelar: 'M.B.A.', email: 'maya.indah@ubd.ac.id', gender: 'WANITA', telepon: '08666666666', foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' },
        { nidn: '0707070707', nama: 'Dr. Iwan Fals', fakultas: 'Ilmu Komunikasi dan Desain', prodi: 'Ilmu Komunikasi', gelar: 'Dr., M.Si.', email: 'iwan.fals@ubd.ac.id', gender: 'PRIA', telepon: '08777777777', foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80' },
        { nidn: '0808080808', nama: 'Dr. Dian Sastro', fakultas: 'Ilmu Komunikasi dan Desain', prodi: 'Desain Komunikasi Visual', gelar: 'Dr., M.Sn.', email: 'dian.sastro@ubd.ac.id', gender: 'WANITA', telepon: '08888888888', foto_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80' },
      ];

      for (const d of seedDosen) {
        await db.runAsync(
          `INSERT INTO dosen (nidn, nama, fakultas, gender, telepon, prodi, gelar, email, foto_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [d.nidn, d.nama, d.fakultas, d.gender, d.telepon, d.prodi, d.gelar, d.email, d.foto_url, now, now]
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
        { kode: 'IF101', nama: 'Algoritma dan Pemrograman', sks: 3, fakultas: 'Sains dan Teknologi', semester: 1, dosenId: getDosenId('Budi') },
        { kode: 'IF102', nama: 'Struktur Data', sks: 3, fakultas: 'Sains dan Teknologi', semester: 2, dosenId: getDosenId('Siti Aminah') },
        { kode: 'IF103', nama: 'Basis Data', sks: 3, fakultas: 'Sains dan Teknologi', semester: 3, dosenId: getDosenId('Budi') },
        { kode: 'TK201', nama: 'Fisika Dasar', sks: 2, fakultas: 'Sains dan Teknologi', semester: 1, dosenId: getDosenId('Agus') },
        { kode: 'TK202', nama: 'Kalkulus', sks: 3, fakultas: 'Sains dan Teknologi', semester: 1, dosenId: getDosenId('Ratna') },
        { kode: 'TK203', nama: 'Rangkaian Listrik', sks: 3, fakultas: 'Sains dan Teknologi', semester: 2, dosenId: getDosenId('Agus') },
        { kode: 'EK301', nama: 'Pengantar Ekonomi', sks: 2, fakultas: 'Bisnis', semester: 1, dosenId: getDosenId('Hendra') },
        { kode: 'EK302', nama: 'Manajemen Bisnis', sks: 3, fakultas: 'Bisnis', semester: 2, dosenId: getDosenId('Maya') },
        { kode: 'EK303', nama: 'Akuntansi Dasar', sks: 3, fakultas: 'Bisnis', semester: 1, dosenId: getDosenId('Hendra') },
        { kode: 'IK401', nama: 'Pengantar Jurnalistik', sks: 2, fakultas: 'Ilmu Komunikasi dan Desain', semester: 1, dosenId: getDosenId('Iwan') },
        { kode: 'IK402', nama: 'Public Relations', sks: 3, fakultas: 'Ilmu Komunikasi dan Desain', semester: 2, dosenId: getDosenId('Dian') },
        { kode: 'IK403', nama: 'Komunikasi Massa', sks: 3, fakultas: 'Ilmu Komunikasi dan Desain', semester: 3, dosenId: getDosenId('Iwan') },
      ];

      for (const m of seedMatkul) {
        await db.runAsync(
          `INSERT INTO mata_kuliah (kode, nama, sks, fakultas, semester, dosen_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [m.kode, m.nama, m.sks, m.fakultas, m.semester, m.dosenId, now, now]
        );
      }
    }

    // 4. Check Mahasiswa
    const mhsCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM mahasiswa;'
    );

    if (!mhsCount || mhsCount.count === 0) {
      const seedMahasiswa = [
        { nim: '2021010001', nama: 'Dewi', gender: 'WANITA', fakultas: 'Sains dan Teknologi', tahun: '2021', status: 'Aktif', foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
        { nim: '2021010002', nama: 'Yanti', gender: 'WANITA', fakultas: 'Bisnis', tahun: '2021', status: 'Aktif', foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80' },
        { nim: '2021010003', nama: 'Melati', gender: 'WANITA', fakultas: 'Ilmu Komunikasi dan Desain', tahun: '2021', status: 'Aktif', foto_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
        { nim: '2021010005', nama: 'Mawar', gender: 'WANITA', fakultas: 'Sains dan Teknologi', tahun: '2021', status: 'Aktif', foto_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80' },
        { nim: '2021010007', nama: 'Komarudin', gender: 'PRIA', fakultas: 'Sains dan Teknologi', tahun: '2021', status: 'Aktif', foto_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
        { nim: '2021010008', nama: 'Jaka', gender: 'PRIA', fakultas: 'Sains dan Teknologi', tahun: '2021', status: 'Aktif', foto_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80' },
        { nim: '2021010010', nama: 'Riska', gender: 'WANITA', fakultas: 'Sosial dan Humaniora', tahun: '2021', status: 'Aktif', foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
      ];

      for (const m of seedMahasiswa) {
        await db.runAsync(
          `INSERT INTO mahasiswa (nim, nama, gender, fakultas, tahun_masuk, status, foto_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [m.nim, m.nama, m.gender, m.fakultas, m.tahun, m.status, m.foto_url, now, now]
        );
      }
    }

    // 5. Check Jadwal
    const jadwalCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM jadwal;'
    );

    if (!jadwalCount || jadwalCount.count === 0) {
      const matkuls = await db.getAllAsync<{ id: number; nama: string; dosen_id: number | null }>('SELECT id, nama, dosen_id FROM mata_kuliah;');
      const getMatkul = (nama: string) => {
        const match = matkuls.find((m) => m.nama.toLowerCase() === nama.toLowerCase());
        return match ? { id: match.id, dosen_id: match.dosen_id } : { id: 1, dosen_id: null };
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
        const mk = getMatkul(j.matkul);
        await db.runAsync(
          `INSERT INTO jadwal (mata_kuliah_id, dosen_id, hari, jam_mulai, jam_selesai, ruangan, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [mk.id, mk.dosen_id, j.hari, j.jamMulai, j.jamSelesai, j.ruangan, now, now]
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
      const allJadwal = await db.getAllAsync<{ id: number; mata_kuliah_id: number }>('SELECT id, mata_kuliah_id FROM jadwal;');

      const dewi = allMhs.find((m) => m.nim === '2021010001');
      const komarudin = allMhs.find((m) => m.nim === '2021010007');

      const if101 = allMatkul.find((m) => m.kode === 'IF101');
      const if102 = allMatkul.find((m) => m.kode === 'IF102');
      const if103 = allMatkul.find((m) => m.kode === 'IF103');

      const if101Jadwal = allJadwal.find((j) => if101 && j.mata_kuliah_id === if101.id);
      const if102Jadwal = allJadwal.find((j) => if102 && j.mata_kuliah_id === if102.id);

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

        // Presensi sample with valid pertemuan_ke and jadwal_id
        await db.runAsync(
          `INSERT INTO presensi (mata_kuliah_id, semester_id, jadwal_id, tanggal, mahasiswa_id, status_kehadiran, pertemuan_ke, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'Hadir', 1, ?, ?);`,
          [if101.id, activeSemesterId, if101Jadwal ? if101Jadwal.id : null, '2026-10-01', dewi.id, now, now]
        );
        await db.runAsync(
          `INSERT INTO presensi (mata_kuliah_id, semester_id, jadwal_id, tanggal, mahasiswa_id, status_kehadiran, pertemuan_ke, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'Hadir', 1, ?, ?);`,
          [if102.id, activeSemesterId, if102Jadwal ? if102Jadwal.id : null, '2026-10-01', dewi.id, now, now]
        );

        // Nilai sample with complete bobot, akhir, and huruf
        // Dewi IF101: 3 SKS, A (4.0) -> 12 points
        await db.runAsync(
          `INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, tugas, uts, uas, akhir, huruf, bobot, nilai_huruf, nilai_angka, created_at, updated_at)
           VALUES (?, ?, ?, 85, 85, 85, 85, 'A', 4.0, 'A', 4.0, ?, ?);`,
          [dewi.id, activeSemesterId, if101.id, now, now]
        );
        // Dewi IF102: 3 SKS, B+ (3.5) -> 10.5 points -> Cumulative GPA: 22.5 / 6 = 3.75
        await db.runAsync(
          `INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, tugas, uts, uas, akhir, huruf, bobot, nilai_huruf, nilai_angka, created_at, updated_at)
           VALUES (?, ?, ?, 78, 78, 78, 78, 'B+', 3.5, 'B+', 3.5, ?, ?);`,
          [dewi.id, activeSemesterId, if102.id, now, now]
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
          `INSERT INTO presensi (mata_kuliah_id, semester_id, jadwal_id, tanggal, mahasiswa_id, status_kehadiran, pertemuan_ke, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'Hadir', 1, ?, ?);`,
          [if101.id, activeSemesterId, if101Jadwal ? if101Jadwal.id : null, '2026-10-01', komarudin.id, now, now]
        );

        // Komarudin IF101: 3 SKS, A (4.0) -> Cumulative GPA: 12.0 / 3 = 4.00
        await db.runAsync(
          `INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, tugas, uts, uas, akhir, huruf, bobot, nilai_huruf, nilai_angka, created_at, updated_at)
           VALUES (?, ?, ?, 85, 85, 85, 85, 'A', 4.0, 'A', 4.0, ?, ?);`,
          [komarudin.id, activeSemesterId, if101.id, now, now]
        );
      }
    }
  };

  if (inTx) {
    await runSeed();
  } else {
    await db.withTransactionAsync(runSeed);
  }
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  const inTx = await db.isInTransactionAsync();

  const runReset = async () => {
    // Preserve current active session so user is not forcibly logged out on reset
    const currentSession = await db.getFirstAsync<{
      user_id: string | null;
      username: string;
      token: string | null;
      expires_at: string | null;
      login_time: number;
      is_logged_in: number;
    }>('SELECT user_id, username, token, expires_at, login_time, is_logged_in FROM sessions WHERE is_logged_in = 1 ORDER BY id DESC LIMIT 1;');

    await db.execAsync(`
      DELETE FROM presensi;
      DELETE FROM nilai;
      DELETE FROM krs;
      DELETE FROM jadwal;
      DELETE FROM mata_kuliah;
      DELETE FROM dosen;
      DELETE FROM mahasiswa;
      DELETE FROM semesters;
      DELETE FROM sessions;
    `);

    await seedInitialData(db);

    if (currentSession) {
      await db.runAsync(
        `INSERT INTO sessions (user_id, username, token, expires_at, is_logged_in, login_time)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          currentSession.user_id || currentSession.username,
          currentSession.username,
          currentSession.token,
          currentSession.expires_at,
          currentSession.is_logged_in ?? 1,
          currentSession.login_time || Date.now(),
        ]
      );
    }
  };

  if (inTx) {
    await runReset();
  } else {
    await db.withTransactionAsync(runReset);
  }
}

export async function resetOperationalData(): Promise<void> {
  const db = await getDatabase();
  const inTx = await db.isInTransactionAsync();

  const runResetOp = async () => {
    await db.execAsync(`
      DELETE FROM presensi;
      DELETE FROM nilai;
      DELETE FROM krs;
      DELETE FROM jadwal;
    `);
  };

  if (inTx) {
    await runResetOp();
  } else {
    await db.withTransactionAsync(runResetOp);
  }
}
