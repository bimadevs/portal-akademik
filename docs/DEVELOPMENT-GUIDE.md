# DEVELOPMENT GUIDE: Panduan Pengembangan & Verifikasi
## Mobile Portal Akademik Universitas Buddhi Dharma (UBD)

Dokumen ini adalah panduan pelaksanaan teknis bertahap (*Step-by-Step Implementation Guide*) bagi pengembang manusia maupun AI agent untuk memastikan implementasi berjalan konsisten, modular, dan bebas *bug*.

---

## 1. Rencana Pelaksanaan Bertahap (Phased Milestones)

### Part A (V1 - Baseline)

**Fase 1: Persiapan Dependensi & Aset Visual**
- Pasang paket `@react-native-async-storage/async-storage` via `npx expo install`.
- Siapkan aset grafis header UBD resmi (`assets/images/ubd-logo.png`) dari referensi desain.
- Siapkan banner visual animasi kampus (`assets/images/campus-banner.gif` atau komponen animasi).

**Fase 2: Lapisan Domain & Penyimpanan (Data & Storage Layer)**
- Definisikan kontrak tipe data di `src/types/mahasiswa.ts` (`Mahasiswa`, `Gender`, `Fakultas`, `UserSession`).
- Buat layanan persistensi di `src/services/storage.ts`:
  - `getSession()`, `saveSession()`, `clearSession()`.
  - `getMahasiswaList()`, `saveMahasiswa()`, `deleteMahasiswa()`.
  - `initSeedData()` (injeksi otomatis data Dewi, Komarudin, Jaka, dll).

**Fase 3: Komponen Antarmuka Terpakai Ulang (Reusable UI Components)**
- `src/components/ubd-header.tsx`: Header logo UBD dengan opsional tombol Logout di pojok kanan.
- `src/components/radio-button.tsx`: Komponen radio button bulat `(•)` dan `( )` yang responsif.
- `src/components/faculty-picker.tsx`: Dropdown pilihan fakultas yang bersih dan kompatibel lintas platform.
- `src/components/banner-media.tsx`: Banner animasi header menu utama.

**Fase 4: Autentikasi & Pelindung Sesi (Auth Guard)**
- Modifikasi `src/app/_layout.tsx`: Penyedia konteks sesi (*Session Context Provider*) dan pengarah rute otomatis (*Auth Guard*).
- Buat layar `src/app/login.tsx`: Form login admin dengan validasi kredensial `admin` / `admin` dan tautan Sign-up.

**Fase 5: Bilah Navigasi Bawah & Menu Utama**
- Buat `src/app/(tabs)/_layout.tsx`: Konfigurasi 3 tab (Home, Data Mahasiswa, Report) dengan ikon vektor tajam.
- Buat `src/app/(tabs)/index.tsx`: Dashboard Menu Utama dengan 6 kotak menu grid dan banner animasi.

**Fase 6: Form Input Data Mahasiswa**
- Buat `src/app/(tabs)/mahasiswa.tsx`:
  - Input Kode Mahasiswa (NIM), Nama, Radio Gender, Dropdown Fakultas.
  - Validasi lengkap (wajib isi & NIM unik).
  - Aksi tombol SAVE: simpan ke AsyncStorage lalu arahkan navigasi ke tab Report.

**Fase 7: Layar Report & Interaksi Data Mahasiswa**
- Buat `src/app/(tabs)/report.tsx`:
  - Render list mahasiswa dengan radio button.
  - Seleksi baris aktif.
  - Pop-up alert: `Yang anda Klik : [Nama NIM]` dengan opsi "OK" dan "Hapus Data".
  - Dialog konfirmasi sebelum penghapusan data.

**Fase 8: Pengujian Kualitas & Verifikasi (QA & Typecheck)**
- Jalankan pemeriksaan lint: `npx expo lint`.
- Jalankan pemeriksaan tipe data: `npx tsc --noEmit`.
- Verifikasi skenario manual pada matriks QA.

