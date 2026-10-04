# Spesifikasi Fitur Baru (Versi 3 - Enterprise & Academic Excellence)
## Portal Akademik Universitas Buddhi Dharma (UBD)

- **Versi Dokumen:** 3.0.0
- **Status:** Disetujui (Approved)
- **Tanggal:** 4 Oktober 2026
- **Target Platform:** Mobile (Android, iOS, Web via Expo)
- **Framework:** Expo SDK 57 (React Native 0.86, React 19, TypeScript)
- **Basis Data:** Local Relational SQLite (`expo-sqlite`) - 100% *Offline-First*

---

## 1. Ringkasan Eksekutif (Executive Summary)

Dokumen ini mendefinisikan cetak biru teknis dan spesifikasi fungsional untuk **Tahap Pengembangan 3 (Versi 3 - V3)** dari aplikasi mobile Portal Akademik Universitas Buddhi Dharma.

Jika Versi 1 (V1) berfokus pada kesesuaian antarmuka dasar (*mockup fidelity*) dan Versi 2 (V2) menyelesaikan seluruh modul inti akademik (Dosen, Mata Kuliah, Jadwal, KRS, Presensi, Nilai, Kartu Mahasiswa, Statistik), maka **Versi 3 (V3)** bertujuan mengangkat derajat aplikasi ini menjadi **Sistem Informasi Akademik Tingkat Enterprise (Enterprise-Grade Campus System)** yang tangguh, akuntabel, dan siap didemonstrasikan di hadapan Dosen Penguji serta praktisi industri.

### Tiga Pilar Utama Pengembangan V3:
1. **Penerbitan Dokumen Resmi & Cetak PDF Mandiri (*Offline Document Engine*)**: Kemampuan mengompilasi lembar KRS resmi ber-kop surat UBD, Kartu Hasil Studi (KHS) / Transkrip Nilai Akademik, Berita Acara Presensi Kelas, dan Berbagi Kartu Mahasiswa Digital langsung dalam format PDF fisik tanpa koneksi server.
2. **Penegakan Integritas Aturan Akademik (*Academic Rules Engine*)**: Penegakan otomatis regulasi Dikti mengenai batas kuota beban SKS maksimal per semester berdasarkan perolehan IPS semester sebelumnya, mekanisme formal *Dispensasi SKS Dekanat*, serta peringatan visual ambang kehadiran 75% saat penginputan nilai akhir mahasiswa.
3. **Ketahanan Data, Portabilitas & Jejak Audit (*Data Resilience & Auditability*)**: Kemampuan mencadangkan (*backup*) dan memulihkan (*atomic restore*) seluruh database relasional ke berkas arsip JSON terstruktur, serta pencatatan kronologis aktivitas administratif ke tabel `audit_logs` dengan antarmuka peninjau riwayat mutasi.

---

## 2. Keputusan Arsitektural V3 (ADR-0003 Summary)

Sesuai dengan keputusan arsitektural resmi pada [docs/adr/0003-advanced-academic-rules-and-document-export.md](./adr/0003-advanced-academic-rules-and-document-export.md), berikut adalah ketetapan teknis V3:

