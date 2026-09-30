import { getDatabase } from './database';
import { Mahasiswa, Fakultas, Gender, StatusMahasiswa } from '@/types/mahasiswa';

export const MahasiswaService = {
  async getAll(params?: {
    search?: string;
    fakultas?: string;
    status?: string;
  } | string): Promise<Mahasiswa[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM mahasiswa WHERE 1=1';
    const args: any[] = [];
    const filter = typeof params === 'string' ? { search: params } : params;

    if (filter?.search && filter.search.trim()) {
      query += ' AND (nama LIKE ? OR nim LIKE ?)';
      const term = `%${filter.search.trim()}%`;
      args.push(term, term);
    }

    if (filter?.fakultas && filter.fakultas !== 'Semua') {
      query += ' AND fakultas = ?';
      args.push(filter.fakultas);
    }

    if (filter?.status && filter.status !== 'Semua') {
      query += ' AND status = ?';
      args.push(filter.status);
    }

    query += ' ORDER BY id DESC;';

    const rows = await db.getAllAsync<any>(query, args);
    return rows.map((r) => ({
      id: r.id,
      nim: r.nim,
      nama: r.nama,
      jenisKelamin: r.gender as Gender,
      fakultas: r.fakultas as Fakultas,
      tahunMasuk: r.tahun_masuk,
      status: r.status as StatusMahasiswa,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getById(id: string | number): Promise<Mahasiswa | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM mahasiswa WHERE id = ? OR nim = ? LIMIT 1;',
      [id, String(id)]
    );
    if (!row) return null;

    return {
      id: row.id,
      nim: row.nim,
      nama: row.nama,
      jenisKelamin: row.gender as Gender,
      fakultas: row.fakultas as Fakultas,
      tahunMasuk: row.tahun_masuk,
      status: row.status as StatusMahasiswa,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async getByNim(nim: string): Promise<Mahasiswa | null> {
    return this.getById(nim);
  },

  async create(data: {
    nim: string;
    nama: string;
    jenisKelamin: Gender;
    fakultas: Fakultas;
    prodi?: string;
    angkatan?: string;
    tahunMasuk?: string;
    status?: StatusMahasiswa;
    email?: string;
    noHp?: string;
    alamat?: string;
  }): Promise<Mahasiswa> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const existing = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM mahasiswa WHERE nim = ? LIMIT 1;',
      [data.nim.trim()]
    );
    if (existing) {
      throw new Error(`Mahasiswa dengan NIM ${data.nim} sudah terdaftar!`);
    }

    const result = await db.runAsync(
      `INSERT INTO mahasiswa (nim, nama, fakultas, gender, tahun_masuk, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.nim.trim(),
        data.nama.trim(),
        data.fakultas,
        data.jenisKelamin,
        data.tahunMasuk || data.angkatan || '2021',
        data.status || 'Aktif',
        now,
        now,
      ]
    );

    return {
      id: result.lastInsertRowId,
      nim: data.nim.trim(),
      nama: data.nama.trim(),
      jenisKelamin: data.jenisKelamin,
      fakultas: data.fakultas,
      prodi: data.prodi,
      angkatan: data.angkatan,
      tahunMasuk: data.tahunMasuk || data.angkatan || '2021',
      status: data.status || 'Aktif',
      email: data.email,
      noHp: data.noHp,
      alamat: data.alamat,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(
    id: string | number,
    data: {
      nim?: string;
      nama?: string;
      jenisKelamin?: Gender;
      fakultas?: Fakultas;
      tahunMasuk?: string;
      status?: StatusMahasiswa;
    }
  ): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const fields: string[] = ['updated_at = ?'];
    const args: any[] = [now];

    if (data.nim !== undefined) {
      // Periksa apakah NIM dipakai oleh mahasiswa lain
      const duplicate = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM mahasiswa WHERE nim = ? AND id != ? LIMIT 1;',
        [data.nim.trim(), id]
      );
      if (duplicate) {
        throw new Error(`Mahasiswa dengan NIM ${data.nim} sudah terdaftar!`);
      }
      fields.push('nim = ?');
      args.push(data.nim.trim());
    }

    if (data.nama !== undefined) {
      fields.push('nama = ?');
      args.push(data.nama.trim());
    }

    if (data.jenisKelamin !== undefined) {
      fields.push('gender = ?');
      args.push(data.jenisKelamin);
    }

    if (data.fakultas !== undefined) {
      fields.push('fakultas = ?');
      args.push(data.fakultas);
    }

    if (data.tahunMasuk !== undefined) {
      fields.push('tahun_masuk = ?');
      args.push(data.tahunMasuk);
    }

    if (data.status !== undefined) {
      fields.push('status = ?');
      args.push(data.status);
    }

    args.push(id);
    await db.runAsync(
      `UPDATE mahasiswa SET ${fields.join(', ')} WHERE id = ? OR nim = ?;`,
      [...args, String(id)]
    );
  },

  async delete(id: string | number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM mahasiswa WHERE id = ? OR nim = ?;', [
      id,
      String(id),
    ]);
  },
};
