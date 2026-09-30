import { Mahasiswa, UserSession } from '@/types/mahasiswa';
import { MahasiswaService } from './mahasiswa-service';
import { getDatabase } from './database';

export const StorageService = {
  /**
   * Mengambil sesi login administrator yang tersimpan di SQLite.
   */
  async getSession(): Promise<UserSession | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        `SELECT * FROM sessions ORDER BY id DESC LIMIT 1`
      );
      if (!row) return null;

      if (row.expires_at) {
        const expTime = Number(row.expires_at);
        if (!isNaN(expTime) && expTime < Date.now()) {
          await this.clearSession();
          return null;
        }
      }

      return {
        isLoggedIn: true,
        username: row.username || row.user_id || 'admin',
        token: row.token || 'ubd_token',
        loginTime: row.login_time ? Number(row.login_time) : Date.now(),
      };
    } catch (error) {
      console.error('Gagal membaca sesi:', error);
      return null;
    }
  },

  /**
   * Menyimpan sesi login administrator aktif ke SQLite.
   */
  async saveSession(session: UserSession): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(`DELETE FROM sessions`);
      if (session.isLoggedIn) {
        const expiresAt = String(Date.now() + 24 * 60 * 60 * 1000);
        const loginTime = session.loginTime || Date.now();
        const username = session.username || 'admin';
        const token = session.token || 'ubd_token';

        const sessionCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(sessions);');
        const colNames = sessionCols.map((c) => c.name);

        const fields: string[] = [];
        const values: any[] = [];
        const placeholders: string[] = [];

        if (colNames.includes('user_id')) {
          fields.push('user_id');
          values.push(username);
          placeholders.push('?');
        }
        if (colNames.includes('username')) {
          fields.push('username');
          values.push(username);
          placeholders.push('?');
        }
        if (colNames.includes('token')) {
          fields.push('token');
          values.push(token);
          placeholders.push('?');
        }
        if (colNames.includes('expires_at')) {
          fields.push('expires_at');
          values.push(expiresAt);
          placeholders.push('?');
        }
        if (colNames.includes('login_time')) {
          fields.push('login_time');
          values.push(loginTime);
          placeholders.push('?');
        }
        if (colNames.includes('is_logged_in')) {
          fields.push('is_logged_in');
          values.push(1);
          placeholders.push('?');
        }

        if (fields.length > 0) {
          await db.runAsync(
            `INSERT INTO sessions (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
            values
          );
        }
      }
    } catch (error) {
      console.error('Gagal menyimpan sesi:', error);
      throw error;
    }
  },

  /**
   * Menghapus sesi login saat logout.
   */
  async clearSession(): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(`DELETE FROM sessions`);
    } catch (error) {
      console.error('Gagal menghapus sesi:', error);
    }
  },

  /**
   * Mengambil seluruh daftar mahasiswa dari SQLite.
   */
  async getMahasiswaList(): Promise<Mahasiswa[]> {
    return MahasiswaService.getAll();
  },

  /**
   * Menyimpan data mahasiswa baru melalui MahasiswaService.
   */
  async saveMahasiswa(
    data: Omit<Mahasiswa, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; error?: string; mahasiswa?: Mahasiswa }> {
    try {
      const res = await MahasiswaService.create({
        nim: data.nim,
        nama: data.nama,
        jenisKelamin: data.jenisKelamin,
        fakultas: data.fakultas,
        prodi: data.prodi,
        angkatan: data.angkatan,
        status: data.status,
        email: data.email,
        noHp: data.noHp,
        alamat: data.alamat,
      });
      return { success: true, mahasiswa: res };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Gagal menyimpan mahasiswa',
      };
    }
  },

  /**
   * Menghapus mahasiswa berdasarkan NIM.
   */
  async deleteMahasiswa(nim: string): Promise<boolean> {
    try {
      const mhs = await MahasiswaService.getByNim(nim);
      if (!mhs) return false;
      await MahasiswaService.delete(mhs.id);
      return true;
    } catch (error) {
      console.error('Gagal menghapus mahasiswa:', error);
      return false;
    }
  },
};