### Part B (V2 - Expansion)

**Fase 9: Migrasi Persistensi ke SQLite**
- Pasang `expo-sqlite` via `npx expo install expo-sqlite`.
- Buat modul database di `src/services/database.ts`: inisialisasi DB, create tables, seed data.
- Definisikan schema 9 tabel (sessions, semesters, mahasiswa, dosen, mata_kuliah, jadwal, krs, presensi, nilai) dengan foreign key constraints.
- Migrasi AuthService dan MahasiswaService dari AsyncStorage ke SQLite.
- Hapus dependency `@react-native-async-storage/async-storage`.
- Update `src/types/mahasiswa.ts` dengan tipe baru (StatusMahasiswa, Hari, NilaiHuruf, StatusPresensi, Semester, Dosen, MataKuliah, Jadwal, KRS, Presensi, Nilai).

**Fase 10: Enhanced Mahasiswa Module**
- Tambah field `status` ke interface Mahasiswa dan tabel SQLite.
- Buat layar edit mahasiswa (form pre-filled) di flow Report.
- Tambah chip filter status (Semua/Aktif/Cuti/Tidak Aktif/Lulus) di report.tsx.
- Tambah search bar di report.tsx (filter nama/NIM/fakultas).
- Buat layar detail mahasiswa di `src/app/mahasiswa-detail/[id].tsx`.

**Fase 11: Modul Dosen & Mata Kuliah**
- Buat service `src/services/dosen-service.ts` (CRUD, validasi NIDN unik, seed data).
- Buat service `src/services/mata-kuliah-service.ts` (CRUD, validasi kode unik, relasi dosen).
- Buat layar-layar:
  - `src/app/dosen/index.tsx` (list + search)
  - `src/app/dosen/form.tsx` (tambah/edit)
  - `src/app/dosen/[id].tsx` (detail)
  - `src/app/mata-kuliah/index.tsx` (list + search)
  - `src/app/mata-kuliah/form.tsx` (tambah/edit)
  - `src/app/mata-kuliah/[id].tsx` (detail)
- Buat komponen `src/components/search-bar.tsx` (reusable search input).
- Update `src/components/academic-grid.tsx`: navigasi grid Jadwal/Dosen → dosen/index, KRS/Dokumen → mata-kuliah/index.
- Inject seed data 8 dosen + 12 matkul.

**Fase 12: Modul Jadwal Kuliah**
- Buat service `src/services/jadwal-service.ts` (CRUD, validasi bentrok, query per hari).
- Buat layar:
  - `src/app/jadwal/index.tsx` (list per hari + chip filter + search)
  - `src/app/jadwal/form.tsx` (tambah/edit jadwal)
- Buat komponen `src/components/day-filter-chips.tsx` (chip Senin–Sabtu).
- Update grid menu navigasi.
- Inject seed data 10 jadwal.

**Fase 13: Modul KRS**
- Buat service `src/services/krs-service.ts` (assign matkul ke mahasiswa per semester, total SKS, riwayat).
- Buat layar:
  - `src/app/krs/index.tsx` (pilih mahasiswa aktif + search)
  - `src/app/krs/[mahasiswaId].tsx` (checklist matkul + total SKS + simpan)
- Filter semester historis (dropdown).
- Update grid menu navigasi.

**Fase 14: Modul Presensi**
- Buat service `src/services/presensi-service.ts` (catat kehadiran, rekap per matkul per mahasiswa).
- Buat layar:
  - `src/app/presensi/index.tsx` (pilih matkul + tanggal)
  - `src/app/presensi/checklist.tsx` (list mahasiswa dari KRS, toggle hadir/izin/sakit/alpha)
  - `src/app/presensi/rekap.tsx` (rekap kehadiran + search)
- Update grid menu navigasi.

