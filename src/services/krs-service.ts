import { getDatabase } from './database';
import { KRS } from '@/types/mahasiswa';
import { AuditService } from './audit-service';
import { AcademicRulesService } from './academic-rules-service';

export interface KRSDispensasiInfo {
  nomorSurat: string;
  totalSks?: number;
  kuotaNormal?: number;
  actor?: string;
}

export const KRSService = {
  async getByMahasiswaAndSemester(
    mahasiswaId: number | string,
    semesterId: number | string
  ): Promise<KRS[]> {
    const db = await getDatabase();
    const query = `
      SELECT k.*, mk.kode as mk_kode, mk.nama as mk_nama, mk.sks as mk_sks, d.nama as dosen_nama
      FROM krs k
      JOIN mata_kuliah mk ON k.mata_kuliah_id = mk.id
      LEFT JOIN dosen d ON mk.dosen_id = d.id
      WHERE k.mahasiswa_id = ? AND k.semester_id = ?
      ORDER BY mk.kode ASC;
    `;
    const rows = await db.getAllAsync<any>(query, [mahasiswaId, semesterId]);
    return rows.map((r) => ({
      id: r.id,
      mahasiswaId: r.mahasiswa_id,
      mahasiswa_id: r.mahasiswa_id,
      semesterId: r.semester_id,
      semester_id: r.semester_id,
      mataKuliahId: r.mata_kuliah_id,
      mata_kuliah_id: r.mata_kuliah_id,
      mataKuliahKode: r.mk_kode,
      kode: r.mk_kode,
      mata_kuliah_kode: r.mk_kode,
      mataKuliahNama: r.mk_nama,
      nama: r.mk_nama,
      mata_kuliah_nama: r.mk_nama,
      sks: r.mk_sks,
      mata_kuliah_sks: r.mk_sks,
      dosenNama: r.dosen_nama || 'Belum Ditentukan',
      dosen_nama: r.dosen_nama || 'Belum Ditentukan',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async saveKrs(
    mahasiswaId: number | string,
    semesterId: number | string,
    mataKuliahIds: (number | string)[],
    dispensasiInfoOrBoolean?: boolean | KRSDispensasiInfo,
    dispensationNomorParam?: string
  ): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    let isDispensation = false;
    let dispensationNomor: string | undefined;
    let dispensationActor = 'admin';

    if (typeof dispensasiInfoOrBoolean === 'boolean') {
      isDispensation = dispensasiInfoOrBoolean;
      dispensationNomor = dispensationNomorParam;
    } else if (dispensasiInfoOrBoolean && typeof dispensasiInfoOrBoolean === 'object') {
      isDispensation = true;
      dispensationNomor = dispensasiInfoOrBoolean.nomorSurat;
      dispensationActor = dispensasiInfoOrBoolean.actor || 'admin';
    }

    // 1. Validasi Batas Beban Studi (Regulasi Dikti)
    let totalSks = 0;
    if (mataKuliahIds.length > 0) {
      const placeholders = mataKuliahIds.map(() => '?').join(',');
      const rows = await db.getAllAsync<{ sks: number }>(
        `SELECT sks FROM mata_kuliah WHERE id IN (${placeholders});`,
        mataKuliahIds
      );
      totalSks = rows.reduce((sum, r) => sum + (r.sks || 0), 0);
    }

    const quotaInfo = await AcademicRulesService.getSksQuotaInfo(mahasiswaId, semesterId, totalSks);

    if (totalSks > quotaInfo.kuotaMaksimal) {
      if (!isDispensation) {
        throw new Error(
          `Melebihi batas beban studi: Total SKS (${totalSks}) melebihi kuota maksimal (${quotaInfo.kuotaMaksimal} SKS)`
        );
      }
      if (!dispensationNomor || !dispensationNomor.trim()) {
        throw new Error('Nomor surat keputusan Dekanat wajib diisi untuk dispensasi SKS.');
      }
    }

    // 2. Simpan perubahan KRS secara transaksional
    await db.withTransactionAsync(async () => {
      // Hapus data KRS mahasiswa di semester ini yang tidak ada di list baru
      if (mataKuliahIds.length === 0) {
        await db.runAsync(
          'DELETE FROM krs WHERE mahasiswa_id = ? AND semester_id = ?;',
          [mahasiswaId, semesterId]
        );
        return;
      }

      const placeholders = mataKuliahIds.map(() => '?').join(',');
      await db.runAsync(
        `DELETE FROM krs WHERE mahasiswa_id = ? AND semester_id = ? AND mata_kuliah_id NOT IN (${placeholders});`,
        [mahasiswaId, semesterId, ...mataKuliahIds]
      );

      for (const mkId of mataKuliahIds) {
        const existing = await db.getFirstAsync<{ id: number }>(
          'SELECT id FROM krs WHERE mahasiswa_id = ? AND semester_id = ? AND mata_kuliah_id = ? LIMIT 1;',
          [mahasiswaId, semesterId, mkId]
        );
        if (!existing) {
          await db.runAsync(
            `INSERT INTO krs (mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?);`,
            [mahasiswaId, semesterId, mkId, now, now]
          );
        }
      }
    });

    // 3. Catat audit log jika terdapat dispensasi dekanat yang disetujui
    if (isDispensation && dispensationNomor && dispensationNomor.trim()) {
      try {
        const details = `Dispensasi SKS: ${totalSks} SKS (Kuota normal ${quotaInfo.kuotaMaksimal} SKS) - No Surat: ${dispensationNomor.trim()}`;
        await AuditService.logActivity(
          'KRS_DISPENSASI',
          'KRS',
          String(mahasiswaId),
          details,
          dispensationActor
        );
      } catch (err) {
        console.warn('Gagal mencatat audit log dispensasi KRS:', err);
      }
    }
  },

  async saveKRS(
    mahasiswaId: number | string,
    semesterId: number | string,
    mataKuliahIds: (number | string)[],
    dispensasiInfoOrBoolean?: boolean | KRSDispensasiInfo,
    dispensationNomorParam?: string
  ): Promise<void> {
    return this.saveKrs(mahasiswaId, semesterId, mataKuliahIds, dispensasiInfoOrBoolean, dispensationNomorParam);
  },

  async getTotalSks(
    mahasiswaId: number | string,
    semesterId: number | string
  ): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ total: number }>(
      `SELECT SUM(mk.sks) as total
       FROM krs k
       JOIN mata_kuliah mk ON k.mata_kuliah_id = mk.id
       WHERE k.mahasiswa_id = ? AND k.semester_id = ?;`,
      [mahasiswaId, semesterId]
    );
    return row?.total || 0;
  },

  async getMahasiswaByMataKuliah(
    mataKuliahId: number | string,
    semesterId: number | string
  ): Promise<{ id: number; nim: string; nama: string; fakultas: string }[]> {
    const db = await getDatabase();
    const query = `
      SELECT m.id, m.nim, m.nama, m.fakultas
      FROM krs k
      JOIN mahasiswa m ON k.mahasiswa_id = m.id
      WHERE k.mata_kuliah_id = ? AND k.semester_id = ?
      ORDER BY m.nim ASC;
    `;
    return db.getAllAsync<any>(query, [mataKuliahId, semesterId]);
  },
};
