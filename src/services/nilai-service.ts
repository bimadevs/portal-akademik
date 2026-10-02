import { getDatabase } from './database';
import { Nilai, NilaiHuruf, NILAI_BOBOT } from '../types/mahasiswa';

export interface NilaiInput {
  mahasiswa_id?: string | number;
  mahasiswaId?: string | number;
  mata_kuliah_id?: string | number;
  mataKuliahId?: string | number;
  semester_id?: string | number;
  semesterId?: string | number;
  tugas: number;
  uts: number;
  uas: number;
  akhir?: number;
  huruf?: NilaiHuruf;
  bobot?: number;
  nilai_huruf?: NilaiHuruf;
  nilai_angka?: number;
}

export function hitungNilaiAkhir(tugas: number, uts: number, uas: number): { akhir: number; huruf: NilaiHuruf; bobot: number } {
  const akhir = Math.round((tugas * 0.3) + (uts * 0.3) + (uas * 0.4));
  let huruf: NilaiHuruf = 'E';
  if (akhir >= 85) huruf = 'A';
  else if (akhir >= 75) huruf = 'B+';
  else if (akhir >= 70) huruf = 'B';
  else if (akhir >= 65) huruf = 'C+';
  else if (akhir >= 60) huruf = 'C';
  else if (akhir >= 50) huruf = 'D';
  else huruf = 'E';

  const bobot = NILAI_BOBOT[huruf] ?? 0;
  return { akhir, huruf, bobot };
}

/**
 * Safely resolves the numerical grade weight (bobot) from a grade record.
 * Defensively distinguishes genuine 'E' (0.0 weight) from unrecorded/defaulted zero weights
 * where a valid numeric score (nilaiAngka/nilai_angka) or letter grade (huruf) is present.
 */
export function resolveBobot(item: {
  bobot?: number | null;
  nilaiAngka?: number | null;
  nilai_angka?: number | null;
  huruf?: NilaiHuruf | string | null;
  nilaiHuruf?: NilaiHuruf | string | null;
  nilai_huruf?: NilaiHuruf | string | null;
  [key: string]: any;
}): number {
  if (item.bobot !== null && item.bobot !== undefined && item.bobot > 0) {
    return item.bobot;
  }
  const angka = item.nilaiAngka ?? item.nilai_angka;
  if (angka !== null && angka !== undefined && angka > 0) {
    return angka;
  }
  const letter = (item.huruf || item.nilaiHuruf || item.nilai_huruf) as NilaiHuruf | undefined;
  if (letter && NILAI_BOBOT[letter] !== undefined) {
    return NILAI_BOBOT[letter];
  }
  return item.bobot ?? angka ?? 0;
}

export class NilaiService {
  static async getByMahasiswaAndSemester(mahasiswaId: string | number, semesterId: string | number): Promise<Nilai[]> {
    const db = await getDatabase();
    return db.getAllAsync<Nilai>(
      `SELECT n.*, m.nama as mahasiswa_nama, m.nim as mahasiswa_nim,
              mk.kode as mata_kuliah_kode, mk.nama as mata_kuliah_nama, mk.sks as mata_kuliah_sks
       FROM nilai n
       JOIN mahasiswa m ON n.mahasiswa_id = m.id
       JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
       WHERE n.mahasiswa_id = ? AND n.semester_id = ?
       ORDER BY mk.kode ASC`,
      [mahasiswaId, semesterId]
    );
  }

  static async getByMataKuliahAndSemester(mataKuliahId: string | number, semesterId: string | number): Promise<Nilai[]> {
    const db = await getDatabase();
    return db.getAllAsync<Nilai>(
      `SELECT n.*, m.nama as mahasiswa_nama, m.nim as mahasiswa_nim,
              mk.kode as mata_kuliah_kode, mk.nama as mata_kuliah_nama, mk.sks as mata_kuliah_sks
       FROM nilai n
       JOIN mahasiswa m ON n.mahasiswa_id = m.id
       JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
       WHERE n.mata_kuliah_id = ? AND n.semester_id = ?
       ORDER BY m.nim ASC`,
      [mataKuliahId, semesterId]
    );
  }

