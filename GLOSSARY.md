# Portal Akademik

Konteks domain aplikasi mobile Portal Akademik Universitas Buddhi Dharma untuk pengelolaan data mahasiswa, dosen, mata kuliah, jadwal, KRS, presensi, nilai akademik, dan administrasi kampus.

## Language

**Admin**:
Pengguna yang memiliki hak akses untuk masuk ke dalam portal akademik dan mengelola data mahasiswa.
_Avoid_: User biasa, Operator, Kasir

**Audit Log**:
Rekam jejak kronologis aktivitas administratif (waktu, jenis aksi, entitas, rincian perubahan) untuk akuntabilitas data akademik.
_Avoid_: Log Sistem, Riwayat Edit, Activity Tracker

**Beban SKS Maksimal**:
Kuota jumlah SKS maksimal yang boleh diambil mahasiswa dalam satu semester aktif berdasarkan IPS semester sebelumnya (standar Dikti: 15 hingga 24 SKS).
_Avoid_: Limit SKS, Batas Kredit, Jatah Matkul

**Cadangan Data**:
Berkas ekspor terstruktur (JSON) yang memuat seluruh tabel database lokal aplikasi untuk keperluan pencadangan dan pemulihan data.
_Avoid_: Backup File, Dump DB, Export Data

**Dosen**:
Tenaga pengajar yang terdaftar resmi di Universitas Buddhi Dharma, diidentifikasi dengan NIDN unik.
_Avoid_: Guru, Pengajar, Instruktur, Lecturer

**Fakultas**:
Satuan unit akademik di universitas yang menaungi bidang keilmuan tertentu (contoh: Sains dan Teknologi).
_Avoid_: Jurusan, Program Studi, Prodi

**IPK**:
Indeks Prestasi Kumulatif. Rata-rata tertimbang nilai seluruh semester yang telah ditempuh mahasiswa. Dihitung dengan rumus: Σ(Bobot Nilai × SKS) / Σ(SKS).
_Avoid_: GPA, Rata-rata Nilai, Cumulative GPA

**IPS**:
Indeks Prestasi Semester. Rata-rata tertimbang nilai pada satu semester tertentu. Dihitung dengan rumus yang sama dengan IPK tetapi hanya untuk satu semester.
_Avoid_: Nilai Semester, Semester GPA

**KHS**:
Kartu Hasil Studi. Rekapitulasi resmi perolehan nilai, SKS, dan IPS mahasiswa pada satu semester tertentu yang dapat dicetak menjadi dokumen PDF.
_Avoid_: Rapor Kuliah, Lembar Nilai, Kartu Nilai

**KRS**:
Kartu Rencana Studi. Daftar mata kuliah yang diambil seorang mahasiswa pada semester tertentu.
_Avoid_: Rencana Belajar, Course Plan, Registrasi Matkul

**Mahasiswa**:
Peserta didik yang terdaftar resmi di lingkungan Universitas Buddhi Dharma.
_Avoid_: Siswa, Pelajar, Murid

**Mata Kuliah**:
Unit pembelajaran yang ditawarkan universitas dengan kode unik dan bobot SKS tertentu, diampu oleh seorang Dosen.
_Avoid_: Kursus, Course, Kelas, Pelajaran

**NIDN**:
Nomor Induk Dosen Nasional. Identifier unik nasional untuk setiap dosen yang terdaftar.
_Avoid_: ID Dosen, Kode Dosen, NIP

**Nilai**:
Grade huruf (A, B+, B, C+, C, D, E) yang diberikan Dosen kepada Mahasiswa untuk suatu Mata Kuliah pada Semester tertentu, dengan bobot numerik (A=4.0 hingga E=0.0).
_Avoid_: Skor, Grade, Angka, Poin

**NIM**:
Nomor unik identitas mahasiswa yang terdaftar. Pada tampilan formulir input dilabeli sebagai Kode Mahasiswa.
_Avoid_: Kode Mahasiswa, ID Mahasiswa, Nomor Registrasi

**Presensi**:
Catatan kehadiran Mahasiswa per pertemuan kuliah pada suatu Mata Kuliah. Status: Hadir, Izin, Sakit, atau Alpha.
_Avoid_: Absensi, Daftar Hadir, Attendance

**Report**:
Layar daftar rekapitulasi data mahasiswa yang menampilkan Nama dan NIM dengan fitur interaksi klik baris.
_Avoid_: List Mahasiswa, Rekapitulasi

**Semester**:
Periode akademik (Ganjil atau Genap) dalam satu tahun ajaran. Sistem menggunakan konsep semester aktif tunggal.
_Avoid_: Term, Periode, Tahun Ajaran

**Sesi Login**:
Status persisten autentikasi admin di perangkat yang memungkinkan akses otomatis ke menu utama tanpa login berulang.
_Avoid_: Token, Status Masuk, Remember Me

**SKS**:
Satuan Kredit Semester. Bobot beban belajar per Mata Kuliah, berkisar antara 1 hingga 6 SKS.
_Avoid_: Kredit, Credit Hours, Bobot

**Syarat Kehadiran Minimum**:
Ambang batas persentase kehadiran kuliah (75%) per mata kuliah agar mahasiswa dinyatakan berhak mengikuti ujian akhir semester (UAS).
_Avoid_: Minimum Absen, Batas Kehadiran, Kuota Hadir

