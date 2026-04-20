# LPJ Exam Analytics

Bilingual (Arab / Inggris) exam analytics web app for Indonesian university
language program reports (LPJ). Upload Pretest.xlsx + Posttest.xlsx, get a
deterministic dashboard with KPI, fakultas breakdowns, butir-soal psikometri,
and a landscape A4 PDF export — all computed client-side (IndexedDB).

## Stack

- Vite + React 18 + TypeScript (strict mode)
- Tailwind CSS (class-based dark mode)
- Zustand (UI state) + Dexie (IndexedDB persistence)
- SheetJS (`xlsx`) inside a Web Worker
- Zod (runtime schema validation, union + exhaustive check for header detection)
- Recharts (SVG charts)
- `@react-pdf/renderer` for PDF export (landscape A4, deterministic layout)
- Vitest + Testing Library for unit / component tests
- Playwright for E2E
- Optional Tauri desktop build

## Commands

```bash
pnpm install
pnpm fixtures:generate     # regenerate /fixtures/*.xlsx

pnpm dev                   # vite dev server
pnpm build                 # typecheck + production build
pnpm preview               # serve /dist (used by Playwright)

pnpm typecheck             # tsc --noEmit
pnpm lint                  # eslint src/**
pnpm test                  # vitest run (unit + component)
pnpm test:watch            # vitest watch mode
pnpm e2e                   # playwright test (requires `pnpm e2e:install` once)

pnpm tauri build           # optional desktop build (requires Rust + Tauri deps)
```

## Data flow

```
[Pretest.xlsx] ─┐
                ├─► Web Worker (SheetJS + Zod validation + dedupe)
[Posttest.xlsx] ┘               │
                                ▼
                         Preview modal (stats + sample)
                                │  (user confirms)
                                ▼
                        Dexie (IndexedDB)
                                │
                                ▼
                  Pure analytics (/src/lib/analytics)
                                │
                                ▼
              Zustand store ─► React views + Recharts
                                │
                                ▼
                   @react-pdf/renderer export
```

### Excel format

Each input workbook must contain:

- Canonical metadata columns (aliases are detected):
  - NIM / Nim / NIM Mahasiswa / Nomor Induk / N.I.M.
  - NAMA LENGKAP / Nama / Full Name
  - FAKULTAS / Faculty
  - JURUSAN / Prodi / Program Studi / Department
  - INSTRUKTUR / Dosen / Instructor
  - KELAS / Class / Rombel
- Soal columns: `Soal 1`, `No. 2`, `Q3`, or just `3` — normalised to `S01`…
- An answer key, supplied either via
  - an inline row where `NIM == "KUNCI"`, OR
  - a dedicated `KUNCI` sheet (`Soal | Kunci` columns).

The NIM must be a 10-digit numeric string (leading zeros preserved). Invalid
rows are rejected with a diagnostic counter; duplicate NIMs are deduped with a
separate counter so the preview modal shows them before data is committed.

### Bilingual context switch

Two independent datasets — one per language (`ar` | `en`) — are stored in
IndexedDB. Switching the context toggles which dataset drives the views; no
re-upload required.

## Analytics

All analytics live in `/src/lib/analytics/` as **pure functions** with 100%
unit coverage:

| Function | Notes |
| --- | --- |
| `ngain(pre, post, max)` | Hake normalised gain, loss-normalised when `post < pre`, clamped to `[-1, +1]`. |
| `computeKPI` | Jumlah Peserta, rata-rata Pre/Post/Gain/N-Gain, Kelulusan %. |
| `aggregateByFakultas` / `aggregateByJurusan` | Group & mean reductions. |
| `topInstruktur` / `topMahasiswa` | Ranked by N-Gain with min-cohort guard. |
| `itemDifficulty` (P) / `itemDiscrimination` (D) | Standard psikometri. |
| `pointBiserial` | Closed-form r_pb. |
| `kr20` | Kuder-Richardson 20 reliability. |
| `optionCounts` / `distraktorShare` | Opsi counts from **pretest + posttest merged**. |

## Accessibility

- `aria-label` on every chart container
- Semantic headings (`h1` / `h2` / `h3`) & landmarks (`header`/`main`/`nav`)
- Keyboard-navigable context switch (`aria-pressed`) & view nav (`aria-current`)
- Error boundaries per view with a retry button
- Dark mode persisted via IndexedDB preferences

## Testing

- **Unit** — `tests/unit/*.test.ts` covers N-Gain clamp, Pt. Biserial, KR-20,
  NIM validator, header detector, parser, and the full merge pipeline against
  fixture workbooks.
- **Component** — `tests/component/*.test.tsx` covers the upload happy path
  and all error paths (invalid header, invalid NIM, duplicate NIM).
- **E2E** — `e2e/flow.spec.ts` drives the production build end-to-end: upload
  → dashboard → butir soal → PDF export.

## Pre-commit

```
pnpm typecheck && pnpm test && prettier --check
```

Run once after cloning to enable husky hooks:

```
pnpm install
```

## Desktop (optional)

```
pnpm tauri build
```

The Tauri scaffold lives in `src-tauri/`. Requires Rust + platform Tauri
dependencies per <https://tauri.app/start/prerequisites/>.

## License

MIT.
