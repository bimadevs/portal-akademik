# PRD: Product Requirements Document
## Mobile Portal Akademik Universitas Buddhi Dharma (UBD)

- **Versi**: 2.0.0
- **Status**: Disetujui (Approved)
- **Target Platform**: Mobile (Android, iOS, Web via Expo)
- **Framework**: Expo SDK 57 (React Native 0.86, React 19, TypeScript)

---

## 1. Visi & Tujuan Produk

### 1.1 Visi
Menghadirkan aplikasi mobile portal akademik yang intuitif, ringan, dan andal bagi sivitas akademika Universitas Buddhi Dharma untuk mencatat, mengelola, dan memonitor data mahasiswa, manajemen dosen, jadwal kuliah, Kartu Rencana Studi (KRS), presensi kampus, serta input nilai akademik secara langsung dari perangkat mobile.

### 1.2 Tujuan Utama (Goals)
1. **Memenuhi Spesifikasi Dosen**: Merealisasikan 100% tata letak dan alur fungsional pada gambar referensi (`login.jpeg`, `menu-utama.jpeg`, `input data mahasiwa & display data mahasiswa.jpeg`).
2. **Pengalaman Pengguna Tanpa Hambatan (*Seamless UX*)**: Memberikan navigasi yang responsif, validasi data yang jelas, serta umpan balik visual instan pada setiap interaksi.
3. **Persistensi Data Lokal yang Tangguh**: Memastikan data mahasiswa dan sesi login admin tersimpan secara persisten di penyimpanan perangkat (*offline-first*), bahkan setelah aplikasi ditutup atau direstart.
4. **Manajemen Siklus Akademik Berkelanjutan**: Mengakomodasi seluruh operasional akademik mulai dari penginputan data master (dosen, matkul), penjadwalan, pengambilan KRS, hingga presensi harian dan rekapitulasi IPK mahasiswa.

### 1.3 Bukan Sasaran (Non-Goals)
- Tidak membangun backend server mandiri (REST API / GraphQL) pada fase ini.
- Tidak mengimplementasikan integrasi pembayaran bank (KRS berbayar) atau modul nilai kompleks.
- Tidak membangun fitur multi-role yang rumit di luar kebutuhan hak akses Admin Akademik.

---

## 2. Persona Pengguna

### Persona: Administrator Akademik Kampus
- **Peran**: Staf administrasi program studi di UBD.
- **Kebutuhan**:
  - Masuk ke sistem dengan cepat menggunakan akun admin.
  - Memasukkan data mahasiswa baru (NIM, Nama Lengkap, Jenis Kelamin, Fakultas).
  - Melihat rekapitulasi data mahasiswa yang sudah tersimpan dalam daftar yang terstruktur.
  - Memeriksa detail mahasiswa dengan menyentuh baris data dan dapat menghapus data yang keliru.
  - Mengelola data master seperti dosen dan mata kuliah.
  - Mengatur jadwal kuliah untuk setiap semester aktif.
  - Menugaskan dan memvalidasi pengisian Kartu Rencana Studi (KRS) untuk mahasiswa.
  - Mencatat rekap presensi kampus mahasiswa pada setiap pertemuan.
  - Menginput nilai ujian, menghasilkan transkrip, dan melakukan perhitungan IPK secara otomatis.
  - Mencetak dan memeriksa kartu mahasiswa digital yang valid.
- **Titik Sakit (*Pain Points*)**:
  - Aplikasi mobile yang lambat atau memerlukan internet stabil saat demonstrasi lapangan.
  - Form input yang tidak memvalidasi data kosong sehingga data menjadi berantakan.
  - Manajemen data relasional yang rumit apabila data tidak saling tersinkronisasi dengan baik.

---

## 3. Fitur Utama & Spesifikasi Fungsional

### Fitur 1: Autentikasi Administrator & Manajemen Sesi
- **Layar Login**:
  - Menampilkan logo resmi Universitas Buddhi Dharma beserta motto *"Kreativitas Membangkitkan Inovasi"*.
  - Input field `User` (teks biasa).
  - Input field `Password` (karakter tersembunyi / *secure text entry*).
  - Tautan teks `Sign-up`: Menampilkan dialog informasi bantuan pendaftaran admin.
  - Tombol aksi `LOGIN`: Memvalidasi kredensial default (`admin` / `admin`).
- **Manajemen Sesi (*Auto-login*)**:
  - Jika admin telah login, status sesi disimpan di penyimpanan lokal. Saat aplikasi dibuka kembali, pengguna langsung diarahkan ke Menu Utama.
  - Tombol **Logout** disediakan di pojok kanan atas Header Menu Utama untuk keluar dari sesi dan kembali ke Layar Login.

