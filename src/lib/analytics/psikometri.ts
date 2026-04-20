import type {
  AnswerKey,
  ItemPsikometri,
  MergedStudent,
  PsikometriSummary,
  StudentResponses,
} from "@/types";

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function stdev(xs: number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  let sq = 0;
  for (const x of xs) sq += (x - m) * (x - m);
  return Math.sqrt(sq / xs.length);
}

/**
 * Item difficulty P = proportion correct.
 * Accepts a boolean vector (one entry per student) and returns [0, 1].
 */
export function itemDifficulty(responses: readonly boolean[]): number {
  if (responses.length === 0) return 0;
  let n = 0;
  for (const r of responses) if (r) n++;
  return n / responses.length;
}

/**
 * Discrimination D = P(upper27) - P(lower27), computed against totalScores.
 * Ties on the score boundary are resolved by deterministic index order.
 */
export function itemDiscrimination(
  responses: readonly boolean[],
  totalScores: readonly number[],
): number {
  const n = responses.length;
  if (n !== totalScores.length || n === 0) return 0;
  const idx = totalScores.map((_, i) => i).sort((a, b) => totalScores[b]! - totalScores[a]!);
  const k = Math.max(1, Math.floor(n * 0.27));
  const upper = idx.slice(0, k);
  const lower = idx.slice(-k);
  const up = upper.filter((i) => responses[i]).length / k;
  const lo = lower.filter((i) => responses[i]).length / k;
  return up - lo;
}

/**
 * Point-biserial correlation between a dichotomous item and the total score.
 *   r_pb = ((M_p - M_q) / s_t) * sqrt(p * q)
 * where p = item P, q = 1 - p, M_p = mean total of correct-responders,
 * M_q = mean total of incorrect-responders, s_t = population std of total.
 */
export function pointBiserial(
  responses: readonly boolean[],
  totalScores: readonly number[],
): number {
  const n = responses.length;
  if (n !== totalScores.length || n < 2) return 0;
  const p = itemDifficulty(responses);
  const q = 1 - p;
  if (p === 0 || p === 1) return 0;
  const mp = mean(totalScores.filter((_, i) => responses[i]!));
  const mq = mean(totalScores.filter((_, i) => !responses[i]!));
  const st = stdev(totalScores.slice());
  if (st === 0) return 0;
  return ((mp - mq) / st) * Math.sqrt(p * q);
}

/**
 * KR-20 reliability coefficient for a dichotomous test.
 *   KR20 = (k / (k-1)) * (1 - sum(p_i * q_i) / var_total)
 */
export function kr20(itemMatrix: readonly (readonly boolean[])[]): number {
  // itemMatrix: items × students. Reject empty / single-item cases.
  const k = itemMatrix.length;
  if (k < 2) return 0;
  const n = itemMatrix[0]?.length ?? 0;
  if (n < 2) return 0;
  for (const row of itemMatrix) {
    if (row.length !== n) return 0;
  }
  const totalScores: number[] = [];
  for (let s = 0; s < n; s++) {
    let total = 0;
    for (let i = 0; i < k; i++) {
      if (itemMatrix[i]![s]) total++;
    }
    totalScores.push(total);
  }
  const varTotal = stdev(totalScores) ** 2;
  if (varTotal === 0) return 0;
  let sumPq = 0;
  for (const row of itemMatrix) {
    const p = itemDifficulty(row);
    sumPq += p * (1 - p);
  }
  return (k / (k - 1)) * (1 - sumPq / varTotal);
}

/**
 * Count per-option responses (A, B, C, D, E, ...) for a single soal across
 * all student responses from pretest+posttest combined.
 */
export function optionCounts(
  soalId: string,
  preResponses: readonly StudentResponses[],
  postResponses: readonly StudentResponses[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  const ingest = (bag: readonly StudentResponses[]) => {
    for (const r of bag) {
      const ans = r.answers[soalId];
      if (!ans) continue;
      counts[ans] = (counts[ans] ?? 0) + 1;
    }
  };
  ingest(preResponses);
  ingest(postResponses);
  return counts;
}

/**
 * Distractor share: proportion of responses that picked each non-kunci option
 * across the merged pre+post corpus. Ideal distractors are picked by 5-25%.
 */
export function distraktorShare(
  counts: Record<string, number>,
  kunci: string,
): Record<string, number> {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return {};
  const share: Record<string, number> = {};
  for (const [opt, c] of Object.entries(counts)) {
    if (opt === kunci) continue;
    share[opt] = c / total;
  }
  return share;
}

export interface PsikometriInput {
  soalIds: readonly string[];
  kunci: AnswerKey;
  students: readonly MergedStudent[];
  preResponses: readonly StudentResponses[];
  postResponses: readonly StudentResponses[];
}

export function computePsikometri(input: PsikometriInput): PsikometriSummary {
  const { soalIds, kunci, students, preResponses, postResponses } = input;
  const n = students.length;
  const items: ItemPsikometri[] = [];
  if (n === 0 || soalIds.length === 0) {
    return { items, kr20: 0, n };
  }
  // Build per-item correctness vectors (posttest).
  const totalScores = students.map((s) => s.postScore);
  const matrix: boolean[][] = soalIds.map((_, i) => students.map((s) => !!s.postCorrect[i]));
  const rel = kr20(matrix);
  soalIds.forEach((soalId, i) => {
    const row = matrix[i]!;
    const counts = optionCounts(soalId, preResponses, postResponses);
    items.push({
      soalId,
      p: itemDifficulty(row),
      d: itemDiscrimination(row, totalScores),
      rpb: pointBiserial(row, totalScores),
      kunci: kunci[soalId] ?? "",
      opsi: counts,
      distraktor: distraktorShare(counts, kunci[soalId] ?? ""),
    });
  });
  return { items, kr20: rel, n };
}
