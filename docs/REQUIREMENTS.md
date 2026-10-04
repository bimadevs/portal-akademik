# REQUIREMENTS: Spesifikasi Kebutuhan Sistem
## Portal Akademik Universitas Buddhi Dharma (UBD)

Dokumen ini mendokumentasikan rincian spesifikasi kebutuhan fungsional (*Functional Requirements*) dan non-fungsional (*Non-Functional Requirements*) beserta kriteria penerimaan formal (*Acceptance Criteria*) berbasis format Gherkin (*Given-When-Then*).

---

## 1. Kebutuhan Fungsional (Functional Requirements)

### Modul 1: Autentikasi & Sesi (FR-AUTH)

#### FR-01: Validasi Kredensial Login
- **Deskripsi**: Sistem harus memvalidasi kombinasi User dan Password yang dimasukkan oleh pengguna.
- **Kredensial Default**: User = `admin`, Password = `admin`.
- **Kriteria Penerimaan**:
  - *Given* pengguna berada di layar Login.
  - *When* pengguna memasukkan User `admin` dan Password `admin` lalu menekan tombol `LOGIN`.
  - *Then* sistem mengalihkan navigasi ke Menu Utama dan menyimpan status sesi aktif di penyimpanan lokal.
  - *When* pengguna memasukkan kredensial yang salah.
  - *Then* sistem menampilkan pesan peringatan: *"User atau Password salah!"*.

#### FR-02: Dialog Bantuan Pendaftaran (Sign-up)
- **Deskripsi**: Tautan teks `Sign-up` memberikan informasi pendaftaran akun administrator.
- **Kriteria Penerimaan**:
  - *Given* pengguna berada di layar Login.
  - *When* pengguna menekan tautan `Sign-up`.
  - *Then* sistem menampilkan alert dialog: *"Pendaftaran Akun: Untuk pembuatan akun administrator baru, silakan menghubungi Bagian Administrasi IT Universitas Buddhi Dharma."*.

#### FR-03: Persistensi Sesi Otomatis (Auto-login)
- **Deskripsi**: Status login administrator harus bertahan saat aplikasi ditutup dan dibuka kembali.
- **Kriteria Penerimaan**:
  - *Given* pengguna telah berhasil login sebelumnya dan belum melakukan logout.
  - *When* aplikasi ditutup sepenuhnya lalu dibuka kembali.
  - *Then* sistem melewati (*bypass*) layar Login dan langsung menampilkan Menu Utama.

#### FR-04: Keluar dari Sistem (Logout)
- **Deskripsi**: Pengguna dapat mengakhiri sesi administrator dan kembali ke layar Login.
- **Kriteria Penerimaan**:
  - *Given* pengguna berada di Menu Utama dalam kondisi sesi aktif.
  - *When* pengguna menekan ikon/tombol Logout di pojok kanan atas header.
  - *Then* sistem menghapus data sesi dari penyimpanan lokal dan mengarahkan pengguna kembali ke layar Login.

---

### Modul 2: Dashboard Menu Utama & Navigasi (FR-DASH)

#### FR-05: Visualisasi Header & Banner Animasi
- **Deskripsi**: Menu Utama harus menampilkan header resmi UBD beserta banner animasi/gambar kampus yang merepresentasikan tag `[GIF]`.
- **Kriteria Penerimaan**:
  - *Given* pengguna berada di tab Beranda (Menu Utama).
  - *Then* bagian atas menampilkan logo UBD dan motto *"Kreativitas Membangkitkan Inovasi"*, diikuti oleh container banner visual.

#### FR-06: 6 Grid Menu Pintasan Akademik
- **Deskripsi**: Halaman beranda memuat 6 ikon grid akademik dalam format 3 kolom x 2 baris (atau 2 kolom x 3 baris).
- **Kriteria Penerimaan**:
  - *When* pengguna menekan ikon menu *Data Mahasiswa*.
  - *Then* sistem mengalihkan layar ke tab Form Input Data Mahasiswa.
  - *When* pengguna menekan salah satu dari 5 ikon lainnya (Dosen, Dokumen, ID Card, Presensi, Prestasi).
  - *Then* sistem memunculkan notifikasi dialog: *"Fitur [Nama Fitur] sedang dalam tahap pengembangan."*.

#### FR-07: Bottom Tab Bar 3 Layar
- **Deskripsi**: Bilah navigasi bawah (*Bottom Tab Bar*) menyediakan akses instan ke 3 layar utama:
  1. *Home* (Ikon Rumah)
  2. *Data Mahasiswa* (Ikon Topi Toga)
  3. *Report* (Ikon Dokumen)
- **Kriteria Penerimaan**:
  - Pengguna dapat berpindah antar ketiga layar ini kapan saja dengan menyentuh ikon tab yang bersangkutan.

---

### Modul 3: Form Input Data Mahasiswa (FR-INPUT)

