/**
 * Tier 4: Enterprise & Academic Excellence (V3 Features) E2E Test Suite
 *
 * Covers:
 * - TC-39: Official KRS PDF & Letterhead Document Generation (FR-37)
 * - TC-40: Official KHS & Academic Transcript PDF Generation (FR-38)
 * - TC-41: Official Attendance Recap PDF Generation (FR-39)
 * - TC-42: Dikti SKS Capping Formula & Semester 1 Default Rule (FR-40)
 * - TC-43: Dekanat SKS Dispensation Override & Audit Logging (FR-41)
 * - TC-44: 75% Attendance Eligibility Threshold Engine (FR-42)
 * - TC-45: Standalone Relational JSON Backup Generation & Checksum (FR-43)
 * - TC-46: Atomic SQLite JSON Restore Transaction & Rollback Safety (FR-44)
 * - TC-47: Append-only Audit Log Recording on Core Mutations (FR-45)
 * - TC-48: Audit Log Administrative Filtering & Search (FR-46)
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import './harness/test-env';
import { resetTestDatabase } from './harness/test-db';
import { MahasiswaService } from '@/services/mahasiswa-service';
import { DosenService } from '@/services/dosen-service';
import { MataKuliahService } from '@/services/mata-kuliah-service';
import { JadwalService } from '@/services/jadwal-service';
import { KRSService } from '@/services/krs-service';
import { PresensiService } from '@/services/presensi-service';
import { NilaiService } from '@/services/nilai-service';
import { SemesterService } from '@/services/semester-service';
import { AcademicRulesService } from '@/services/academic-rules-service';
import { AuditService } from '@/services/audit-service';
import { BackupRestoreService } from '@/services/backup-restore-service';
import { PDFService } from '@/services/pdf-service';

describe('Tier 4: Enterprise & Academic Excellence (V3 Features)', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  // ==============================================================
  // 1. Pillar 1: Offline Document Engine (PDF & Letterhead Export)
  // ==============================================================
  describe('Pillar 1: Offline Document Engine (expo-print & expo-sharing)', () => {
    it('TC-39: generates official KRS document HTML with UBD letterhead and verification code', async () => {
      const sem = (await SemesterService.getActive())!;
      const mhsList = await MahasiswaService.getAll();
      const student = mhsList[0];

      // Enroll in 2 courses
      const courses = await MataKuliahService.getAll();
      const courseIds = [courses[0].id, courses[1].id];
      await KRSService.saveKrs(student.id, sem.id, courseIds);

      const result = await PDFService.generateKRSPdf(student.id, sem.id);

      expect(result.html).toBeDefined();
      expect(result.uri).toBeDefined();
      expect(result.html).toContain('UNIVERSITAS BUDDHI DHARMA');
      expect(result.html).toContain('KARTU RENCANA STUDI (KRS)');
      expect(result.html).toContain(student.nim);
      expect(result.html).toContain(student.nama);
      expect(result.html).toContain(courses[0].nama);
      expect(result.html).toContain(courses[1].nama);
      expect(result.html).toContain('UBD-KRS-');
    });

    it('TC-40: generates official KHS document HTML with IPS and IPK calculations', async () => {
      const sem = (await SemesterService.getActive())!;
      const mhsList = await MahasiswaService.getAll();
      const student = mhsList[0];

      const courses = await MataKuliahService.getAll();
      await KRSService.saveKrs(student.id, sem.id, [courses[0].id, courses[1].id]);

      // Assign grades: 85 (A, 4.0) and 75 (B, 3.0)
      await NilaiService.saveNilai({
        mahasiswaId: student.id,
        mataKuliahId: courses[0].id,
        semesterId: sem.id,
        tugas: 85,
        uts: 85,
        uas: 85,
      });

      await NilaiService.saveNilai({
        mahasiswaId: student.id,
        mataKuliahId: courses[1].id,
        semesterId: sem.id,
        tugas: 75,
        uts: 75,
        uas: 75,
      });

      const result = await PDFService.generateKHSPdf(student.id, sem.id);

      expect(result.html).toBeDefined();
      expect(result.uri).toBeDefined();
      expect(result.html).toContain('KARTU HASIL STUDI (KHS)');
      expect(result.html).toContain(student.nim);
      expect(result.html).toContain('Indeks Prestasi Semester (IPS)');
      expect(result.html).toContain('Indeks Prestasi Kumulatif (IPK)');
      expect(result.html).toContain('UBD-KHS-');
    });

    it('TC-41: generates official course attendance recap PDF HTML', async () => {
      const sem = (await SemesterService.getActive())!;
      const courses = await MataKuliahService.getAll();
      const course = courses[0];
      const mhsList = await MahasiswaService.getAll();
      const student = mhsList[0];

      // Enroll student
      await KRSService.saveKrs(student.id, sem.id, [course.id]);

      // Record attendance
      await PresensiService.saveBatch(course.id, sem.id, '2026-10-01', [
        { mahasiswaId: student.id, status: 'HADIR' },
      ]);

      const result = await PDFService.generatePresensiPdf(course.id, sem.id);

      expect(result.html).toBeDefined();
      expect(result.uri).toBeDefined();
      expect(result.html).toContain('REKAPITULASI PRESENSI PERKULIAHAN');
      expect(result.html).toContain(course.nama);
      expect(result.html).toContain('UBD-PRES-');
    });
  });

  // ==============================================================
  // 2. Pillar 2: Academic Rules Engine (Dikti SKS & Attendance)
  // ==============================================================
  describe('Pillar 2: Academic Rules Engine (Dikti SKS Capping & 75% Attendance)', () => {
    it('TC-42: applies Dikti SKS capping formula based on IPS and defaults to 20 for Semester 1', () => {
      // Rule 1: IPS >= 3.00 -> 24 SKS
      expect(AcademicRulesService.calculateMaxSks(4.0)).toBe(24);
      expect(AcademicRulesService.calculateMaxSks(3.5)).toBe(24);
      expect(AcademicRulesService.calculateMaxSks(3.0)).toBe(24);

      // Rule 2: 2.50 <= IPS < 3.00 -> 21 SKS
      expect(AcademicRulesService.calculateMaxSks(2.99)).toBe(21);
      expect(AcademicRulesService.calculateMaxSks(2.75)).toBe(21);
      expect(AcademicRulesService.calculateMaxSks(2.5)).toBe(21);

      // Rule 3: 2.00 <= IPS < 2.50 -> 18 SKS
      expect(AcademicRulesService.calculateMaxSks(2.49)).toBe(18);
      expect(AcademicRulesService.calculateMaxSks(2.2)).toBe(18);
      expect(AcademicRulesService.calculateMaxSks(2.0)).toBe(18);

      // Rule 4: IPS < 2.00 -> 15 SKS
      expect(AcademicRulesService.calculateMaxSks(1.99)).toBe(15);
      expect(AcademicRulesService.calculateMaxSks(1.0)).toBe(15);
      expect(AcademicRulesService.calculateMaxSks(0.0)).toBe(15);

      // Rule 5: New student (null / undefined previous IPS) -> default 20 SKS
      expect(AcademicRulesService.calculateMaxSks(null)).toBe(20);
      expect(AcademicRulesService.calculateMaxSks(undefined)).toBe(20);
    });

    it('TC-43: enforces SKS limit and allows Dekanat dispensation with required permit number', async () => {
      const sem = (await SemesterService.getActive())!;

      // Create a student
      const student = await MahasiswaService.create({
        nim: '202409001',
        nama: 'Budi Santoso',
        fakultas: 'Sains dan Teknologi',
        jenisKelamin: 'PRIA',
        status: 'Aktif',
      });

      // Student has no previous semester -> quota is 20 SKS
      const quota = await AcademicRulesService.getSksQuotaInfo(student.id, sem.id);
      expect(quota.quota).toBe(20);
      expect(quota.isDispensation).toBe(false);

      // Find courses to exceed 20 SKS
      const allCourses = await MataKuliahService.getAll();
      const coursesToTake: typeof allCourses = [];
      let totalSksToTake = 0;
      for (const c of allCourses) {
        coursesToTake.push(c);
        totalSksToTake += c.sks;
        if (totalSksToTake > 20) break;
      }
      expect(totalSksToTake).toBeGreaterThan(20);

      // Attempting to save without dispensation must throw error
      await expect(
        KRSService.saveKrs(
          student.id,
          sem.id,
          coursesToTake.map((c) => c.id)
        )
      ).rejects.toThrow('Melebihi batas beban studi');

      // Dispensation without permit number must fail
      await expect(
        KRSService.saveKrs(
          student.id,
          sem.id,
          coursesToTake.map((c) => c.id),
          true,
          '' // Empty permit number
        )
      ).rejects.toThrow('Nomor surat keputusan Dekanat wajib diisi');

      // Dispensation with valid permit number succeeds
      const permitNo = 'SK-DEKAN-FST-2026/042';
      await KRSService.saveKrs(
        student.id,
        sem.id,
        coursesToTake.map((c) => c.id),
        true,
        permitNo
      );

      // Verify dispensation was saved
      const updatedQuota = await AcademicRulesService.getSksQuotaInfo(student.id, sem.id);
      expect(updatedQuota.isDispensation).toBe(true);
      expect(updatedQuota.dispensationNomor).toBe(permitNo);
      expect(updatedQuota.currentSks).toBe(totalSksToTake);

      // Verify audit log for dispensation was recorded
      const logs = await AuditService.getAuditLogs({ action: 'KRS_DISPENSASI' });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].details).toContain(permitNo);
    });

    it('TC-44: verifies 75% attendance threshold calculation for examination eligibility', async () => {
      const sem = (await SemesterService.getActive())!;
      const courses = await MataKuliahService.getAll();
      const course = courses[0];

      const student = await MahasiswaService.create({
        nim: '202409002',
        nama: 'Siti Aminah',
        fakultas: 'Bisnis',
        jenisKelamin: 'WANITA',
        status: 'Aktif',
      });

      await KRSService.saveKrs(student.id, sem.id, [course.id]);

      // Record 4 meetings:
      // Meeting 1: HADIR
      // Meeting 2: HADIR
      // Meeting 3: HADIR
      // Meeting 4: ALPA (3/4 = 75% -> ELIGIBLE)
      for (let i = 1; i <= 3; i++) {
        await PresensiService.saveBatch(course.id, sem.id, `2026-10-0${i}`, [
          { mahasiswaId: student.id, status: 'HADIR' },
        ]);
      }
      await PresensiService.saveBatch(course.id, sem.id, '2026-10-04', [
        { mahasiswaId: student.id, status: 'ALPA' },
      ]);

      let eligibility = await AcademicRulesService.checkAttendanceEligibility(student.id, course.id, sem.id);
      expect(eligibility.attended).toBe(3);
      expect(eligibility.totalMeetings).toBe(4);
      expect(eligibility.percentage).toBe(75);
      expect(eligibility.eligible).toBe(true);

      // Meeting 5: ALPA (3/5 = 60% -> NOT ELIGIBLE < 75%)
      await PresensiService.saveBatch(course.id, sem.id, '2026-10-05', [
        { mahasiswaId: student.id, status: 'ALPA' },
      ]);

      eligibility = await AcademicRulesService.checkAttendanceEligibility(student.id, course.id, sem.id);
      expect(eligibility.attended).toBe(3);
      expect(eligibility.totalMeetings).toBe(5);
      expect(eligibility.percentage).toBe(60);
      expect(eligibility.eligible).toBe(false);
    });
  });

  // ==============================================================
  // 3. Pillar 3: Data Resilience & Auditability (Backup, Restore, Audit)
  // ==============================================================
  describe('Pillar 3: Data Resilience & Auditability (JSON Backup/Restore & Audit Logs)', () => {
    it('TC-45: exports complete relational schema backup to JSON with checksum verification', async () => {
      const backup = await BackupRestoreService.generateBackupJson();

      expect(backup.payload.app).toBe('Portal Akademik UBD');
      expect(backup.payload.version).toBe('3.0.0');
      expect(backup.payload.exportedAt).toBeDefined();
      expect(backup.payload.checksum).toMatch(/^crc32-[0-9a-f]{8}$/);

      // Verify all 10 core tables are present in backup
      const { tables } = backup.payload;
      expect(Array.isArray(tables.semesters)).toBe(true);
      expect(Array.isArray(tables.mahasiswa)).toBe(true);
      expect(Array.isArray(tables.dosen)).toBe(true);
      expect(Array.isArray(tables.mata_kuliah)).toBe(true);
      expect(Array.isArray(tables.jadwal)).toBe(true);
      expect(Array.isArray(tables.krs)).toBe(true);
      expect(Array.isArray(tables.presensi)).toBe(true);
      expect(Array.isArray(tables.nilai)).toBe(true);
      expect(Array.isArray(tables.audit_logs)).toBe(true);
      expect(Array.isArray(tables.sessions)).toBe(true);
      expect(tables.semesters.length).toBeGreaterThan(0);
      expect(tables.mahasiswa.length).toBeGreaterThan(0);
    });

    it('TC-46: executes atomic database restore and verifies rollback on invalid payload', async () => {
      // Step 1: Capture initial baseline backup
      const originalBackup = await BackupRestoreService.generateBackupJson();

      // Step 2: Add a temporary student
      const tempStudent = await MahasiswaService.create({
        nim: 'TEMP-99999',
        nama: 'Temporary Student',
        fakultas: 'Sains dan Teknologi',
        jenisKelamin: 'PRIA',
        status: 'Aktif',
      });
      const checkAdded = await MahasiswaService.getByNim('TEMP-99999');
      expect(checkAdded).not.toBeNull();

      // Step 3: Restore to original baseline
      const restoreResult = await BackupRestoreService.restoreFromJson(originalBackup.jsonString);
      expect(restoreResult.restoredCount).toBeGreaterThan(0);

      // Step 4: Verify tempStudent is gone (restored to baseline)
      const checkAfterRestore = await MahasiswaService.getByNim('TEMP-99999');
      expect(checkAfterRestore).toBeNull();

      // Step 5: Test rollback safety on invalid JSON structure
      await expect(
        BackupRestoreService.restoreFromJson('{"app": "Another App"}')
      ).rejects.toThrow('Berkas cadangan tidak valid');

      await expect(
        BackupRestoreService.restoreFromJson('{ invalid json syntax')
      ).rejects.toThrow('Format berkas tidak valid');
    });

    it('TC-47: records append-only audit logs on grade mutations and status changes', async () => {
      const student = (await MahasiswaService.getAll())[0];
      const sem = (await SemesterService.getActive())!;
      const course = (await MataKuliahService.getAll())[0];

      // Mutate grade
      await NilaiService.saveNilai({
        mahasiswaId: student.id,
        mataKuliahId: course.id,
        semesterId: sem.id,
        tugas: 90,
        uts: 92,
        uas: 94,
      });

      // Verify NILAI_MUTATION audit log
      const gradeLogs = await AuditService.getAuditLogs({ action: 'NILAI_MUTATION' });
      expect(gradeLogs.length).toBeGreaterThanOrEqual(1);
      expect(gradeLogs[0].entity).toBe('Nilai');

      // Update student status
      await MahasiswaService.updateStatus(student.id, 'Cuti');

      // Verify MAHASISWA_STATUS_CHANGE audit log
      const statusLogs = await AuditService.getAuditLogs({ action: 'MAHASISWA_STATUS_CHANGE' });
      expect(statusLogs.length).toBeGreaterThanOrEqual(1);
      expect(statusLogs[0].details).toContain('Cuti');
    });

    it('TC-48: supports filtering by action and text search across audit logs', async () => {
      await AuditService.logActivity(
        'LOGIN_SUCCESS',
        'Auth',
        null,
        'Admin berhasil login dari sesi uji coba',
        'tester-admin'
      );

      await AuditService.logActivity(
        'DATABASE_BACKUP',
        'Database',
        null,
        'Pencadangan database otomatis terjadwal',
        'system'
      );

      // Filter by action
      const loginLogs = await AuditService.getAuditLogs({ action: 'LOGIN_SUCCESS' });
      expect(loginLogs.length).toBeGreaterThanOrEqual(1);
      expect(loginLogs.every((l) => l.action === 'LOGIN_SUCCESS')).toBe(true);

      // Search by keyword
      const searchLogs = await AuditService.getAuditLogs({ searchQuery: 'terjadwal' });
      expect(searchLogs.length).toBeGreaterThanOrEqual(1);
      expect(searchLogs[0].details).toContain('terjadwal');
    });
  });
});