**Fase 15: Modul Prestasi & IPK**
- Buat service `src/services/nilai-service.ts` (input nilai, konversi bobot, hitung IPS/IPK, transkrip).
- Buat layar:
  - `src/app/nilai/index.tsx` (pilih matkul semester aktif)
  - `src/app/nilai/input.tsx` (list mahasiswa dari KRS, picker nilai huruf)
  - `src/app/nilai/transkrip/[mahasiswaId].tsx` (transkrip lengkap per semester + IPS + IPK)
- Update grid menu navigasi.

**Fase 16: Kartu Mahasiswa Digital**
- Pasang `react-native-qrcode-svg` dan `react-native-svg` via `npx expo install`.
- Buat layar:
  - `src/app/kartu/index.tsx` (pilih/search mahasiswa)
  - `src/app/kartu/[mahasiswaId].tsx` (tampilan kartu digital + QR code)
- Komponen kartu: avatar inisial, data lengkap, QR, branding UBD.
- Update grid menu navigasi.

**Fase 17: Statistik Dashboard**
- Buat service `src/services/statistik-service.ts` (query aggregate: count per fakultas, gender, avg IPK, avg kehadiran).
- Update `src/app/(tabs)/index.tsx`:
  - Stat cards: Total Mahasiswa, Total Dosen, Total Matkul.
  - Bar chart mahasiswa per fakultas.
  - Pie chart distribusi gender.
  - Card IPK rata-rata + Kehadiran rata-rata.
- Buat komponen chart: `src/components/bar-chart.tsx`, `src/components/pie-chart.tsx`.

**Fase 18: Layar Pengaturan**
- Buat service `src/services/semester-service.ts` (CRUD semester, switch aktif).
- Buat layar `src/app/settings.tsx`:
  - Picker semester aktif (buat baru / pilih existing).
  - Tombol Reset Data + konfirmasi dialog.
  - Info aplikasi (versi 2.0.0, logo UBD).
  - Profil admin (username yang login).
- Tambah ikon gear di header Home untuk navigasi ke settings.

**Fase 19: QA Final & Verifikasi V2**
- Jalankan `npx expo lint` dan `npx tsc --noEmit`.
- Verifikasi seluruh test case V2.
- Pastikan integritas referensial SQLite.
- Demo end-to-end seluruh modul.

### Part C (V3 - Professional Enterprise Expansion)

**Fase 20: Pustaka Dokumen & Template Ekspor PDF**
- Pasang pustaka `expo-print` dan `expo-sharing` via `npx expo install expo-print expo-sharing`.
- Buat service `src/services/pdf-service.ts`:
  - `generateKRSPdf(mahasiswa, krsItems, semester)`: Render dokumen KRS ber-kop surat resmi UBD, data mahasiswa, tabel mata kuliah, tanda tangan, dan verifikasi QR.
  - `generateKHSPdf(mahasiswa, nilaiItems, semester, ips, ipk)`: Render lembar KHS/Transkrip Nilai resmi dengan tanda tangan BAAK.
  - `generatePresensiPdf(mataKuliah, rekapList)`: Render berita acara absensi kelas.
  - `shareStudentCard(mahasiswa)`: Mekanisme berbagi kartu mahasiswa digital.
- Tambahkan tombol aksi ekspor pada layar terkait (`krs/[mahasiswaId].tsx`, `nilai/[mahasiswaId].tsx`, `presensi/rekap.tsx`, `kartu/[mahasiswaId].tsx`).

**Fase 21: Mesin Penegakan Aturan Akademik (Academic Rules)**
- Buat service `src/services/academic-rules-service.ts`:
  - `getMaxSksForStudent(mahasiswaId, currentSemesterId)`: Kalkulasi beban SKS maksimal berdasarkan IPS semester sebelumnya (standar Dikti: 15-24 SKS, semester 1 = 20 SKS).
  - `checkAttendanceEligibility(mahasiswaId, mataKuliahId, semesterId)`: Cek apakah kehadiran >= 75%.
- Update UI `src/app/krs/[mahasiswaId].tsx`:
  - Tampilkan kuota SKS dan indikator batas.
  - Nonaktifkan tombol simpan jika over-quota.
  - Sediakan toggle "Dispensasi SKS Dekanat" + form catatan dispensasi.