#### FR-08: Pengisian Data Mahasiswa
- **Deskripsi**: Form menyediakan input field berikut:
  1. `Kode Mahasiswa` (Input teks, representasi NIM).
  2. `Nama Mahasiswa` (Input teks).
  3. `Jenis Kelamin` (Radio button dengan pilihan: `PRIA` dan `WANITA`).
  4. `Fakultas` (Komponen Dropdown dengan pilihan fakultas resmi UBD).
- **Pilihan Fakultas Resmi**:
  - *Sains dan Teknologi* (Pilihan default).
  - *Bisnis*.
  - *Ilmu Komunikasi dan Desain*.
  - *Sosial dan Humaniora*.

#### FR-09: Validasi Masukan Form
- **Deskripsi**: Memvalidasi kelengkapan data sebelum penyimpanan dilakukan.
- **Kriteria Penerimaan**:
  - *Given* salah satu atau lebih kolom masukan belum diisi/dipilih.
  - *When* pengguna menekan tombol `SAVE`.
  - *Then* sistem memunculkan alert peringatan: *"Harap lengkapi semua data mahasiswa!"* dan tidak melakukan penyimpanan.
  - *Given* `Kode Mahasiswa` (NIM) yang dimasukkan sudah ada dalam database lokal.
  - *When* pengguna menekan tombol `SAVE`.
  - *Then* sistem memunculkan alert peringatan: *"Kode Mahasiswa/NIM [NIM] sudah terdaftar!"* dan membatalkan penyimpanan.

#### FR-10: Penyimpanan & Pengalihan Otomatis (Save & Redirect)
- **Deskripsi**: Menyimpan entri data baru ke penyimpanan lokal dan mengarahkan pengguna ke layar Report.
- **Kriteria Penerimaan**:
  - *Given* seluruh kolom data valid dan NIM belum pernah terdaftar.
  - *When* pengguna menekan tombol `SAVE`.
  - *Then* sistem menyimpan objek mahasiswa ke AsyncStorage, mengosongkan kolom input form (*reset form*), dan memindahkan tampilan tab ke layar **Report** sehingga data baru langsung terlihat di daftar.

---

### Modul 4: Display & Report Data Mahasiswa (FR-REP)

#### FR-11: Inisialisasi Data Awal (Seed Data)
- **Deskripsi**: Saat pertama kali aplikasi diinstal/dijalankan, daftar mahasiswa diisi dengan data awal sesuai contoh pada mockup dosen.
- **Daftar Seed Data**:
  1. Dewi (NIM: 2021010001, Gender: WANITA, Fakultas: Sains dan Teknologi)
  2. Yanti (NIM: 2021010002, Gender: WANITA, Fakultas: Bisnis)
  3. Melati (NIM: 2021010003, Gender: WANITA, Fakultas: Ilmu Komunikasi dan Desain)
  4. Mawar (NIM: 2021010005, Gender: WANITA, Fakultas: Sains dan Teknologi)
  5. Komarudin (NIM: 2021010007, Gender: PRIA, Fakultas: Sains dan Teknologi)
  6. Jaka (NIM: 2021010008, Gender: PRIA, Fakultas: Sains dan Teknologi)
  7. Riska (NIM: 2021010010, Gender: WANITA, Fakultas: Sosial dan Humaniora)

#### FR-12: Tampilan Daftar Mahasiswa & Seleksi Radio Button
- **Deskripsi**: Setiap baris pada daftar menampilkan komponen radio button dan teks berformat `[Nama] [NIM]` dibatasi garis pemisah (*divider line*).
- **Kriteria Penerimaan**:
  - *Given* pengguna berada di layar Report.
  - *When* pengguna menyentuh baris seorang mahasiswa (misal: Dewi 2021010001).
  - *Then* radio button baris tersebut aktif bertitik hitam `(•)` dan memunculkan pop-up dialog interaktif.

#### FR-13: Pop-up Dialog Interaktif Baris Mahasiswa
- **Deskripsi**: Dialog menampilkan pesan persis sesuai mockup: `Yang anda Klik : [Nama] [NIM]` dengan dua opsi aksi:
  1. Tombol `OK`
  2. Tombol `Hapus Data`
- **Kriteria Penerimaan**:
  - *When* pengguna menekan tombol `OK`.
  - *Then* dialog tertutup dan baris tetap mempertahankan seleksi.
  - *When* pengguna menekan tombol `Hapus Data`.
  - *Then* sistem membuka dialog konfirmasi keamanan penghapusan.

