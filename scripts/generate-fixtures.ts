#!/usr/bin/env tsx
/**
 * Generate 3 sample Excel fixtures in /fixtures:
 *  - Pretest.xlsx   (Bahasa Inggris context)
 *  - Posttest.xlsx  (Bahasa Inggris context)
 *  - Kunci.xlsx     (shared answer key — demonstrates external-kunci format)
 *
 * Deterministic — uses a seeded RNG so snapshots are stable in CI.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "fixtures");
mkdirSync(outDir, { recursive: true });

// ---- deterministic rng ----
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const OPTIONS = ["A", "B", "C", "D", "E"] as const;
const FAKULTAS_LIST = [
  { fakultas: "FEB", jurusan: ["Manajemen", "Akuntansi", "Ilmu Ekonomi"] },
  { fakultas: "FT", jurusan: ["Teknik Informatika", "Teknik Elektro"] },
  { fakultas: "FKIP", jurusan: ["PBI", "PBA", "PGSD"] },
  { fakultas: "FH", jurusan: ["Ilmu Hukum"] },
  { fakultas: "FIB", jurusan: ["Sastra Inggris", "Sastra Arab"] },
];
const INSTRUKTUR = [
  "Dr. Siti Aminah",
  "Prof. Agus Salim",
  "Mira Kusuma, M.Pd.",
  "Hendra Pratama, M.A.",
  "Nurul Hidayah, M.Hum.",
];

const SOAL_COUNT = 30;
const STUDENT_COUNT = 60;

const rng = mulberry32(42);

// Build kunci
const kunci: Record<string, string> = {};
for (let i = 1; i <= SOAL_COUNT; i++) {
  const id = `Soal ${i}`;
  kunci[id] = OPTIONS[Math.floor(rng() * OPTIONS.length)]!;
}

function buildStudent(index: number) {
  const bucket = FAKULTAS_LIST[Math.floor(rng() * FAKULTAS_LIST.length)]!;
  const jurusan = bucket.jurusan[Math.floor(rng() * bucket.jurusan.length)]!;
  const instruktur = INSTRUKTUR[Math.floor(rng() * INSTRUKTUR.length)]!;
  const kelas = `Kelas ${String.fromCharCode(65 + (index % 6))}`;
  // Strictly unique, deterministic NIM — no rng shift so collisions are impossible.
  const nim = (2000000000 + index).toString().padStart(10, "0");
  return {
    nim,
    nama: `Mahasiswa ${index + 1}`,
    fakultas: bucket.fakultas,
    jurusan,
    instruktur,
    kelas,
  };
}

function studentAnswers(nim: string, correctProb: number): Record<string, string> {
  const ans: Record<string, string> = {};
  // per-student skill anchor so posttest > pretest on average
  const seed = Number(nim.slice(-4));
  const sub = mulberry32(seed);
  for (const [id, k] of Object.entries(kunci)) {
    const correct = sub() < correctProb;
    if (correct) ans[id] = k;
    else {
      const distractors = OPTIONS.filter((o) => o !== k);
      ans[id] = distractors[Math.floor(sub() * distractors.length)]!;
    }
  }
  return ans;
}

const students = Array.from({ length: STUDENT_COUNT }, (_, i) => buildStudent(i));

function buildSheet(exam: "pretest" | "posttest") {
  const header = [
    "NIM",
    "NAMA LENGKAP",
    "FAKULTAS",
    "JURUSAN",
    "INSTRUKTUR",
    "KELAS",
    ...Object.keys(kunci),
  ];
  const kunciRow = [
    "KUNCI",
    "",
    "",
    "",
    "",
    "",
    ...Object.values(kunci),
  ];
  const probBase = exam === "pretest" ? 0.35 : 0.65;
  const rows = students.map((s) => [
    s.nim,
    s.nama,
    s.fakultas,
    s.jurusan,
    s.instruktur,
    s.kelas,
    ...Object.keys(kunci).map((id) => {
      // Inject a few deliberate issues into posttest to exercise validators.
      const ans = studentAnswers(s.nim, probBase);
      return ans[id]!;
    }),
  ]);
  // Add an invalid NIM row + a duplicate NIM row on pretest to exercise validation.
  if (exam === "pretest" && students[0]) {
    rows.push([
      "123",
      "Mahasiswa Invalid",
      "FEB",
      "Manajemen",
      INSTRUKTUR[0]!,
      "Kelas A",
      ...Object.keys(kunci).map(() => "A"),
    ]);
    rows.push([
      students[0].nim,
      "Duplikat",
      "FEB",
      "Manajemen",
      INSTRUKTUR[0]!,
      "Kelas A",
      ...Object.keys(kunci).map(() => "B"),
    ]);
  }
  return [header, kunciRow, ...rows];
}

function write(name: string, aoa: unknown[][]) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Data");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  writeFileSync(resolve(outDir, name), buf);
  console.warn(`wrote ${name} — ${aoa.length - 1} data rows`);
}

write("Pretest.xlsx", buildSheet("pretest"));
write("Posttest.xlsx", buildSheet("posttest"));

// Kunci.xlsx — two-column soal/kunci, demonstrates external kunci format.
const kunciAoA: unknown[][] = [["Soal", "Kunci"], ...Object.entries(kunci)];
const kunciWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(kunciWb, XLSX.utils.aoa_to_sheet(kunciAoA), "KUNCI");
writeFileSync(resolve(outDir, "Kunci.xlsx"), XLSX.write(kunciWb, { type: "buffer", bookType: "xlsx" }));
console.warn("wrote Kunci.xlsx");
