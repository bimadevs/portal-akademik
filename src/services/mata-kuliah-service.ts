import { getDatabase } from './database';
import { Fakultas, MataKuliah } from '@/types/mahasiswa';

export const MataKuliahService = {
  async getAll(search?: string, fakultas?: string): Promise<MataKuliah[]> {
    const db = await getDatabase();
    let query = `
      SELECT mk.*, d.nama as dosen_nama
      FROM mata_kuliah mk
      LEFT JOIN dosen d ON mk.dosen_id = d.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (search && search.trim()) {
      query += ' AND (mk.nama LIKE ? OR mk.kode LIKE ?)';
      const term = `%${search.trim()}%`;
      args.push(term, term);
    }

    if (fakultas && fakultas !== 'Semua') {
      query += ' AND mk.fakultas = ?';
      args.push(fakultas);
    }

    query += ' ORDER BY mk.id ASC;';

    const rows = await db.getAllAsync<any>(query, args);
    return rows.map((r) => ({
      id: r.id,
      kode: r.kode,
      nama: r.nama,
      sks: r.sks,
      fakultas: r.fakultas as Fakultas,
      dosenId: r.dosen_id,
      dosenNama: r.dosen_nama || 'Belum Ditentukan',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getById(id: number | string): Promise<MataKuliah | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT mk.*, d.nama as dosen_nama
       FROM mata_kuliah mk
       LEFT JOIN dosen d ON mk.dosen_id = d.id
       WHERE mk.id = ? LIMIT 1;`,
      [id]
    );
    if (!row) return null;

    return {
      id: row.id,
      kode: row.kode,
      nama: row.nama,
      sks: row.sks,
      fakultas: row.fakultas as Fakultas,
      semester: row.semester || 1,
      dosenId: row.dosen_id,
      dosen_id: row.dosen_id,
      dosenNama: row.dosen_nama || 'Belum Ditentukan',
      dosen_nama: row.dosen_nama || 'Belum Ditentukan',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async create(data: {
    kode: string;
    nama: string;
    sks: number;
    fakultas?: Fakultas;
    semester?: number;
    dosenId?: number | string | null;
    dosen_id?: number | string | null;
  }): Promise<MataKuliah> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const existing = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM mata_kuliah WHERE kode = ? LIMIT 1;',
      [data.kode.trim().toUpperCase()]
    );
    if (existing) {
      throw new Error(`Mata Kuliah dengan Kode ${data.kode} sudah terdaftar!`);
    }

    const assignedDosen = data.dosenId !== undefined ? data.dosenId : data.dosen_id;
    const fakultasVal = data.fakultas || 'Sains dan Teknologi';

    const result = await db.runAsync(
      `INSERT INTO mata_kuliah (kode, nama, sks, fakultas, dosen_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        data.kode.trim().toUpperCase(),
        data.nama.trim(),
        data.sks,
        fakultasVal,
        assignedDosen ?? null,
        now,
        now,
      ]
    );

    return {
      id: result.lastInsertRowId,
      kode: data.kode.trim().toUpperCase(),
      nama: data.nama.trim(),
      sks: data.sks,
      fakultas: fakultasVal,
      semester: data.semester || 1,
      dosenId: assignedDosen ?? null,
      dosen_id: assignedDosen ?? null,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(
    id: number | string,
    data: {
      kode?: string;
      nama?: string;
      sks?: number;
      fakultas?: Fakultas;
      semester?: number;
      dosenId?: number | string | null;
      dosen_id?: number | string | null;
    }
  ): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const fields: string[] = ['updated_at = ?'];
    const args: any[] = [now];

    if (data.kode !== undefined) {
      const duplicate = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM mata_kuliah WHERE kode = ? AND id != ? LIMIT 1;',
        [data.kode.trim().toUpperCase(), id]
      );
      if (duplicate) {
        throw new Error(`Mata Kuliah dengan Kode ${data.kode} sudah terdaftar!`);
      }
      fields.push('kode = ?');
      args.push(data.kode.trim().toUpperCase());
    }

    if (data.nama !== undefined) {
      fields.push('nama = ?');
      args.push(data.nama.trim());
    }

    if (data.sks !== undefined) {
      fields.push('sks = ?');
      args.push(data.sks);
    }

    if (data.fakultas !== undefined) {
      fields.push('fakultas = ?');
      args.push(data.fakultas);
    }

    const assignedDosen = data.dosenId !== undefined ? data.dosenId : data.dosen_id;
    if (assignedDosen !== undefined) {
      fields.push('dosen_id = ?');
      args.push(assignedDosen);
    }

    args.push(id);
    await db.runAsync(
      `UPDATE mata_kuliah SET ${fields.join(', ')} WHERE id = ?;`,
      args
    );
  },

  async delete(id: number | string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM mata_kuliah WHERE id = ?;', [id]);
  },
};