| Dimensi Arsitektural | Keputusan Terpilih | Rationale & Trade-off |
|---|---|---|
| **Mesin Render Dokumen** | `expo-print` + `expo-sharing` | Mengompilasi template HTML/CSS resmi langsung menjadi PDF di memori perangkat secara 100% offline. Cepat, resolusi vektor tajam, dan mendukung dialog sistem native (*share/save*). |
| **Batas Kuota SKS** | Standar Baku Regulasi Dikti (15–24 SKS) | Mencegah anomali akademik (misal mahasiswa IPS rendah mengambil 24 SKS). Semester 1 otomatis dialokasikan 20 SKS. |
| **Override Beban SKS** | Toggle Dispensasi Dekanat + Wajib Catatan | Memberikan fleksibilitas bagi admin jika ada izin resmi dekanat, namun seluruh tindakan dicatat otomatis ke Audit Log demi akuntabilitas data. |
| **Syarat Kehadiran 75%** | Lencana Peringatan (*Warning Badge*) + Override | Nilai akhir tetap dapat diisi jika mahasiswa memegang dispensasi sakit/tugas kampus, namun sistem memberi peringatan visual kontras tinggi di layar input. |
| **Cadangan Data (Backup)** | Structured JSON Archive (`.json`) | Kebal terhadap risiko *file lock* SQLite saat runtime, independen dari OS/arsitektur CPU, transparan untuk diinspeksi, dan mudah dipulihkan lintas platform. |
| **Pemulihan Data (Restore)** | Atomic SQLite Transaction | Menghapus data lama dan menginjeksi data baru dalam satu transaksi SQL tunggal. Jika ada error, terjadi *rollback* otomatis sehingga database tidak korup. |
| **Jejak Audit (Audit Log)** | Tabel `audit_logs` (*Append-Only*) | Hanya mencatat mutasi kritis berisiko integritas (Nilai, Dispensasi KRS, Status Mahasiswa, Hapus Data, Restore) agar performa mobile tetap responsif dan bebas *noise*. |

---

## 3. Spesifikasi Rinci Modul & Kriteria Penerimaan Gherkin

### MODUL A: Penerbitan Dokumen Resmi & Cetak PDF (PDF Engine)

#### Fitur A.1: Cetak Kartu Rencana Studi (KRS) Resmi ke PDF
- **Lokasi UI:** Layar Detail / Pengisian KRS Mahasiswa (`src/app/krs/[mahasiswaId].tsx`).
- **Komponen Dokumen:**
  1. **Kop Surat Resmi UBD**:
     - Logo Universitas Buddhi Dharma (resolusi tajam).
     - Nama Institusi: *UNIVERSITAS BUDDHI DHARMA*.
     - Alamat: *Jl. Imam Bonjol No. 41, Karawaci Ilir, Tangerang, Banten 15115*.
     - Garis ganda resmi pemisah kop surat.
  2. **Identitas Mahasiswa**:
     - Nama Mahasiswa, NIM, Program Studi / Fakultas, Tahun Akademik & Semester Aktif, Nama Dosen Pembimbing Akademik.
  3. **Tabel Mata Kuliah Terdaftar**:
     - No, Kode Mata Kuliah, Nama Mata Kuliah, Bobot SKS, Hari & Jam Kuliah, Ruangan Kelas, Dosen Pengampu.
  4. **Ringkasan Beban Studi**: Total SKS yang diambil pada semester ini.
  5. **Blok Pengesahan & Tanda Tangan**:
     - Tanggal penerbitan dokumen.
     - Kolom tanda tangan Mahasiswa Yang Bersangkutan.
     - Kolom tanda tangan Dosen Pembimbing Akademik (PA).
  6. **QR Code Verifikasi Keabsahan**: Kode QR di pojok kanan bawah memuat metadata verifikasi dokumen (`UBD-KRS-{NIM}-{SEMESTER_ID}-{TIMESTAMP}`).
- **Alur Interaksi:**
  - Admin menekan tombol *"Cetak KRS (PDF)"* dengan ikon printer/dokumen.
  - Tampil indikator pemrosesan (*loading spinner*).
  - Sistem memanggil `PDFService.generateKRSPdf()`.
  - Berkas PDF dikompilasi dan dialog sistem `expo-sharing` terbuka untuk menyimpan ke perangkat atau membagikan ke aplikasi lain.

```gherkin
Scenario: Admin mencetak dokumen resmi KRS ke berkas PDF
  Given admin berada di layar KRS mahasiswa "Dewi" (NIM "2021010001") pada semester aktif
  When admin menekan tombol "Cetak KRS (PDF)"
  Then sistem mengompilasi berkas PDF ber-kop surat resmi UBD memuat seluruh mata kuliah yang diambil
  And sistem membuka lembar dialog berbagi sistem (share sheet) dengan berkas PDF siap simpan/kirim
```

---

