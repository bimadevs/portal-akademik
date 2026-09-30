# CONTEXT: Portal Akademik Universitas Buddhi Dharma (UBD)

Dokumen ini mendefinisikan latar belakang, konteks akademik, identitas visual, dan batasan operasional untuk pengembangan aplikasi mobile **Portal Akademik UBD**. Dokumen ini menjadi acuan filosofis dan kontekstual bagi seluruh pengembang manusia dan AI agent.

---

## 1. Latar Belakang & Tujuan Proyek

Aplikasi mobile ini dikembangkan untuk memenuhi tugas mata kuliah pemrograman mobile. Proyek ini memodelkan sistem informasi akademik terpadu untuk lingkungan kampus **Universitas Buddhi Dharma (UBD)**.

Tujuan utama proyek:
1. Mengimplementasikan antarmuka mobile modern, responsif, dan ramah pengguna sesuai mockup acuan dosen.
2. Membangun alur autentikasi administrator kampus dengan sistem sesi lokal.
3. Menyediakan modul administrasi terpadu yang mencakup pengelolaan data dosen, mata kuliah, jadwal kuliah, Kartu Rencana Studi (KRS), presensi, dan prestasi akademik (nilai & IPK).
4. Menyediakan sistem penyimpanan data mandiri (*offline-first*) menggunakan basis data lokal (`expo-sqlite`) yang dapat didemonstrasikan kapan saja tanpa ketergantungan koneksi server eksternal.
5. Menyediakan dashboard statistik akademik terintegrasi dengan visualisasi data.

---

## 2. Pemangku Kepentingan (Stakeholders)

| Peran | Deskripsi | Kepentingan Utama |
|---|---|---|
| **Dosen Penguji / Evaluator** | Penilai tugas akademik | Menguji kelengkapan fungsionalitas, kesesuaian dengan mockup referensi, kerapian kode, dan kelancaran alur demo. |
| **Admin Akademik (Pengguna Akhir)** | Pengelola data akademik universitas | Melakukan autentikasi, meninjau dashboard akademik, dan mengelola data dosen, mata kuliah, jadwal, KRS, presensi, dan nilai akademik. |
| **Developer & AI Agent** | Pembangun dan pemelihara sistem | Memiliki spesifikasi teknis dan desain yang presisi sehingga tidak terjadi deviasi saat implementasi kode. |

---

## 3. Identitas Visual & Branding Kampus

Aplikasi mengadopsi identitas visual resmi Universitas Buddhi Dharma:
- **Institusi**: Universitas Buddhi Dharma (UBD).
- **Motto Resmi**: *"Kreativitas Membangkitkan Inovasi"*.
- **Palet Warna Utama**:
  - Primary Blue: `#2B52BA` / `#3B62C6` (Warna tombol `LOGIN`, `SAVE`, indikator aksi aktif).
  - Background: `#FFFFFF` (Putih bersih dengan tata letak minimalis).
  - Border & Dividers: `#CCCCCC` / `#E0E0E0` (Garis pemisah list, border input field).
  - Text: `#1E1E1E` (Teks utama kontras tinggi), `#666666` (Placeholder & secondary text).
- **Aset Header**:
  - Logo UBD resmi dengan lambang universitas dan teks motto di bagian header setiap layar utama.
- **Tipografi**:
  - Font Sans-Serif sistem (Roboto pada Android, San Francisco pada iOS) dengan variasi ketebalan `Regular`, `Medium`, dan `Bold`.

---

## 4. Acuan Dokumen & Gambar Referensi

Aplikasi dibangun mengacu langsung pada dokumen gambar spesifikasi dosen:
1. `assets/login.jpeg`: Antarmuka Login Administrator (User, Password, Sign-up text, Tombol LOGIN).
2. `assets/menu-utama.jpeg`: Dashboard Menu Utama (Header Logo, Banner Animasi/GIF, 6 Menu Grid Akademik, Bottom Navigation Bar 3 Tab).
3. `assets/input data mahasiwa & display data mahasiswa.jpeg`:
   - Panel Kiri: Form Input Data Mahasiswa (Kode Mahasiswa, Nama Mahasiswa, Jenis Kelamin PRIA/WANITA, Dropdown Fakultas, Tombol SAVE).
   - Panel Kanan: Layar Display Data Mahasiswa (Radio List Mahasiswa dengan format Nama & NIM, Pop-up alert interaktif).
4. `docs/NEW_FEATURE_V2.md`: Spesifikasi fitur V2 lengkap mencakup 10 fase ekspansi modul (Dosen, Mata Kuliah, Jadwal, KRS, Presensi, Nilai/IPK, Kartu Mahasiswa, Statistik, Pengaturan).

---

## 5. Batasan & Asumsi Sistem (System Constraints)

1. **Platform**: Mobile Android & iOS (dijalankan via Expo SDK 57 dan React Native).
2. **Konektivitas**: 100% *Offline-first*. Tidak bergantung pada API eksternal agar proses presentasi di depan dosen tidak terkendala jaringan.
3. **Persistensi Data**: Menggunakan **expo-sqlite** sebagai database relasional lokal.
4. **Cakupan Fitur Menu Grid**: Seluruh 6 modul menu grid aktif dan fungsional sepenuhnya, mencakup Data Mahasiswa, Jadwal Kuliah/Dosen, KRS/Dokumen, Kartu Mahasiswa, Presensi & Catatan, dan Prestasi & IPK.
5. **Siklus Akademik**: Sistem mendukung konsep semester aktif tunggal dengan riwayat historis. Data KRS, presensi, dan nilai tersimpan per semester.
6. **Domain Data**: Entitas domain utama: Mahasiswa, Dosen, Mata Kuliah, Jadwal, KRS, Presensi, Nilai, Semester.
