# Design System: Universitas Buddhi Dharma (UBD)

Dokumen ini mendefinisikan filosofi desain, palet warna resmi berakar dari logo UBD, skala tipografi, sistem bayangan, motif visual, dan standar komponen untuk aplikasi mobile **Portal Akademik UBD**.

---

## 1. Filosofi Desain: Authentic UBD Collegiate Identity

Desain aplikasi ini dibangun langsung dari elemen-elemen resmi lambang **Universitas Buddhi Dharma (UBD)**:
1. **Kelopak Teratai (Lotus Petals)** & **Wordmark UBD** menghasilkan warna **Crimson Red (`#B3202A`)** sebagai identitas institusi yang berani, berwibawa, dan hangat.
2. **Stupa Borobudur** & **Buku Terbuka** menghasilkan warna **Royal Blue (`#2556A8`)** sebagai lambang keilmuan, kebijaksanaan, dan integritas akademik.
3. **Cakram Roda Dharma (Dharmacakra)** menghasilkan aksen **Saffron (`#EE8A25`)** dan **Sun Gold (`#F5C518`)** sebagai simbol pencerahan, dinamisme, dan keunggulan.
4. **Permukaan & Latar Belakang** mengadopsi **Warm Stone (`#FAF8F6`)** yang lembut, bersih, dan elegan tanpa silau putih sintetis.

---

## 2. Palet Warna (Color System)

Definisi token dalam `src/theme/colors.ts`:

### 2.1 Warna Institusional (Brand Identity)
| Token | Nilai Hex | Peran & Penggunaan |
|---|---|---|
| `colors.primary` | `#B3202A` | UBD Crimson Red — Brand header, CTA utama, active tab indicator pill, badge KTM. |
| `colors.primaryDark` | `#941B23` | Crimson gelap — Gradient stop, active press feedback. |
| `colors.primaryLight` | `#FDF2F2` | Tint crimson lembut — Background badge aktif, highlight card. |
| `colors.primarySoft` | `#F8D7D9` | Border tint crimson — Border outline badge & chip aktif. |
| `colors.secondary` | `#2556A8` | UBD Royal Blue — Stupa & buku, badge akademik, info status, link text. |
| `colors.secondaryDark` | `#1E4282` | Royal blue gelap — Contrast text on subtle blue. |
| `colors.secondaryLight` | `#EFF6FF` | Tint blue lembut — Background info banner, badge SKS. |
| `colors.saffron` | `#EE8A25` | Dharmacakra Saffron — Aksen operasional, warning status, highlight chip. |
| `colors.saffronDark` | `#CF6F17` | Saffron pekat — Ikon operasional, badge Dosen. |
| `colors.gold` | `#F5C518` | Sun Gold — Cincin emblem logo, aksen strip pembatas KTM, bintang prestasi. |

### 2.2 Fakultas UBD (Faculty Colors)
| Fakultas | Token | Nilai Hex | Deskripsi Simbolik |
|---|---|---|---|
| **Sains & Teknologi** | `colors.faculties.saintek` | `#2556A8` | UBD Royal Blue (Teknologi, Logika) |
| **Bisnis** | `colors.faculties.bisnis` | `#CF6F17` | UBD Saffron Gold (Kemakmuran, Strategi) |
| **Komunikasi** | `colors.faculties.komunikasi` | `#9B2C5A` | UBD Lotus Plum (Kreativitas, Ekspresi) |
| **Sosial & Humaniora** | `colors.faculties.soshum` | `#1F7A6B` | UBD Jade Teal (Etika, Kebijakan Sosial) |

### 2.3 Status & Semantik (Functional Feedback)
| Token | Nilai Hex | Peran |
|---|---|---|
| `colors.danger` | `#D7372A` | Vermilion warning — Aksi destruktif (Hapus, Reset, Logout, Gagal). Terpisah jelas dari crimson institusi. |
| `colors.dangerLight` | `#FEF2F2` | Latar peringatan kehadiran & pesan eror. |
| `colors.success` | `#1F8A5B` | Emerald kampus — Presensi aman (>= 75%), status lulus, backup sukses. |
| `colors.successLight` | `#ECFDF5` | Latar badge presensi aman. |

---

## 3. Tipografi (Typography)

Mengadopsi **Bricolage Grotesque** (`@expo-google-fonts/bricolage-grotesque`, 700 Bold) dikombinasikan dengan sistem Sans-Serif:

| Gaya | Font Family | Size | Weight | Penggunaan |
|---|---|---|---|---|
| `typography.display` | Bricolage Grotesque | 28pt | 800 | Header Login, Judul Hero Dashboard |
| `typography.headerTitle`| Bricolage Grotesque | 18pt | 700 | Title pada Navigation Bar Header |
| `typography.title` | Bricolage Grotesque | 16pt | 700 | Judul Kartu & Section Header |
| `typography.stat` | Bricolage Grotesque | 24pt | 800 | Angka KPI, IPK, SKS (`tabular-nums`) |
| `typography.overline` | Bricolage Grotesque | 10pt | 800 | Label Kategori & Badge (Uppercase) |
| Body Text | System Sans-Serif | 13–15pt | 400–600 | Keterangan, Form Input, Paragraf |

---

## 4. Motif Visual & Identitas Kampus

1. **Lotus Motif (`LotusRing`)**:
   - Vektor SVG 12-kelopak teratai terinspirasi dari logo UBD.
   - Digunakan sebagai watermark halus (`opacity: 0.12 - 0.18`) pada background header kartu KTM, banner selamat datang, dan splash login hero.
2. **Emblem Plate**:
   - Lingkaran putih bersih dengan border keemasan (`colors.gold`) membingkai logo resmi UBD pada layar login dan header KTM.
3. **Pill Active Indicator**:
   - Tab navigasi bawah menggunakan kapsul crimson halus dengan teks berbobot tegas, memberikan respon visual instan bagi jempol pengguna.

---

## 5. Komponen Utama & Interaksi

- **`UBDHeader`**: Header standar dengan logo resmi UBD, judul layar berfont display, dan touch target HIG 44×44 pt.
- **`CampusBanner`**: Kartu hero semester aktif dengan gradien crimson mendalam, watermark teratai, dan chip semester beraksen emas.
- **`AcademicGrid`**: 6 modul menu utama dikelompokkan dalam keluarga warna fungsional (Master Data: Royal Blue, Operasional: Saffron, Prestasi: Crimson).
- **`InteractiveModal`**: Dialog konfirmasi aman dengan border vermilion halus untuk aksi destruktif dan tombol solid crimson untuk aksi submit normal.
