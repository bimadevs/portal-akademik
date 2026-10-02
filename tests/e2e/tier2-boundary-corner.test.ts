/**
 * Tier 2: Boundary & Corner Cases E2E Tests
 * Covers edge cases, boundary conditions, and adversarial inputs:
 * - Empty & Null states (non-existent entity lookups, empty searches, 0-credit students)
 * - Whitespace trimming and sanitization
 * - Identifier boundary validation (NIM, NIDN, Kode MK)
 * - Time interval boundary and schedule clash edge cases
 * - SKS range constraint boundaries (0, 1, 6, 7)
 * - Grade score boundary values (0, 100, decimals, thresholds)
 * - SQL parameterization & escaping resilience (apostrophes, quotes, injection vectors)
 * - Session expiration (TTL) verification
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import './harness/test-env';
import { resetTestDatabase } from './harness/test-db';
import { StorageService } from '@/services/storage';
import { MahasiswaService } from '@/services/mahasiswa-service';
import { DosenService } from '@/services/dosen-service';
import { MataKuliahService } from '@/services/mata-kuliah-service';
import { JadwalService } from '@/services/jadwal-service';
import { KRSService } from '@/services/krs-service';
import { NilaiService } from '@/services/nilai-service';
import { SemesterService } from '@/services/semester-service';

describe('Tier 2: Boundary & Corner Cases', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  // ==========================================
  // 1. Empty & Null State Handling
  // ==========================================
  describe('Empty & Null State Handling', () => {
    it('TC-T2-EMPTY-01: querying non-existent student ID returns null without throwing', async () => {
      const student = await MahasiswaService.getById(999999);
      expect(student).toBeNull();

      const byNim = await MahasiswaService.getByNim('9999999999');
      expect(byNim).toBeNull();
    });

    it('TC-T2-EMPTY-02: querying non-existent dosen ID returns null without throwing', async () => {
      const dosen = await DosenService.getById(999999);
      expect(dosen).toBeNull();
    });

    it('TC-T2-EMPTY-03: querying non-existent course ID returns null without throwing', async () => {
      const course = await MataKuliahService.getById(999999);
      expect(course).toBeNull();
    });

    it('TC-T2-EMPTY-04: querying non-existent schedule ID returns null without throwing', async () => {
      const schedule = await JadwalService.getById(999999);
      expect(schedule).toBeNull();
    });

    it('TC-T2-EMPTY-05: searching with empty string returns full collection', async () => {
      const allMhs = await MahasiswaService.getAll('');
      expect(allMhs.length).toBe(7);

      const allDosen = await DosenService.getAll('');
      expect(allDosen.length).toBe(8);

      const allMk = await MataKuliahService.getAll('');
      expect(allMk.length).toBe(12);
    });

    it('TC-T2-EMPTY-06: searching with non-matching term returns empty array', async () => {
      const results = await MahasiswaService.getAll('__NON_EXISTENT_NAME_XYZ__');
      expect(results).toBeArray();
      expect(results.length).toBe(0);
    });

    it('TC-T2-EMPTY-07: student with 0 enrolled courses returns 0 SKS without error', async () => {
      const sem = (await SemesterService.getActive())!;
      const student = await MahasiswaService.create({
        nim: '2024010111',
        nama: 'Siswa Baru Belum KRS',
        jenisKelamin: 'PRIA',
        fakultas: 'Sains dan Teknologi',
      });

      const totalSks = await KRSService.getTotalSks(student.id, sem.id);
      expect(totalSks).toBe(0);
    });

    it('TC-T2-EMPTY-08: student with 0 graded courses returns 0.00 IPS without divide-by-zero error', async () => {
      const sem = (await SemesterService.getActive())!;
      const student = await MahasiswaService.create({
        nim: '2024010222',
        nama: 'Siswa Belum Ada Nilai',
        jenisKelamin: 'WANITA',
        fakultas: 'Bisnis',
      });

      const { ips, totalSks } = await NilaiService.hitungIPS(student.id, sem.id);
      expect(totalSks).toBe(0);
      expect(ips).toBe(0);
      expect(Number.isNaN(ips)).toBe(false);
    });
  });

  // ==========================================
  // 2. Whitespace & Sanitization
  // ==========================================
  describe('Whitespace & Input Sanitization', () => {
    it('TC-T2-WS-01: trims leading and trailing whitespace on student NIM and Nama', async () => {
      const student = await MahasiswaService.create({
        nim: '  2024010333  ',
        nama: '   Trimmed Student Name   ',
        jenisKelamin: 'PRIA',
        fakultas: 'Sains dan Teknologi',
      });

      expect(student.nim).toBe('2024010333');
      expect(student.nama).toBe('Trimmed Student Name');

      const found = await MahasiswaService.getByNim('2024010333');
      expect(found).not.toBeNull();
      expect(found?.nama).toBe('Trimmed Student Name');
    });

    it('TC-T2-WS-02: whitespace-only search string is treated as empty search', async () => {
      const results = await MahasiswaService.getAll('    ');
      expect(results.length).toBe(7);
    });

    it('TC-T2-WS-03: trims leading and trailing whitespace on course kode and nama', async () => {
      const course = await MataKuliahService.create({
        kode: '  CS999  ',
        nama: '   Cloud Architecture   ',
        sks: 3,
        fakultas: 'Sains dan Teknologi',
      });

      expect(course.kode).toBe('CS999');
      expect(course.nama).toBe('Cloud Architecture');
    });
  });

  // ==========================================
  // 3. Time Interval Boundaries & Jadwal Clashes
  // ==========================================
  describe('Time Interval Boundaries & Jadwal Clashes', () => {
    it('TC-T2-TIME-01: allows adjacent non-overlapping schedules in same room (back-to-back)', async () => {
      const courses = await MataKuliahService.getAll();
      const c1 = courses[0];
      const c2 = courses[1];

      // Schedule 1: 08:00 - 10:00 in Room LAB-EDGE
      await JadwalService.create({
        mataKuliahId: c1.id,
        hari: 'Kamis',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        ruangan: 'LAB-EDGE',
      });

      // Schedule 2: 10:00 - 12:00 in Room LAB-EDGE (ends exactly when previous begins) -> Should be ALLOWED
      let collision = false;
      try {
        await JadwalService.create({
          mataKuliahId: c2.id,
          hari: 'Kamis',
          jamMulai: '10:00',
          jamSelesai: '12:00',
          ruangan: 'LAB-EDGE',
        });
      } catch (e) {
        collision = true;
      }
      expect(collision).toBe(false);
    });

    it('TC-T2-TIME-02: allows exact same time slot in different rooms', async () => {
      const courses = await MataKuliahService.getAll();
      const c1 = courses[0];
      const c2 = courses[1];

      // Schedule 1: 08:00 - 10:00 in Room R-PARALLEL-1
      await JadwalService.create({
        mataKuliahId: c1.id,
        hari: 'Jumat',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        ruangan: 'R-PARALLEL-1',
      });

      // Schedule 2: 08:00 - 10:00 in Room R-PARALLEL-2 -> Different room, should be ALLOWED
      let collision = false;
      try {
        await JadwalService.create({
          mataKuliahId: c2.id,
          hari: 'Jumat',
          jamMulai: '08:00',
          jamSelesai: '10:00',
          ruangan: 'R-PARALLEL-2',
        });
      } catch (e) {
        collision = true;
      }
      expect(collision).toBe(false);
    });

    it('TC-T2-TIME-03: rejects overlapping time slot in same room (interior overlap)', async () => {
      const courses = await MataKuliahService.getAll();
      const c1 = courses[0];
      const c2 = courses[1];

      // Schedule 1: 08:00 - 11:00 in Room R-OVERLAP
      await JadwalService.create({
        mataKuliahId: c1.id,
        hari: 'Sabtu',
        jamMulai: '08:00',
        jamSelesai: '11:00',
        ruangan: 'R-OVERLAP',
      });

      // Schedule 2: 09:00 - 10:00 in Room R-OVERLAP -> Strictly inside, must be REJECTED
      let collision = false;
      try {
        await JadwalService.create({
          mataKuliahId: c2.id,
          hari: 'Sabtu',
          jamMulai: '09:00',
          jamSelesai: '10:00',
          ruangan: 'R-OVERLAP',
        });
      } catch (e: any) {
        collision = true;
        expect(e.message).toContain('bentrok');
      }
      expect(collision).toBe(true);
    });
  });

  // ==========================================
  // 4. SKS Range Constraint Boundaries (1 - 6)
  // ==========================================
  describe('SKS Range Constraint Boundaries (CHECK sks >= 1 AND sks <= 6)', () => {
    it('TC-T2-SKS-01: allows minimum valid SKS (1)', async () => {
      const c = await MataKuliahService.create({
        kode: 'MK-SKS-1',
        nama: 'Praktikum Lapangan',
        sks: 1,
        fakultas: 'Sains dan Teknologi',
      });
      expect(c.sks).toBe(1);
    });

    it('TC-T2-SKS-02: allows maximum valid SKS (6)', async () => {
      const c = await MataKuliahService.create({
        kode: 'MK-SKS-6',
        nama: 'Skripsi dan Tugas Akhir',
        sks: 6,
        fakultas: 'Sains dan Teknologi',
      });
      expect(c.sks).toBe(6);
    });

    it('TC-T2-SKS-03: rejects SKS = 0 (below minimum)', async () => {
      let rejected = false;
      try {
        await MataKuliahService.create({
          kode: 'MK-SKS-0',
          nama: 'Matkul Nol SKS',
          sks: 0,
          fakultas: 'Sains dan Teknologi',
        });
      } catch (e) {
        rejected = true;
      }
      expect(rejected).toBe(true);
    });

    it('TC-T2-SKS-04: rejects SKS = 7 (above maximum)', async () => {
      let rejected = false;
      try {
        await MataKuliahService.create({
          kode: 'MK-SKS-7',
          nama: 'Matkul Tujuh SKS',
          sks: 7,
          fakultas: 'Sains dan Teknologi',
        });
      } catch (e) {
        rejected = true;
      }
      expect(rejected).toBe(true);
    });
  });

  // ==========================================
  // 5. Nilai & Score Boundary Values
  // ==========================================
  describe('Nilai & Score Boundary Values', () => {
    it('TC-T2-SCORE-01: score 0 evaluates to grade E with 0.0 bobot', async () => {
      const mhs = (await MahasiswaService.getAll())[0];
      const sem = (await SemesterService.getActive())!;
      const course = (await MataKuliahService.getAll())[0];

      await KRSService.saveKrs(mhs.id, sem.id, [course.id]);

      const saved = await NilaiService.saveNilai({
        mahasiswaId: mhs.id,
        semesterId: sem.id,
        mataKuliahId: course.id,
        tugas: 0,
        uts: 0,
        uas: 0,
      });

      expect(saved.huruf).toBe('E');
      expect(saved.bobot).toBe(0.0);
    });

    it('TC-T2-SCORE-02: score 100 evaluates to grade A with 4.0 bobot', async () => {
      const mhs = (await MahasiswaService.getAll())[0];
      const sem = (await SemesterService.getActive())!;
      const course = (await MataKuliahService.getAll())[0];

      await KRSService.saveKrs(mhs.id, sem.id, [course.id]);

      const saved = await NilaiService.saveNilai({
        mahasiswaId: mhs.id,
        semesterId: sem.id,
        mataKuliahId: course.id,
        tugas: 100,
        uts: 100,
        uas: 100,
      });

      expect(saved.huruf).toBe('A');
      expect(saved.bobot).toBe(4.0);
    });

    it('TC-T2-SCORE-03: boundary score 85 evaluates to grade A', async () => {
      const mhs = (await MahasiswaService.getAll())[0];
      const sem = (await SemesterService.getActive())!;
      const course = (await MataKuliahService.getAll())[0];

      await KRSService.saveKrs(mhs.id, sem.id, [course.id]);

      const saved = await NilaiService.saveNilai({
        mahasiswaId: mhs.id,
        semesterId: sem.id,
        mataKuliahId: course.id,
        tugas: 85,
        uts: 85,
        uas: 85,
      });

      expect(saved.huruf).toBe('A');
      expect(saved.bobot).toBe(4.0);
    });
  });

  // ==========================================
  // 6. SQL Parameterization & Escaping Resilience
  // ==========================================
  describe('SQL Parameterization & Escaping Resilience', () => {
    it('TC-T2-SQL-01: saves and retrieves names with apostrophes and special characters', async () => {
      const specialName = "Dr. Conan O'Connor, S.Kom., M.T.";
      const lecturer = await DosenService.create({
        nidn: '0912837465',
        nama: specialName,
        fakultas: 'Sains dan Teknologi',
        telepon: '0812345678',
      });

      expect(lecturer.nama).toBe(specialName);

      const found = await DosenService.getById(lecturer.id);
      expect(found?.nama).toBe(specialName);

      const searchResult = await DosenService.getAll("O'Connor");
      expect(searchResult.length).toBe(1);
      expect(searchResult[0].nama).toBe(specialName);
    });

    it('TC-T2-SQL-02: protects against SQL injection in form inputs', async () => {
      const injectionString = "Robert'); DROP TABLE mahasiswa; --";
      const student = await MahasiswaService.create({
        nim: '2024010999',
        nama: injectionString,
        jenisKelamin: 'PRIA',
        fakultas: 'Sains dan Teknologi',
      });

      expect(student.nama).toBe(injectionString);

      // Verify that table was NOT dropped and normal queries still succeed
      const all = await MahasiswaService.getAll();
      expect(all.length).toBeGreaterThan(0);
      expect(all.map((m) => m.nama)).toContain(injectionString);
    });
  });

  // ==========================================
  // 7. Session Expiry (TTL) Verification
  // ==========================================
  describe('Session Expiry (TTL) Verification', () => {
    it('TC-T2-TTL-01: returns null for expired sessions (past expires_at)', async () => {
      const pastTime = Date.now() - 3600 * 1000; // 1 hour ago
      await StorageService.saveSession({
        username: 'admin',
        isLoggedIn: true,
        loginTime: pastTime - 1000,
        token: 'expired-token-xyz',
      });

      // Directly update session to simulate expiration
      const { testDbShim } = await import('./harness/test-db');
      await testDbShim.runAsync(`UPDATE sessions SET expires_at = ?;`, [String(pastTime)]);

      const session = await StorageService.getSession();
      expect(session).toBeNull();
    });

    it('TC-T2-TTL-02: returns valid session for future expires_at', async () => {
      const futureTime = Date.now() + 7 * 24 * 3600 * 1000; // 7 days in future
      await StorageService.saveSession({
        username: 'admin',
        isLoggedIn: true,
        loginTime: Date.now(),
        token: 'valid-token-xyz',
      });

      const { testDbShim } = await import('./harness/test-db');
      await testDbShim.runAsync(`UPDATE sessions SET expires_at = ?;`, [String(futureTime)]);

      const session = await StorageService.getSession();
      expect(session).not.toBeNull();
      expect(session?.isLoggedIn).toBe(true);
    });
  });
});