#### Fitur A.2: Cetak Kartu Hasil Studi (KHS) & Transkrip Nilai ke PDF
- **Lokasi UI:** Layar Detail Nilai & Transkrip Mahasiswa (`src/app/nilai/[mahasiswaId].tsx`).
- **Komponen Dokumen:**
  1. Kop Surat Resmi UBD.
  2. Judul Dokumen: *KARTU HASIL STUDI (KHS) & TRANSKRIP AKADEMIK*.
  3. Informasi Mahasiswa (Nama, NIM, Fakultas, Status Akademik).
  4. Tabel Nilai Komprehensif:
     - No, Semester, Kode MK, Nama Mata Kuliah, SKS, Nilai Angka, Nilai Huruf Mutu, Bobot Numerik, Nilai Mutu ($SKS \times Bobot$).
  5. Kalkulasi Akademik:
     - Total SKS Tempuh, Total SKS Lulus.
     - Indeks Prestasi Semester (IPS) per semester.
     - Indeks Prestasi Kumulatif (IPK) akhir.
  6. Kolom Pengesahan: Tanda tangan Kepala Biro Administrasi Akademik & Kemahasiswaan (BAAK) UBD dan stempel resmi digital.
  7. QR Code Verifikasi Transkrip.

```gherkin
Scenario: Admin mencetak lembar Transkrip Nilai resmi mahasiswa
  Given admin membuka layar transkrip nilai mahasiswa "Dewi"
  When admin menekan tombol "Cetak KHS / Transkrip (PDF)"
  Then sistem menghasilkan dokumen PDF resmi berisi tabel seluruh nilai mata kuliah beserta kalkulasi IPS dan IPK
  And berkas PDF dapat disimpan atau dibagikan secara langsung
```

---

#### Fitur A.3: Ekspor Berita Acara Rekap Presensi Kelas ke PDF
- **Lokasi UI:** Layar Rekap Presensi Kelas (`src/app/presensi/rekap.tsx`).
- **Komponen Dokumen:**
  1. Kop Surat Resmi UBD.
  2. Judul: *BERITA ACARA & REKAPITULASI PRESENSI PERKULIAHAN*.
  3. Metadata Kelas: Mata Kuliah, Kode MK, SKS, Dosen Pengampu, Hari/Jam, Total Pertemuan Terselenggara.
  4. Tabel Rekap Mahasiswa:
     - No, NIM, Nama Mahasiswa, Hadir, Izin, Sakit, Alpha, Persentase Kehadiran (%), Status Kelayakan Ujian (Memenuhi / Tidak Memenuhi Syarat).
  5. Kolom Tanda Tangan: Dosen Pengampu Mata Kuliah dan Ketua Program Studi.

```gherkin
Scenario: Admin mengekspor rekap presensi suatu mata kuliah ke PDF
  Given admin berada di layar Rekap Presensi mata kuliah "Pemrograman Mobile"
  When admin menekan tombol "Ekspor Berita Acara (PDF)"
  Then sistem mengompilasi dokumen PDF memuat persentase kehadiran seluruh mahasiswa kelas tersebut
  And menandai mahasiswa yang memenuhi atau tidak memenuhi ambang batas kehadiran
```

---

#### Fitur A.4: Bagikan Kartu Mahasiswa Digital
- **Lokasi UI:** Layar Kartu Mahasiswa (`src/app/kartu/[mahasiswaId].tsx`).
- **Fungsionalitas:** Tombol *"Bagikan Kartu"* yang membuka `expo-sharing` untuk membagikan detail kartu mahasiswa digital dan QR code ke media eksternal.

---

### MODUL B: Penegakan Aturan Integritas Akademik (Academic Rules Engine)

#### Fitur B.1: Pembatasan Kuota Beban SKS Maksimal Berdasarkan IPS (SKS Capping)
- **Regulasi Dikti & Kebijakan Kampus UBD:**
  
  $$\text{Beban SKS Maksimal} = \begin{cases} 
  24 \text{ SKS}, & \text{jika } \text{IPS} \ge 3.00 \\
  21 \text{ SKS}, & \text{jika } 2.50 \le \text{IPS} < 3.00 \\
  18 \text{ SKS}, & \text{jika } 2.00 \le \text{IPS} < 2.50 \\
  15 \text{ SKS}, & \text{jika } \text{IPS} < 2.00 \\
  20 \text{ SKS}, & \text{jika Mahasiswa Baru (Semester 1 / Tanpa Riwayat)}
  \end{cases}$$

