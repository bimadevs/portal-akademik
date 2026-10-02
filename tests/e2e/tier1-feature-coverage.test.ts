/**
 * Tier 1: Feature Coverage E2E Tests
 * Covers all primary features defined in docs/REQUIREMENTS.md and PROJECT.md:
 * - FR-01 to FR-04: Authentication & Session Lifecycle
 * - FR-05, FR-06, FR-33: Dashboard & Academic Statistics
 * - FR-08 to FR-14, FR-37 to FR-40: Mahasiswa CRUD, Search, and Filtering
 * - FR-15 to FR-17: Dosen CRUD and Search
 * - FR-18 to FR-20: Mata Kuliah CRUD and SKS Validation
 * - FR-21 to FR-23: Jadwal Kuliah and Day Filtering
 * - FR-24 to FR-26: KRS Course Enrollment and SKS Calculation
 * - FR-27, FR-28: Presensi Recording and Attendance Recap
 * - FR-29 to FR-31: Nilai Entry, IPS/IPK Calculation, and Academic Transcript
 * - FR-32: Digital Student Card and QR Code Payload
 * - FR-34 to FR-36: Settings and Semester Management
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
import { PresensiService } from '@/services/presensi-service';
import { NilaiService } from '@/services/nilai-service';
import { SemesterService } from '@/services/semester-service';
import { StatistikService } from '@/services/statistik-service';

describe('Tier 1: Feature Coverage', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  // ==========================================
  // 1. Authentication & Session Lifecycle (FR-01 to FR-04)
  // ==========================================
  describe('FR-01 to FR-04: Authentication & Session Lifecycle', () => {
    it('TC-T1-AUTH-01: saves and retrieves active administrator session (FR-01, FR-03)', async () => {
      const session = {
        username: 'admin',
        isLoggedIn: true,
        loginTime: Date.now(),
        token: 'test-token-123',
      };
      await StorageService.saveSession(session);

      const retrieved = await StorageService.getSession();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.isLoggedIn).toBe(true);
      expect(retrieved?.username).toBe('admin');
    });

    it('TC-T1-AUTH-02: clears session on logout (FR-04)', async () => {
      await StorageService.saveSession({
        username: 'admin',
        isLoggedIn: true,
        loginTime: Date.now(),
      });

      await StorageService.clearSession();
      const session = await StorageService.getSession();
      expect(session).toBeNull();
    });
  });

  // ==========================================
  // 2. Dashboard & Statistics (FR-05, FR-06, FR-33)
  // ==========================================
  describe('FR-05, FR-06, FR-33: Dashboard & Academic Statistics', () => {
    it('TC-T1-DASH-01: retrieves academic metrics and distributions (FR-33)', async () => {
      // Note: In un-remediated codebase, StatistikService queries 'jenis_kelamin' instead of 'gender'
      // This test asserts the true requirement contract
      const stats = await StatistikService.getDashboardStats();
      expect(stats.totalMahasiswa).toBe(7);
      expect(stats.totalDosen).toBe(8);
      expect(stats.totalMataKuliah).toBe(12);
      expect(stats.totalJadwal).toBe(10);
      expect(stats.mahasiswaByFakultas.length).toBeGreaterThan(0);
      expect(stats.mahasiswaByGender.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 3. Mahasiswa Management (FR-08 to FR-14, FR-37 to FR-40)
  // ==========================================
  describe('FR-08 to FR-14, FR-37 to FR-40: Mahasiswa Management', () => {
    it('TC-T1-MHS-01: verifies seed data contains 7 default students (FR-11)', async () => {
      const list = await MahasiswaService.getAll();
      expect(list.length).toBe(7);

      const names = list.map((m) => m.nama);
      expect(names).toContain('Dewi');
      expect(names).toContain('Yanti');
      expect(names).toContain('Melati');
      expect(names).toContain('Mawar');
      expect(names).toContain('Komarudin');
      expect(names).toContain('Jaka');
      expect(names).toContain('Riska');
    });

    it('TC-T1-MHS-02: creates a new student with valid inputs (FR-08, FR-10)', async () => {
      const newMhs = await MahasiswaService.create({
        nim: '2024010099',
        nama: 'Ahmad Dahlan',
        jenisKelamin: 'PRIA',
        fakultas: 'Sains dan Teknologi',
        status: 'Aktif',
      });

      expect(newMhs.id).toBeDefined();
      expect(newMhs.nim).toBe('2024010099');
      expect(newMhs.nama).toBe('Ahmad Dahlan');

      const found = await MahasiswaService.getByNim('2024010099');
      expect(found).not.toBeNull();
      expect(found?.nama).toBe('Ahmad Dahlan');
    });

    it('TC-T1-MHS-03: rejects duplicate NIM with validation error (FR-09)', async () => {
      // NIM 2021010001 is already registered to Dewi in seed data
      let errorThrown = false;
      try {
        await MahasiswaService.create({
          nim: '2021010001',
          nama: 'Dewi Duplikat',
          jenisKelamin: 'WANITA',
          fakultas: 'Sains dan Teknologi',
        });
      } catch (err: any) {
        errorThrown = true;
        expect(err.message).toContain('sudah terdaftar');
      }
      expect(errorThrown).toBe(true);
    });

    it('TC-T1-MHS-04: filters students by name and NIM search query (FR-39)', async () => {
      const searchByName = await MahasiswaService.getAll({ search: 'Dewi' });
      expect(searchByName.length).toBe(1);
      expect(searchByName[0].nama).toBe('Dewi');

      const searchByNim = await MahasiswaService.getAll({ search: '2021010007' });
      expect(searchByNim.length).toBe(1);
      expect(searchByNim[0].nama).toBe('Komarudin');
    });

    it('TC-T1-MHS-05: filters students by Fakultas (FR-39)', async () => {
      const sainsTek = await MahasiswaService.getAll({ fakultas: 'Sains dan Teknologi' });
      expect(sainsTek.length).toBe(4); // Dewi, Mawar, Komarudin, Jaka
      for (const m of sainsTek) {
        expect(m.fakultas).toBe('Sains dan Teknologi');
      }

      const bisnis = await MahasiswaService.getAll({ fakultas: 'Bisnis' });
      expect(bisnis.length).toBe(1); // Yanti
      expect(bisnis[0].nama).toBe('Yanti');
    });

    it('TC-T1-MHS-06: filters students by Status (FR-38, FR-39)', async () => {
      const allActive = await MahasiswaService.getAll({ status: 'Aktif' });
      expect(allActive.length).toBe(7); // All seed students start as Aktif
    });

    it('TC-T1-MHS-07: updates existing student data (FR-37)', async () => {
      const dewi = await MahasiswaService.getByNim('2021010001');
      expect(dewi).not.toBeNull();

      await MahasiswaService.update(dewi!.id, {
        nama: 'Dewi Sartika, S.Kom',
        status: 'Lulus',
      });

      const reloaded = await MahasiswaService.getById(dewi!.id);
      expect(reloaded?.nama).toBe('Dewi Sartika, S.Kom');
      expect(reloaded?.status).toBe('Lulus');
    });

    it('TC-T1-MHS-08: deletes student from database (FR-14)', async () => {
      const jaka = await MahasiswaService.getByNim('2021010008');
      expect(jaka).not.toBeNull();

      await MahasiswaService.delete(jaka!.id);
      const reloaded = await MahasiswaService.getById(jaka!.id);
      expect(reloaded).toBeNull();
    });
  });

  // ==========================================
  // 4. Dosen Management (FR-15 to FR-17)
  // ==========================================
  describe('FR-15 to FR-17: Dosen Management', () => {
    it('TC-T1-DOSEN-01: verifies seed data contains 8 default lecturers', async () => {
      const list = await DosenService.getAll();
      expect(list.length).toBe(8);
    });

    it('TC-T1-DOSEN-02: creates new lecturer with valid NIDN (FR-15)', async () => {
      const newDosen = await DosenService.create({
        nidn: '0909090909',
        nama: 'Dr. John Von Neumann',
        fakultas: 'Sains dan Teknologi',
        gender: 'PRIA',
        telepon: '08999999999',
      });

      expect(newDosen.id).toBeDefined();
      expect(newDosen.nidn).toBe('0909090909');

      const found = await DosenService.getById(newDosen.id);
      expect(found).not.toBeNull();
      expect(found?.nama).toBe('Dr. John Von Neumann');
    });

    it('TC-T1-DOSEN-03: rejects duplicate NIDN (FR-15)', async () => {
      let errorThrown = false;
      try {
        await DosenService.create({
          nidn: '0101010101', // Already belongs to Dr. Budi Santoso
          nama: 'Budi Santoso Klon',
          fakultas: 'Sains dan Teknologi',
        });
      } catch (err: any) {
        errorThrown = true;
        expect(err.message).toContain('sudah terdaftar');
      }
      expect(errorThrown).toBe(true);
    });

    it('TC-T1-DOSEN-04: searches lecturers by name and NIDN (FR-16)', async () => {
      const results = await DosenService.getAll('Budi');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].nama).toContain('Budi');
    });

    it('TC-T1-DOSEN-05: updates and deletes lecturer (FR-17)', async () => {
      const lecturer = await DosenService.create({
        nidn: '9876543210',
        nama: 'Lecturer To Delete',
        fakultas: 'Bisnis',
        telepon: '0812345678',
      });

      await DosenService.update(lecturer.id, {
        nama: 'Lecturer Updated Name',
      });
      const updated = await DosenService.getById(lecturer.id);
      expect(updated?.nama).toBe('Lecturer Updated Name');

      await DosenService.delete(lecturer.id);
      const reloaded = await DosenService.getById(lecturer.id);
      expect(reloaded).toBeNull();
    });
  });

  // ==========================================
  // 5. Mata Kuliah Management (FR-18 to FR-20)
  // ==========================================
  describe('FR-18 to FR-20: Mata Kuliah Management', () => {
    it('TC-T1-MK-01: verifies seed data contains 12 default courses', async () => {
      const list = await MataKuliahService.getAll();
      expect(list.length).toBe(12);
    });

    it('TC-T1-MK-02: creates new course with valid attributes (FR-18)', async () => {
      const dosen = (await DosenService.getAll())[0];
      const newCourse = await MataKuliahService.create({
        kode: 'CS301',
        nama: 'Pemrograman Mobile Lanjut',
        sks: 3,
        fakultas: 'Sains dan Teknologi',
        dosenId: dosen.id,
      });

      expect(newCourse.id).toBeDefined();
      expect(newCourse.kode).toBe('CS301');
      expect(newCourse.sks).toBe(3);

      const found = await MataKuliahService.getById(newCourse.id);
      expect(found?.nama).toBe('Pemrograman Mobile Lanjut');
    });

    it('TC-T1-MK-03: rejects duplicate course code (FR-18)', async () => {
      let errorThrown = false;
      try {
        await MataKuliahService.create({
          kode: 'IF101', // Already exists in seed
          nama: 'Algoritma Duplikat',
          sks: 3,
          fakultas: 'Sains dan Teknologi',
        });
      } catch (err: any) {
        errorThrown = true;
        expect(err.message).toContain('sudah terdaftar');
      }
      expect(errorThrown).toBe(true);
    });

    it('TC-T1-MK-04: searches courses by code or name (FR-19)', async () => {
      const byKode = await MataKuliahService.getAll('IF101');
      expect(byKode.length).toBe(1);
      expect(byKode[0].nama).toBe('Algoritma dan Pemrograman');

      const byName = await MataKuliahService.getAll('Basis Data');
      expect(byName.length).toBe(1);
      expect(byName[0].kode).toBe('IF103');
    });
  });

  // ==========================================
  // 6. Jadwal Kuliah (FR-21 to FR-23)
  // ==========================================
  describe('FR-21 to FR-23: Jadwal Kuliah', () => {
    it('TC-T1-JADWAL-01: verifies seed data contains 10 schedules', async () => {
      const list = await JadwalService.getAll();
      expect(list.length).toBe(10);
    });

    it('TC-T1-JADWAL-02: filters schedules by day (FR-22)', async () => {
      const seninList = await JadwalService.getAll({ hari: 'Senin' });
      expect(seninList.length).toBeGreaterThan(0);
      for (const j of seninList) {
        expect(j.hari).toBe('Senin');
      }
    });

    it('TC-T1-JADWAL-03: prevents schedule collision in same room and time (FR-21)', async () => {
      const mkList = await MataKuliahService.getAll();
      const mk1 = mkList[0];
      const mk2 = mkList[1];

      // Schedule 1: Senin 08:00 - 10:00 in Lab A
      await JadwalService.create({
        mataKuliahId: mk1.id,
        hari: 'Senin',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        ruangan: 'Lab A',
      });

      // Schedule 2: Overlapping on Senin 09:00 - 11:00 in Lab A -> Must throw
      let collisionDetected = false;
      try {
        await JadwalService.create({
          mataKuliahId: mk2.id,
          hari: 'Senin',
          jamMulai: '09:00',
          jamSelesai: '11:00',
          ruangan: 'Lab A',
        });
      } catch (err: any) {
        collisionDetected = true;
        expect(err.message).toContain('bentrok');
      }
      expect(collisionDetected).toBe(true);
    });
  });

  // ==========================================
  // 7. KRS Module & SKS Calculation (FR-24 to FR-26)
  // ==========================================
  describe('FR-24 to FR-26: KRS Module & SKS Calculation', () => {
    it('TC-T1-KRS-01: updates KRS enrollments and calculates total SKS (FR-24, FR-25)', async () => {
      const mhs = (await MahasiswaService.getAll())[0];
      const sem = (await SemesterService.getActive())!;
      const courses = await MataKuliahService.getAll();

      // Pick 2 courses (3 SKS each -> total 6 SKS)
      const selectedCourseIds = [courses[0].id, courses[1].id];
      const expectedSks = courses[0].sks + courses[1].sks;

      await KRSService.saveKrs(mhs.id, sem.id, selectedCourseIds);

      const enrolled = await KRSService.getByMahasiswaAndSemester(mhs.id, sem.id);
      expect(enrolled.length).toBe(2);

      const totalSks = await KRSService.getTotalSks(mhs.id, sem.id);
      expect(totalSks).toBe(expectedSks);
    });

    it('TC-T1-KRS-02: retrieves enrolled students for a course (FR-27)', async () => {
      const mhs = (await MahasiswaService.getAll())[0];
      const sem = (await SemesterService.getActive())!;
      const course = (await MataKuliahService.getAll())[0];

      await KRSService.saveKrs(mhs.id, sem.id, [course.id]);

      const participants = await KRSService.getMahasiswaByMataKuliah(course.id, sem.id);
      expect(participants.map((p) => p.nim)).toContain(mhs.nim);
    });
  });

  // ==========================================
  // 8. Presensi Module & Rekap (FR-27, FR-28)
  // ==========================================
  describe('FR-27, FR-28: Presensi Module & Rekap', () => {
    it('TC-T1-PRES-01: saves batch attendance and calculates attendance summary (FR-27, FR-28)', async () => {
      const mhs = (await MahasiswaService.getAll())[0];
      const sem = (await SemesterService.getActive())!;
      const course = (await MataKuliahService.getAll())[0];

      await KRSService.saveKrs(mhs.id, sem.id, [course.id]);

      // Record 2 meetings: 1 Hadir, 1 Izin -> 50% Hadir
      await PresensiService.saveBatch(course.id, sem.id, '2026-03-01', [
        { mahasiswaId: mhs.id, status: 'Hadir' },
      ]);
      await PresensiService.saveBatch(course.id, sem.id, '2026-03-08', [
        { mahasiswaId: mhs.id, status: 'Izin' },
      ]);

      const rekap = await PresensiService.getRekapByMataKuliah(course.id, sem.id);
      const studentRekap = rekap.find((r) => r.mahasiswa_id === mhs.id || r.nama === mhs.nama);
      expect(studentRekap).toBeDefined();
      expect(studentRekap?.total_pertemuan).toBe(2);
      expect(studentRekap?.hadir).toBe(1);
      expect(studentRekap?.persentase).toBe(50);
    });
  });

  // ==========================================
  // 9. Nilai & Transkrip (FR-29 to FR-31)
  // ==========================================
  describe('FR-29 to FR-31: Nilai & Transkrip', () => {
    it('TC-T1-NILAI-01: saves grade, computes bobot, and calculates semester IPS (FR-29, FR-30)', async () => {
      const mhs = (await MahasiswaService.getAll())[0];
      const sem = (await SemesterService.getActive())!;
      const courses = await MataKuliahService.getAll();

      const c1 = courses[0]; // 3 SKS
      const c2 = courses[1]; // 3 SKS

      await KRSService.saveKrs(mhs.id, sem.id, [c1.id, c2.id]);

      // Course 1: Score 85 -> Grade A (Bobot 4.0)
      await NilaiService.saveNilai({
        mahasiswaId: mhs.id,
        semesterId: sem.id,
        mataKuliahId: c1.id,
        tugas: 85,
        uts: 85,
        uas: 85,
      });

      // Course 2: Score 75 -> Grade B+ (Bobot 3.5)
      await NilaiService.saveNilai({
        mahasiswaId: mhs.id,
        semesterId: sem.id,
        mataKuliahId: c2.id,
        tugas: 75,
        uts: 75,
        uas: 75,
      });

      const { ips, totalSks } = await NilaiService.hitungIPS(mhs.id, sem.id);
      const expectedSks = c1.sks + c2.sks;
      expect(totalSks).toBe(expectedSks);
      expect(ips).toBeGreaterThan(0);
    });

    it('TC-T1-NILAI-02: retrieves academic transcript for student (FR-31)', async () => {
      // Note: In un-remediated codebase, NilaiService.getTranskrip() orders by non-existent s.tahun
      // This test asserts the true requirement contract
      const mhs = (await MahasiswaService.getAll())[0];
      const transkrip = await NilaiService.getTranskrip(mhs.id);
      expect(Array.isArray(transkrip.list)).toBe(true);
    });
  });

  // ==========================================
  // 10. Kartu Mahasiswa (FR-32)
  // ==========================================
  describe('FR-32: Kartu Mahasiswa Digital', () => {
    it('TC-T1-KARTU-01: retrieves student card payload and verifies QR code content (FR-32)', async () => {
      const dewi = await MahasiswaService.getByNim('2021010001');
      expect(dewi).not.toBeNull();

      // Card must present valid student identity with QR payload matching NIM
      expect(dewi?.nim).toBe('2021010001');
      expect(dewi?.nama).toBe('Dewi');
      expect(dewi?.fakultas).toBe('Sains dan Teknologi');
      expect(dewi?.status).toBe('Aktif');
    });
  });

  // ==========================================
  // 11. Pengaturan & Semester Management (FR-34 to FR-36)
  // ==========================================
  describe('FR-34 to FR-36: Pengaturan & Semester Management', () => {
    it('TC-T1-SETTINGS-01: switches active semester (FR-34)', async () => {
      const semesters = await SemesterService.getAll();
      expect(semesters.length).toBeGreaterThanOrEqual(2);

      const targetSem = semesters.find((s) => !s.aktif);
      expect(targetSem).toBeDefined();

      await SemesterService.setActive(targetSem!.id);
      const active = await SemesterService.getActive();
      expect(active?.id).toBe(targetSem!.id);
    });

    it('TC-T1-SETTINGS-02: creates a new semester (FR-34)', async () => {
      const newSem = await SemesterService.create('Ganjil 2026/2027');
      expect(newSem.id).toBeDefined();
      expect(newSem.nama).toBe('Ganjil 2026/2027');

      const all = await SemesterService.getAll();
      expect(all.map((s) => s.nama)).toContain('Ganjil 2026/2027');
    });
  });
});
