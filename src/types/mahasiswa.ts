/**
 * Model Data & Kontrak Tipe Mahasiswa Universitas Buddhi Dharma (UBD)
 * Berdasarkan spesifikasi docs/SYSTEM-DESIGN.md & GLOSSARY.md
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

export interface Mahasiswa {
  id: string;
  nim: string; // Kode Mahasiswa / NIM unik
  nama: string;
  jenisKelamin: Gender;
  fakultas: Fakultas;
  createdAt: number;
}

export interface UserSession {
  username: string;
  isLoggedIn: boolean;
  loginTime: number;
}

export const STORAGE_KEYS = {
  SESSION: '@ubd_session_v1',
  MAHASISWA_LIST: '@ubd_mahasiswa_v1',
  IS_SEEDED: '@ubd_seed_initialized_v1',
} as const;
