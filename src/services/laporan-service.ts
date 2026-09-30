import { getDatabase } from './database';
import { Gender } from '@/types/mahasiswa';

export interface DashboardStats {
  totalMahasiswa: number;
  totalDosen: number;
  totalMataKuliah: number;
  totalJadwal: number;
  genderBreakdown: { jenisKelamin: Gender; count: number }[];
  fakultasBreakdown: { fakultas: string; count: number }[];
  statusBreakdown?: { status: string; count: number }[];
  gradeDistribution: Record<string, number>;
  ipkAverage?: number;
}

export const LaporanService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const db = await getDatabase();

    const mhsCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM mahasiswa;'
    );
    const dosenCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM dosen;'
    );
    const mkCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM mata_kuliah;'
    );
    const jadwalCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM jadwal;'
    );

    const genderRows = await db.getAllAsync<{ gender: string; count: number }>(
      'SELECT gender, COUNT(*) as count FROM mahasiswa GROUP BY gender;'
    );

    const fakultasRows = await db.getAllAsync<{ fakultas: string; count: number }>(
      'SELECT fakultas, COUNT(*) as count FROM mahasiswa GROUP BY fakultas;'
    );

    const statusRows = await db.getAllAsync<{ status: string; count: number }>(
      'SELECT status, COUNT(*) as count FROM mahasiswa GROUP BY status;'
    );

    const avgNilai = await db.getFirstAsync<{ avg: number | null }>(
      'SELECT AVG(nilai_angka) as avg FROM nilai;'
    );

    const gradeRows = await db.getAllAsync<{ huruf: string; count: number }>(
      'SELECT COALESCE(huruf, nilai_huruf) as huruf, COUNT(*) as count FROM nilai GROUP BY COALESCE(huruf, nilai_huruf);'
    );

    const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    gradeRows.forEach((r) => {
      if (r.huruf) {
        gradeDistribution[r.huruf] = (gradeDistribution[r.huruf] || 0) + r.count;
      }
    });

    const genderBreakdown: { jenisKelamin: Gender; count: number }[] = [
      {
        jenisKelamin: 'PRIA',
        count: genderRows.find((r) => r.gender === 'PRIA' || r.gender === 'L')?.count || 0,
      },
      {
        jenisKelamin: 'WANITA',
        count: genderRows.find((r) => r.gender === 'WANITA' || r.gender === 'P')?.count || 0,
      },
    ];

    const fakultasBreakdown = fakultasRows.map((r) => ({
      fakultas: r.fakultas,
      count: r.count,
    }));

    const statusBreakdown = statusRows.map((r) => ({
      status: r.status,
      count: r.count,
    }));

    return {
      totalMahasiswa: mhsCount?.count || 0,
      totalDosen: dosenCount?.count || 0,
      totalMataKuliah: mkCount?.count || 0,
      totalJadwal: jadwalCount?.count || 0,
      genderBreakdown,
      fakultasBreakdown,
      statusBreakdown,
      gradeDistribution,
      ipkAverage: avgNilai?.avg ? Number(avgNilai.avg.toFixed(2)) : 0,
    };
  },
};