- Update UI `src/app/nilai/index.tsx` & input nilai:
  - Tampilkan lencana peringatan ("Kehadiran < 75%") bagi mahasiswa yang kurang absensi.

**Fase 22: Cadangan & Pemulihan Basis Data (Backup & Restore)**
- Buat service `src/services/backup-restore-service.ts`:
  - `exportBackupJson()`: Ekspor seluruh tabel database ke berkas `.json` terstruktur dengan checksum dan buka via `expo-sharing`.
  - `importRestoreJson(jsonString)`: Validasi skema, parsing, dan jalankan transaksi atomik `PRAGMA foreign_keys = OFF; ...; PRAGMA foreign_keys = ON;`.
- Update UI `src/app/pengaturan/index.tsx`:
  - Tambahkan grup menu "Cadangan & Pemulihan Data" (Tombol Backup & Tombol Restore).

**Fase 23: Audit Log Aktivitas Administratif**
- Tambahkan tabel `audit_logs` pada `src/services/database.ts` dengan indeks performa.
- Buat service `src/services/audit-service.ts`:
  - `logActivity(action, entity, entityId, details, actor)`: Simpan riwayat mutasi kritis.
  - `getAuditLogs(filterAction?, limit?)`: Ambil daftar audit log terurut.
- Buat layar `src/app/pengaturan/audit-log.tsx`:
  - Daftar riwayat kronologis, filter jenis aksi, pencarian, dan visual badge aksi.
- Rekam aktivitas kritis pada mutasi nilai, dispensasi SKS, ganti status mahasiswa, dan restore data.

**Fase 24: QA Final V3 & Verifikasi Ekspor Dokumen**
- Jalankan `npx expo lint` dan `npx tsc --noEmit`.
- Verifikasi pencetakan PDF di Android, iOS, dan Web.
- Verifikasi alur dispensasi SKS dan pencatatan audit log.
- Verifikasi backup JSON dan pemulihan database tanpa kehilangan relasi data.

---

## 2. Matriks Rencana Pengujian Manual (QA Test Cases)

