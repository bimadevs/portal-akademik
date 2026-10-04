import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Mahasiswa, Semester, MataKuliah, KRS, Nilai } from '@/types/mahasiswa';
import { RekapPresensi, PresensiService } from './presensi-service';
import { resolveBobot, NilaiService } from './nilai-service';
import { MahasiswaService } from './mahasiswa-service';
import { SemesterService } from './semester-service';
import { KRSService } from './krs-service';
import { MataKuliahService } from './mata-kuliah-service';

export interface GenerateKRSParams {
  mahasiswa: Mahasiswa;
  krsItems: KRS[];
  semester: Semester;
  totalSks: number;
}

export interface GenerateKHSParams {
  mahasiswa: Mahasiswa;
  nilaiList: Nilai[];
  semester: Semester;
  ips: number;
  ipk: number;
  totalSks: number;
  totalSksLulus?: number;
}

export interface GeneratePresensiParams {
  mataKuliah: MataKuliah;
  rekapList: RekapPresensi[];
  semester: Semester;
}

/**
 * Format tanggal dalam format Indonesia resmi (contoh: 04 Oktober 2026).
 */
export function formatIndonesianDate(date: Date = new Date()): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Komponen HTML Kop Surat Resmi Universitas Buddhi Dharma (UBD).
 */
export function getUBDLetterheadHTML(): string {
  return `
    <div class="letterhead">
      <div class="letterhead-content">
        <div class="logo-box">
          <div class="logo-badge">UBD</div>
        </div>
        <div class="univ-info">
          <h1 class="univ-name">UNIVERSITAS BUDDHI DHARMA</h1>
          <p class="univ-sub">Yayasan Buddhi Dharma Tangerang</p>
          <p class="univ-address">Jl. Imam Bonjol No. 41, Karawaci Ilir, Tangerang, Banten 15115</p>
          <p class="univ-contact">Telp: (021) 5517853 | Email: akademik@buddhidharma.ac.id | Web: buddhidharma.ac.id</p>
        </div>
      </div>
      <div class="divider-double"></div>
    </div>
  `;
}

/**
 * Standar CSS untuk dokumen cetak PDF resmi UBD.
 */
