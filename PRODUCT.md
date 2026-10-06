# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Administrator Akademik Kampus (BAAK & Staf Program Studi Universitas Buddhi Dharma) yang mengelola dan memonitor seluruh administrasi akademik sivitas kampus.

## Product Purpose

Sistem Informasi Portal Akademik mobile terpadu Universitas Buddhi Dharma untuk pengelolaan data mahasiswa, dosen, mata kuliah, jadwal perkuliahan, Kartu Rencana Studi (KRS), presensi kampus, input nilai & kalkulasi IPK, kartu mahasiswa digital (KTM), ekspor dokumen resmi PDF kampus (KRS, KHS, Rekap Presensi), penegakan aturan akademik Dikti, serta pencadangan/pemulihan database lokal secara 100% offline-first.

## Positioning

Sistem administrasi akademik kampus enterprise yang beroperasi penuh secara lokal (offline-first berbasis SQLite) tanpa ketergantungan server eksternal, berstandar tinggi, cepat, dan presisi.

## Operating Context

Penggunaan administratif di lingkungan kampus Universitas Buddhi Dharma (Karawaci, Tangerang) pada perangkat mobile Android dan iOS.

## Capabilities and Constraints

- 100% Offline-first dengan basis data lokal `expo-sqlite`
- Manajemen master data: Mahasiswa, Dosen, Mata Kuliah
- Manajemen operasional: Jadwal Kuliah, KRS dengan capping SKS Dikti, Presensi kelas
- Penilaian: Grade huruf, bobot numerik, kalkulasi IPS & IPK otomatis, pengawasan kehadiran 75%
- Ekspor Dokumen Resmi PDF ber-kop surat UBD: KRS, KHS/Transkrip, Rekap Presensi
- Kartu Mahasiswa Digital dengan QR code
- Cadangan & Pemulihan data JSON terstruktur
- Audit Log aktivitas administratif append-only

## Brand Commitments

- Institusi: Universitas Buddhi Dharma (UBD)
- Motto: “Kreativitas Membangkitkan Inovasi”
- Palet Resmi: UBD Crimson Red (`#B3202A`), UBD Royal Blue (`#2556A8`), Saffron (`#EE8A25`), Sun Gold (`#F5C518`), Warm Stone (`#FAF8F6`)
- Tipografi: Bricolage Grotesque untuk Display/Headers/Tabular Stat + System Sans-Serif
- Estetika: Authentic UBD Collegiate Identity, Modern Editorial Academic, bebas dari AI slop

## Evidence on Hand

- Mockup acuan dosen (`assets/login.jpeg`, `assets/menu-utama.jpeg`, `assets/input data mahasiwa & display data mahasiswa.jpeg`)
- Logo resmi UBD (`assets/images/ubd-logo.png`)
- Dokumen spesifikasi (`docs/CONTEXT.md`, `docs/PRD.md`, `docs/REQUIREMENTS.md`, `docs/SYSTEM-DESIGN.md`, `GLOSSARY.md`)

## Product Principles

1. Keberwibawaan Institusional: Antarmuka bersih, percaya diri, dan profesional setara sistem akademik universitas terkemuka.
2. Kejelasan Tugas & Tanpa Jalan Buntu: Setiap layar memiliki navigasi yang jelas dengan tombol kembali dan hierarki aksi yang tegas.
3. Kerapian Data & Akses Cepat: Tampilan informasi terstruktur, mudah dipindai, dengan angka tabular yang presisi.