- **Logika Perhitungan:**
  - Sistem mencari perolehan nilai mahasiswa pada semester sebelum semester aktif saat ini.
  - Menghitung IPS semester lalu: $\frac{\sum (\text{Bobot} \times \text{SKS})}{\sum \text{SKS}}$.
  - Menentukan kuota SKS maksimal yang berhak diambil.
- **Antarmuka Pengisian KRS (`src/app/krs/[mahasiswaId].tsx`):**
  - Di bagian atas daftar mata kuliah, terdapat **Kartu Kuota Akademik**:
    - Menampilkan: *IPS Semester Lalu*, *Batas Kuota SKS*, dan *SKS Terpilih*.
    - Visual Progress Bar (Hijau jika aman, Merah jika melebihi kuota).
  - Jika `Total SKS Terpilih > Batas Kuota`:
    - Tampil *banner* peringatan merah: *"Total SKS ([X]) melebihi kuota maksimal ([Y] SKS) berdasarkan IPS semester lalu!"*.
    - Tombol **"SIMPAN KRS"** dinonaktifkan (*disabled*).

```gherkin
Scenario: Sistem memblokir pengisian KRS yang melebihi kuota beban SKS
  Given mahasiswa "Komarudin" memiliki IPS semester lalu sebesar 2.30 (kuota maksimal 18 SKS)
  When admin mencentang mata kuliah hingga total SKS mencapai 21 SKS
  Then sistem menampilkan peringatan kuota SKS terlampaui
  And tombol "SIMPAN KRS" terkunci (disabled)
```

---

#### Fitur B.2: Mekanisme Dispensasi SKS Dekanat
- **Kebutuhan Bisnis:** Mengakomodasi mahasiswa tingkat akhir atau berprestasi yang memperoleh surat izin dispensasi khusus dari dekanat untuk mengambil SKS di atas kuota normal.
- **Interaksi UI:**
  - Di bawah kartu kuota SKS, terdapat *switch/toggle*: **"Gunakan Dispensasi SKS Dekanat"**.
  - Jika switch diaktifkan:
    - Muncul kolom teks wajib: **"Nomor Surat / Alasan Dispensasi"** (misal: *"Surat Izin Dekan No. 124/FT/UBD/2026"*).
    - Tombol **"SIMPAN KRS"** menjadi aktif kembali.
  - Saat disimpan:
    - Data KRS tersimpan ke SQLite.
    - Sistem secara otomatis mencatat entri ke tabel `audit_logs` dengan aksi `KRS_DISPENSASI`, mencatat nama mahasiswa, jumlah kelebihan SKS, nomor surat dispensasi, dan user admin yang melakukan aksi.

```gherkin
Scenario: Admin menggunakan dispensasi dekanat untuk menyimpan KRS berlebih
  Given total SKS mahasiswa melebihi kuota beban studi
  When admin mengaktifkan toggle "Gunakan Dispensasi SKS Dekanat"
  And mengisi nomor surat dispensasi "SK-DEKAN-082/2026"
  And menekan tombol "SIMPAN KRS"
  Then sistem berhasil menyimpan data KRS mahasiswa
  And mencatat aktivitas dispensasi ke dalam tabel audit_logs
```

---