#### FR-14: Konfirmasi & Penghapusan Data Mahasiswa
- **Deskripsi**: Memastikan penghapusan data berlangsung aman dengan konfirmasi eksplisit.
- **Kriteria Penerimaan**:
  - *Given* dialog konfirmasi terbuka dengan pesan *"Apakah Anda yakin ingin menghapus data [Nama] ([NIM])?"*.
  - *When* pengguna memilih opsi *"Batal"*.
  - *Then* proses dibatalkan tanpa mengubah data.
  - *When* pengguna memilih opsi *"Hapus"*.
  - *Then* data mahasiswa tersebut dihapus dari penyimpanan lokal, daftar di layar seketika diperbarui tanpa reload aplikasi, dan status seleksi di-reset.

---

### Modul 5: Manajemen Data Dosen (FR-DOSEN)

#### FR-15: Input Data Dosen Baru
- **Deskripsi**: Admin dapat menambahkan data dosen baru ke dalam sistem.
- **Field**: NIDN (teks, unik), Nama Lengkap (teks), Jenis Kelamin (radio: PRIA/WANITA), Fakultas (dropdown 4 opsi UBD), No. Telepon (teks, opsional).
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar form input dosen.
  - *When* admin mengisi semua field wajib dan menekan tombol SAVE.
  - *Then* data dosen tersimpan ke database SQLite dan admin diarahkan ke list dosen.
  - *When* admin memasukkan NIDN yang sudah terdaftar.
  - *Then* sistem menampilkan peringatan: "NIDN sudah terdaftar!".

#### FR-16: Tampilan Daftar Dosen & Pencarian
- **Deskripsi**: Admin dapat melihat seluruh daftar dosen dengan fitur pencarian.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar daftar dosen.
  - *Then* sistem menampilkan seluruh dosen dalam format list dengan NIDN, Nama, dan Fakultas.
  - *When* admin mengetik di search bar.
  - *Then* list difilter secara real-time berdasarkan nama, NIDN, atau fakultas.

#### FR-17: Edit & Hapus Data Dosen
- **Deskripsi**: Admin dapat mengubah atau menghapus data dosen yang sudah ada.
- **Kriteria Penerimaan**:
  - *Given* admin menekan baris dosen di daftar.
  - *When* admin memilih opsi Edit.
  - *Then* form input terbuka dengan data dosen yang sudah terisi (pre-filled), admin dapat mengubah dan menyimpan.
  - *When* admin memilih opsi Hapus dan mengkonfirmasi.
  - *Then* data dosen terhapus dari database dan daftar diperbarui seketika.

---

### Modul 6: Manajemen Mata Kuliah (FR-MK)

#### FR-18: Input Data Mata Kuliah Baru
- **Deskripsi**: Admin dapat menambahkan mata kuliah baru.
- **Field**: Kode MK (teks, unik), Nama MK (teks), SKS (numerik, 1-6), Fakultas (dropdown), Dosen Pengampu (picker dari daftar dosen).
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar form input mata kuliah.
  - *When* admin mengisi semua field wajib dan menekan SAVE.
  - *Then* data mata kuliah tersimpan ke database dengan relasi ke dosen pengampu.
  - *When* admin memasukkan kode MK yang sudah ada.
  - *Then* sistem menampilkan peringatan: "Kode Mata Kuliah sudah terdaftar!".

#### FR-19: Tampilan Daftar Mata Kuliah & Pencarian
- **Deskripsi**: Admin dapat melihat seluruh daftar mata kuliah.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar daftar mata kuliah.
  - *Then* sistem menampilkan matkul dengan Kode, Nama, SKS, Fakultas, dan Dosen Pengampu.
  - *When* admin mengetik di search bar.
  - *Then* list difilter real-time berdasarkan kode, nama, atau fakultas.

#### FR-20: Edit & Hapus Data Mata Kuliah
- **Deskripsi**: Admin dapat mengubah atau menghapus data mata kuliah.
- **Kriteria Penerimaan**: Sama dengan FR-17 (edit pre-filled, hapus dengan konfirmasi, daftar diperbarui seketika).

---

### Modul 7: Jadwal Kuliah (FR-JADWAL)

#### FR-21: Input Jadwal Kuliah Baru
- **Deskripsi**: Admin dapat menambahkan jadwal kuliah.
- **Field**: Hari (Senin–Sabtu), Jam Mulai (time), Jam Selesai (time), Mata Kuliah (picker), Ruangan (teks).
- **Kriteria Penerimaan**:
  - *Given* admin mengisi semua field jadwal dan menekan SAVE.
  - *Then* jadwal tersimpan ke database.
  - *When* admin memasukkan jadwal yang bentrok (hari + jam + ruangan sama dengan jadwal lain).
  - *Then* sistem menampilkan peringatan: "Jadwal bentrok dengan [Nama Matkul] di ruangan [Ruangan]!".

#### FR-22: Tampilan Jadwal Per Hari
- **Deskripsi**: Jadwal ditampilkan dalam format list yang dikelompokkan per hari.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar jadwal.
  - *Then* sistem menampilkan chip/tab filter hari (Senin–Sabtu) di bagian atas.
  - *When* admin memilih hari tertentu.
  - *Then* list hanya menampilkan jadwal hari tersebut, diurutkan berdasarkan jam mulai.
  - Setiap baris menampilkan: Jam (mulai–selesai), Nama Matkul, Nama Dosen, Ruangan.

