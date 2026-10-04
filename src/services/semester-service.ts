import { getDatabase } from './database';
import { Semester } from '../types/mahasiswa';

export class SemesterService {
  static async getAll(): Promise<Semester[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM semesters ORDER BY id DESC;`
    );
    return rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      aktif: r.aktif ?? (r.is_active ? 1 : 0),
      is_active: r.aktif ?? r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  static async getActive(): Promise<Semester | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM semesters WHERE aktif = 1 LIMIT 1;`
    );
    if (!row) {
      const first = await db.getFirstAsync<any>(`SELECT * FROM semesters ORDER BY id DESC LIMIT 1;`);
      if (!first) return null;
      return {
        id: first.id,
        nama: first.nama,
        aktif: first.aktif,
        is_active: first.aktif,
        createdAt: first.created_at,
        updatedAt: first.updated_at,
      };
    }
    return {
      id: row.id,
      nama: row.nama,
      aktif: row.aktif,
      is_active: row.aktif,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async setActive(id: number | string): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync(`UPDATE semesters SET aktif = 0;`);
      await db.runAsync(`UPDATE semesters SET aktif = 1 WHERE id = ?;`, [id]);
    });
  }

  static async create(nama: string): Promise<Semester> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO semesters (nama, aktif, created_at, updated_at) VALUES (?, 0, ?, ?);`,
      [nama, now, now]
    );
    const created = await db.getFirstAsync<any>(`SELECT * FROM semesters WHERE id = ?;`, [result.lastInsertRowId]);
    return {
      id: created.id,
      nama: created.nama,
      aktif: created.aktif,
      is_active: created.aktif,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
  }

  static async getById(id: number | string): Promise<Semester | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(`SELECT * FROM semesters WHERE id = ? LIMIT 1;`, [id]);
    if (!row) return null;
    return {
      id: row.id,
      nama: row.nama,
      aktif: row.aktif,
      is_active: row.aktif,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