#### Fitur B.3: Pengawasan Ambang Batas Kehadiran 75% pada Modul Nilai
- **Aturan Akademik:** Mahasiswa yang memiliki persentase kehadiran $< 75\%$ pada pertemuan perkuliahan suatu mata kuliah dianggap tidak memenuhi syarat kehadiran minimum untuk mengikuti evaluasi akhir.
- **Implementasi pada UI Input Nilai (`src/app/nilai/index.tsx` & form input nilai):**
  - Saat admin membuka daftar mahasiswa peserta kelas untuk input nilai:
    - Sistem menghitung persentase kehadiran: $\frac{\text{Pertemuan Hadir}}{\text{Total Pertemuan}} \times 100\%$.
    - Jika persentase $< 75\%$, di sebelah nama mahasiswa muncul lencana visual (*warning pill*) berwarna merah/oranye:
      `[!] Kehadiran [X]% (< 75%)`.
  - Admin tetap dapat mengisi nilai (mendukung dispensasi kehadiran), namun sistem memunculkan konfirmasi dialog jika nilai UAS/Akhir hendak disimpan:
    *"Peringatan: Mahasiswa ini memiliki kehadiran di bawah 75%. Tetap simpan nilai?"*.

```gherkin
Scenario: Sistem memperingatkan admin saat menginput nilai mahasiswa dengan kehadiran kurang dari 75%
  Given mahasiswa "Jaka" hanya memiliki persentase kehadiran 60% pada mata kuliah "Algoritma"
  When admin membuka formulir penilaian mahasiswa tersebut
  Then sistem menampilkan lencana peringatan bahwa kehadiran kurang dari 75%
  And meminta konfirmasi saat admin menyimpan nilai akhir
```

---

### MODUL C: Ketahanan Data, Portabilitas & Audit Log (Data Resilience & Audit)

#### Fitur C.1: Pencadangan Basis Data Mandiri (Backup JSON Archive)
- **Lokasi UI:** Layar Pengaturan Sistem (`src/app/pengaturan/index.tsx`) pada grup *"Cadangan & Pemulihan Data"*.
- **Mekanisme Teknis:**
  - Admin menekan tombol **"Cadangkan Database (Backup JSON)"**.
  - `BackupRestoreService` mengekspor seluruh record dari 9 tabel relasional SQLite:
    `sessions`, `semesters`, `mahasiswa`, `dosen`, `mata_kuliah`, `jadwal`, `krs`, `presensi`, `nilai`, dan `audit_logs`.
  - Membentuk payload JSON terstandarisasi:
    ```json
    {
      "app": "Portal Akademik UBD",
      "version": "3.0.0",
      "exportedAt": "2026-10-04T17:45:00.000Z",
      "checksum": "sha256-hash-value",
      "tables": {
        "semesters": [...],
        "mahasiswa": [...],
        "dosen": [...],
        "mata_kuliah": [...],
        "jadwal": [...],
        "krs": [...],
        "presensi": [...],
        "nilai": [...],
        "audit_logs": [...]
      }
    }
    ```
  - Berkas disimpan sementara ke cache filesystem lokal, lalu `expo-sharing` dipanggil agar pengguna dapat menyimpannya ke folder Downloads atau membagikannya ke media penyimpanan eksternal.

```gherkin
Scenario: Admin membuat berkas cadangan database aplikasi
  Given admin berada di layar Pengaturan Sistem
  When admin menekan tombol "Cadangkan Database (Backup JSON)"
  Then sistem membaca seluruh tabel SQLite dan membentuk berkas JSON terstruktur
  And membuka dialog share sistem untuk menyimpan berkas cadangan
```

---

#### Fitur C.2: Pemulihan Basis Data Atomik (Atomic Restore)
- **Lokasi UI:** Tombol **"Pulihkan Database (Restore JSON)"** di Pengaturan Sistem.
- **Alur Kerja & Validasi:**
  1. Pengguna memilih berkas JSON cadangan (via Document Picker / input string file).
  2. Sistem memvalidasi struktur JSON:
     - Memastikan atribut `app == "Portal Akademik UBD"`.
     - Memastikan seluruh kunci tabel esensial tersedia.
  3. Dialog konfirmasi ganda (*high-risk alert*):
     *"Perhatian: Pemulihan database akan menimpa seluruh data saat ini dengan data dari berkas cadangan. Tindakan ini tidak dapat dibatalkan. Lanjutkan?"*.
  4. Eksekusi Transaksi Atomik SQLite:
     ```sql
     PRAGMA foreign_keys = OFF;
     BEGIN TRANSACTION;
     -- Kosongkan seluruh tabel lama
     DELETE FROM nilai;
     DELETE FROM presensi;
     DELETE FROM krs;
     DELETE FROM jadwal;
     DELETE FROM mata_kuliah;
     DELETE FROM dosen;
     DELETE FROM mahasiswa;
     DELETE FROM semesters;
     DELETE FROM audit_logs;
     -- Sisipkan seluruh entri dari payload JSON cadangan
     -- ... Prepared statements insert ...
     COMMIT;
     PRAGMA foreign_keys = ON;
     ```
  5. Jika salah satu operasi gagal, sistem mengeksekusi `ROLLBACK`, memulihkan status database awal tanpa korupsi data, dan memunculkan pesan error.
  6. Jika berhasil, sistem mencatat riwayat ke `audit_logs` dan menampilkan dialog sukses serta me-refresh context.

