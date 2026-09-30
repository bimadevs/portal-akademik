import { getDatabase } from './database';
import { Presensi, StatusPresensi } from '@/types/mahasiswa';

export interface PresensiRekapItem {
  mahasiswaId: number | string;
  mahasiswa_id?: number | string;
  nim: string;
  mahasiswa_nim?: string;
  nama: string;
  mahasiswa_nama?: string;
  totalPertemuan: number;
  total_pertemuan?: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  alfa?: number;
  persentase: number; // 0 - 100
}

export type RekapPresensi = PresensiRekapItem;

export const PresensiService = {
  async getByMatkulAndDate(
    mataKuliahId: number | string,
    semesterId: number | string,
    tanggal: string
  ): Promise<Presensi[]> {
    const db = await getDatabase();
    const query = `
      SELECT p.*, m.nim as mahasiswa_nim, m.nama as mahasiswa_nama
      FROM presensi p
      JOIN mahasiswa m ON p.mahasiswa_id = m.id
      WHERE p.mata_kuliah_id = ? AND p.semester_id = ? AND p.tanggal = ?
      ORDER BY m.nim ASC;
    `;
    const rows = await db.getAllAsync<any>(query, [
      mataKuliahId,
      semesterId,
      tanggal,
    ]);
    return rows.map((r) => ({
      id: r.id,
      mataKuliahId: r.mata_kuliah_id,
      mata_kuliah_id: r.mata_kuliah_id,
      semesterId: r.semester_id,
      semester_id: r.semester_id,
      tanggal: r.tanggal,
      mahasiswaId: r.mahasiswa_id,
      mahasiswa_id: r.mahasiswa_id,
      mahasiswaNim: r.mahasiswa_nim,
      mahasiswa_nim: r.mahasiswa_nim,
      mahasiswaNama: r.mahasiswa_nama,
      mahasiswa_nama: r.mahasiswa_nama,
      statusKehadiran: r.status_kehadiran as StatusPresensi,
      status_kehadiran: r.status_kehadiran,
      status: r.status_kehadiran as StatusPresensi,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getByPertemuan(
    mataKuliahId: number | string,
    semesterId: number | string,
    tanggal: string
  ): Promise<any[]> {
    return this.getByMatkulAndDate(mataKuliahId, semesterId, tanggal);
  },

  async saveBatch(
    mataKuliahId: number | string,
    semesterId: number | string,
    tanggal: string,
    records: { mahasiswaId: number | string; status: StatusPresensi | string }[]
  ): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      for (const rec of records) {
        const existing = await db.getFirstAsync<{ id: number }>(
          `SELECT id FROM presensi
           WHERE mata_kuliah_id = ? AND semester_id = ? AND tanggal = ? AND mahasiswa_id = ?
           LIMIT 1;`,
          [mataKuliahId, semesterId, tanggal, rec.mahasiswaId]
        );

        if (existing) {
          await db.runAsync(
            `UPDATE presensi
             SET status_kehadiran = ?, updated_at = ?
             WHERE id = ?;`,
            [rec.status, now, existing.id]
          );
        } else {
          await db.runAsync(
            `INSERT INTO presensi (mata_kuliah_id, semester_id, tanggal, mahasiswa_id, status_kehadiran, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [mataKuliahId, semesterId, tanggal, rec.mahasiswaId, rec.status, now, now]
          );
        }
      }
    });
  },

  async savePresensiBatch(
    records: {
      mahasiswa_id: number | string;
      mata_kuliah_id: number | string;
      semester_id: number | string;
      tanggal: string;
      status: StatusPresensi | string;
      pertemuan_ke?: number;
    }[]
  ): Promise<void> {
    if (records.length === 0) return;
    const { mata_kuliah_id, semester_id, tanggal } = records[0];
    const transformed = records.map((r) => ({
      mahasiswaId: r.mahasiswa_id,
      status: r.status,
    }));
    await this.saveBatch(mata_kuliah_id, semester_id, tanggal, transformed);
  },

  async getRekapByMataKuliah(
    mataKuliahId: number | string,
    semesterId: number | string
  ): Promise<PresensiRekapItem[]> {
    const db = await getDatabase();

    // 1. Ambil seluruh mahasiswa yang terdaftar di KRS matkul ini
    const peserta = await db.getAllAsync<{ id: number; nim: string; nama: string }>(
      `SELECT m.id, m.nim, m.nama
       FROM krs k
       JOIN mahasiswa m ON k.mahasiswa_id = m.id
       WHERE k.mata_kuliah_id = ? AND k.semester_id = ?
       ORDER BY m.nim ASC;`,
      [mataKuliahId, semesterId]
    );

    // 2. Ambil total tanggal unik (total pertemuan)
    const datesRow = await db.getAllAsync<{ tanggal: string }>(
      `SELECT DISTINCT tanggal FROM presensi
       WHERE mata_kuliah_id = ? AND semester_id = ?;`,
      [mataKuliahId, semesterId]
    );
    const totalPertemuan = datesRow.length;

    // 3. Ambil data presensi
    const presensiList = await db.getAllAsync<{
      mahasiswa_id: number;
      status_kehadiran: string;
    }>(
      `SELECT mahasiswa_id, status_kehadiran FROM presensi
       WHERE mata_kuliah_id = ? AND semester_id = ?;`,
      [mataKuliahId, semesterId]
    );

    return peserta.map((p) => {
      const records = presensiList.filter((item) => item.mahasiswa_id === p.id);
      const hadir = records.filter((r) => r.status_kehadiran?.toLowerCase() === 'hadir').length;
      const izin = records.filter((r) => r.status_kehadiran?.toLowerCase() === 'izin').length;
      const sakit = records.filter((r) => r.status_kehadiran?.toLowerCase() === 'sakit').length;
      const alpha = records.filter(
        (r) => r.status_kehadiran?.toLowerCase() === 'alpha' || r.status_kehadiran?.toLowerCase() === 'alfa'
      ).length;

      const persentase =
        totalPertemuan > 0 ? Math.round((hadir / totalPertemuan) * 100) : 100;

      return {
        mahasiswaId: p.id,
        mahasiswa_id: p.id,
        nim: p.nim,
        mahasiswa_nim: p.nim,
        nama: p.nama,
        mahasiswa_nama: p.nama,
        totalPertemuan,
        total_pertemuan: totalPertemuan,
        hadir,
        izin,
        sakit,
        alpha,
        alfa: alpha,
        persentase,
      };
    });
  },
};
