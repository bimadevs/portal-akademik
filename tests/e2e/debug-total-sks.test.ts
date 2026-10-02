// Debug test for total SKS calculation
import { describe, it, expect, beforeEach } from 'bun:test';
import './harness/test-env';
import { resetTestDatabase } from './harness/test-db';
import { MahasiswaService } from '@/services/mahasiswa-service';
import { SemesterService } from '@/services/semester-service';
import { MataKuliahService } from '@/services/mata-kuliah-service';
import { KRSService } from '@/services/krs-service';
import { NilaiService } from '@/services/nilai-service';

describe('Debug total SKS', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('enroll two courses and check total SKS', async () => {
    const student = await MahasiswaService.create({
      nim: '2024029999',
      nama: 'Debug Student',
      jenisKelamin: 'PRIA',
      fakultas: 'Sains dan Teknologi',
      status: 'Aktif',
    });
    const sem = (await SemesterService.getActive())!;
    const allCourses = await MataKuliahService.getAll();
    const c1 = allCourses[0];
    const c2 = allCourses[1];
    console.log('c1 id', c1.id, 'sks', c1.sks);
    console.log('c2 id', c2.id, 'sks', c2.sks);
    await KRSService.saveKrs(student.id, sem.id, [c1.id, c2.id]);
    const total = await KRSService.getTotalSks(student.id, sem.id);
    console.log('totalSks from DB:', total);
    const krsEntries = await KRSService.getByMahasiswaAndSemester(student.id, sem.id);
    console.log('KRS entries count:', krsEntries.length);
    // assertions for debugging
    expect(total).toBe(c1.sks + c2.sks);
  });
});
