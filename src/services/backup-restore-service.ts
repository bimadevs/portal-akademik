import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getDatabase } from './database';
import { BackupPayload } from '@/types/mahasiswa';
import { AuditService } from './audit-service';

/**
 * Menghasilkan hash checksum sederhana untuk memvalidasi integritas payload cadangan.
 */
function calculateChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `crc32-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export const BackupRestoreService = {
  /**
   * Mengekspor seluruh record dari 9 tabel relasional ke format JSON terstruktur.
   */
  async generateBackupJson(): Promise<{ payload: BackupPayload; jsonString: string; uri?: string }> {
    const db = await getDatabase();

    const [
      semesters,
      mahasiswa,
      dosen,
      mata_kuliah,
      jadwal,
      krs,
      presensi,
      nilai,
      audit_logs,
      sessions,
    ] = await Promise.all([
      db.getAllAsync<any>('SELECT * FROM semesters ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM mahasiswa ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM dosen ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM mata_kuliah ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM jadwal ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM krs ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM presensi ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM nilai ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM audit_logs ORDER BY id ASC;'),
      db.getAllAsync<any>('SELECT * FROM sessions ORDER BY id ASC;'),
    ]);

    const tables = {
      semesters,
      mahasiswa,
      dosen,
      mata_kuliah,
      jadwal,
      krs,
      presensi,
      nilai,
      audit_logs,
      sessions,
    };

    const exportedAt = new Date().toISOString();
    const rawTablesJson = JSON.stringify(tables);
    const checksum = calculateChecksum(rawTablesJson);

    const payload: BackupPayload = {
      app: 'Portal Akademik UBD',
      version: '3.0.0',
      exportedAt,
      checksum,
      tables,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    let uri: string | undefined;

    if (Platform.OS !== 'web' && FileSystem.cacheDirectory) {
      const fileName = `ubd_backup_${Date.now()}.json`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      uri = filePath;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Cadangan Basis Data Portal Akademik UBD',
          UTI: 'public.json',
        });
      }
    } else if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Browser download trigger
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ubd_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return { payload, jsonString, uri };
  },

  /**
   * Memulihkan seluruh basis data secara atomik dari berkas JSON cadangan.
   */
  async restoreFromJson(jsonString: string, actor: string = 'admin'): Promise<{ restoredCount: number }> {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Format berkas tidak valid: gagal mengurai payload JSON.');
    }

    if (!parsed || parsed.app !== 'Portal Akademik UBD') {
      throw new Error('Berkas cadangan tidak valid: bukan berasal dari Portal Akademik UBD.');
    }

    if (!parsed.tables || typeof parsed.tables !== 'object') {
      throw new Error('Struktur data cadangan rusak: objek tabel tidak ditemukan.');
    }

    const {
      semesters = [],
      mahasiswa = [],
      dosen = [],
      mata_kuliah = [],
      jadwal = [],
      krs = [],
      presensi = [],
      nilai = [],
      audit_logs = [],
    } = parsed.tables;

    const db = await getDatabase();
    let totalRestored = 0;

    // Eksekusi transaksi atomik
    await db.execAsync('PRAGMA foreign_keys = OFF;');

    try {
      await db.execAsync('BEGIN TRANSACTION;');

      // 1. Kosongkan seluruh tabel lama
      await db.execAsync(`
        DELETE FROM nilai;
        DELETE FROM presensi;
        DELETE FROM krs;
        DELETE FROM jadwal;
        DELETE FROM mata_kuliah;
        DELETE FROM dosen;
        DELETE FROM mahasiswa;
        DELETE FROM semesters;
        DELETE FROM audit_logs;
      `);

      // 2. Pulihkan semesters
      for (const s of semesters) {
        await db.runAsync(
          `INSERT INTO semesters (id, nama, aktif, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?);`,
          [s.id, s.nama, s.aktif ?? 0, s.created_at || new Date().toISOString(), s.updated_at || new Date().toISOString()]
        );
        totalRestored++;
      }

      // 3. Pulihkan mahasiswa
      for (const m of mahasiswa) {
        await db.runAsync(
          `INSERT INTO mahasiswa (id, nim, nama, fakultas, gender, tahun_masuk, status, foto_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            m.id,
            m.nim,
            m.nama,
            m.fakultas,
            m.gender || m.jenis_kelamin || 'PRIA',
            m.tahun_masuk || m.tahunMasuk || '2021',
            m.status || 'Aktif',
            m.foto_url || m.fotoUrl || null,
            m.created_at || new Date().toISOString(),
            m.updated_at || new Date().toISOString(),
          ]
        );
        totalRestored++;
      }

      // 4. Pulihkan dosen
      for (const d of dosen) {
        await db.runAsync(
          `INSERT INTO dosen (id, nidn, nama, fakultas, gender, telepon, prodi, gelar, email, foto_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            d.id,
            d.nidn,
            d.nama,
            d.fakultas,
            d.gender || d.jenis_kelamin || 'PRIA',
            d.telepon || d.no_telepon || '',
            d.prodi || null,
            d.gelar || null,
            d.email || null,
            d.foto_url || d.fotoUrl || null,
            d.created_at || new Date().toISOString(),
            d.updated_at || new Date().toISOString(),
          ]
        );
        totalRestored++;
      }

      // 5. Pulihkan mata_kuliah
      for (const mk of mata_kuliah) {
        await db.runAsync(
          `INSERT INTO mata_kuliah (id, kode, nama, sks, fakultas, semester, dosen_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mk.id,
            mk.kode || mk.kode_mk,
            mk.nama,
            mk.sks,
            mk.fakultas,
            mk.semester || 1,
            mk.dosen_id || mk.dosenId || null,
            mk.created_at || new Date().toISOString(),
            mk.updated_at || new Date().toISOString(),
          ]
        );
        totalRestored++;
      }

      // 6. Pulihkan jadwal
      for (const j of jadwal) {
        await db.runAsync(
          `INSERT INTO jadwal (id, mata_kuliah_id, dosen_id, hari, jam_mulai, jam_selesai, ruangan, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            j.id,
            j.mata_kuliah_id,
            j.dosen_id || null,
            j.hari,
            j.jam_mulai,
            j.jam_selesai,
            j.ruangan,
            j.created_at || new Date().toISOString(),
            j.updated_at || new Date().toISOString(),
          ]
        );
        totalRestored++;
      }

      // 7. Pulihkan krs
      for (const k of krs) {
        await db.runAsync(
          `INSERT INTO krs (id, mahasiswa_id, semester_id, mata_kuliah_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            k.id,
            k.mahasiswa_id,
            k.semester_id,
            k.mata_kuliah_id,
            k.created_at || new Date().toISOString(),
            k.updated_at || new Date().toISOString(),
          ]
        );
        totalRestored++;
      }

      // 8. Pulihkan presensi
      for (const p of presensi) {
        await db.runAsync(
          `INSERT INTO presensi (id, mata_kuliah_id, semester_id, jadwal_id, tanggal, mahasiswa_id, status_kehadiran, pertemuan_ke, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            p.id,
            p.mata_kuliah_id,
            p.semester_id,
            p.jadwal_id || null,
            p.tanggal,
            p.mahasiswa_id,
            p.status_kehadiran,
            p.pertemuan_ke || 1,
            p.created_at || new Date().toISOString(),
            p.updated_at || new Date().toISOString(),
          ]
        );
        totalRestored++;
      }

      // 9. Pulihkan nilai
      for (const n of nilai) {
        await db.runAsync(
          `INSERT INTO nilai (id, mahasiswa_id, semester_id, mata_kuliah_id, tugas, uts, uas, akhir, huruf, bobot, nilai_huruf, nilai_angka, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            n.id,
            n.mahasiswa_id,
            n.semester_id,
            n.mata_kuliah_id,
            n.tugas || 0,
            n.uts || 0,
            n.uas || 0,
            n.akhir || 0,
            n.huruf || 'E',
            n.bobot || 0,
            n.nilai_huruf || n.huruf || 'E',
            n.nilai_angka || n.bobot || 0,
            n.created_at || new Date().toISOString(),
            n.updated_at || new Date().toISOString(),
          ]
        );
        totalRestored++;
      }

      // 10. Pulihkan audit_logs jika ada
      for (const a of audit_logs) {
        await db.runAsync(
          `INSERT INTO audit_logs (id, timestamp, action, entity, entity_id, details, actor, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [a.id, a.timestamp, a.action, a.entity, a.entity_id || null, a.details || null, a.actor, a.created_at]
        );
        totalRestored++;
      }

      await db.execAsync('COMMIT;');
    } catch (err) {
      await db.execAsync('ROLLBACK;');
      throw err;
    } finally {
      await db.execAsync('PRAGMA foreign_keys = ON;');
    }

    // Catat aktivitas pemulihan ke audit_logs
    try {
      await AuditService.logActivity(
        'DATABASE_RESTORE',
        'Database',
        null,
        `Pemulihan basis data selesai: ${totalRestored} entitas dipulihkan`,
        actor
      );
    } catch (logErr) {
      console.warn('Gagal mencatat audit log setelah restore:', logErr);
    }

    return { restoredCount: totalRestored };
  },

  /**
   * Membuka pemilih berkas native/sistem untuk memilih berkas JSON cadangan.
   */
  async pickBackupFile(): Promise<{ fileName?: string; jsonString: string } | null> {
    try {
      const res = await File.pickFileAsync({
        mimeTypes: ['application/json', 'text/plain'],
      });

      if (!res.canceled && res.result) {
        const picked = res.result;
        const content = await picked.text();
        return {
          fileName: picked.name,
          jsonString: content,
        };
      }
    } catch (err) {
      console.warn('Gagal memilih file via File.pickFileAsync:', err);
    }
    return null;
  },
};