### Fitur 2: Dashboard Menu Utama
- **Banner Media Animasi**:
  - Area banner di bawah header yang menampilkan animasi/gambar kampus UBD (merepresentasikan placeholder `[GIF]` pada mockup).
- **6 Grid Menu Akademik**:
  1. *Data Mahasiswa* (Ikon Topi Toga): Membuka form input data mahasiswa.
  2. *Jadwal Kuliah / Dosen* (Ikon Guru Mengajar): Menampilkan dialog "Fitur sedang dalam pengembangan".
  3. *KRS / Dokumen* (Ikon Berkas): Menampilkan dialog "Fitur sedang dalam pengembangan".
  4. *Kartu Mahasiswa* (Ikon ID Card): Menampilkan dialog "Fitur sedang dalam pengembangan".
  5. *Presensi & Catatan* (Ikon Buku & Gadget): Menampilkan dialog "Fitur sedang dalam pengembangan".
  6. *Prestasi Akademik* (Ikon Piala): Menampilkan dialog "Fitur sedang dalam pengembangan".
- **Bottom Navigation Bar (3 Tab)**:
  - Tab 1: **Home** (Menu Utama)
  - Tab 2: **Data Mahasiswa** (Form Input)
  - Tab 3: **Report** (Display Data Mahasiswa)

### Fitur 3: Form Input Data Mahasiswa
- **Field Masukan**:
  1. `Kode Mahasiswa` (Input Teks, representasi kanonik dari NIM).
  2. `Nama Mahasiswa` (Input Teks).
  3. `Jenis Kelamin` (Radio Button: `PRIA` dan `WANITA`).
  4. `Fakultas` (Komponen Dropdown / Picker dengan 4 opsi resmi UBD: *Sains dan Teknologi*, *Bisnis*, *Ilmu Komunikasi dan Desain*, *Sosial dan Humaniora*).
- **Aksi Tombol `SAVE`**:
  - Validasi: Memastikan semua kolom telah terisi dan NIM belum terdaftar sebelumnya.
  - Penyimpanan: Menyimpan data baru ke dalam daftar mahasiswa di penyimpanan lokal.
  - Pengalihan (*Redirect*): Mengosongkan form dan otomatis memindahkan navigasi ke layar **Report** untuk menampilkan data yang baru saja disimpan.

### Fitur 4: Display & Report Data Mahasiswa
- **Daftar Rekapitulasi (Radio List)**:
  - Menampilkan daftar mahasiswa dalam urutan terstruktur dengan format: `[Nama Mahasiswa] [NIM]` (contoh: *"Dewi 2021010001"*).
  - Setiap baris memiliki indikator radio button di sisi kiri.
  - Data bawaan (*Seed Data*) diinisialisasi otomatis saat pertama kali aplikasi diinstal (memuat nama-nama sesuai mockup: Dewi, Komarudin, Jaka, Melati, Mawar, Riska, Yanti).
- **Interaktivitas Klik Baris**:
  - Saat suatu baris disentuh, radio button baris tersebut aktif bertitik hitam `(•)` (seperti Dewi pada mockup).
  - Memunculkan dialog alert dengan judul/pesan:
    `Yang anda Klik : [Nama Mahasiswa] [NIM]`
  - Dialog memiliki 2 tombol aksi:
    1. **OK / Tutup**: Menutup dialog tanpa aksi tambahan.
    2. **Hapus Data**: Membuka dialog konfirmasi penghapusan: *"Apakah Anda yakin ingin menghapus data [Nama] ([NIM])?"*. Jika dikonfirmasi, data terhapus dari penyimpanan dan daftar seketika ter-update.

**Fitur 5: Manajemen Data Dosen**
- CRUD dosen: NIDN, Nama Lengkap, Jenis Kelamin, Fakultas, No. Telepon
- List dosen dengan search bar (nama/NIDN/fakultas)
- Seed data: 8 dosen fiktif tersebar di 4 fakultas

**Fitur 6: Manajemen Mata Kuliah**
- CRUD mata kuliah: Kode MK, Nama MK, SKS (1-6), Fakultas, Dosen Pengampu (picker relasi ke dosen)
- List matkul dengan search bar (kode/nama/fakultas)
- Seed data: 12 matkul realistis

**Fitur 7: Jadwal Kuliah**
- CRUD jadwal: Hari (Senin–Sabtu), Jam Mulai, Jam Selesai, Mata Kuliah (picker), Ruangan
- Tampilan list view per hari dengan filter chip hari
- Validasi bentrok jadwal (hari + jam + ruangan)
- Search berdasarkan matkul/dosen/ruangan

