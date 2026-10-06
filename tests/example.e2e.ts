import { describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('Portal Akademik UBD - End to End Suite', () => {
  test('portal login screen loads and displays UBD academic branding', async ({ app, screen }) => {
    await app.open('/login');
    await expect(screen.getByText('Universitas Buddhi Dharma')).toBeVisible();
    await expect(screen.getByText('PORTAL AKADEMIK TERPADU')).toBeVisible();
    await expect(screen.getByText('Masuk Administrator')).toBeVisible();
    await expect(screen.getByRole('button', 'Tombol Login')).toBeVisible();
  });

  test('quick fill demo fills credentials and successfully logs in to dashboard', async ({ app, screen }) => {
    await app.open('/login');
    await screen.getByRole('button', 'Isi otomatis akun demo administrator').tap();
    await screen.getByRole('button', 'Tombol Login').tap();
    
    // Verifikasi dashboard utama
    await expect(screen.getByText('Halo, ADMIN')).toBeVisible();
    await expect(screen.getByText('Master Data Akademik')).toBeVisible();
    await expect(screen.getByRole('button', 'Data Mahasiswa')).toBeVisible();
    await expect(screen.getByRole('button', 'Data Dosen')).toBeVisible();
  });

  test('navigates to Input Data Mahasiswa tab and displays form inputs', async ({ app, screen }) => {
    await app.open('/login');
    await screen.getByRole('button', 'Isi otomatis akun demo administrator').tap();
    await screen.getByRole('button', 'Tombol Login').tap();
    await expect(screen.getByText('Halo, ADMIN')).toBeVisible();

    // Buka tab Input Data Mahasiswa
    await screen.getByRole('tab', 'Tab Form Input Data Mahasiswa').tap();
    await expect(screen.getByText('Formulir Registrasi Mahasiswa')).toBeVisible();
    await expect(screen.getByText('Kode Mahasiswa (NIM)')).toBeVisible();
    await expect(screen.getByText('Nama Lengkap Mahasiswa')).toBeVisible();
  });

  test('navigates to Rekap Data tab and displays student list', async ({ app, screen }) => {
    await app.open('/login');
    await screen.getByRole('button', 'Isi otomatis akun demo administrator').tap();
    await screen.getByRole('button', 'Tombol Login').tap();
    await expect(screen.getByText('Halo, ADMIN')).toBeVisible();

    // Buka tab Rekap Data
    await screen.getByRole('tab', 'Tab Display & Report Data Mahasiswa').tap();
    await expect(screen.getByText('Direktori & Rekapitulasi Data')).toBeVisible();
    await expect(screen.getByText('Riska')).toBeVisible();
    await expect(screen.getByText('Komarudin')).toBeVisible();
  });

  test('admin can logout back to login screen', async ({ app, screen, browser }) => {
    await app.open('/login');
    await screen.getByRole('button', 'Isi otomatis akun demo administrator').tap();
    await screen.getByRole('button', 'Tombol Login').tap();
    await expect(screen.getByText('Halo, ADMIN')).toBeVisible();

    // Terima dialog konfirmasi pada browser
    await browser.onDialog('accept');
    await screen.getByRole('button', 'Logout Administrator').tap();
    await expect(screen.getByText('Masuk Administrator')).toBeVisible();
  });
});
