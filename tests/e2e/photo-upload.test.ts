import { describe, it, expect, beforeEach } from 'bun:test';
import './harness/test-env';
import { resetTestDatabase } from './harness/test-db';
import { MahasiswaService } from '@/services/mahasiswa-service';
import { DosenService } from '@/services/dosen-service';

describe('Photo Feature: Dosen and Mahasiswa Profile Photos', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('verifies seed lecturers and students have dummy photo URLs', async () => {
    const dosens = await DosenService.getAll();
    expect(dosens.length).toBeGreaterThan(0);
    // Dr. Budi Santoso should have photo URL
    const budi = dosens.find((d) => d.nidn === '0101010101');
    expect(budi).toBeDefined();

    const students = await MahasiswaService.getAll();
    expect(students.length).toBeGreaterThan(0);
    // Dewi should have photo URL
    const dewi = students.find((s) => s.nim === '2021010001');
    expect(dewi).toBeDefined();
  });

  it('creates and retrieves a dosen with a photo URL', async () => {
    const fotoUrl = 'file:///data/photos/dosen_123.jpg';
    const created = await DosenService.create({
      nidn: '9988776655',
      nama: 'Dr. Foto Test',
      fakultas: 'Sains dan Teknologi',
      gender: 'PRIA',
      telepon: '08123456789',
      prodi: 'Teknik Informatika',
      fotoUrl,
    });

    expect(created.id).toBeDefined();
    expect(created.fotoUrl).toBe(fotoUrl);

    const fetched = await DosenService.getById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.fotoUrl).toBe(fotoUrl);
  });

  it('updates a dosen photo URL', async () => {
    const created = await DosenService.create({
      nidn: '9988776644',
      nama: 'Prof. Update Foto',
      fakultas: 'Bisnis',
      gender: 'WANITA',
      telepon: '08987654321',
      prodi: 'Manajemen',
    });

    const newPhoto = 'file:///data/photos/new_dosen.jpg';
    await DosenService.update(created.id, { fotoUrl: newPhoto });

    const updated = await DosenService.getById(created.id);
    expect(updated?.fotoUrl).toBe(newPhoto);

    // Remove photo
    await DosenService.update(created.id, { fotoUrl: null });
    const cleared = await DosenService.getById(created.id);
    expect(cleared?.fotoUrl).toBeNull();
  });

  it('creates and retrieves a mahasiswa with a photo URL', async () => {
    const fotoUrl = 'file:///data/photos/mhs_123.jpg';
    const created = await MahasiswaService.create({
      nim: '2025019999',
      nama: 'Mahasiswa Foto Test',
      jenisKelamin: 'WANITA',
      fakultas: 'Ilmu Komunikasi dan Desain',
      fotoUrl,
    });

    expect(created.id).toBeDefined();
    expect(created.fotoUrl).toBe(fotoUrl);

    const fetched = await MahasiswaService.getById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.fotoUrl).toBe(fotoUrl);
  });

  it('updates a mahasiswa photo URL', async () => {
    const created = await MahasiswaService.create({
      nim: '2025018888',
      nama: 'Mahasiswa Update Foto',
      jenisKelamin: 'PRIA',
      fakultas: 'Sosial dan Humaniora',
    });

    const newPhoto = 'file:///data/photos/new_mhs.jpg';
    await MahasiswaService.update(created.id, { fotoUrl: newPhoto });

    const updated = await MahasiswaService.getById(created.id);
    expect(updated?.fotoUrl).toBe(newPhoto);

    // Remove photo
    await MahasiswaService.update(created.id, { fotoUrl: null });
    const cleared = await MahasiswaService.getById(created.id);
    expect(cleared?.fotoUrl).toBeNull();
  });
});
