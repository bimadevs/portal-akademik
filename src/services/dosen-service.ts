import { getDatabase } from './database';
import { Dosen, Fakultas, Gender } from '@/types/mahasiswa';

export const DosenService = {
  async getAll(search?: string, fakultas?: string): Promise<Dosen[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM dosen WHERE 1=1';
    const args: any[] = [];

    if (search && search.trim()) {
      query += ' AND (nama LIKE ? OR nidn LIKE ?)';
      const term = `%${search.trim()}%`;
      args.push(term, term);
    }

    if (fakultas && fakultas !== 'Semua') {
      query += ' AND fakultas = ?';
      args.push(fakultas);
    }

    query += ' ORDER BY id ASC;';

    const rows = await db.getAllAsync<any>(query, args);
    return rows.map((r) => ({
      id: r.id,
      nidn: r.nidn,
      nama: r.nama,
      fakultas: r.fakultas as Fakultas,
      gender: r.gender as Gender,
      telepon: r.telepon,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getById(id: number | string): Promise<Dosen | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM dosen WHERE id = ? LIMIT 1;',
      [id]
    );
    if (!row) return null;

    return {
      id: row.id,
      nidn: row.nidn,
      nama: row.nama,
      fakultas: row.fakultas as Fakultas,
      gender: row.gender as Gender,
      jenis_kelamin: row.gender,
      telepon: row.telepon,
      no_hp: row.telepon,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async create(data: {
    nidn: string;
    nama: string;
    fakultas: Fakultas;
    gender?: Gender;
    jenis_kelamin?: string;
    telepon?: string;
    gelar?: string;
    prodi?: string;
    email?: string;
    no_hp?: string;
    noHp?: string;
  }): Promise<Dosen> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const existing = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM dosen WHERE nidn = ? LIMIT 1;',
      [data.nidn.trim()]
    );
    if (existing) {
      throw new Error(`Dosen dengan NIDN ${data.nidn} sudah terdaftar!`);
    }

    const genderVal = (data.gender || (data.jenis_kelamin?.toUpperCase() === 'WANITA' ? 'WANITA' : 'PRIA')) as Gender;
    const phoneVal = (data.telepon || data.no_hp || data.noHp || '-').trim();

    const result = await db.runAsync(
      `INSERT INTO dosen (nidn, nama, fakultas, gender, telepon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        data.nidn.trim(),
        data.nama.trim(),
        data.fakultas,
        genderVal,
        phoneVal,
        now,
        now,
      ]
    );

    return {
      id: result.lastInsertRowId,
      nidn: data.nidn.trim(),
      nama: data.nama.trim(),
      fakultas: data.fakultas,
      gender: genderVal,
      jenis_kelamin: genderVal,
      telepon: phoneVal,
      no_hp: phoneVal,
      gelar: data.gelar,
      prodi: data.prodi,
      email: data.email,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(
    id: number | string,
    data: {
      nidn?: string;
      nama?: string;
      fakultas?: Fakultas;
      gender?: Gender;
      jenis_kelamin?: string;
      telepon?: string;
      gelar?: string;
      prodi?: string;
      email?: string;
      no_hp?: string;
      noHp?: string;
    }
  ): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const fields: string[] = ['updated_at = ?'];
    const args: any[] = [now];

    if (data.nidn !== undefined) {
      const duplicate = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM dosen WHERE nidn = ? AND id != ? LIMIT 1;',
        [data.nidn.trim(), id]
      );
      if (duplicate) {
        throw new Error(`Dosen dengan NIDN ${data.nidn} sudah terdaftar!`);
      }
      fields.push('nidn = ?');
      args.push(data.nidn.trim());
    }

    if (data.nama !== undefined) {
      fields.push('nama = ?');
      args.push(data.nama.trim());
    }

    if (data.fakultas !== undefined) {
      fields.push('fakultas = ?');
      args.push(data.fakultas);
    }

    if (data.gender !== undefined || data.jenis_kelamin !== undefined) {
      const g = (data.gender || (data.jenis_kelamin?.toUpperCase() === 'WANITA' ? 'WANITA' : 'PRIA')) as Gender;
      fields.push('gender = ?');
      args.push(g);
    }

    const phone = data.telepon || data.no_hp || data.noHp;
    if (phone !== undefined) {
      fields.push('telepon = ?');
      args.push(phone.trim());
    }

    args.push(id);
    await db.runAsync(
      `UPDATE dosen SET ${fields.join(', ')} WHERE id = ?;`,
      args
    );
  },

  async delete(id: number | string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM dosen WHERE id = ?;', [id]);
  },
};