#### FR-23: Edit & Hapus Jadwal
- **Kriteria Penerimaan**: Sama pola dengan FR-17.

---

### Modul 8: Kartu Rencana Studi / KRS (FR-KRS)

#### FR-24: Pemilihan Mahasiswa untuk KRS
- **Deskripsi**: Admin memilih mahasiswa yang akan dibuatkan/diedit KRS-nya.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar KRS.
  - *Then* sistem menampilkan daftar mahasiswa berstatus Aktif dengan search bar.
  - *When* admin memilih seorang mahasiswa.
  - *Then* sistem menampilkan layar checklist mata kuliah untuk mahasiswa tersebut.

#### FR-25: Checklist Mata Kuliah & Kalkulasi SKS
- **Deskripsi**: Admin memilih mata kuliah yang diambil mahasiswa pada semester aktif.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar checklist matkul untuk seorang mahasiswa.
  - *Then* sistem menampilkan seluruh mata kuliah dengan checkbox, nama, kode, dan SKS.
  - *When* admin mencentang/menghilangkan centang mata kuliah.
  - *Then* total SKS di footer diperbarui secara real-time.
  - *When* admin menekan tombol SIMPAN.
  - *Then* relasi KRS (mahasiswa ↔ matkul ↔ semester aktif) tersimpan ke database.

#### FR-26: Riwayat KRS Per Semester
- **Deskripsi**: Admin dapat melihat KRS mahasiswa dari semester-semester sebelumnya.
- **Kriteria Penerimaan**:
  - *Given* admin melihat KRS seorang mahasiswa.
  - *When* admin memilih semester berbeda dari dropdown filter.
  - *Then* daftar matkul berubah sesuai semester yang dipilih.

---

### Modul 9: Presensi Kampus (FR-PRESENSI)

#### FR-27: Pencatatan Presensi Per Pertemuan
- **Deskripsi**: Admin mencatat kehadiran mahasiswa per mata kuliah per tanggal pertemuan.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar presensi.
  - *When* admin memilih mata kuliah dari dropdown dan tanggal dari date picker.
  - *Then* sistem menampilkan daftar mahasiswa yang memiliki KRS di mata kuliah tersebut pada semester aktif.
  - Setiap baris mahasiswa memiliki toggle status: Hadir / Izin / Sakit / Alpha (default: Hadir).
  - *When* admin menekan SIMPAN.
  - *Then* record presensi tersimpan per mahasiswa per matkul per tanggal.

#### FR-28: Rekap Kehadiran
- **Deskripsi**: Admin dapat melihat ringkasan kehadiran per mahasiswa per matkul.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar rekap presensi.
  - *Then* sistem menampilkan: Nama Mahasiswa, Mata Kuliah, Total Hadir / Total Pertemuan, Persentase Kehadiran.
  - *When* admin mengetik di search bar.
  - *Then* rekap difilter berdasarkan nama mahasiswa atau nama matkul.

---

### Modul 10: Prestasi Akademik & Nilai (FR-NILAI)

#### FR-29: Input Nilai Per Mata Kuliah
- **Deskripsi**: Admin menginput nilai huruf per mahasiswa per matkul per semester.
- **Kriteria Penerimaan**:
  - *Given* admin memilih mata kuliah dari semester aktif di layar input nilai.
  - *Then* sistem menampilkan daftar mahasiswa yang memiliki KRS di matkul tersebut.
  - Setiap baris memiliki picker nilai huruf: A, B+, B, C+, C, D, E.
  - *When* admin memilih nilai dan menekan SIMPAN.
  - *Then* nilai tersimpan ke database dengan konversi bobot otomatis (A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D=1.0, E=0.0).

#### FR-30: Kalkulasi IPS & IPK Otomatis
- **Deskripsi**: Sistem menghitung IPS dan IPK secara otomatis.
- **Kriteria Penerimaan**:
  - *Given* mahasiswa memiliki nilai di satu atau lebih matkul pada semester aktif.
  - *Then* IPS dihitung: Σ(Bobot Nilai × SKS matkul) / Σ(SKS matkul) untuk semester tersebut.
  - *Given* mahasiswa memiliki nilai di lebih dari satu semester.
  - *Then* IPK dihitung: Σ(Bobot Nilai × SKS) / Σ(SKS) untuk seluruh semester.

#### FR-31: Transkrip Nilai Per Mahasiswa
- **Deskripsi**: Layar detail yang menampilkan seluruh riwayat nilai mahasiswa.
- **Kriteria Penerimaan**:
  - *Given* admin membuka transkrip seorang mahasiswa.
  - *Then* sistem menampilkan daftar matkul per semester, lengkap dengan: Kode MK, Nama MK, SKS, Nilai Huruf, Bobot.
  - Di bagian bawah setiap semester ditampilkan IPS semester tersebut.
  - Di bagian paling bawah ditampilkan IPK kumulatif.