**Fitur 8: Kartu Rencana Studi (KRS)**
- Alur: Admin pilih mahasiswa (status Aktif) → checklist mata kuliah yang diambil semester aktif
- Perhitungan total SKS otomatis
- Simpan relasi mahasiswa ↔ matkul ↔ semester ke database
- Lihat KRS per mahasiswa per semester dengan filter semester historis

**Fitur 9: Presensi Kampus**
- Pilih mata kuliah (semester aktif) + tanggal pertemuan
- Checklist kehadiran: list mahasiswa yang punya KRS di matkul tersebut. Status: Hadir / Izin / Sakit / Alpha
- Rekap kehadiran per mahasiswa per matkul (total hadir / total pertemuan + persentase)

**Fitur 10: Prestasi Akademik & IPK**
- Input nilai huruf (A/B+/B/C+/C/D/E) per mahasiswa per matkul per semester
- Konversi otomatis ke bobot: A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D=1.0, E=0.0
- Kalkulasi IPS (Indeks Prestasi Semester) = Σ(Bobot×SKS) / Σ(SKS) per semester
- Kalkulasi IPK (Indeks Prestasi Kumulatif) = Σ(Bobot×SKS) / Σ(SKS) seluruh semester
- Transkrip nilai per mahasiswa
- Distribusi nilai per matkul (berapa A, B, dst.)

**Fitur 11: Kartu Mahasiswa Digital**
- Pilih/search mahasiswa → tampilkan kartu digital
- Informasi kartu: Avatar inisial gradient, Nama, NIM, Fakultas, Jenis Kelamin, Tahun Masuk, Status (Aktif/Cuti/Tidak Aktif/Lulus)
- QR Code berisi NIM
- Branding UBD (logo + motto)

**Fitur 12: Statistik Dashboard**
- Stat cards enhanced: Total Mahasiswa, Total Dosen, Total Matkul
- Bar chart mahasiswa per fakultas
- Pie chart distribusi gender
- IPK rata-rata seluruh mahasiswa aktif
- Persentase kehadiran rata-rata semester aktif
- Jumlah matkul aktif semester ini

**Fitur 13: Pengaturan Sistem**
- Layar Pengaturan diakses dari ikon gear di header Home
- Ganti semester aktif (buat baru atau pilih yang ada)
- Reset data (hapus semua, kembalikan ke seed awal, dengan konfirmasi)
- Info aplikasi (versi, credits, logo UBD)
- Profil admin yang sedang login

**Fitur 14: Enhanced Mahasiswa**
- Edit data mahasiswa (form pre-filled)
- Status mahasiswa: Aktif / Cuti / Tidak Aktif / Lulus
- Filter status di Report (chip filter)
- Search bar di Report (nama/NIM/fakultas)
- Detail view mahasiswa (profil lengkap + links ke KRS, presensi, nilai)

---

## 4. Kriteria Keberhasilan & Rubrik Evaluasi Akademik

| No | Kriteria Evaluasi | Indikator Keberhasilan |
|---|---|---|
| 1 | **Fidelity Antarmuka** | Tampilan Login, Menu Utama, Input Form, dan Report persis dengan gambar referensi dosen. |
| 2 | **Fungsionalitas Autentikasi** | Login berhasil dengan `admin`/`admin`, proteksi navigasi aktif, dan logout berfungsi sempurna. |
| 3 | **Fungsionalitas CRUD & Flow** | Input mahasiswa tersimpan dan langsung muncul di Report; klik item memunculkan alert format `Yang anda Klik : [Nama NIM]`. |
| 4 | **Integritas Data** | Form memblokir input kosong dan duplikasi NIM. Data mahasiswa dan sesi tidak hilang saat aplikasi ditutup (*persistent*). |
| 5 | **Kerapian Kode & Standar** | Ditulis dalam TypeScript murni, tanpa *lint error*, mengikuti struktur modular Expo Router. |
| 6 | **Kelengkapan Modul Akademik** | Seluruh 6 modul grid (Data Mahasiswa, Jadwal, KRS, Kartu, Presensi, Prestasi) fungsional sepenuhnya, bukan placeholder. |
| 7 | **Integritas Relasional** | Data antar modul (Mahasiswa ↔ KRS ↔ Matkul ↔ Dosen ↔ Presensi ↔ Nilai) konsisten dan terhubung melalui SQLite foreign keys. |
| 8 | **Kalkulasi Akademik** | IPS dan IPK dihitung otomatis dan akurat sesuai rumus standar universitas Indonesia. |