export function getDocumentStyles(): string {
  return `
    <style>
      @page {
        size: A4;
        margin: 18mm 15mm 20mm 15mm;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #111827;
        margin: 0;
        padding: 0;
        font-size: 11pt;
        line-height: 1.4;
      }
      .letterhead {
        margin-bottom: 16px;
      }
      .letterhead-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .logo-box {
        width: 72px;
        height: 72px;
      }
      .logo-badge {
        width: 72px;
        height: 72px;
        background: #2B52BA;
        color: #FFFFFF;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: 1px;
        text-align: center;
        line-height: 72px;
      }
      .univ-info {
        flex: 1;
        text-align: center;
      }
      .univ-name {
        margin: 0;
        font-size: 16pt;
        font-weight: 800;
        color: #1E3A8A;
        letter-spacing: 0.5px;
      }
      .univ-sub {
        margin: 2px 0 0 0;
        font-size: 10pt;
        font-weight: 600;
        color: #4B5563;
      }
      .univ-address, .univ-contact {
        margin: 2px 0 0 0;
        font-size: 8.5pt;
        color: #4B5563;
      }
      .divider-double {
        margin-top: 10px;
        border-top: 3px solid #111827;
        border-bottom: 1px solid #111827;
        height: 3px;
      }
      .doc-title {
        text-align: center;
        margin: 18px 0 14px 0;
      }
      .doc-title h2 {
        margin: 0;
        font-size: 13pt;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-decoration: underline;
      }
      .doc-title p {
        margin: 3px 0 0 0;
        font-size: 9.5pt;
        color: #4B5563;
      }
      .meta-grid {
        display: table;
        width: 100%;
        margin-bottom: 14px;
        font-size: 9.5pt;
      }
      .meta-row {
        display: table-row;
      }
      .meta-cell {
        display: table-cell;
        padding: 2px 0;
      }
      .meta-label {
        width: 130px;
        font-weight: 600;
        color: #374151;
      }
      .meta-separator {
        width: 15px;
        text-align: center;
      }
      .meta-value {
        font-weight: 700;
        color: #111827;
      }
      table.data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        margin-bottom: 16px;
        font-size: 9pt;
      }
      table.data-table th, table.data-table td {
        border: 1px solid #9CA3AF;
        padding: 6px 8px;
      }
      table.data-table th {
        background-color: #F3F4F6;
        font-weight: 800;
        text-align: center;
        color: #1F2937;
      }
      table.data-table td.center {
        text-align: center;
      }
      table.data-table td.right {
        text-align: right;
      }
      table.data-table tr.total-row {
        background-color: #F9FAFB;
        font-weight: 800;
      }
      .summary-box {
        margin-top: 12px;
        background: #F9FAFB;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        padding: 10px 14px;
        font-size: 9.5pt;
      }
      .summary-box .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .summary-box .summary-row:last-child {
        margin-bottom: 0;
      }
      .signatures {
        margin-top: 30px;
        display: table;
        width: 100%;
        page-break-inside: avoid;
      }
      .sig-row {
        display: table-row;
      }
      .sig-cell {
        display: table-cell;
        width: 50%;
        text-align: center;
        vertical-align: top;
        font-size: 9.5pt;
      }
      .sig-space {
        height: 60px;
      }
      .sig-name {
        font-weight: 700;
        text-decoration: underline;
      }
      .sig-title {
        color: #4B5563;
        font-size: 8.5pt;
      }
      .qr-verification {
        margin-top: 24px;
        padding-top: 10px;
        border-top: 1px dashed #D1D5DB;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 8pt;
        color: #6B7280;
        page-break-inside: avoid;
      }
      .qr-code-box {
        display: inline-block;
        padding: 4px 8px;
        border: 1px solid #D1D5DB;
        background: #F9FAFB;
        font-family: monospace;
        font-weight: 700;
        font-size: 7.5pt;
        color: #1E3A8A;
      }
      .badge-pass {
        background: #DCFCE7;
        color: #166534;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 8pt;
      }
      .badge-fail {
        background: #FEE2E2;
        color: #991B1B;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 8pt;
      }
    </style>
  `;
}