| ID Uji | Skenario Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| **TC-01** | Login Berhasil | Masukkan `admin` / `admin` lalu klik LOGIN | Masuk ke Menu Utama, sesi tersimpan | [ ] |
| **TC-02** | Login Gagal | Masukkan `user_salah` / `pass_salah` lalu klik LOGIN | Muncul alert: *"User atau Password salah!"* | [ ] |
| **TC-03** | Tautan Sign-up | Klik tautan *"Sign-up"* di layar login | Muncul dialog petunjuk pendaftaran admin | [ ] |
| **TC-04** | Auto-login | Tutup aplikasi saat sesi aktif, buka kembali | Langsung masuk ke Menu Utama tanpa ke layar login | [ ] |
| **TC-05** | Logout | Klik tombol logout di pojok kanan atas Menu Utama | Sesi dihapus, kembali ke layar login | [ ] |
| **TC-06** | 6 Menu Grid | Klik menu non-mahasiswa di Menu Utama | Muncul dialog info: *"Fitur dalam pengembangan"* | [ ] |
| **TC-07** | Navigasi Tab | Sentuh tab Home, Mahasiswa, dan Report | Perpindahan layar mulus tanpa lag | [ ] |
| **TC-08** | Input Validasi Kosong | Kosongkan salah satu field lalu klik SAVE | Muncul alert: *"Harap lengkapi semua data mahasiswa!"* | [ ] |
| **TC-09** | Input Validasi Duplikasi | Masukkan NIM yang sudah ada (misal `2021010001`) | Muncul alert: *"Kode Mahasiswa/NIM sudah terdaftar!"* | [ ] |
| **TC-10** | Simpan Mahasiswa Baru | Masukkan data valid lalu klik SAVE | Data tersimpan, form direset, pindah ke Report | [ ] |
| **TC-11** | Klik Baris Report | Sentuh salah satu baris mahasiswa (misal: Dewi) | Radio aktif `(•)`, muncul alert *"Yang anda Klik : ..."* | [ ] |
| **TC-12** | Hapus Data Mahasiswa | Pilih opsi "Hapus Data" lalu konfirmasi "Hapus" | Data terhapus permanen dari list dan storage | [ ] |
| **TC-13** | Seed Data Persistence | Buka aplikasi pertama kali | Daftar memuat minimal 7 mahasiswa bawaan | [ ] |
| **TC-14** | Edit Mahasiswa | Klik baris di Report → Edit → ubah nama → SAVE | Nama berubah di daftar | [ ] |
| **TC-15** | Status Mahasiswa | Edit mahasiswa → ubah status ke "Cuti" | Status berubah, mahasiswa tidak muncul di KRS/presensi | [ ] |
| **TC-16** | Filter Status Report | Klik chip "Aktif" di Report | Hanya mahasiswa Aktif yang tampil | [ ] |
| **TC-17** | Search Report | Ketik "Dewi" di search bar Report | Hanya Dewi yang tampil | [ ] |
| **TC-18** | Tambah Dosen | Isi form dosen lengkap → SAVE | Dosen tersimpan, muncul di daftar | [ ] |
| **TC-19** | Duplikasi NIDN | Input NIDN yang sudah ada | Alert "NIDN sudah terdaftar!" | [ ] |
| **TC-20** | Tambah Mata Kuliah | Isi form matkul + pilih dosen pengampu → SAVE | Matkul tersimpan dengan relasi dosen | [ ] |
| **TC-21** | Tambah Jadwal | Isi jadwal Senin 08:00-09:40 → SAVE | Jadwal muncul di list hari Senin | [ ] |
| **TC-22** | Bentrok Jadwal | Input jadwal di hari+jam+ruangan yang sama | Alert "Jadwal bentrok!" | [ ] |
| **TC-23** | Filter Jadwal Per Hari | Klik chip "Selasa" | Hanya jadwal Selasa yang tampil | [ ] |
| **TC-24** | Assign KRS | Pilih mahasiswa → centang 3 matkul → SIMPAN | KRS tersimpan, total SKS benar | [ ] |
| **TC-25** | KRS Semester Historis | Ganti filter semester ke semester lama | KRS semester lama tampil | [ ] |
| **TC-26** | Catat Presensi | Pilih matkul + tanggal → toggle kehadiran → SIMPAN | Presensi tersimpan per mahasiswa | [ ] |
| **TC-27** | Rekap Presensi | Buka rekap presensi matkul tertentu | Persentase kehadiran per mahasiswa tampil | [ ] |
| **TC-28** | Input Nilai | Pilih matkul → input nilai A/B/C per mahasiswa → SIMPAN | Nilai tersimpan dengan bobot benar | [ ] |
| **TC-29** | Kalkulasi IPS | Buka transkrip mahasiswa yang punya nilai | IPS = Σ(Bobot×SKS)/Σ(SKS) benar | [ ] |
| **TC-30** | Kalkulasi IPK | Mahasiswa punya nilai di 2 semester | IPK kumulatif benar | [ ] |
| **TC-31** | Kartu Mahasiswa | Pilih mahasiswa → lihat kartu | Kartu menampilkan semua info + QR code | [ ] |
| **TC-32** | Statistik Dashboard | Buka Home setelah ada data lengkap | Chart fakultas, gender, IPK, kehadiran tampil | [ ] |
| **TC-33** | Ganti Semester | Buka Pengaturan → pilih semester baru | Semester aktif berubah, KRS/presensi/nilai mengacu semester baru | [ ] |
| **TC-34** | Reset Data | Pengaturan → Reset → Konfirmasi | Semua data kembali ke seed awal | [ ] |
| **TC-35** | Detail Mahasiswa | Klik "Lihat Detail" di Report | Profil lengkap + ringkasan KRS/presensi/IPK | [ ] |
| **TC-36** | Search Dosen | Ketik nama di search bar daftar dosen | Filter real-time berfungsi | [ ] |
| **TC-37** | Search Matkul | Ketik kode MK di search bar | Filter real-time berfungsi | [ ] |
| **TC-38** | Integritas Referensial | Coba hapus dosen yang mengampu matkul | Sistem mencegah penghapusan / menampilkan peringatan | [ ] |
| **TC-39** | Cetak KRS PDF | Di layar KRS klik "Cetak KRS (PDF)" | PDF terkompilasi dengan kop surat UBD dan lembar dialog share muncul | [ ] |
| **TC-40** | Cetak KHS / Transkrip | Di layar Nilai klik "Cetak KHS / Transkrip" | PDF memuat riwayat nilai, SKS, IPS, IPK, dan tanda tangan BAAK | [ ] |
| **TC-41** | Ekspor Berita Acara Presensi | Di layar Rekap Presensi klik "Ekspor PDF" | PDF memuat rekap kehadiran seluruh mahasiswa kelas | [ ] |
| **TC-42** | Pembatasan Kuota SKS | Centang matkul melebihi kuota IPS (misal >18 SKS) | Tombol simpan terkunci, muncul peringatan batas beban SKS | [ ] |
| **TC-43** | Dispensasi SKS Dekanat | Aktifkan toggle dispensasi dan isi nomor surat | Tombol simpan aktif, tersimpan dan tercatat di Audit Log | [ ] |
| **TC-44** | Peringatan Presensi 75% | Buka input nilai untuk mahasiswa dengan absen <75% | Muncul lencana peringatan visual "Kehadiran < 75%" | [ ] |
| **TC-45** | Cadangkan Data (Backup) | Di Pengaturan klik "Cadangkan Data (JSON)" | Berkas JSON lengkap tersimpan/dibagikan via dialog sistem | [ ] |
| **TC-46** | Pulihkan Data (Restore) | Unggah file JSON cadangan dan konfirmasi | Seluruh data dipulihkan secara atomik tanpa merusak skema | [ ] |
| **TC-47** | Catat Audit Log | Ubah nilai mahasiswa atau status ke Cuti | Catatan baru muncul di layar Audit Log dengan detail mutasi | [ ] |
| **TC-48** | Pencarian & Filter Audit Log | Buka Audit Log, filter berdasarkan aksi | Daftar riwayat memfilter sesuai kategori aksi yang dipilih | [ ] |

