# Fixtures

Deterministic sample Excel files used by unit + E2E tests. Regenerate with:

```bash
pnpm fixtures:generate
```

Files:

- `Pretest.xlsx` — 60 students × 30 soal + inline `KUNCI` row, deliberate
  invalid NIM + duplicate NIM rows to exercise validators.
- `Posttest.xlsx` — same cohort, higher correct-probability baseline.
- `Kunci.xlsx` — external answer-key workbook format (`Soal | Kunci`).