```gherkin
Scenario: Admin memulihkan data dari berkas cadangan valid
  Given admin memiliki berkas cadangan JSON yang valid
  When admin mengunggah berkas tersebut dan menyetujui konfirmasi pemulihan
  Then sistem mengganti seluruh data database secara atomik tanpa merusak relasi foreign key
  And memunculkan pesan bahwa database berhasil dipulihkan
```

---

#### Fitur C.3: Tabel Basis Data & Jejak Audit (Audit Log)
- **Skema Tabel SQLite (`audit_logs`):**
  ```sql
  CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      actor TEXT NOT NULL,
      created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
  ```
- **Kategori Tindakan Kritis (`action`):**
  - `NILAI_MUTATION`: Penginputan atau perubahan nilai mahasiswa.
  - `KRS_DISPENSASI`: Penyimpanan KRS dengan override kuota dispensasi dekanat.
  - `MAHASISWA_STATUS_CHANGE`: Perubahan status mahasiswa (Aktif $\to$ Cuti / Lulus / Tidak Aktif).
  - `MASTER_DATA_DELETE`: Penghapusan data Mahasiswa, Dosen, Matkul, atau Jadwal.
  - `DATABASE_RESTORE`: Pemulihan database dari file cadangan.
- **Karakteristik Keamanan:** Bersifat *Append-Only* (hanya bisa menambah record, tanpa tombol edit atau hapus per entri).

---

#### Fitur C.4: Layar Peninjau Audit Log (`src/app/pengaturan/audit-log.tsx`)
- **Navigasi:** Diakses melalui menu item *"Riwayat & Jejak Audit"* di dalam layar Pengaturan Sistem.
- **Elemen Tampilan:**
  - Header dengan judul *Log Aktivitas Administratif*.
  - Search Bar: Pencarian riwayat berdasarkan nama mahasiswa/dosen, nomor surat, atau detail aksi.
  - Filter Chips: `Semua`, `Nilai`, `KRS`, `Mahasiswa`, `Database`.
  - Kartu Rekam Jejak (Audit Card):
    - Ikon aksi dengan warna indikator spesifik (Merah untuk Hapus/Restore, Biru untuk Nilai, Kuning untuk Dispensasi, Hijau untuk Status).
    - Judul Aksi & Waktu (Format Indonesia, contoh: *04 Okt 2026, 17:30 WIB*).
    - Rincian perubahan (Contoh: *"Dispensasi SKS Dewi (2021010001): 21 SKS (Kuota 18) - No Surat: SK-019/2026"*).
    - Aktor: Username admin yang melakukan tindakan.

---

## 4. Tumpukan Teknologi & Dependensi Tambahan

Untuk mendukung fitur V3 secara resmi di Expo SDK 57, proyek memerlukan dua pustaka standar Expo yang dipasang via `npx expo install`:

```bash
npx expo install expo-print expo-sharing
```

| Paket | Fungsi Utama | Alasan Pemilihan |
|---|---|---|
| **`expo-print`** | Kompilasi HTML/CSS ke PDF | Pustaka resmi Expo, berjalan 100% offline di background thread, mendukung styling CSS lengkap untuk tata letak dokumen cetak resmi. |
| **`expo-sharing`** | Native Share Sheet | Menyediakan integrasi native Android dan iOS untuk menyimpan berkas PDF/JSON ke penyimpanan perangkat, Google Drive, atau dibagikan via WhatsApp/Email. |

