import { getDatabase } from './database';
import { Fakultas } from '../types/mahasiswa';

export interface DashboardStats {
  totalMahasiswa: number;
  totalDosen: number;
  totalMataKuliah: number;
  totalJadwal: number;
  mahasiswaByFakultas: { label: string; count: number; color?: string }[];
  mahasiswaByGender: { label: string; count: number; color: string }[];
  mahasiswaByStatus: { label: string; count: number }[];
  rataRataNilai: number;
}

const FAKULTAS_COLORS: Record<string, string> = {
  'Fakultas Ilmu Komputer': '#002B49',
  'Fakultas Ekonomi dan Bisnis': '#E5A823',
  'Fakultas Ilmu Komunikasi dan Diplomasi': '#0284C7',
  'Fakultas Teknik': '#16A34A',
  'Fakultas Psikologi': '#DC2626',
  'Fakultas Hukum': '#9333EA',
};

export class StatistikService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const db = await getDatabase();

    const mCount = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM mahasiswa`);
    const dCount = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM dosen`);
    const mkCount = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM mata_kuliah`);
    const jCount = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM jadwal`);

    const fakultasRows = await db.getAllAsync<{ fakultas: Fakultas; count: number }>(
      `SELECT fakultas, COUNT(*) as count FROM mahasiswa GROUP BY fakultas ORDER BY count DESC`
    );

    const genderRows = await db.getAllAsync<{ jenis_kelamin: string; count: number }>(
      `SELECT jenis_kelamin, COUNT(*) as count FROM mahasiswa GROUP BY jenis_kelamin`
    );

    const statusRows = await db.getAllAsync<{ status: string; count: number }>(
      `SELECT status, COUNT(*) as count FROM mahasiswa GROUP BY status`
    );

    const avgNilai = await db.getFirstAsync<{ avg: number | null }>(
      `SELECT AVG(akhir) as avg FROM nilai`
    );

    const mahasiswaByFakultas = fakultasRows.map((r) => ({
      label: r.fakultas.replace('Fakultas ', ''),
      count: r.count,
      color: FAKULTAS_COLORS[r.fakultas] || '#64748B',
    }));

    const mahasiswaByGender = genderRows.map((r) => ({
      label: r.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      count: r.count,
      color: r.jenis_kelamin === 'L' ? '#002B49' : '#E5A823',
    }));

    const mahasiswaByStatus = statusRows.map((r) => ({
      label: r.status,
      count: r.count,
    }));

    return {
      totalMahasiswa: mCount?.count || 0,
      totalDosen: dCount?.count || 0,
      totalMataKuliah: mkCount?.count || 0,
      totalJadwal: jCount?.count || 0,
      mahasiswaByFakultas,
      mahasiswaByGender,
      mahasiswaByStatus,
      rataRataNilai: avgNilai?.avg ? Number(avgNilai.avg.toFixed(1)) : 0,
    };
  }
}
