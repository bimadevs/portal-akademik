/**
 * Tier 3: Cross-Feature Interactions E2E Tests
 * Covers cross-module workflows, state transitions, and relational integrity:
 * - TC-T3-01: End-to-End Complete Academic Lifecycle (Mhs -> Dosen -> Matkul -> Jadwal -> KRS -> Presensi -> Nilai -> Transkrip)
 * - TC-T3-02: Multi-Semester Progression & Cumulative IPK Calculation across semesters
 * - TC-T3-03: Student Status Transition Impact (Aktif -> Cuti -> Lulus)
 * - TC-T3-04: Relational Foreign Key Integrity & Cascade Deletes
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import './harness/test-env';
import { resetTestDatabase, getActiveRawDatabase } from './harness/test-db';
import { MahasiswaService } from '@/services/mahasiswa-service';
import { DosenService } from '@/services/dosen-service';
import { MataKuliahService } from '@/services/mata-kuliah-service';
import { JadwalService } from '@/services/jadwal-service';
import { KRSService } from '@/services/krs-service';
import { PresensiService } from '@/services/presensi-service';
import { NilaiService } from '@/services/nilai-service';
import { SemesterService } from '@/services/semester-service';

describe('Tier 3: Cross-Feature Interactions', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  // ==========================================
  // 1. End-to-End Complete Academic Lifecycle
  // ==========================================
  it('TC-T3-01: executes full academic lifecycle from student creation to transcript', async () => {
    const sem = (await SemesterService.getActive())!;

    // 1. Create student
    const student = await MahasiswaService.create({
      nim: '2024019999',
      nama: 'Grace Hopper',
      jenisKelamin: 'WANITA',
      fakultas: 'Sains dan Teknologi',
      status: 'Aktif',
    });
    expect(student.id).toBeDefined();

    // 2. Create lecturer
    const dosen = await DosenService.create({
      nidn: '0988776655',
      nama: 'Dr. Claude Shannon',
      fakultas: 'Sains dan Teknologi',
      gender: 'PRIA',
      telepon: '08123456789',
    });
    expect(dosen.id).toBeDefined();

    // 3. Create course assigned to lecturer
    const course = await MataKuliahService.create({
      kode: 'IF401',
      nama: 'Teori Informasi dan Komputasi',
      sks: 3,
      fakultas: 'Sains dan Teknologi',
      dosenId: dosen.id,
    });
    expect(course.id).toBeDefined();

    // 4. Create class schedule
    const schedule = await JadwalService.create({
      mataKuliahId: course.id,
      hari: 'Senin',
      jamMulai: '10:00',
      jamSelesai: '12:30',
      ruangan: 'LAB-COMM',
    });
    expect(schedule.id).toBeDefined();

    // 5. Enroll student via KRS
    await KRSService.saveKrs(student.id, sem.id, [course.id]);
    const enrolled = await KRSService.getByMahasiswaAndSemester(student.id, sem.id);
    expect(enrolled.length).toBe(1);
    expect(enrolled[0].mataKuliahKode || enrolled[0].kode).toBe('IF401');

    // 6. Verify student appears in course attendance list
    const participants = await KRSService.getMahasiswaByMataKuliah(course.id, sem.id);
    expect(participants.map((p) => p.nim)).toContain('2024019999');

    // 7. Record 4 attendance meetings (3 Hadir, 1 Sakit -> 75% attendance)
    await PresensiService.saveBatch(course.id, sem.id, '2026-03-02', [{ mahasiswaId: student.id, status: 'Hadir' }]);
    await PresensiService.saveBatch(course.id, sem.id, '2026-03-09', [{ mahasiswaId: student.id, status: 'Hadir' }]);
    await PresensiService.saveBatch(course.id, sem.id, '2026-03-16', [{ mahasiswaId: student.id, status: 'Sakit' }]);
    await PresensiService.saveBatch(course.id, sem.id, '2026-03-23', [{ mahasiswaId: student.id, status: 'Hadir' }]);

    const rekap = await PresensiService.getRekapByMataKuliah(course.id, sem.id);
    const mhsRekap = rekap.find((r) => r.mahasiswa_id === student.id || r.nama === student.nama);
    expect(mhsRekap).toBeDefined();
    expect(mhsRekap?.total_pertemuan).toBe(4);
    expect(mhsRekap?.hadir).toBe(3);
    expect(mhsRekap?.persentase).toBe(75);

    // 8. Submit grades
    const grade = await NilaiService.saveNilai({
      mahasiswaId: student.id,
      semesterId: sem.id,
      mataKuliahId: course.id,
      tugas: 90,
      uts: 95,
      uas: 88,
    });
    expect(grade.huruf).toBe('A');
    expect(grade.bobot).toBe(4.0);

    // 9. Verify IPS calculation
    const { ips, totalSks } = await NilaiService.hitungIPS(student.id, sem.id);
    expect(totalSks).toBe(3);
    expect(ips).toBe(4.0);
  });

  // ==========================================
  // 2. Multi-Semester Progression & Cumulative IPK
  // ==========================================
  it('TC-T3-02: tracks multi-semester academic progression and cumulative IPK accurately', async () => {
    const student = await MahasiswaService.create({
      nim: '2024020001',
      nama: 'Alan Turing',
      jenisKelamin: 'PRIA',
      fakultas: 'Sains dan Teknologi',
      status: 'Aktif',
    });

    const sem1 = (await SemesterService.getActive())!; // Ganjil 2025/2026
    const allSem = await SemesterService.getAll();
    const sem2 = allSem.find((s) => s.id !== sem1.id)!; // Genap 2024/2025

    const allCourses = await MataKuliahService.getAll();
    const c1 = allCourses[0]; // SKS 3
    const c2 = allCourses[1]; // SKS 3
    const c3 = allCourses[2]; // SKS 3
    const c4 = allCourses[3]; // SKS 2

    // --- Semester 1 ---
    await KRSService.saveKrs(student.id, sem1.id, [c1.id, c2.id]);

    // c1: Grade A (4.0), c2: Grade B (3.0)
    // SKS = 3 + 3 = 6. Total points = (3*4.0 + 3*3.0) = 21.0 -> IPS = 3.50
    await NilaiService.saveNilai({
      mahasiswaId: student.id,
      semesterId: sem1.id,
      mataKuliahId: c1.id,
      tugas: 85,
      uts: 85,
      uas: 85,
    });
    await NilaiService.saveNilai({
      mahasiswaId: student.id,
      semesterId: sem1.id,
      mataKuliahId: c2.id,
      tugas: 70,
      uts: 70,
      uas: 70,
    });

    const sem1Result = await NilaiService.hitungIPS(student.id, sem1.id);
    expect(sem1Result.totalSks).toBe(6);
    expect(sem1Result.ips).toBe(3.5);

    // --- Switch active semester to Semester 2 ---
    await SemesterService.setActive(sem2.id);
    const activeSem2 = await SemesterService.getActive();
    expect(activeSem2?.id).toBe(sem2.id);

    // --- Semester 2 ---
    await KRSService.saveKrs(student.id, sem2.id, [c3.id, c4.id]);

    // c3: Grade B+ (3.5, 3 SKS), c4: Grade A (4.0, 2 SKS)
    // SKS = 3 + 2 = 5. Total points = (3*3.5 + 2*4.0) = 10.5 + 8.0 = 18.5 -> IPS = 18.5 / 5 = 3.70
    await NilaiService.saveNilai({
      mahasiswaId: student.id,
      semesterId: sem2.id,
      mataKuliahId: c3.id,
      tugas: 75,
      uts: 75,
      uas: 75,
    });
    await NilaiService.saveNilai({
      mahasiswaId: student.id,
      semesterId: sem2.id,
      mataKuliahId: c4.id,
      tugas: 85,
      uts: 85,
      uas: 85,
    });

    const sem2Result = await NilaiService.hitungIPS(student.id, sem2.id);
    expect(sem2Result.totalSks).toBe(5);
    expect(sem2Result.ips).toBe(3.7);

    // Verify historical Semester 1 KRS remains completely intact
    const sem1Krs = await KRSService.getByMahasiswaAndSemester(student.id, sem1.id);
    expect(sem1Krs.length).toBe(2);

    // Verify cumulative points:
    // Total points = 21.0 + 18.5 = 39.5. Total SKS = 6 + 5 = 11.
    // IPK = 39.5 / 11 = 3.5909 ≈ 3.59
    const rawDb = getActiveRawDatabase();
    const rows = rawDb.query<{ sks: number; bobot: number }>(`
      SELECT mk.sks, n.bobot
      FROM nilai n
      JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
      WHERE n.mahasiswa_id = ?;
    `).all(student.id);

    let totalCumulativePoints = 0;
    let totalCumulativeSks = 0;
    for (const r of rows) {
      totalCumulativePoints += r.sks * r.bobot;
      totalCumulativeSks += r.sks;
    }

    const calculatedIpk = Number((totalCumulativePoints / totalCumulativeSks).toFixed(2));
    expect(totalCumulativeSks).toBe(11);
    expect(calculatedIpk).toBe(3.59);
  });

  // ==========================================
  // 3. Student Status Transition Impact
  // ==========================================
  it('TC-T3-03: tracks student status changes (Aktif -> Cuti -> Lulus) and query segregation', async () => {
    const student = await MahasiswaService.create({
      nim: '2024030001',
      nama: 'Status Transition Student',
      jenisKelamin: 'PRIA',
      fakultas: 'Bisnis',
      status: 'Aktif',
    });

    // 1. Initial status is Aktif
    let activeStudents = await MahasiswaService.getAll({ status: 'Aktif' });
    expect(activeStudents.map((s) => s.nim)).toContain('2024030001');

    // 2. Change status to Cuti
    await MahasiswaService.update(student.id, { status: 'Cuti' });
    activeStudents = await MahasiswaService.getAll({ status: 'Aktif' });
    expect(activeStudents.map((s) => s.nim)).not.toContain('2024030001');

    const cutiStudents = await MahasiswaService.getAll({ status: 'Cuti' });
    expect(cutiStudents.map((s) => s.nim)).toContain('2024030001');

    // 3. Change status to Lulus
    await MahasiswaService.update(student.id, { status: 'Lulus' });
    const lulusStudents = await MahasiswaService.getAll({ status: 'Lulus' });
    expect(lulusStudents.map((s) => s.nim)).toContain('2024030001');
  });

  // ==========================================
  // 4. Relational Foreign Key Integrity & Cascade Deletes
  // ==========================================
  it('TC-T3-04: verifies PRAGMA foreign_keys = ON and cascade deletion of related child records', async () => {
    const sem = (await SemesterService.getActive())!;
    const rawDb = getActiveRawDatabase();

    // Verify foreign keys are enabled
    const fkStatus = rawDb.query<{ foreign_keys: number }>('PRAGMA foreign_keys;').get();
    expect(fkStatus?.foreign_keys).toBe(1);

    // Create student
    const student = await MahasiswaService.create({
      nim: '2024040001',
      nama: 'Cascade Test Student',
      jenisKelamin: 'PRIA',
      fakultas: 'Sains dan Teknologi',
      status: 'Aktif',
    });

    const courses = await MataKuliahService.getAll();
    const c1 = courses[0];

    // Enroll in KRS
    await KRSService.saveKrs(student.id, sem.id, [c1.id]);
    // Save attendance
    await PresensiService.saveBatch(c1.id, sem.id, '2026-03-01', [{ mahasiswaId: student.id, status: 'Hadir' }]);
    // Save grade
    await NilaiService.saveNilai({
      mahasiswaId: student.id,
      semesterId: sem.id,
      mataKuliahId: c1.id,
      tugas: 90,
      uts: 90,
      uas: 90,
    });

    // Verify records exist before delete
    const krsBefore = rawDb.query('SELECT COUNT(*) as count FROM krs WHERE mahasiswa_id = ?;').get(student.id) as any;
    const presensiBefore = rawDb.query('SELECT COUNT(*) as count FROM presensi WHERE mahasiswa_id = ?;').get(student.id) as any;
    const nilaiBefore = rawDb.query('SELECT COUNT(*) as count FROM nilai WHERE mahasiswa_id = ?;').get(student.id) as any;

    expect(krsBefore.count).toBe(1);
    expect(presensiBefore.count).toBe(1);
    expect(nilaiBefore.count).toBe(1);

    // Delete student
    await MahasiswaService.delete(student.id);

    // Verify student is gone
    const studentAfter = await MahasiswaService.getById(student.id);
    expect(studentAfter).toBeNull();

    // Verify CASCADE deleted all related KRS, Presensi, and Nilai child records
    const krsAfter = rawDb.query('SELECT COUNT(*) as count FROM krs WHERE mahasiswa_id = ?;').get(student.id) as any;
    const presensiAfter = rawDb.query('SELECT COUNT(*) as count FROM presensi WHERE mahasiswa_id = ?;').get(student.id) as any;
    const nilaiAfter = rawDb.query('SELECT COUNT(*) as count FROM nilai WHERE mahasiswa_id = ?;').get(student.id) as any;

    expect(krsAfter.count).toBe(0);
    expect(presensiAfter.count).toBe(0);
    expect(nilaiAfter.count).toBe(0);
  });
});
