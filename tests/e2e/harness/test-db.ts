/**
 * Test Database Harness for Portal Akademik UBD E2E Test Suite
 *
 * Implements an in-memory SQLite database adapter wrapping `bun:sqlite`
 * that faithfully implements the `expo-sqlite` SQLiteDatabase interface.
 * Provides per-test isolation, automatic schema initialization, and transactional state reset.
 */

import { Database } from 'bun:sqlite';

export interface SQLiteDatabaseShim {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  withTransactionAsync<T = void>(callback: () => Promise<T>): Promise<T>;
  isInTransactionAsync(): Promise<boolean>;
  getRawDb(): Database;
  closeAsync(): Promise<void>;
}

let activeRawDb: Database | null = null;
let txDepth = 0;

function sanitizeParams(params: any[] = []): any[] {
  return params.map((p) => (p === undefined ? null : p));
}

const SCHEMA_SQL = `
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
`;

function populateSeeds(db: Database) {
  const now = new Date().toISOString();

  // Semesters
  const sem1 = db.query(`INSERT INTO semesters (nama, aktif, created_at, updated_at) VALUES (?, 1, ?, ?);`).run('Ganjil 2025/2026', now, now);
  const activeSemesterId = Number(sem1.lastInsertRowid);
  db.query(`INSERT INTO semesters (nama, aktif, created_at, updated_at) VALUES (?, 0, ?, ?);`).run('Genap 2024/2025', now, now);

  // Dosen (8)
  const seedDosen = [
    { nidn: '0101010101', nama: 'Dr. Budi Santoso', fakultas: 'Sains dan Teknologi', gender: 'PRIA', telepon: '08111111111', foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { nidn: '0202020202', nama: 'Prof. Siti Aminah', fakultas: 'Sains dan Teknologi', gender: 'WANITA', telepon: '08222222222', foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
    { nidn: '0303030303', nama: 'Ir. Agus Setiawan, M.T.', fakultas: 'Sains dan Teknologi', gender: 'PRIA', telepon: '08333333333', foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
    { nidn: '0404040404', nama: 'Ratna Sari, M.Sc.', fakultas: 'Sains dan Teknologi', gender: 'WANITA', telepon: '08444444444', foto_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80' },
    { nidn: '0505050505', nama: 'Dr. Hendra Gunawan', fakultas: 'Bisnis', gender: 'PRIA', telepon: '08555555555', foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
    { nidn: '0606060606', nama: 'Maya Indah, M.B.A.', fakultas: 'Bisnis', gender: 'WANITA', telepon: '08666666666', foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' },
    { nidn: '0707070707', nama: 'Dr. Iwan Fals', fakultas: 'Ilmu Komunikasi dan Desain', gender: 'PRIA', telepon: '08777777777', foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80' },
    { nidn: '0808080808', nama: 'Dr. Dian Sastro', fakultas: 'Ilmu Komunikasi dan Desain', gender: 'WANITA', telepon: '08888888888', foto_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80' },
  ];
  for (const d of seedDosen) {
    db.query(`INSERT INTO dosen (nidn, nama, fakultas, gender, telepon, foto_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`)
      .run(d.nidn, d.nama, d.fakultas, d.gender, d.telepon, (d as any).foto_url || null, now, now);
  }

  // Mata Kuliah (12)
  const seedMatkul = [
    { kode: 'IF101', nama: 'Algoritma dan Pemrograman', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: 1 },
    { kode: 'IF102', nama: 'Struktur Data', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: 2 },
    { kode: 'IF103', nama: 'Basis Data', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: 1 },
    { kode: 'TK201', nama: 'Fisika Dasar', sks: 2, fakultas: 'Sains dan Teknologi', dosenId: 3 },
    { kode: 'TK202', nama: 'Kalkulus', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: 4 },
    { kode: 'TK203', nama: 'Rangkaian Listrik', sks: 3, fakultas: 'Sains dan Teknologi', dosenId: 3 },
    { kode: 'EK301', nama: 'Pengantar Ekonomi', sks: 2, fakultas: 'Bisnis', dosenId: 5 },
    { kode: 'EK302', nama: 'Manajemen Bisnis', sks: 3, fakultas: 'Bisnis', dosenId: 6 },
    { kode: 'EK303', nama: 'Akuntansi Dasar', sks: 3, fakultas: 'Bisnis', dosenId: 5 },
    { kode: 'IK401', nama: 'Pengantar Jurnalistik', sks: 2, fakultas: 'Ilmu Komunikasi dan Desain', dosenId: 7 },
    { kode: 'IK402', nama: 'Public Relations', sks: 3, fakultas: 'Ilmu Komunikasi dan Desain', dosenId: 8 },
    { kode: 'IK403', nama: 'Komunikasi Massa', sks: 3, fakultas: 'Ilmu Komunikasi dan Desain', dosenId: 7 },
  ];
  for (const m of seedMatkul) {
    db.query(`INSERT INTO mata_kuliah (kode, nama, sks, fakultas, dosen_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);`)
      .run(m.kode, m.nama, m.sks, m.fakultas, m.dosenId, now, now);
  }

  // Mahasiswa (7)
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
    db.query(`INSERT INTO mahasiswa (nim, nama, gender, fakultas, tahun_masuk, status, foto_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`)
      .run(m.nim, m.nama, m.gender, m.fakultas, m.tahun, m.status, (m as any).foto_url || null, now, now);
  }

  // Jadwal (10)
  const seedJadwal = [
    { mkId: 1, hari: 'Senin', jamMulai: '08:00', jamSelesai: '10:30', ruangan: 'LAB-01' },
    { mkId: 2, hari: 'Senin', jamMulai: '13:00', jamSelesai: '15:30', ruangan: 'R-101' },
    { mkId: 3, hari: 'Selasa', jamMulai: '08:00', jamSelesai: '10:30', ruangan: 'LAB-02' },
    { mkId: 4, hari: 'Selasa', jamMulai: '10:00', jamSelesai: '11:40', ruangan: 'R-102' },
    { mkId: 5, hari: 'Rabu', jamMulai: '08:00', jamSelesai: '10:30', ruangan: 'R-103' },
    { mkId: 6, hari: 'Rabu', jamMulai: '13:00', jamSelesai: '15:30', ruangan: 'LAB-03' },
    { mkId: 7, hari: 'Kamis', jamMulai: '08:00', jamSelesai: '09:40', ruangan: 'R-201' },
    { mkId: 8, hari: 'Kamis', jamMulai: '10:00', jamSelesai: '12:30', ruangan: 'R-202' },
    { mkId: 9, hari: 'Jumat', jamMulai: '08:00', jamSelesai: '10:30', ruangan: 'R-301' },
    { mkId: 10, hari: 'Jumat', jamMulai: '13:00', jamSelesai: '15:30', ruangan: 'R-302' },
  ];
  for (const j of seedJadwal) {
    db.query(`INSERT INTO jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruangan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);`)
      .run(j.mkId, j.hari, j.jamMulai, j.jamSelesai, j.ruangan, now, now);
  }

  // KRS, Presensi, Nilai sample for Dewi (id: 1) and Komarudin (id: 5)
  // Dewi (id: 1)
  db.query(`INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?);`)
    .run(1, activeSemesterId, 1, now, now);
  db.query(`INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?);`)
    .run(1, activeSemesterId, 2, now, now);



  // Nilai inserts with both old and new schema fields
  db.query(`INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, nilai_huruf, nilai_angka, tugas, uts, uas, akhir, huruf, bobot, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
    .run(1, activeSemesterId, 1, 'A', 4.0, 85, 85, 85, 85, 'A', 4.0, now, now);
  db.query(`INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, nilai_huruf, nilai_angka, tugas, uts, uas, akhir, huruf, bobot, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
    .run(1, activeSemesterId, 2, 'B+', 3.5, 75, 75, 75, 75, 'B+', 3.5, now, now);

  // Komarudin (id: 5)
  db.query(`INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?);`)
    .run(5, activeSemesterId, 1, now, now);
  db.query(`INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?);`)
    .run(5, activeSemesterId, 3, now, now);



  db.query(`INSERT INTO nilai (mahasiswa_id, semester_id, mata_kuliah_id, nilai_huruf, nilai_angka, tugas, uts, uas, akhir, huruf, bobot, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
    .run(5, activeSemesterId, 1, 'A', 4.0, 85, 85, 85, 85, 'A', 4.0, now, now);
}

export function createInMemoryDatabase(): Database {
  const db = new Database(':memory:');
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = MEMORY;');
  db.exec(SCHEMA_SQL);
  populateSeeds(db);
  return db;
}

export const testDbShim: SQLiteDatabaseShim = {
  async execAsync(sql: string): Promise<void> {
    if (!activeRawDb) activeRawDb = createInMemoryDatabase();
    activeRawDb.exec(sql);
  },

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    if (!activeRawDb) activeRawDb = createInMemoryDatabase();
    const cleanParams = sanitizeParams(params);
    const stmt = activeRawDb.query(sql);
    const res = stmt.run(...cleanParams);
    return {
      lastInsertRowId: Number(res.lastInsertRowid),
      changes: res.changes,
    };
  },

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!activeRawDb) activeRawDb = createInMemoryDatabase();
    const cleanParams = sanitizeParams(params);
    const stmt = activeRawDb.query(sql);
    return stmt.all(...cleanParams) as T[];
  },

  async getFirstAsync<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!activeRawDb) activeRawDb = createInMemoryDatabase();
    const cleanParams = sanitizeParams(params);
    const stmt = activeRawDb.query(sql);
    const row = stmt.get(...cleanParams);
    return (row as T) ?? null;
  },

  async withTransactionAsync<T = void>(callback: () => Promise<T>): Promise<T> {
    if (!activeRawDb) activeRawDb = createInMemoryDatabase();
    const savepointName = `sp_${txDepth++}`;
    activeRawDb.exec(`SAVEPOINT ${savepointName};`);
    try {
      const result = await callback();
      activeRawDb.exec(`RELEASE SAVEPOINT ${savepointName};`);
      txDepth--;
      return result;
    } catch (error) {
      activeRawDb.exec(`ROLLBACK TO SAVEPOINT ${savepointName};`);
      activeRawDb.exec(`RELEASE SAVEPOINT ${savepointName};`);
      txDepth--;
      throw error;
    }
  },

  async closeAsync(): Promise<void> {
    if (activeRawDb) {
      activeRawDb.close();
      activeRawDb = null;
    }
  },

  async isInTransactionAsync(): Promise<boolean> { return false; },

  getRawDb(): Database {
    if (!activeRawDb) activeRawDb = createInMemoryDatabase();
    return activeRawDb;
  },
};

/**
 * Resets the in-memory database to a brand new instance populated with fresh schema and seeds.
 */
export async function resetTestDatabase(): Promise<SQLiteDatabaseShim> {
  if (activeRawDb) {
    try {
      activeRawDb.close();
    } catch (_) {
      // ignore
    }
  }
  activeRawDb = createInMemoryDatabase();
  txDepth = 0;
  return testDbShim;
}

export function getActiveRawDatabase(): Database {
  return testDbShim.getRawDb();
}
