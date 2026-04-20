import type { Language } from "@/types";

export interface UiDictionary {
  appTitle: string;
  context: {
    arab: string;
    inggris: string;
    switch: string;
  };
  nav: {
    upload: string;
    dashboard: string;
    fakultas: string;
    butirSoal: string;
  };
  upload: {
    pretestLabel: string;
    posttestLabel: string;
    drop: string;
    processing: string;
    preview: string;
    confirm: string;
    cancel: string;
    duplicates: string;
    invalidNim: string;
    accepted: string;
    missingHeaders: string;
    noKunci: string;
  };
  kpi: {
    jumlahPeserta: string;
    rataRataPre: string;
    rataRataPost: string;
    rataRataGain: string;
    rataRataNGain: string;
    kelulusan: string;
  };
  dashboard: {
    topInstruktur: string;
    topMahasiswa: string;
    fakultasHeatmap: string;
    fakultasBar: string;
    ngainHorizontal: string;
    jurusanBreakdown: string;
    noData: string;
  };
  butirSoal: {
    soal: string;
    p: string;
    d: string;
    rpb: string;
    kr20: string;
    distraktor: string;
    opsiMerged: string;
    kunci: string;
  };
  actions: {
    download: string;
    exportPdf: string;
    reset: string;
    darkMode: string;
  };
  errors: {
    invalidFile: string;
    parseFailed: string;
    boundaryTitle: string;
    boundaryRetry: string;
  };
}

const id: UiDictionary = {
  appTitle: "LPJ Exam Analytics",
  context: { arab: "Bahasa Arab", inggris: "Bahasa Inggris", switch: "Ganti konteks" },
  nav: {
    upload: "Unggah",
    dashboard: "Dashboard",
    fakultas: "Per Fakultas",
    butirSoal: "Butir Soal",
  },
  upload: {
    pretestLabel: "Pretest.xlsx",
    posttestLabel: "Posttest.xlsx",
    drop: "Seret file Excel ke sini atau klik untuk memilih",
    processing: "Memproses…",
    preview: "Pratinjau",
    confirm: "Simpan & hitung analitik",
    cancel: "Batal",
    duplicates: "NIM duplikat",
    invalidNim: "NIM tidak valid",
    accepted: "Diterima",
    missingHeaders: "Header hilang",
    noKunci: "Kunci jawaban tidak ditemukan",
  },
  kpi: {
    jumlahPeserta: "Jumlah Peserta",
    rataRataPre: "Rata-rata Pretest",
    rataRataPost: "Rata-rata Posttest",
    rataRataGain: "Rata-rata Gain",
    rataRataNGain: "Rata-rata N-Gain",
    kelulusan: "Kelulusan",
  },
  dashboard: {
    topInstruktur: "Top Instruktur",
    topMahasiswa: "Top Mahasiswa",
    fakultasHeatmap: "Heatmap Fakultas",
    fakultasBar: "Rata-rata per Fakultas",
    ngainHorizontal: "N-Gain per Fakultas",
    jurusanBreakdown: "Rincian Jurusan",
    noData: "Belum ada data — unggah pretest & posttest untuk memulai.",
  },
  butirSoal: {
    soal: "Soal",
    p: "P (kesukaran)",
    d: "D (daya beda)",
    rpb: "Pt. Biserial",
    kr20: "KR-20",
    distraktor: "Distraktor",
    opsiMerged: "Opsi (Pre + Post)",
    kunci: "Kunci",
  },
  actions: {
    download: "Unduh",
    exportPdf: "Ekspor PDF",
    reset: "Reset",
    darkMode: "Mode gelap",
  },
  errors: {
    invalidFile: "File tidak valid",
    parseFailed: "Gagal mengurai file",
    boundaryTitle: "Terjadi kesalahan pada tampilan ini",
    boundaryRetry: "Coba lagi",
  },
};

// For now the surface UI uses Bahasa Indonesia; `context.arab|inggris` is the
// switch that drives which dataset (Arab vs Inggris) is loaded — both language
// contexts share the Indonesian UI chrome as typical for LPJ reports.
// Separate dictionaries exist for future localisation of the chrome itself.

const dictionaries: Record<Language, UiDictionary> = {
  ar: id,
  en: id,
};

export function dict(lang: Language): UiDictionary {
  return dictionaries[lang];
}