---

## 5. Rencana Struktur Berkas Baru & Modifikasi

```text
src/
├── app/
│   ├── krs/
│   │   └── [mahasiswaId].tsx           <- Modifikasi: Kuota SKS bar, toggle dispensasi, tombol Cetak KRS
│   ├── nilai/
│   │   ├── index.tsx                   <- Modifikasi: Warning badge kehadiran < 75%
│   │   └── [mahasiswaId].tsx           <- Modifikasi: Tombol Cetak KHS / Transkrip PDF
│   ├── presensi/
│   │   └── rekap.tsx                   <- Modifikasi: Tombol Ekspor Berita Acara Presensi PDF
│   ├── kartu/
│   │   └── [mahasiswaId].tsx           <- Modifikasi: Tombol Bagikan Kartu Mahasiswa
│   └── pengaturan/
│       ├── index.tsx                   <- Modifikasi: Seksi Cadangan & Pemulihan Data, Link ke Audit Log
│       └── audit-log.tsx               <- BERKAS BARU: Layar Peninjau Jejak Audit Administratif
├── services/
│   ├── database.ts                     <- Modifikasi: Inisialisasi tabel audit_logs & indeks
│   ├── pdf-service.ts                  <- BERKAS BARU: Template HTML & mesin kompilasi PDF via expo-print
│   ├── academic-rules-service.ts       <- BERKAS BARU: Mesin aturan kuota SKS & validasi kehadiran 75%
│   ├── backup-restore-service.ts       <- BERKAS BARU: Ekspor/impor arsip JSON & transaksi atomik restore
│   └── audit-service.ts                <- BERKAS BARU: Pencatatan mutasi audit log & query riwayat
└── types/
    └── mahasiswa.ts                    <- Modifikasi: Interface AuditLog, BackupPayload, SksQuotaInfo
```

---

## 6. Panduan Pelaksanaan Bertahap bagi Developer & AI Agent

Pelaksanaan implementasi V3 diatur dalam 5 fase bertahap (*Phased Execution*):

### Fase 1: Setup Dependensi & Kontrak Tipe Data
1. Jalankan `npx expo install expo-print expo-sharing`.
2. Buka `src/types/mahasiswa.ts`, tambahkan kontrak antarmuka:
   - `AuditLog`, `AuditActionType`
   - `SksQuotaInfo` (`ipsLalu`, `kuotaMaksimal`, `sksTerpilih`, `isOverLimit`)
   - `BackupPayload`
3. Update `src/services/database.ts`: tambahkan DDL tabel `audit_logs` dan pembuatan indeks performa.

### Fase 2: Service Layer Development
1. Buat `src/services/audit-service.ts`: fungsi `logActivity()` dan `getAuditLogs()`.
2. Buat `src/services/academic-rules-service.ts`: fungsi `calculateMaxSks()` dan `checkAttendanceRate()`.
3. Buat `src/services/backup-restore-service.ts`: fungsi `generateBackupJson()` dan `restoreFromJson()`.
4. Buat `src/services/pdf-service.ts`: buat generator template HTML resmi ber-kop UBD dan fungsi pemanggil `expo-print` + `expo-sharing`.

### Fase 3: Integrasi Mesin Aturan Akademik (KRS & Nilai)
1. Perbarui `src/app/krs/[mahasiswaId].tsx`: integrasikan `academic-rules-service.ts` untuk menampilkan kuota beban SKS, visual bar, toggle dispensasi dekanat, dan pencatatan audit saat dispensasi digunakan.
2. Perbarui `src/app/nilai/index.tsx`: integrasikan pengecekan persentase kehadiran $< 75\%$ dan munculkan lencana peringatan.

