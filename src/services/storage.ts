import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Mahasiswa,
  STORAGE_KEYS,
  UserSession,
} from '@/types/mahasiswa';

/**
 * Data awal mahasiswa sesuai spesifikasi FR-11 dan gambar acuan dosen.
 */
export const SEED_MAHASISWA: readonly Mahasiswa[] = [
  {
    id: 'seed-5',
    nim: '2021010007',
    nama: 'Komarudin',
    jenisKelamin: 'PRIA',
    fakultas: 'Sains dan Teknologi',
    createdAt: 1700000000001,
  },
  {
    id: 'seed-6',
    nim: '2021010008',
    nama: 'Jaka',
    jenisKelamin: 'PRIA',
    fakultas: 'Sains dan Teknologi',
    createdAt: 1700000000002,
  },
  {
    id: 'seed-1',
    nim: '2021010001',
    nama: 'Dewi',
    jenisKelamin: 'WANITA',
    fakultas: 'Sains dan Teknologi',
    createdAt: 1700000000003,
  },
  {
    id: 'seed-2',
    nim: '2021010002',
    nama: 'Yanti',
    jenisKelamin: 'WANITA',
    fakultas: 'Bisnis',
    createdAt: 1700000000004,
  },
  {
    id: 'seed-3',
    nim: '2021010003',
    nama: 'Melati',
    jenisKelamin: 'WANITA',
    fakultas: 'Ilmu Komunikasi dan Desain',
    createdAt: 1700000000005,
  },
  {
    id: 'seed-4',
    nim: '2021010005',
    nama: 'Mawar',
    jenisKelamin: 'WANITA',
    fakultas: 'Sains dan Teknologi',
    createdAt: 1700000000006,
  },
  {
    id: 'seed-7',
    nim: '2021010010',
    nama: 'Riska',
    jenisKelamin: 'WANITA',
    fakultas: 'Sosial dan Humaniora',
    createdAt: 1700000000007,
  },
] as const;

export const StorageService = {
  /**
   * Mengambil sesi login administrator yang tersimpan.
   */
  async getSession(): Promise<UserSession | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
      if (!json) return null;
      const session = JSON.parse(json) as UserSession;
      return session?.isLoggedIn ? session : null;
    } catch (error) {
      console.error('Gagal membaca sesi dari AsyncStorage:', error);
      return null;
    }
  },

  /**
   * Menyimpan sesi login administrator aktif.
   */
  async saveSession(session: UserSession): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Gagal menyimpan sesi ke AsyncStorage:', error);
      throw error;
    }
  },

  /**
   * Menghapus sesi login saat logout.
   */
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (error) {
      console.error('Gagal menghapus sesi:', error);
    }
  },

  /**
   * Mengambil seluruh daftar mahasiswa dari penyimpanan lokal.
   * Jika belum ada data (first run), menginisialisasi dengan seed data.
   */
  async getMahasiswaList(): Promise<Mahasiswa[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.MAHASISWA_LIST);
      if (!json) {
        return await this.initSeedData();
      }
      const list = JSON.parse(json) as Mahasiswa[];
      return Array.isArray(list) ? list : await this.initSeedData();
    } catch (error) {
      console.error('Gagal membaca list mahasiswa:', error);
      return [...SEED_MAHASISWA];
    }
  },

  /**
   * Menginisialisasi seed data ke AsyncStorage.
   */
  async initSeedData(): Promise<Mahasiswa[]> {
    try {
      const initial = [...SEED_MAHASISWA];
      await AsyncStorage.setItem(
        STORAGE_KEYS.MAHASISWA_LIST,
        JSON.stringify(initial)
      );
      await AsyncStorage.setItem(STORAGE_KEYS.IS_SEEDED, 'true');
      return initial;
    } catch (error) {
      console.error('Gagal inisialisasi seed data:', error);
      return [...SEED_MAHASISWA];
    }
  },

  /**
   * Menyimpan data mahasiswa baru.
   * Melakukan validasi kelengkapan kolom dan keunikan NIM.
   */
  async saveMahasiswa(
    data: Omit<Mahasiswa, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; error?: string; mahasiswa?: Mahasiswa }> {
    try {
      const cleanNim = data.nim?.trim() ?? '';
      const cleanNama = data.nama?.trim() ?? '';

      if (!cleanNim || !cleanNama || !data.jenisKelamin || !data.fakultas) {
        return {
          success: false,
          error: 'Harap lengkapi semua data mahasiswa!',
        };
      }

      const currentList = await this.getMahasiswaList();

      const isDuplicate = currentList.some(
        (m) => m.nim.toLowerCase() === cleanNim.toLowerCase()
      );

      if (isDuplicate) {
        return {
          success: false,
          error: `Kode Mahasiswa/NIM ${cleanNim} sudah terdaftar!`,
        };
      }

      const newMahasiswa: Mahasiswa = {
        id: `mhs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nim: cleanNim,
        nama: cleanNama,
        jenisKelamin: data.jenisKelamin,
        fakultas: data.fakultas,
        createdAt: Date.now(),
      };

      const updatedList = [...currentList, newMahasiswa];
      await AsyncStorage.setItem(
        STORAGE_KEYS.MAHASISWA_LIST,
        JSON.stringify(updatedList)
      );

      return { success: true, mahasiswa: newMahasiswa };
    } catch (error) {
      console.error('Gagal menyimpan mahasiswa:', error);
      return {
        success: false,
        error: 'Terjadi kesalahan saat menyimpan data.',
      };
    }
  },

  /**
   * Menghapus mahasiswa berdasarkan NIM.
   */
  async deleteMahasiswa(nim: string): Promise<boolean> {
    try {
      const currentList = await this.getMahasiswaList();
      const updatedList = currentList.filter(
        (m) => m.nim.toLowerCase() !== nim.trim().toLowerCase()
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.MAHASISWA_LIST,
        JSON.stringify(updatedList)
      );
      return true;
    } catch (error) {
      console.error('Gagal menghapus mahasiswa:', error);
      return false;
    }
  },
};