  static async getTranskrip(mahasiswaId: string | number): Promise<{
    list: Nilai[];
    totalSks: number;
    ipk: number;
  }> {
    const db = await getDatabase();
    const list = await db.getAllAsync<Nilai>(
      `SELECT n.*, s.nama as semester_nama,
              mk.kode as mata_kuliah_kode, mk.nama as mata_kuliah_nama, mk.sks as mata_kuliah_sks
       FROM nilai n
       JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
       JOIN semesters s ON n.semester_id = s.id
       WHERE n.mahasiswa_id = ?
       ORDER BY s.id ASC, mk.kode ASC`,
      [mahasiswaId]
    );

    let totalSks = 0;
    let totalPoin = 0;

    for (const item of list) {
      const sks = item.mata_kuliah_sks || item.sks || 0;
      const bobot = resolveBobot(item);
      totalSks += sks;
      totalPoin += (sks * bobot);
    }

    const ipk = totalSks > 0 ? Number((totalPoin / totalSks).toFixed(2)) : 0;

    return { list, totalSks, ipk };
  }

  static async calculateIpk(mahasiswaId: string | number): Promise<number> {
    const { ipk } = await this.getTranskrip(mahasiswaId);
    return ipk;
  }

  static async saveNilai(input: NilaiInput): Promise<Nilai> {
    const db = await getDatabase();
    const computed = hitungNilaiAkhir(input.tugas, input.uts, input.uas);
    const akhir = input.akhir !== undefined ? input.akhir : computed.akhir;
    const huruf = input.huruf !== undefined ? input.huruf : computed.huruf;
    const bobot = input.bobot !== undefined ? input.bobot : computed.bobot;

    const mId = input.mahasiswa_id ?? input.mahasiswaId ?? 0;
    const mkId = input.mata_kuliah_id ?? input.mataKuliahId ?? 0;
    const sId = input.semester_id ?? input.semesterId ?? 0;
    const now = new Date().toISOString();

    const inTx = await db.isInTransactionAsync();

    const runSave = async () => {
      const existing = await db.getFirstAsync<{ id: string | number }>(
        `SELECT id FROM nilai WHERE mahasiswa_id = ? AND mata_kuliah_id = ? AND semester_id = ?`,
        [mId, mkId, sId]
      );

      if (existing) {
        await db.runAsync(
          `UPDATE nilai 
           SET tugas = ?, uts = ?, uas = ?, akhir = ?, huruf = ?, bobot = ?,
               nilai_huruf = ?, nilai_angka = ?, updated_at = ?
           WHERE id = ?`,
          [input.tugas, input.uts, input.uas, akhir, huruf, bobot, huruf, bobot, now, existing.id]
        );
        return (await db.getFirstAsync<Nilai>(`SELECT * FROM nilai WHERE id = ?`, [existing.id]))!;
      } else {
        const res = await db.runAsync(
          `INSERT INTO nilai (mahasiswa_id, mata_kuliah_id, semester_id, tugas, uts, uas, akhir, huruf, bobot, nilai_huruf, nilai_angka, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [mId, mkId, sId, input.tugas, input.uts, input.uas, akhir, huruf, bobot, huruf, bobot, now, now]
        );
        return (await db.getFirstAsync<Nilai>(`SELECT * FROM nilai WHERE id = ?`, [res.lastInsertRowId]))!;
      }
    };

    if (inTx) {
      return runSave();
    } else {
      await db.runAsync('BEGIN TRANSACTION;');
      const result = await runSave();
      await db.runAsync('COMMIT;');
      return result;
    }
  }

  static async hitungIPS(mahasiswaId: string | number, semesterId: string | number): Promise<{ totalSks: number; ips: number }> {
    const grades = await this.getByMahasiswaAndSemester(mahasiswaId, semesterId);
    // Retrieve total SKS for the semester from KRS entries, ensuring all registered courses are counted
    const totalSks = await import('./krs-service').then(mod => mod.KRSService.getTotalSks(mahasiswaId, semesterId));
    // Compute total points from existing grades
    let totalPoin = 0;
    for (const g of grades) {
      const sks = g.mata_kuliah_sks || g.sks || 0;
      const bobot = resolveBobot(g);
      totalPoin += sks * bobot;
    }
    const ips = totalSks > 0 ? Number((totalPoin / totalSks).toFixed(2)) : 0;
    return { totalSks, ips };
  }
}