---

### Modul 11: Kartu Mahasiswa Digital (FR-KARTU)

#### FR-32: Tampilan Kartu Mahasiswa Digital
- **Deskripsi**: Admin dapat melihat kartu identitas digital untuk setiap mahasiswa.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar Kartu Mahasiswa.
  - *Then* sistem menampilkan daftar mahasiswa dengan search bar.
  - *When* admin memilih seorang mahasiswa.
  - *Then* sistem menampilkan kartu digital dengan: Logo UBD & motto, Avatar inisial gradient, Nama Lengkap, NIM, Fakultas, Jenis Kelamin, Tahun Masuk, Status (Aktif/Cuti/Tidak Aktif/Lulus), QR Code berisi NIM.

---

### Modul 12: Statistik Dashboard (FR-STATS)

#### FR-33: Visualisasi Statistik Akademik
- **Deskripsi**: Home screen menampilkan metrik dan chart akademik.
- **Kriteria Penerimaan**:
  - *Given* admin berada di tab Home.
  - *Then* stat cards menampilkan: Total Mahasiswa (aktif), Total Dosen, Total Mata Kuliah.
  - *Then* bar chart menampilkan distribusi mahasiswa per fakultas.
  - *Then* pie chart menampilkan distribusi gender (PRIA vs WANITA).
  - *Then* card IPK Rata-rata menampilkan rata-rata IPK seluruh mahasiswa aktif.
  - *Then* card Kehadiran menampilkan persentase kehadiran rata-rata semester aktif.

---

### Modul 13: Pengaturan Sistem (FR-SETTINGS)

#### FR-34: Manajemen Semester Aktif
- **Deskripsi**: Admin dapat mengelola dan mengganti semester aktif.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar Pengaturan.
  - *When* admin memilih semester lain dari picker atau membuat semester baru.
  - *Then* semester aktif berubah. Data KRS, presensi, dan nilai di layar-layar lain mengacu pada semester yang baru aktif.
  - Data semester lama tetap tersimpan dan bisa diakses via filter semester historis.

#### FR-35: Reset Data Sistem
- **Deskripsi**: Admin dapat mengembalikan seluruh data ke kondisi awal (seed data).
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar Pengaturan.
  - *When* admin menekan tombol Reset Data.
  - *Then* muncul dialog konfirmasi: "Apakah Anda yakin ingin menghapus SEMUA data dan mengembalikan ke kondisi awal? Tindakan ini tidak dapat dibatalkan.".
  - *When* admin mengkonfirmasi.
  - *Then* seluruh tabel di SQLite dikosongkan dan diisi ulang dengan seed data.

#### FR-36: Informasi Aplikasi & Profil Admin
- **Deskripsi**: Menampilkan informasi sistem dan admin yang sedang login.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar Pengaturan.
  - *Then* sistem menampilkan: Username admin yang login, Versi aplikasi (2.0.0), Logo UBD dan nama universitas.

---

### Modul 14: Enhanced Data Mahasiswa (FR-ENH)

#### FR-37: Edit Data Mahasiswa
- **Deskripsi**: Admin dapat mengubah data mahasiswa yang sudah tersimpan.
- **Kriteria Penerimaan**:
  - *Given* admin menekan baris mahasiswa di layar Report.
  - *When* dialog interaktif muncul dan admin memilih opsi "Edit Data".
  - *Then* form input terbuka dengan data mahasiswa yang sudah terisi (pre-filled).
  - *When* admin mengubah data dan menekan SAVE.
  - *Then* data diperbarui di database dan daftar Report seketika menampilkan perubahan.

#### FR-38: Status Mahasiswa
- **Deskripsi**: Setiap mahasiswa memiliki status: Aktif, Cuti, Tidak Aktif, atau Lulus.
- **Kriteria Penerimaan**:
  - *Given* admin membuat mahasiswa baru.
  - *Then* status default = "Aktif".
  - *Given* admin mengedit data mahasiswa.
  - *Then* admin dapat mengubah status melalui dropdown.
  - Mahasiswa berstatus "Tidak Aktif" atau "Lulus" tidak muncul di checklist presensi dan KRS.

#### FR-39: Filter & Pencarian di Report
- **Deskripsi**: Layar Report dilengkapi chip filter status dan search bar.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar Report.
  - *Then* di atas daftar terdapat chip filter: Semua | Aktif | Cuti | Tidak Aktif | Lulus.
  - *When* admin memilih chip filter tertentu.
  - *Then* daftar hanya menampilkan mahasiswa dengan status tersebut.
  - *When* admin mengetik di search bar.
  - *Then* daftar difilter real-time berdasarkan nama, NIM, atau fakultas.