### Fase 4: Integrasi Mesin Cetak PDF & Ekspor Dokumen
1. Pasang tombol *"Cetak KRS (PDF)"* pada `src/app/krs/[mahasiswaId].tsx`.
2. Pasang tombol *"Cetak KHS / Transkrip (PDF)"* pada `src/app/nilai/[mahasiswaId].tsx`.
3. Pasang tombol *"Ekspor Berita Acara (PDF)"* pada `src/app/presensi/rekap.tsx`.
4. Pasang tombol *"Bagikan Kartu"* pada `src/app/kartu/[mahasiswaId].tsx`.

### Fase 5: Integrasi Cadangan Data & Layar Audit Log
1. Perbarui `src/app/pengaturan/index.tsx`: tambahkan tombol Backup JSON dan Restore JSON dengan konfirmasi atomik.
2. Buat layar `src/app/pengaturan/audit-log.tsx`: sediakan list rekam jejak, chip filter aksi, dan search input.
3. Jalankan `npx expo lint` dan `npx tsc --noEmit`.

---

## 7. Matriks Pengujian Mutu (QA Test Matrix V3)

| ID Uji | Skenario Pengujian | Langkah Pengujian | Hasil yang Diharapkan |
|---|---|---|---|
| **TC-39** | Cetak KRS PDF | Buka detail KRS mahasiswa Dewi $\to$ klik "Cetak KRS (PDF)" | PDF ber-kop surat resmi UBD, data mahasiswa, tabel jadwal, dan tanda tangan berhasil dibuat; dialog simpan/bagikan muncul. |
| **TC-40** | Cetak KHS / Transkrip | Buka transkrip nilai $\to$ klik "Cetak KHS / Transkrip" | PDF memuat rekap seluruh nilai, kalkulasi SKS tempuh, IPS, IPK, dan tanda tangan BAAK. |
| **TC-41** | Ekspor Berita Acara Presensi | Buka rekap presensi matkul $\to$ klik "Ekspor PDF" | PDF rekapitulasi kehadiran seluruh mahasiswa kelas tersusun rapi. |
| **TC-42** | Pembatasan Kuota SKS | Pilih mata kuliah melebihi kuota IPS (misal $>18$ SKS) | Tombol simpan terkunci otomatis, muncul visual progress bar merah dan peringatan kuota terlampaui. |
| **TC-43** | Dispensasi SKS Dekanat | Aktifkan toggle dispensasi $\to$ isi nomor surat $\to$ SIMPAN | Data KRS tersimpan; entri baru tercatat di `audit_logs` memuat nomor surat dispensasi. |
| **TC-44** | Peringatan Presensi 75% | Buka input nilai untuk kelas dengan mahasiswa kehadiran $<75\%$ | Muncul lencana visual peringatan merah/oranye di samping nama mahasiswa yang bersangkutan. |
| **TC-45** | Cadangkan Data (Backup) | Buka Pengaturan $\to$ klik "Cadangkan Database (Backup JSON)" | Berkas `.json` terstruktur berhasil dibuat dan lembar dialog sistem muncul. |
| **TC-46** | Pemulihan Data (Restore) | Unggah file JSON cadangan $\to$ konfirmasi alert | Seluruh database dipulihkan secara atomik; data lama tertimpa dengan rapi tanpa error foreign key. |
| **TC-47** | Catat Audit Log | Ubah status mahasiswa ke Cuti atau ubah nilai | Entri baru langsung tercatat pada tabel `audit_logs` dengan stempel waktu akurat. |
| **TC-48** | Peninjau Audit Log | Buka layar Audit Log $\to$ gunakan filter dan search | Riwayat aksi tampil kronologis dan filter kategori berfungsi secara real-time. |

---

## 8. Kesimpulan & Nilai Tambah bagi Evaluator

Dengan menyelesaikan spesifikasi V3 ini:
1. **Dosen Penguji** akan melihat aplikasi yang tidak sekadar menyimpan data di memori ponsel, namun sanggup menerbitkan berkas resmi universitas yang nyata (KRS, KHS, Presensi PDF).
2. **Integritas Akademik** terjaga dengan penegakan kuota SKS Dikti dan pemantauan presensi 75%.
3. **Keamanan & Portabilitas Data** terjamin melalui pencadangan berkas JSON dan jejak audit institusional kelas enterprise.