---

## 3. Pedoman Kerja untuk Developer & AI Agent

1. **Jaga Integritas Desain**: Jangan mengubah tata letak antarmuka yang sudah disepakati di `docs/SYSTEM-DESIGN.md` dan gambar referensi dosen.
2. **Tanpa Tipe `any`**: Semua parameter, state, dan properti komponen harus memiliki pengetikan TypeScript eksplisit.
3. **Patuhi Definisi Glosarium**: Selalu gunakan istilah kanonik dari `GLOSSARY.md` (misal: gunakan `nim` untuk Kode Mahasiswa).
4. **Verifikasi Sebelum Selesai**: Selalu jalankan `npx expo lint` dan `npx tsc --noEmit` untuk memastikan tidak ada kesalahan sebelum menandai tugas selesai.
5. **Gunakan expo-sqlite**: Semua operasi data melalui prepared statements. Jangan pernah string-concatenate SQL queries.
6. **Foreign Key Enforcement**: Aktifkan `PRAGMA foreign_keys = ON` saat koneksi database dibuka.
7. **Service Layer Pattern**: Setiap entitas domain memiliki service file sendiri di `src/services/`. Layar UI tidak boleh langsung mengakses database.
8. **Komponen Reusable**: Search bar, chip filter, form inputs harus dijadikan komponen reusable di `src/components/`.
9. **Seed Data Konsisten**: Semua seed data di-inject dalam satu transaksi saat first-run. Jika salah satu gagal, semua di-rollback.