#### FR-40: Detail View Mahasiswa
- **Deskripsi**: Admin dapat melihat profil lengkap seorang mahasiswa.
- **Kriteria Penerimaan**:
  - *Given* admin menekan mahasiswa dan memilih "Lihat Detail".
  - *Then* layar detail menampilkan: Data profil lengkap (NIM, Nama, Gender, Fakultas, Status, Tahun Masuk), Ringkasan KRS semester aktif (matkul yang diambil + total SKS), Ringkasan presensi (persentase kehadiran), IPS/IPK terbaru.

---

### Modul 11: Ekspor & Dokumen Cetak Resmi (FR-DOC)

#### FR-41: Cetak KRS Resmi ke Dokumen PDF
- **Deskripsi**: Sistem mengompilasi lembar Kartu Rencana Studi resmi mahasiswa ke dalam berkas PDF ber-kop surat resmi UBD.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar detail/pengisian KRS mahasiswa tertentu.
  - *When* admin menekan tombol "Cetak KRS (PDF)".
  - *Then* sistem mengompilasi dokumen HTML/CSS dengan kop surat Universitas Buddhi Dharma, data mahasiswa (Nama, NIM, Fakultas, Dosen PA), tabel mata kuliah (Kode, Nama, SKS, Dosen, Hari, Jam, Ruang), total SKS semester, kolom tanda tangan (Mahasiswa dan Pembimbing Akademik), serta QR verifikasi berkas.
  - *And* sistem memunculkan lembar dialog sistem (*native share/print sheet*) untuk menyimpan atau membagikan berkas PDF.

#### FR-42: Cetak KHS & Transkrip Nilai ke Dokumen PDF
- **Deskripsi**: Sistem mengompilasi lembar Kartu Hasil Studi (KHS) dan Transkrip Nilai Akademik ke dalam berkas PDF resmi.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar detail nilai/transkrip mahasiswa.
  - *When* admin menekan tombol "Cetak KHS / Transkrip (PDF)".
  - *Then* sistem menghasilkan dokumen PDF resmi yang memuat daftar seluruh mata kuliah yang telah ditempuh, bobot numerik, huruf mutu, kalkulasi IPS, dan IPK kumulatif disertai pengesahan tanda tangan BAAK.
  - *And* berkas PDF siap diunduh atau dibagikan melalui dialog sistem.

#### FR-43: Ekspor Rekap Presensi Kelas ke PDF
- **Deskripsi**: Sistem mengekspor berita acara dan daftar hadir kelas per mata kuliah ke dalam format dokumen resmi.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar Rekap Presensi suatu mata kuliah.
  - *When* admin menekan tombol "Ekspor Berita Acara (PDF)".
  - *Then* sistem menyusun tabel seluruh mahasiswa peserta kelas beserta persentase kehadiran masing-masing dan status kelayakan ujian ke dalam dokumen PDF resmi.

#### FR-44: Bagikan Kartu Mahasiswa Digital
- **Deskripsi**: Admin dapat mengekspor atau membagikan gambar/dokumen kartu identitas mahasiswa digital.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar detail Kartu Mahasiswa.
  - *When* admin menekan tombol "Bagikan Kartu Mahasiswa".
  - *Then* sistem menyajikan dialog bagikan (*share sheet*) dengan tautan/berkas kartu mahasiswa untuk dibagikan ke aplikasi lain.

---

### Modul 12: Penegakan Aturan Akademik (FR-RULE)

#### FR-45: Pembatasan Kuota Beban SKS Berbasis IPS (SKS Capping)
- **Deskripsi**: Sistem membatasi jumlah SKS maksimal yang dapat diambil mahasiswa dalam semester aktif berdasarkan capaian IPS semester sebelumnya mengacu pada standar resmi Dikti.
- **Aturan Beban**:
  - $\text{IPS} \ge 3.00 \implies \text{Maksimal } 24 \text{ SKS}$
  - $2.50 \le \text{IPS} < 3.00 \implies \text{Maksimal } 21 \text{ SKS}$
  - $2.00 \le \text{IPS} < 2.50 \implies \text{Maksimal } 18 \text{ SKS}$
  - $\text{IPS} < 2.00 \implies \text{Maksimal } 15 \text{ SKS}$
  - Mahasiswa Baru (Semester 1): Default paket 20 SKS
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar checklist KRS mahasiswa yang memiliki riwayat nilai semester sebelumnya.
  - *When* jumlah SKS mata kuliah yang dicentang melebihi kuota beban SKS mahasiswa.
  - *Then* sistem menampilkan pesan peringatan batas SKS dan menonaktifkan tombol "Simpan KRS".
  - *When* admin mengaktifkan tombol *toggle* "Dispensasi SKS Dekanat" dan mengisi alasan/nomor surat.
  - *Then* tombol "Simpan KRS" kembali aktif dan sistem mencatat dispensasi tersebut ke dalam tabel `audit_logs`.

