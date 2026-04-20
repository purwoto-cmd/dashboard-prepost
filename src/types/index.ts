/**
 * Shared domain types for LPJ exam analytics.
 *
 * A dataset is a merged pretest+posttest corpus for a single language context
 * (Arab | Inggris). All analytics operate on these types — never on raw Excel
 * rows — so the pipeline stays pure and testable.
 */

export type Language = "ar" | "en";

/** Canonical metadata fields (non-soal columns) recognised in uploads. */
export type CanonicalField = "nim" | "nama" | "fakultas" | "jurusan" | "instruktur" | "kelas";

/** Result of detecting a single Excel header column. */
export type DetectedHeader =
  | { kind: "canonical"; field: CanonicalField; raw: string }
  | { kind: "soal"; id: string; raw: string }
  | { kind: "unknown"; raw: string };

/** Single student's raw response on a given exam (pretest OR posttest). */
export interface StudentResponses {
  nim: string;
  nama: string;
  fakultas: string;
  jurusan: string;
  instruktur: string;
  kelas: string;
  /** soalId -> answer letter (normalised upper-case, trimmed). */
  answers: Record<string, string>;
}

/** Answer key: soalId -> correct letter. */
export type AnswerKey = Record<string, string>;

/** A single parsed Excel file (pretest OR posttest). */
export interface ParsedExam {
  kind: "pretest" | "posttest";
  /** Ordered soal ids extracted from the headers. */
  soalIds: string[];
  /** Detected or explicit answer key. May be partial. */
  kunci: AnswerKey;
  /** Students actually included in analytics (after validation + dedupe). */
  students: StudentResponses[];
  /** Diagnostic info surfaced to the UI. */
  diagnostics: ParseDiagnostics;
}

export interface ParseDiagnostics {
  totalRows: number;
  accepted: number;
  rejectedInvalidNim: number;
  duplicateNim: number;
  missingHeaders: CanonicalField[];
  soalCount: number;
  hasKunci: boolean;
  warnings: string[];
}

/**
 * A student joined across pretest and posttest. Only students present in BOTH
 * exams and matching on NIM are considered for N-Gain analytics.
 */
export interface MergedStudent {
  nim: string;
  nama: string;
  fakultas: string;
  jurusan: string;
  instruktur: string;
  kelas: string;
  preScore: number;
  postScore: number;
  maxScore: number;
  /** Clamped N-Gain in [-1, +1]. */
  ngain: number;
  /** Per-item correctness arrays, aligned with dataset soalIds. */
  preCorrect: boolean[];
  postCorrect: boolean[];
}

export interface Dataset {
  /** ISO timestamp the dataset was ingested. */
  createdAt: string;
  language: Language;
  soalIds: string[];
  kunci: AnswerKey;
  students: MergedStudent[];
  /** Raw student responses kept for distraktor analysis. */
  preResponses: StudentResponses[];
  postResponses: StudentResponses[];
  /** Maximum score (= number of soal with kunci). */
  maxScore: number;
  /** Threshold for "Lulus" flag. Defaults to 60% of maxScore. */
  passThreshold: number;
}

export interface KPI {
  jumlahPeserta: number;
  rataRataPre: number;
  rataRataPost: number;
  rataRataGain: number;
  /** Mean of per-student clamped N-Gain values. */
  rataRataNGain: number;
  kelulusanPercent: number;
}

export interface FakultasAggregate {
  fakultas: string;
  peserta: number;
  rataRataPre: number;
  rataRataPost: number;
  rataRataNGain: number;
  kelulusanPercent: number;
  jurusan: JurusanAggregate[];
}

export interface JurusanAggregate {
  jurusan: string;
  fakultas: string;
  peserta: number;
  rataRataPre: number;
  rataRataPost: number;
  rataRataNGain: number;
}

export interface TopEntry {
  key: string;
  label: string;
  peserta: number;
  rataRataNGain: number;
  rataRataPost: number;
}

export interface ItemPsikometri {
  soalId: string;
  /** Difficulty P in [0, 1], computed on posttest. */
  p: number;
  /** Discrimination D (upper27 - lower27). */
  d: number;
  /** Point-biserial correlation. */
  rpb: number;
  /** Answer key. */
  kunci: string;
  /** Per-option counts from merged pre+post responses. */
  opsi: Record<string, number>;
  /** Distractor effectiveness (each non-kunci option share). */
  distraktor: Record<string, number>;
}

export interface PsikometriSummary {
  items: ItemPsikometri[];
  /** KR-20 reliability of posttest. */
  kr20: number;
  /** Number of students used in psikometri (posttest). */
  n: number;
}
