import { getDatabase } from './database';
import { Mahasiswa, Fakultas, Gender, StatusMahasiswa } from '@/types/mahasiswa';
import { AuditService } from './audit-service';

const DEFAULT_STUDENT_PHOTOS: Record<string, string> = {
  '2021010001': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  '2021010002': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80',
  '2021010003': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  '2021010005': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  '2021010007': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  '2021010008': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  '2021010010': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
};

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
    return rows.map((r) => {
      const photo = r.foto_url || DEFAULT_STUDENT_PHOTOS[r.nim] || undefined;
      return {
        id: r.id,
        nim: r.nim,
        nama: r.nama,
        jenisKelamin: r.gender as Gender,
        fakultas: r.fakultas as Fakultas,
        tahunMasuk: r.tahun_masuk,
        status: r.status as StatusMahasiswa,
        fotoUrl: photo,
        foto_url: photo,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });
  },

  async getById(id: string | number): Promise<Mahasiswa | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM mahasiswa WHERE id = ? OR nim = ? LIMIT 1;',
      [id, String(id)]
    );
    if (!row) return null;

    const photo = row.foto_url || DEFAULT_STUDENT_PHOTOS[row.nim] || row.foto_url;

    return {
      id: row.id,
      nim: row.nim,
      nama: row.nama,
      jenisKelamin: row.gender as Gender,
      fakultas: row.fakultas as Fakultas,
      tahunMasuk: row.tahun_masuk,
      status: row.status as StatusMahasiswa,
      fotoUrl: photo,
      foto_url: photo,
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
    fotoUrl?: string;
    foto_url?: string;
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

    const photoVal = data.fotoUrl || data.foto_url || null;

    const result = await db.runAsync(
      `INSERT INTO mahasiswa (nim, nama, fakultas, gender, tahun_masuk, status, foto_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.nim.trim(),
        data.nama.trim(),
        data.fakultas,
        data.jenisKelamin,
        data.tahunMasuk || data.angkatan || '2021',
        data.status || 'Aktif',
        photoVal,
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
      fotoUrl: photoVal || undefined,
      foto_url: photoVal || undefined,
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
      fotoUrl?: string | null;
      foto_url?: string | null;
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

    const photo = data.fotoUrl !== undefined ? data.fotoUrl : data.foto_url;
    if (photo !== undefined) {
      fields.push('foto_url = ?');
      args.push(photo ? photo.trim() : null);
    }

    args.push(id);
    await db.runAsync(
      `UPDATE mahasiswa SET ${fields.join(', ')} WHERE id = ? OR nim = ?;`,
      [...args, String(id)]
    );

    if (data.status !== undefined) {
      try {
        await AuditService.logActivity(
          'MAHASISWA_STATUS_CHANGE',
          'Mahasiswa',
          id,
          `Status mahasiswa diubah menjadi ${data.status}`
        );
      } catch (err) {
        console.warn('Gagal mencatat audit log status mahasiswa:', err);
      }
    }
  },

  async updateStatus(id: string | number, status: StatusMahasiswa): Promise<void> {
    return this.update(id, { status });
  },

  async delete(id: string | number): Promise<void> {
    const db = await getDatabase();
    const existing = await this.getById(id);
    await db.runAsync('DELETE FROM mahasiswa WHERE id = ? OR nim = ?;', [
      id,
      String(id),
    ]);

    try {
      await AuditService.logActivity(
        'MASTER_DATA_DELETE',
        'Mahasiswa',
        id,
        `Penghapusan data mahasiswa: ${existing?.nama || id} (${existing?.nim || id})`
      );
    } catch (err) {
      console.warn('Gagal mencatat audit log hapus mahasiswa:', err);
    }
  },
};