#### FR-46: Ambang Batas Kehadiran 75% untuk Ujian Akhir (Attendance Threshold)
- **Deskripsi**: Sistem memantau syarat kehadiran minimal 75% per mata kuliah pada saat proses penginputan nilai akhir mahasiswa.
- **Kriteria Penerimaan**:
  - *Given* admin membuka layar input nilai untuk mata kuliah tertentu.
  - *When* terdapat mahasiswa peserta kelas yang memiliki persentase kehadiran kumulatif di bawah 75%.
  - *Then* sistem menampilkan lencana tanda peringatan (*warning badge*) oranye/merah bertuliskan: *"Kehadiran < 75% (Perlu Perhatian)"*.
  - *And* admin tetap diizinkan mengisi nilai akhir jika mahasiswa memiliki surat dispensasi khusus.

---

### Modul 13: Cadangan & Pemulihan Basis Data (FR-DATA)

#### FR-47: Pencadangan Basis Data Mandiri (Backup JSON Archive)
- **Deskripsi**: Admin dapat mengekspor seluruh basis data aplikasi lokal ke dalam berkas arsip JSON terstruktur.
- **Kriteria Penerimaan**:
  - *Given* admin berada di layar Pengaturan Sistem.
  - *When* admin menekan tombol "Cadangkan Data (Backup JSON)".
  - *Then* sistem membaca seluruh tabel SQLite (`semesters`, `mahasiswa`, `dosen`, `mata_kuliah`, `jadwal`, `krs`, `presensi`, `nilai`, `audit_logs`), membuat berkas `.json` terstruktur dengan metadata versi, stempel waktu, dan checksum.
  - *And* sistem memicu `expo-sharing` agar berkas dapat disimpan di penyimpanan eksternal atau dikirim via aplikasi lain.

#### FR-48: Pemulihan Basis Data (Atomic Restore)
- **Deskripsi**: Admin dapat memulihkan seluruh basis data aplikasi dari berkas cadangan JSON yang valid.
- **Kriteria Penerimaan**:
  - *Given* admin menekan tombol "Pulihkan Data (Restore)" di layar Pengaturan Sistem.
  - *When* admin memilih berkas cadangan JSON yang valid dan mengonfirmasi dialog peringatan.
  - *Then* sistem menjalankan transaksi atomik SQLite: mengosongkan tabel lama dan menginjeksi seluruh data dari berkas cadangan tanpa merusak integritas foreign key.
  - *When* berkas yang diunggah rusak atau skema tidak cocok.
  - *Then* sistem membatalkan proses (*rollback*), mempertahankan data saat ini, dan menampilkan pesan kesalahan: *"Berkas cadangan tidak valid atau rusak!"*.

---

### Modul 14: Audit Log Aktivitas Administratif (FR-AUDIT)

#### FR-49: Pencatatan Otomatis Mutasi Kritis
- **Deskripsi**: Sistem mencatat setiap operasi administratif berisiko tinggi ke dalam tabel `audit_logs`.
- **Aksi yang Dicatat**: Pengubahan/Input Nilai, Pengesahan KRS dengan Dispensasi, Perubahan Status Mahasiswa (Cuti/Lulus/DO), Penghapusan Data Master, dan Pemulihan Basis Data.
- **Kriteria Penerimaan**:
  - *Given* admin melakukan perubahan nilai atau menyimpan KRS dengan dispensasi.
  - *Then* sistem secara otomatis menyimpan record baru di tabel `audit_logs` memuat timestamp, action, entity, entity_id, details, dan username actor.

#### FR-50: Peninjau Riwayat Audit Log
- **Deskripsi**: Admin dapat melihat, memfilter, dan mencari rekam jejak aktivitas sistem.
- **Kriteria Penerimaan**:
  - *Given* admin membuka layar "Audit Log" di Pengaturan Sistem.
  - *Then* sistem menampilkan daftar rekam jejak kronologis terurut dari yang terbaru, dilengkapi filter jenis aksi dan kolom pencarian.

---

