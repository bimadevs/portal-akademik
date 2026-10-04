import { getDatabase } from './database';
import { SksQuotaInfo } from '@/types/mahasiswa';
import { NilaiService } from './nilai-service';

export interface AttendanceEligibility {
  persentase: number;
  totalPertemuan: number;
  hadir: number;
  isEligible: boolean; // true if >= 75% or no meetings yet
}

export const AcademicRulesService = {
  /**
   * Menghitung batas kuota SKS maksimal berdasarkan capaian IPS semester sebelumnya
   * sesuai standar baku regulasi Dikti.
   * - IPS >= 3.00: 24 SKS
   * - 2.50 <= IPS < 3.00: 21 SKS
   * - 2.00 <= IPS < 2.50: 18 SKS
   * - IPS < 2.00: 15 SKS
   * - Semester 1 / Tanpa riwayat nilai (null): 20 SKS
   */
  calculateMaxSks(ips?: number | null): number {
    if (ips === null || ips === undefined) {
      return 20; // Default mahasiswa baru / semester 1
    }
    if (ips >= 3.00) {
      return 24;
    }
    if (ips >= 2.50) {
      return 21;
    }
    if (ips >= 2.00) {
      return 18;
    }
    return 15;
  },

  /**
   * Mengambil perolehan IPS mahasiswa pada semester sebelum semester aktif saat ini.
   * Mencari semester dengan ID lebih rendah yang memiliki catatan nilai mahasiswa.
   */
  async getPreviousSemesterIps(
    mahasiswaId: string | number,
    currentSemesterId: string | number
  ): Promise<number | null> {
    const db = await getDatabase();

    // Cari semester terdahulu yang memiliki nilai untuk mahasiswa ini
    const prevSem = await db.getFirstAsync<{ semester_id: number }>(
      `SELECT DISTINCT n.semester_id
       FROM nilai n
       JOIN semesters s ON n.semester_id = s.id
       WHERE n.mahasiswa_id = ? AND n.semester_id != ?
       ORDER BY s.id DESC
       LIMIT 1;`,
      [mahasiswaId, currentSemesterId]
    );

    if (!prevSem) {
      return null;
    }

    const { ips, totalSks } = await NilaiService.hitungIPS(mahasiswaId, prevSem.semester_id);
    if (totalSks === 0) {
      return null;
    }

    return ips;
  },

  /**
   * Mengambil metadata lengkap kuota SKS mahasiswa pada semester aktif.
   */
  async getSksQuotaInfo(
    mahasiswaId: string | number,
    currentSemesterId: string | number,
    selectedSks: number = 0
  ): Promise<SksQuotaInfo & { quota: number; currentSks: number; isDispensation: boolean; dispensationNomor?: string }> {
    const db = await getDatabase();
    const ipsLalu = await this.getPreviousSemesterIps(mahasiswaId, currentSemesterId);
    const kuotaMaksimal = this.calculateMaxSks(ipsLalu);

    let effectiveSks = selectedSks;
    if (!effectiveSks || effectiveSks === 0) {
      const row = await db.getFirstAsync<{ total: number }>(
        `SELECT SUM(mk.sks) as total
         FROM krs k
         JOIN mata_kuliah mk ON k.mata_kuliah_id = mk.id
         WHERE k.mahasiswa_id = ? AND k.semester_id = ?;`,
        [mahasiswaId, currentSemesterId]
      );
      effectiveSks = row?.total || 0;
    }

    const isOverLimit = effectiveSks > kuotaMaksimal;

    // Cek apakah mahasiswa memiliki dispensasi tercatat di audit_logs
    const dispLog = await db.getFirstAsync<{ details: string }>(
      `SELECT details FROM audit_logs
       WHERE action = 'KRS_DISPENSASI' AND entity_id = ?
       ORDER BY id DESC LIMIT 1;`,
      [String(mahasiswaId)]
    );

    const isDisp = !!dispLog;
    const dispMatch = dispLog?.details?.match(/No Surat:\s*([^\s,]+)/);
    const dispNomor = dispMatch ? dispMatch[1] : undefined;

    return {
      ipsLalu,
      kuotaMaksimal,
      sksTerpilih: effectiveSks,
      isOverLimit,
      isDispensasiActive: isDisp,
      nomorSuratDispensasi: dispNomor,
      quota: kuotaMaksimal,
      currentSks: effectiveSks,
      isDispensation: isDisp,
      dispensationNomor: dispNomor,
    };
  },

  /**
   * Memeriksa ambang batas kehadiran minimum 75% mahasiswa pada mata kuliah tertentu.
   */
  async checkAttendanceEligibility(
    mahasiswaId: string | number,
    mataKuliahId: string | number,
    semesterId: string | number
  ): Promise<AttendanceEligibility & { percentage: number; totalMeetings: number; attended: number; eligible: boolean }> {
    const db = await getDatabase();

    // 1. Hitung total tanggal perkuliahan unik yang sudah terselenggara
    const datesRow = await db.getAllAsync<{ tanggal: string }>(
      `SELECT DISTINCT tanggal FROM presensi
       WHERE mata_kuliah_id = ? AND semester_id = ?;`,
      [mataKuliahId, semesterId]
    );
    const totalPertemuan = datesRow.length;

    if (totalPertemuan === 0) {
      return {
        persentase: 100,
        totalPertemuan: 0,
        hadir: 0,
        isEligible: true,
        percentage: 100,
        totalMeetings: 0,
        attended: 0,
        eligible: true,
      };
    }

    // 2. Hitung jumlah kehadiran mahasiswa yang berstatus 'Hadir'
    const hadirRow = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM presensi
       WHERE mata_kuliah_id = ? AND semester_id = ? AND mahasiswa_id = ?
         AND LOWER(status_kehadiran) = 'hadir';`,
      [mataKuliahId, semesterId, mahasiswaId]
    );
    const hadir = hadirRow?.count || 0;

    const persentase = Math.round((hadir / totalPertemuan) * 100);
    const isEligible = persentase >= 75;

    return {
      persentase,
      totalPertemuan,
      hadir,
      isEligible,
      percentage: persentase,
      totalMeetings: totalPertemuan,
      attended: hadir,
      eligible: isEligible,
    };
  },
};
