import { getDatabase } from './database';
import { Dosen, Fakultas, Gender } from '@/types/mahasiswa';

const DEFAULT_DOSEN_PHOTOS: Record<string, string> = {
  '0101010101': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  '0202020202': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  '0303030303': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  '0404040404': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  '0505050505': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  '0606060606': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  '0707070707': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  '0808080808': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
};

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
    return rows.map((r) => {
      const photo = r.foto_url || DEFAULT_DOSEN_PHOTOS[r.nidn] || undefined;
      return {
        id: r.id,
        nidn: r.nidn,
        nama: r.nama,
        fakultas: r.fakultas as Fakultas,
        gender: r.gender as Gender,
        telepon: r.telepon,
        no_hp: r.telepon,
        prodi: r.prodi,
        gelar: r.gelar,
        email: r.email,
        fotoUrl: photo,
        foto_url: photo,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });
  },

  async getById(id: number | string): Promise<Dosen | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM dosen WHERE id = ? LIMIT 1;',
      [id]
    );
    if (!row) return null;

    const photo = row.foto_url || DEFAULT_DOSEN_PHOTOS[row.nidn] || row.foto_url;

    return {
      id: row.id,
      nidn: row.nidn,
      nama: row.nama,
      fakultas: row.fakultas as Fakultas,
      gender: row.gender as Gender,
      jenis_kelamin: row.gender,
      telepon: row.telepon,
      no_hp: row.telepon,
      prodi: row.prodi,
      gelar: row.gelar,
      email: row.email,
      fotoUrl: photo,
      foto_url: photo,
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
    fotoUrl?: string;
    foto_url?: string;
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
    const photoVal = data.fotoUrl || data.foto_url || null;

    const result = await db.runAsync(
      `INSERT INTO dosen (nidn, nama, fakultas, gender, telepon, prodi, gelar, email, foto_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.nidn.trim(),
        data.nama.trim(),
        data.fakultas,
        genderVal,
        phoneVal,
        data.prodi?.trim() || null,
        data.gelar?.trim() || null,
        data.email?.trim() || null,
        photoVal,
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
      fotoUrl: photoVal || undefined,
      foto_url: photoVal || undefined,
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
      fotoUrl?: string | null;
      foto_url?: string | null;
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

    if (data.prodi !== undefined) {
      fields.push('prodi = ?');
      args.push(data.prodi.trim());
    }

    if (data.gelar !== undefined) {
      fields.push('gelar = ?');
      args.push(data.gelar.trim());
    }

    if (data.email !== undefined) {
      fields.push('email = ?');
      args.push(data.email.trim());
    }

    const photo = data.fotoUrl !== undefined ? data.fotoUrl : data.foto_url;
    if (photo !== undefined) {
      fields.push('foto_url = ?');
      args.push(photo ? photo.trim() : null);
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