## 2. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| ID | Parameter | Spesifikasi |
|---|---|---|
| **NFR-01** | **Offline Operation** | Seluruh fitur aplikasi harus dapat dijalankan 100% tanpa sambungan internet. |
| **NFR-02** | **Respon Antarmuka (Performance)** | Transisi antar tab, pembukaan modal dialog, dan rendering daftar harus terjadi dalam waktu kurang dari 100ms. |
| **NFR-03** | **Portabilitas Platform** | Aplikasi harus berjalan seragam di Android (APK/Expo Go), iOS (Simulator/Device), dan Web browser. |
| **NFR-04** | **Integritas Tipe Data (Type Safety)** | Seluruh kode ditulis dalam TypeScript ketat (`strict: true`) tanpa menggunakan tipe `any`. |
| **NFR-05** | **Manajemen Memori & List Rendering** | Menggunakan `FlatList` dengan virtualisasi untuk render daftar mahasiswa agar efisien dan tidak terjadi *memory leak*. |
| **NFR-06** | **Konsistensi UI/UX** | Skema warna, tata letak input, font, dan elemen visual harus mematuhi panduan desain pada `docs/CONTEXT.md`. |
| **NFR-07** | **Ketahanan Penyimpanan (Data Durability)** | Data yang disimpan ke SQLite harus terjamin integritas relasinya dan tidak rusak jika aplikasi ditutup paksa. |
| **NFR-08** | **Database Relasional Lokal** | Menggunakan `expo-sqlite` sebagai database relasional lokal dengan foreign key constraints aktif untuk menjaga integritas referensial antar tabel. |
| **NFR-09** | **Pencarian Real-Time** | Pencarian/filter pada setiap layar list harus responsif dan menampilkan hasil dalam waktu kurang dari 200ms untuk dataset hingga 1000 record. |
| **NFR-10** | **Akurasi Kalkulasi** | Perhitungan IPS dan IPK harus akurat hingga 2 desimal, sesuai standar perhitungan universitas Indonesia. |
| **NFR-11** | **Performa Kompilasi Dokumen PDF** | Kompilasi HTML ke berkas PDF via `expo-print` harus selesai dalam waktu kurang dari 1.5 detik untuk dokumen multi-halaman. |
| **NFR-12** | **Integritas Atomik Pemulihan Data** | Proses Restore database harus dieksekusi dalam satu transaksi atomik SQLite; jika terjadi kegagalan di tengah proses, seluruh state di-*rollback* ke kondisi semula. |
| **NFR-13** | **Keamanan Rekam Jejak Audit** | Catatan pada tabel `audit_logs` bersifat *append-only* (hanya bisa ditambahkan dan tidak dapat disunting atau diubah oleh admin biasa). |

---

## 3. Matriks Aturan Validasi Field (Field Validation Rules)

| Nama Kolom | Label UI | Tipe Data | Wajib? | Format / Batasan | Pesan Validasi Error |
|---|---|---|---|---|---|
| `nim` | Kode Mahasiswa | String | Ya | Karakter alfanumerik / numerik (min. 4 karakter, unik) | *"Kode Mahasiswa/NIM wajib diisi dan harus unik!"* |
| `nama` | Nama Mahasiswa | String | Ya | Alfabet dan spasi (min. 2 karakter) | *"Nama Mahasiswa wajib diisi!"* |
| `jenisKelamin` | Jenis Kelamin | Enum | Ya | Harus salah satu: `'PRIA'` atau `'WANITA'` | *"Pilih Jenis Kelamin (PRIA atau WANITA)!"* |
| `fakultas` | Fakultas | String | Ya | Harus merupakan salah satu opsi fakultas terdaftar | *"Pilih Fakultas yang valid!"* |
| `nidn` | NIDN | String | Ya | Numerik (min. 4 karakter, unik) | *"NIDN wajib diisi dan harus unik!"* |
| `namaDosen` | Nama Dosen | String | Ya | Alfabet dan spasi (min. 2 karakter) | *"Nama Dosen wajib diisi!"* |
| `noTelepon` | No. Telepon | String | Tidak | Numerik (min. 8 karakter jika diisi) | *"Format No. Telepon tidak valid!"* |
| `kodeMK` | Kode Mata Kuliah | String | Ya | Alfanumerik (min. 3 karakter, unik) | *"Kode MK wajib diisi dan harus unik!"* |
| `namaMK` | Nama Mata Kuliah | String | Ya | Alfabet dan spasi (min. 3 karakter) | *"Nama Mata Kuliah wajib diisi!"* |
| `sks` | SKS | Integer | Ya | Numerik antara 1 dan 6 | *"SKS harus antara 1 dan 6!"* |
| `hari` | Hari | Enum | Ya | Salah satu: Senin–Sabtu | *"Pilih Hari yang valid!"* |
| `jamMulai` | Jam Mulai | String | Ya | Format HH:MM | *"Format jam tidak valid!"* |
| `jamSelesai` | Jam Selesai | String | Ya | Format HH:MM, harus > jamMulai | *"Jam Selesai harus setelah Jam Mulai!"* |
| `ruangan` | Ruangan | String | Ya | Alfanumerik (min. 2 karakter) | *"Ruangan wajib diisi!"* |
| `nilaiHuruf` | Nilai | Enum | Ya | Salah satu: A, B+, B, C+, C, D, E | *"Pilih Nilai yang valid!"* |
| `statusMhs` | Status Mahasiswa | Enum | Ya | Salah satu: Aktif, Cuti, Tidak Aktif, Lulus | *"Status tidak valid!"* |
