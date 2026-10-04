/**
 * Model Data & Kontrak Tipe Mahasiswa & V2 Universitas Buddhi Dharma (UBD)
 * Berdasarkan spesifikasi docs/SYSTEM-DESIGN.md, docs/NEW_FEATURE_V2.md & GLOSSARY.md
 */

export type Gender = 'PRIA' | 'WANITA';

export type Fakultas =
  | 'Sains dan Teknologi'
  | 'Bisnis'
  | 'Ilmu Komunikasi dan Desain'
  | 'Sosial dan Humaniora';

export const FAKULTAS_OPTIONS: readonly Fakultas[] = [
  'Sains dan Teknologi',
  'Bisnis',
  'Ilmu Komunikasi dan Desain',
  'Sosial dan Humaniora',
] as const;

export type StatusMahasiswa = 'Aktif' | 'Cuti' | 'Tidak Aktif' | 'Lulus';

export const STATUS_MAHASISWA_OPTIONS: readonly StatusMahasiswa[] = [
  'Aktif',
  'Cuti',
  'Tidak Aktif',
  'Lulus',
] as const;

export type Hari = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export const HARI_OPTIONS: readonly Hari[] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

export type NilaiHuruf = 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'E';

export const NILAI_HURUF_OPTIONS: readonly NilaiHuruf[] = [
  'A',
  'B+',
  'B',
  'C+',
  'C',
  'D',
  'E',
] as const;

export const NILAI_BOBOT: Record<NilaiHuruf, number> = {
  'A': 4.0,
  'B+': 3.5,
  'B': 3.0,
  'C+': 2.5,
  'C': 2.0,
  'D': 1.0,
  'E': 0.0,
};

export type StatusPresensi = 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPHA';

export const STATUS_PRESENSI_OPTIONS: readonly StatusPresensi[] = [
  'Hadir',
  'Izin',
  'Sakit',
  'Alpha',
] as const;

export interface Semester {
  id: number | string;
  nama: string; // e.g. 'Ganjil 2025/2026'
  aktif?: number; // 1 = aktif, 0 = tidak aktif
  is_active?: number | boolean;
  tahun?: string;
  tipe?: 'Ganjil' | 'Genap';
  createdAt?: string;
  updatedAt?: string;
}

export interface Mahasiswa {
  id: string | number;
  nim: string;
  nama: string;
  jenisKelamin: Gender;
  fakultas: Fakultas;
  fotoUrl?: string;
  foto_url?: string;
  prodi?: string;
  angkatan?: string;
  tahunMasuk?: string;
  status?: StatusMahasiswa;
  email?: string;
  noHp?: string;
  alamat?: string;
  createdAt?: number | string;
  updatedAt?: string;
}

export interface Dosen {
  id: number | string;
  nidn: string;
  nama: string;
  fakultas: Fakultas;
  fotoUrl?: string;
  foto_url?: string;
  gender?: Gender;
  jenis_kelamin?: string;
  telepon?: string;
  gelar?: string;
  prodi?: string;
  email?: string;
  no_hp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MataKuliah {
  id: number | string;
  kode: string;
  nama: string;
  sks: number;
  fakultas: Fakultas;
  semester?: number;
  dosenId?: number | string | null;
  dosen_id?: number | string | null;
  dosenNama?: string;
  dosen_nama?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Jadwal {
  id: number | string;
  mataKuliahId?: number | string;
  mata_kuliah_id?: number | string;
  mataKuliahKode?: string;
  mk_kode?: string;
  mata_kuliah_kode?: string;
  mataKuliahNama?: string;
  mk_nama?: string;
  mata_kuliah_nama?: string;
  sks?: number;
  mk_sks?: number;
  mata_kuliah_sks?: number;
  dosenNama?: string;
  dosen_nama?: string;
  fakultas?: Fakultas;
  mk_fakultas?: Fakultas;
  hari: Hari;
  jamMulai?: string;
  jam_mulai?: string;
  jamSelesai?: string;
  jam_selesai?: string;
  ruangan: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KRS {
  id: number | string;
  mahasiswaId?: number | string;
  mahasiswa_id?: number | string;
  semesterId?: number | string;
  semester_id?: number | string;
  mataKuliahId?: number | string;
  mata_kuliah_id?: number | string;
  mataKuliahKode?: string;
  kode?: string;
  mata_kuliah_kode?: string;
  mataKuliahNama?: string;
  nama?: string;
  mata_kuliah_nama?: string;
  sks?: number;
  mata_kuliah_sks?: number;
  dosenNama?: string;
  dosen_nama?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Presensi {
  id: number | string;
  mataKuliahId?: number | string;
  mata_kuliah_id?: number | string;
  semesterId?: number | string;
  semester_id?: number | string;
  tanggal: string; // YYYY-MM-DD
  mahasiswaId?: number | string;
  mahasiswa_id?: number | string;
  mahasiswaNim?: string;
  mahasiswa_nim?: string;
  mahasiswaNama?: string;
  mahasiswa_nama?: string;
  statusKehadiran?: StatusPresensi;
  status_kehadiran?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Nilai {
  id: number | string;
  mahasiswaId?: number | string;
  mahasiswa_id?: string | number;
  semesterId?: number | string;
  semester_id?: string | number;
  mataKuliahId?: number | string;
  mata_kuliah_id?: string | number;
  mataKuliahKode?: string;
  mata_kuliah_kode?: string;
  mataKuliahNama?: string;
  mata_kuliah_nama?: string;
  mahasiswa_nama?: string;
  mahasiswa_nim?: string;
  sks?: number;
  mata_kuliah_sks?: number;
  nilaiHuruf?: NilaiHuruf;
  huruf?: NilaiHuruf;
  nilaiAngka?: number;
  akhir?: number;
  tugas?: number;
  uts?: number;
  uas?: number;
  bobot?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSession {
  username: string;
  isLoggedIn: boolean;
  loginTime?: number;
  token?: string;
}

export type AuditActionType =
  | 'NILAI_MUTATION'
  | 'KRS_DISPENSASI'
  | 'MAHASISWA_STATUS_CHANGE'
  | 'MASTER_DATA_DELETE'
  | 'DATABASE_RESTORE';

export interface AuditLog {
  id: number;
  timestamp: string;
  action: AuditActionType | string;
  entity: string;
  entityId?: string | null;
  entity_id?: string | null;
  details?: string | null;
  actor: string;
  createdAt?: string;
  created_at?: string;
}

export interface SksQuotaInfo {
  ipsLalu: number | null;
  kuotaMaksimal: number;
  sksTerpilih: number;
  isOverLimit: boolean;
  isDispensasiActive?: boolean;
  nomorSuratDispensasi?: string;
}

export interface BackupPayload {
  app: string;
  version: string;
  exportedAt: string;
  checksum?: string;
  tables: {
    sessions?: any[];
    semesters: any[];
    mahasiswa: any[];
    dosen: any[];
    mata_kuliah: any[];
    jadwal: any[];
    krs: any[];
    presensi: any[];
    nilai: any[];
    audit_logs: any[];
  };
}

export const STORAGE_KEYS = {
  SESSION: '@ubd_session_v1',
  MAHASISWA_LIST: '@ubd_mahasiswa_v1',
  IS_SEEDED: '@ubd_seed_initialized_v1',
} as const;

export const DATABASE = {
  NAME: 'portal_akademik_ubd.db',
  VERSION: 3,
} as const;