export const PDFService = {
  /**
   * Menghasilkan string template HTML untuk dokumen KRS Resmi.
   */
  generateKRSHTML(params: GenerateKRSParams): string {
    const { mahasiswa, krsItems, semester, totalSks } = params;
    const tanggalCetak = formatIndonesianDate();
    const verificationCode = `UBD-KRS-${mahasiswa.nim}-${semester.id}-${Date.now()}`;

    const tableRows = krsItems.map((item, index) => {
      const kode = item.kode || item.mataKuliahKode || item.mata_kuliah_kode || '-';
      const nama = item.nama || item.mataKuliahNama || item.mata_kuliah_nama || '-';
      const sks = item.sks || item.mata_kuliah_sks || 0;
      const dosen = item.dosenNama || item.dosen_nama || 'Belum Ditentukan';

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td class="center"><strong>${kode}</strong></td>
          <td>${nama}</td>
          <td class="center">${sks}</td>
          <td>${dosen}</td>
          <td class="center">Reguler / UBD</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Kartu Rencana Studi (KRS) - ${mahasiswa.nama}</title>
        ${getDocumentStyles()}
      </head>
      <body>
        ${getUBDLetterheadHTML()}

        <div class="doc-title">
          <h2>KARTU RENCANA STUDI (KRS)</h2>
          <p>Tahun Akademik: ${semester.nama}</p>
        </div>

        <div class="meta-grid">
          <div class="meta-row">
            <div class="meta-cell meta-label">Nama Mahasiswa</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.nama}</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Fakultas</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.fakultas}</div>
          </div>
          <div class="meta-row">
            <div class="meta-cell meta-label">NIM (Nomor Induk)</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.nim}</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Status Mahasiswa</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.status || 'Aktif'}</div>
          </div>
          <div class="meta-row">
            <div class="meta-cell meta-label">Semester Tempuh</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${semester.nama}</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Dosen PA</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">Biro Pembimbing Akademik</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35px;">No</th>
              <th style="width: 90px;">Kode MK</th>
              <th>Nama Mata Kuliah</th>
              <th style="width: 50px;">SKS</th>
              <th>Dosen Pengampu</th>
              <th style="width: 100px;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows.length > 0 ? tableRows : '<tr><td colspan="6" class="center">Belum ada mata kuliah yang terdaftar di KRS</td></tr>'}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; padding-right: 12px;"><strong>TOTAL BEBAN SKS:</strong></td>
              <td class="center"><strong>${totalSks}</strong></td>
              <td colspan="2">SKS</td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-row">
            <div class="sig-cell">
              <p>Mengetahui,<br>Dosen Pembimbing Akademik (PA)</p>
              <div class="sig-space"></div>
              <p class="sig-name">( Dr. Budi Santoso, M.Kom. )</p>
              <p class="sig-title">NIDN. 0101010101</p>
            </div>
            <div class="sig-cell">
              <p>Tangerang, ${tanggalCetak}<br>Mahasiswa Yang Bersangkutan,</p>
              <div class="sig-space"></div>
              <p class="sig-name">( ${mahasiswa.nama} )</p>
              <p class="sig-title">NIM. ${mahasiswa.nim}</p>
            </div>
          </div>
        </div>

        <div class="qr-verification">
          <div>Dokumen ini sah dan diterbitkan secara digital oleh Portal Akademik Universitas Buddhi Dharma.</div>
          <div class="qr-code-box">${verificationCode}</div>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Menghasilkan string template HTML untuk lembar KHS & Transkrip Nilai Akademik.
   */
  generateKHSHTML(params: GenerateKHSParams): string {
    const { mahasiswa, nilaiList, semester, ips, ipk, totalSks, totalSksLulus } = params;
    const tanggalCetak = formatIndonesianDate();
    const verificationCode = `UBD-KHS-${mahasiswa.nim}-${semester.id}-${Date.now()}`;
    const sksLulus = totalSksLulus ?? totalSks;

    let totalPoinMutu = 0;
    const tableRows = nilaiList.map((item, index) => {
      const kode = item.mata_kuliah_kode || item.mataKuliahKode || '-';
      const nama = item.mata_kuliah_nama || item.mataKuliahNama || '-';
      const sks = item.mata_kuliah_sks || item.sks || 0;
      const nilaiAngka = item.akhir ?? item.nilaiAngka ?? 0;
      const huruf = item.huruf || item.nilaiHuruf || 'E';
      const bobot = resolveBobot(item);
      const mutu = Number((sks * bobot).toFixed(1));
      totalPoinMutu += mutu;

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td class="center"><strong>${kode}</strong></td>
          <td>${nama}</td>
          <td class="center">${sks}</td>
          <td class="center">${nilaiAngka}</td>
          <td class="center"><strong>${huruf}</strong></td>
          <td class="center">${bobot.toFixed(1)}</td>
          <td class="right">${mutu.toFixed(1)}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>KHS & Transkrip Akademik - ${mahasiswa.nama}</title>
        ${getDocumentStyles()}
      </head>
      <body>
        ${getUBDLetterheadHTML()}

        <div class="doc-title">
          <h2>KARTU HASIL STUDI (KHS) & TRANSKRIP AKADEMIK</h2>
          <p>Periode Evaluasi: ${semester.nama}</p>
        </div>

        <div class="meta-grid">
          <div class="meta-row">
            <div class="meta-cell meta-label">Nama Mahasiswa</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.nama}</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Fakultas</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.fakultas}</div>
          </div>
          <div class="meta-row">
            <div class="meta-cell meta-label">NIM</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.nim}</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Tahun Angkatan</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.tahunMasuk || '2021'}</div>
          </div>
          <div class="meta-row">
            <div class="meta-cell meta-label">Semester</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${semester.nama}</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Status</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mahasiswa.status || 'Aktif'}</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35px;">No</th>
              <th style="width: 85px;">Kode MK</th>
              <th>Nama Mata Kuliah</th>
              <th style="width: 45px;">SKS</th>
              <th style="width: 55px;">Angka</th>
              <th style="width: 50px;">Huruf</th>
              <th style="width: 50px;">Bobot</th>
              <th style="width: 70px;">Mutu</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows.length > 0 ? tableRows : '<tr><td colspan="8" class="center">Belum ada nilai mata kuliah pada semester ini</td></tr>'}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; padding-right: 12px;"><strong>TOTAL:</strong></td>
              <td class="center"><strong>${totalSks}</strong></td>
              <td colspan="3"></td>
              <td class="right"><strong>${totalPoinMutu.toFixed(1)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-row">
            <span><strong>Total SKS Ditempuh:</strong> ${totalSks} SKS</span>
            <span><strong>Total SKS Lulus:</strong> ${sksLulus} SKS</span>
          </div>
          <div class="summary-row" style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #D1D5DB;">
            <span><strong>Indeks Prestasi Semester (IPS):</strong> <span style="color: #1E3A8A; font-size: 11pt; font-weight: 800;">${ips.toFixed(2)}</span></span>
            <span><strong>Indeks Prestasi Kumulatif (IPK):</strong> <span style="color: #1E3A8A; font-size: 11pt; font-weight: 800;">${ipk.toFixed(2)}</span></span>
          </div>
        </div>

        <div class="signatures">
          <div class="sig-row">
            <div class="sig-cell">
              <p>Mengetahui,<br>Dekan Fakultas ${mahasiswa.fakultas}</p>
              <div class="sig-space"></div>
              <p class="sig-name">( Prof. Dr. Ir. Herman, M.T. )</p>
              <p class="sig-title">NIDN. 0202020202</p>
            </div>
            <div class="sig-cell">
              <p>Tangerang, ${tanggalCetak}<br>Kepala BAAK UBD,</p>
              <div class="sig-space"></div>
              <p class="sig-name">( Dra. Susilowati, M.M. )</p>
              <p class="sig-title">NIP. 198504122008012001</p>
            </div>
          </div>
        </div>

        <div class="qr-verification">
          <div>Dokumen resmi diterbitkan oleh Biro Administrasi Akademik & Kemahasiswaan (BAAK) UBD.</div>
          <div class="qr-code-box">${verificationCode}</div>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Menghasilkan string template HTML untuk Berita Acara Rekapitulasi Presensi Kelas.
   */
  generatePresensiHTML(params: GeneratePresensiParams): string {
    const { mataKuliah, rekapList, semester } = params;
    const tanggalCetak = formatIndonesianDate();
    const verificationCode = `UBD-PRES-${mataKuliah.kode}-${semester.id}-${Date.now()}`;

    const tableRows = rekapList.map((item, index) => {
      const isEligible = item.persentase >= 75;
      const statusBadge = isEligible
        ? '<span class="badge-pass">Memenuhi Syarat</span>'
        : '<span class="badge-fail">Tidak Memenuhi</span>';

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td class="center"><strong>${item.nim || item.mahasiswa_nim}</strong></td>
          <td>${item.nama || item.mahasiswa_nama}</td>
          <td class="center">${item.hadir}</td>
          <td class="center">${item.izin}</td>
          <td class="center">${item.sakit}</td>
          <td class="center">${item.alpha || (item as any).alfa || 0}</td>
          <td class="center"><strong>${item.persentase}%</strong></td>
          <td class="center">${statusBadge}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Berita Acara Presensi - ${mataKuliah.nama}</title>
        ${getDocumentStyles()}
      </head>
      <body>
        ${getUBDLetterheadHTML()}

        <div class="doc-title">
          <h2>BERITA ACARA & REKAPITULASI PRESENSI PERKULIAHAN</h2>
          <p>Semester: ${semester.nama}</p>
        </div>

        <div class="meta-grid">
          <div class="meta-row">
            <div class="meta-cell meta-label">Mata Kuliah</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mataKuliah.nama} (${mataKuliah.kode})</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Bobot SKS</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mataKuliah.sks} SKS</div>
          </div>
          <div class="meta-row">
            <div class="meta-cell meta-label">Fakultas</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mataKuliah.fakultas}</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Dosen Pengampu</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${mataKuliah.dosenNama || mataKuliah.dosen_nama || 'Belum Ditentukan'}</div>
          </div>
          <div class="meta-row">
            <div class="meta-cell meta-label">Total Peserta</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">${rekapList.length} Mahasiswa</div>
            <div class="meta-cell meta-label" style="padding-left: 20px;">Batas Kehadiran</div>
            <div class="meta-cell meta-separator">:</div>
            <div class="meta-cell meta-value">Minimal 75% untuk UAS</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th style="width: 90px;">NIM</th>
              <th>Nama Mahasiswa</th>
              <th style="width: 45px;">H</th>
              <th style="width: 45px;">I</th>
              <th style="width: 45px;">S</th>
              <th style="width: 45px;">A</th>
              <th style="width: 60px;">Persen</th>
              <th style="width: 120px;">Status Ujian</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows.length > 0 ? tableRows : '<tr><td colspan="9" class="center">Belum ada data kehadiran untuk kelas ini</td></tr>'}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-row">
            <div class="sig-cell">
              <p>Mengetahui,<br>Ketua Program Studi</p>
              <div class="sig-space"></div>
              <p class="sig-name">( Dr. Hendra Gunawan, M.M. )</p>
              <p class="sig-title">NIDN. 0505050505</p>
            </div>
            <div class="sig-cell">
              <p>Tangerang, ${tanggalCetak}<br>Dosen Pengampu Mata Kuliah,</p>
              <div class="sig-space"></div>
              <p class="sig-name">( ${mataKuliah.dosenNama || mataKuliah.dosen_nama || 'Dosen Pengampu'} )</p>
              <p class="sig-title">NIDN / NIP Dosen</p>
            </div>
          </div>
        </div>

        <div class="qr-verification">
          <div>Berita acara presensi perkuliahan resmi Universitas Buddhi Dharma.</div>
          <div class="qr-code-box">${verificationCode}</div>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Mengompilasi dokumen KRS resmi ke berkas PDF dan memicu dialog simpan/bagikan sistem.
   */
  async generateKRSPdf(
    paramsOrMahasiswaId: GenerateKRSParams | number | string,
    semesterIdParam?: number | string
  ): Promise<{ uri: string; html: string }> {
    let params: GenerateKRSParams;

    if (typeof paramsOrMahasiswaId === 'object') {
      params = paramsOrMahasiswaId;
    } else {
      const student = await MahasiswaService.getById(paramsOrMahasiswaId);
      if (!student) throw new Error('Mahasiswa tidak ditemukan untuk cetak KRS');
      const semester = semesterIdParam
        ? await SemesterService.getById(semesterIdParam)
        : await SemesterService.getActive();
      if (!semester) throw new Error('Semester tidak ditemukan untuk cetak KRS');
      const krsItems = await KRSService.getByMahasiswaAndSemester(student.id, semester.id);
      const totalSks = await KRSService.getTotalSks(student.id, semester.id);
      params = {
        mahasiswa: student,
        krsItems,
        semester,
        totalSks,
      };
    }

    const html = this.generateKRSHTML(params);

    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return { uri: 'web-printed', html };
    }

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Cetak KRS - ${params.mahasiswa.nama}`,
      });
    }
    return { uri, html };
  },

  /**
   * Mengompilasi lembar KHS & Transkrip Akademik ke PDF dan memicu dialog simpan/bagikan.
   */
  async generateKHSPdf(
    paramsOrMahasiswaId: GenerateKHSParams | number | string,
    semesterIdParam?: number | string
  ): Promise<{ uri: string; html: string }> {
    let params: GenerateKHSParams;

    if (typeof paramsOrMahasiswaId === 'object') {
      params = paramsOrMahasiswaId;
    } else {
      const student = await MahasiswaService.getById(paramsOrMahasiswaId);
      if (!student) throw new Error('Mahasiswa tidak ditemukan untuk cetak KHS');
      const semester = semesterIdParam
        ? await SemesterService.getById(semesterIdParam)
        : await SemesterService.getActive();
      if (!semester) throw new Error('Semester tidak ditemukan untuk cetak KHS');
      const nilaiList = await NilaiService.getByMahasiswaAndSemester(student.id, semester.id);
      const { ips, totalSks } = await NilaiService.hitungIPS(student.id, semester.id);
      const transkrip = await NilaiService.getTranskrip(student.id);
      params = {
        mahasiswa: student,
        nilaiList,
        semester,
        ips,
        ipk: transkrip.ipk,
        totalSks,
      };
    }

    const html = this.generateKHSHTML(params);

    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return { uri: 'web-printed', html };
    }

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Cetak KHS & Transkrip - ${params.mahasiswa.nama}`,
      });
    }
    return { uri, html };
  },

  /**
   * Mengompilasi Berita Acara Rekapitulasi Presensi ke PDF dan memicu dialog simpan/bagikan.
   */
  async generatePresensiPdf(
    paramsOrMataKuliahId: GeneratePresensiParams | number | string,
    semesterIdParam?: number | string
  ): Promise<{ uri: string; html: string }> {
    let params: GeneratePresensiParams;

    if (typeof paramsOrMataKuliahId === 'object') {
      params = paramsOrMataKuliahId;
    } else {
      const mataKuliah = await MataKuliahService.getById(paramsOrMataKuliahId);
      if (!mataKuliah) throw new Error('Mata kuliah tidak ditemukan untuk ekspor presensi');
      const semester = semesterIdParam
        ? await SemesterService.getById(semesterIdParam)
        : await SemesterService.getActive();
      if (!semester) throw new Error('Semester tidak ditemukan untuk ekspor presensi');
      const rekapList = await PresensiService.getRekapByMataKuliah(mataKuliah.id, semester.id);
      params = {
        mataKuliah,
        rekapList,
        semester,
      };
    }

    const html = this.generatePresensiHTML(params);

    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return { uri: 'web-printed', html };
    }

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Ekspor Presensi - ${params.mataKuliah.nama}`,
      });
    }
    return { uri, html };
  },

  /**
   * Membagikan detail Kartu Mahasiswa Digital via native share sheet.
   */
  async shareStudentCard(mahasiswa: Mahasiswa): Promise<void> {
    const message = `KARTU MAHASISWA DIGITAL UNIVERSITAS BUDDHI DHARMA\n\nNama: ${mahasiswa.nama}\nNIM: ${mahasiswa.nim}\nFakultas: ${mahasiswa.fakultas}\nStatus: ${mahasiswa.status || 'Aktif'}\nVerifikasi: UBD-KTM-${mahasiswa.nim}\n\nPortal Akademik UBD - Kreativitas Membangkitkan Inovasi`;

    // Coba gunakan expo-sharing jika ada berkas, atau fallback ke Web/Native Share
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: `Kartu Mahasiswa - ${mahasiswa.nama}`,
        text: message,
      });
    } else {
      const { Share } = await import('react-native');
      await Share.share({
        title: `Kartu Mahasiswa - ${mahasiswa.nama}`,
        message,
      });
    }
  },
};
