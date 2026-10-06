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

## 3. Identitas Visual & Branding Kampus (UBD Official)

Aplikasi mengadopsi identitas visual resmi Universitas Buddhi Dharma (UBD) yang diselaraskan dengan logo resmi kampus:
- **Institusi**: Universitas Buddhi Dharma (UBD).
- **Motto Resmi**: *"Kreativitas Membangkitkan Inovasi"*.
- **Palet Warna Resmi (Berdasarkan Logo UBD)**:
  - **Primary (UBD Crimson Red)**: `#B3202A` / `#941B23` (Warna kelopak teratai & wordmark resmi UBD, tombol utama, tab aktif, header institusional).
  - **Secondary (UBD Royal Blue)**: `#2556A8` / `#1E4282` (Warna stupa Borobudur & buku terbuka, badge akademik, info).
  - **Tertiary Accent (Saffron & Sun Gold)**: `#EE8A25` / `#F5C518` (Warna roda dharma cakram, cincin keemasan, status peringatan & sorotan).
  - **Background & Neutrals (Warm Stone)**: `#FAF8F6` / `#F4F1EE` (Latar belakang modern bertekstur hangat, permukaan kartu `#FFFFFF`).
  - **Border & Dividers**: `#E8E3DE` / `#D4CDC5` (Garis pemisah list, border input field).
  - **Text**: `#1C1917` (Teks utama kontras tinggi), `#57514C` (Teks sekunder/muted).
  - **Status**: Vermilion (`#D7372A`) untuk aksi berbahaya terpisah dari crimson kampus, Emerald (`#1F8A5B`) untuk presensi aman/lulus.
- **Aset & Motif Brand**:
  - Logo UBD resmi (`assets/images/ubd-logo.webp`) dengan watermark motif 12 kelopak teratai (`LotusRing`).
- **Tipografi**:
  - Display & Headings: **Bricolage Grotesque** (`@expo-google-fonts/bricolage-grotesque`, 700 Bold) untuk judul layar, angka statistik tabular, dan nama universitas.
  - Body Text: System sans-serif (San Francisco di iOS, Roboto di Android) dengan skala modular.

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
