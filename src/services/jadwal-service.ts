import { getDatabase } from './database';
import { Hari, Jadwal } from '@/types/mahasiswa';

export const JadwalService = {
  async getAll(params?: { hari?: string; search?: string } | string): Promise<Jadwal[]> {
    const db = await getDatabase();
    let query = `
      SELECT j.*, mk.kode as mk_kode, mk.nama as mk_nama, mk.sks as mk_sks, mk.fakultas as mk_fakultas, d.nama as dosen_nama
      FROM jadwal j
      JOIN mata_kuliah mk ON j.mata_kuliah_id = mk.id
      LEFT JOIN dosen d ON mk.dosen_id = d.id
      WHERE 1=1
    `;
    const args: any[] = [];
    const filter = typeof params === 'string' ? { search: params } : params;

    if (filter?.hari && filter.hari !== 'Semua') {
      query += ' AND j.hari = ?';
      args.push(filter.hari);
    }

    if (filter?.search && filter.search.trim()) {
      query += ' AND (mk.nama LIKE ? OR mk.kode LIKE ? OR j.ruangan LIKE ?)';
      const term = `%${filter.search.trim()}%`;
      args.push(term, term, term);
    }

    query += ' ORDER BY j.jam_mulai ASC;';

    const rows = await db.getAllAsync<any>(query, args);
    return rows.map((r) => ({
      id: r.id,
      mataKuliahId: r.mata_kuliah_id,
      mata_kuliah_id: r.mata_kuliah_id,
      mataKuliahKode: r.mk_kode,
      mata_kuliah_kode: r.mk_kode,
      mk_kode: r.mk_kode,
      mataKuliahNama: r.mk_nama,
      mata_kuliah_nama: r.mk_nama,
      mk_nama: r.mk_nama,
      sks: r.mk_sks,
      mata_kuliah_sks: r.mk_sks,
      mk_sks: r.mk_sks,
      fakultas: r.mk_fakultas,
      mk_fakultas: r.mk_fakultas,
      dosenNama: r.dosen_nama || 'Belum Ditentukan',
      dosen_nama: r.dosen_nama || 'Belum Ditentukan',
      hari: r.hari as Hari,
      jamMulai: r.jam_mulai,
      jam_mulai: r.jam_mulai,
      jamSelesai: r.jam_selesai,
      jam_selesai: r.jam_selesai,
      ruangan: r.ruangan,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getById(id: number | string): Promise<Jadwal | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT j.*, mk.kode as mk_kode, mk.nama as mk_nama, mk.sks as mk_sks, mk.fakultas as mk_fakultas, d.nama as dosen_nama
       FROM jadwal j
       JOIN mata_kuliah mk ON j.mata_kuliah_id = mk.id
       LEFT JOIN dosen d ON mk.dosen_id = d.id
       WHERE j.id = ? LIMIT 1;`,
      [id]
    );
    if (!row) return null;

    return {
      id: row.id,
      mataKuliahId: row.mata_kuliah_id,
      mata_kuliah_id: row.mata_kuliah_id,
      mataKuliahKode: row.mk_kode,
      mata_kuliah_kode: row.mk_kode,
      mk_kode: row.mk_kode,
      mataKuliahNama: row.mk_nama,
      mata_kuliah_nama: row.mk_nama,
      mk_nama: row.mk_nama,
      sks: row.mk_sks,
      mata_kuliah_sks: row.mk_sks,
      mk_sks: row.mk_sks,
      fakultas: row.mk_fakultas,
      mk_fakultas: row.mk_fakultas,
      dosenNama: row.dosen_nama || 'Belum Ditentukan',
      dosen_nama: row.dosen_nama || 'Belum Ditentukan',
      hari: row.hari as Hari,
      jamMulai: row.jam_mulai,
      jam_mulai: row.jam_mulai,
      jamSelesai: row.jam_selesai,
      jam_selesai: row.jam_selesai,
      ruangan: row.ruangan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async checkConflict(
    hari: Hari,
    ruangan: string,
    jamMulai: string,
    jamSelesai: string,
    excludeId?: number | string
  ): Promise<Jadwal | null> {
    const db = await getDatabase();
    let query = `
      SELECT j.*, mk.kode as mk_kode, mk.nama as mk_nama, mk.sks as mk_sks, mk.fakultas as mk_fakultas, d.nama as dosen_nama
      FROM jadwal j
      JOIN mata_kuliah mk ON j.mata_kuliah_id = mk.id
      LEFT JOIN dosen d ON mk.dosen_id = d.id
      WHERE j.hari = ? AND j.ruangan = ?
      AND (j.jam_mulai < ? AND j.jam_selesai > ?)
    `;
    const args: any[] = [hari, ruangan.trim(), jamSelesai, jamMulai];

    if (excludeId) {
      query += ' AND j.id != ?';
      args.push(excludeId);
    }

    query += ' LIMIT 1;';

    const row = await db.getFirstAsync<any>(query, args);
    if (!row) return null;

    return {
      id: row.id,
      mataKuliahId: row.mata_kuliah_id,
      mata_kuliah_id: row.mata_kuliah_id,
      mataKuliahKode: row.mk_kode,
      mata_kuliah_kode: row.mk_kode,
      mk_kode: row.mk_kode,
      mataKuliahNama: row.mk_nama,
      mata_kuliah_nama: row.mk_nama,
      mk_nama: row.mk_nama,
      sks: row.mk_sks,
      mata_kuliah_sks: row.mk_sks,
      mk_sks: row.mk_sks,
      fakultas: row.mk_fakultas,
      mk_fakultas: row.mk_fakultas,
      dosenNama: row.dosen_nama || 'Belum Ditentukan',
      dosen_nama: row.dosen_nama || 'Belum Ditentukan',
      hari: row.hari as Hari,
      jamMulai: row.jam_mulai,
      jam_mulai: row.jam_mulai,
      jamSelesai: row.jam_selesai,
      jam_selesai: row.jam_selesai,
      ruangan: row.ruangan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async checkBentrok(
    hari: Hari,
    ruangan: string,
    jamMulai: string,
    jamSelesai: string,
    excludeId?: number | string
  ): Promise<boolean> {
    const conflict = await this.checkConflict(hari, ruangan, jamMulai, jamSelesai, excludeId);
    return !!conflict;
  },

  async create(data: {
    mataKuliahId?: number | string;
    mata_kuliah_id?: number | string;
    hari: Hari;
    jamMulai?: string;
    jam_mulai?: string;
    jamSelesai?: string;
    jam_selesai?: string;
    ruangan: string;
  }): Promise<Jadwal> {
    const mkId = data.mataKuliahId ?? data.mata_kuliah_id;
    if (!mkId) throw new Error('Mata kuliah wajib dipilih');

    const jamMulai = data.jamMulai ?? data.jam_mulai ?? '08:00';
    const jamSelesai = data.jamSelesai ?? data.jam_selesai ?? '10:00';

    const isBentrok = await this.checkBentrok(
      data.hari,
      data.ruangan,
      jamMulai,
      jamSelesai
    );
    if (isBentrok) {
      throw new Error(
        `Jadwal bentrok! Ruangan ${data.ruangan} sudah digunakan pada ${data.hari} antara ${jamMulai} - ${jamSelesai}.`
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = await db.runAsync(
      `INSERT INTO jadwal (mata_kuliah_id, hari, jam_mulai, jam_selesai, ruangan, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        mkId,
        data.hari,
        jamMulai,
        jamSelesai,
        data.ruangan.trim(),
        now,
        now,
      ]
    );

    const created = await this.getById(result.lastInsertRowId);
    if (!created) throw new Error('Gagal membuat jadwal');
    return created;
  },

  async update(
    id: number | string,
    data: {
      mataKuliahId?: number | string;
      mata_kuliah_id?: number | string;
      hari?: Hari;
      jamMulai?: string;
      jam_mulai?: string;
      jamSelesai?: string;
      jam_selesai?: string;
      ruangan?: string;
    }
  ): Promise<void> {
    const current = await this.getById(id);
    if (!current) throw new Error('Jadwal tidak ditemukan');

    const newHari = data.hari ?? current.hari;
    const newRuangan = (data.ruangan ?? current.ruangan ?? '').trim();
    const newMulai = data.jamMulai ?? data.jam_mulai ?? current.jamMulai ?? current.jam_mulai ?? '08:00';
    const newSelesai = data.jamSelesai ?? data.jam_selesai ?? current.jamSelesai ?? current.jam_selesai ?? '10:00';
    const newMkId = data.mataKuliahId ?? data.mata_kuliah_id ?? current.mataKuliahId ?? current.mata_kuliah_id ?? 0;

    const isBentrok = await this.checkBentrok(
      newHari,
      newRuangan,
      newMulai,
      newSelesai,
      id
    );
    if (isBentrok) {
      throw new Error(
        `Jadwal bentrok! Ruangan ${newRuangan} sudah digunakan pada ${newHari} antara ${newMulai} - ${newSelesai}.`
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE jadwal
       SET mata_kuliah_id = ?, hari = ?, jam_mulai = ?, jam_selesai = ?, ruangan = ?, updated_at = ?
       WHERE id = ?;`,
      [
        newMkId,
        newHari,
        newMulai,
        newSelesai,
        newRuangan,
        now,
        id,
      ]
    );
  },

  async delete(id: number | string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM jadwal WHERE id = ?;', [id]);
  },
};
