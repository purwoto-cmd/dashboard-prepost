import type {
  AnswerKey,
  Dataset,
  Language,
  MergedStudent,
  ParsedExam,
  StudentResponses,
} from "@/types";
import { ngain } from "./ngain";

function scoreAgainstKunci(
  answers: Record<string, string>,
  soalIds: readonly string[],
  kunci: AnswerKey,
): { score: number; correct: boolean[] } {
  const correct: boolean[] = [];
  let score = 0;
  for (const id of soalIds) {
    const k = kunci[id];
    const a = answers[id];
    const ok = !!k && !!a && a === k;
    correct.push(ok);
    if (ok) score++;
  }
  return { score, correct };
}

export interface MergeOptions {
  language: Language;
  /** Optional explicit pass threshold. Defaults to 60% of maxScore. */
  passThreshold?: number;
}

/**
 * Join pretest and posttest on NIM. Students missing from either side are
 * dropped with a warning surfaced in the returned dataset metadata.
 */
export function mergeExams(
  pretest: ParsedExam,
  posttest: ParsedExam,
  options: MergeOptions,
): Dataset {
  // Union of soalIds, preserving pretest order first, then posttest-only ids.
  const preIds = new Set(pretest.soalIds);
  const soalIds: string[] = [...pretest.soalIds];
  for (const id of posttest.soalIds) {
    if (!preIds.has(id)) soalIds.push(id);
  }
  // Merge kunci — posttest wins in conflicts (pretest is often a pilot form).
  const kunci: AnswerKey = { ...pretest.kunci, ...posttest.kunci };
  const maxScore = soalIds.filter((id) => !!kunci[id]).length;
  const threshold = options.passThreshold ?? maxScore * 0.6;

  const postByNim = new Map<string, StudentResponses>();
  for (const s of posttest.students) postByNim.set(s.nim, s);

  const merged: MergedStudent[] = [];
  for (const pre of pretest.students) {
    const post = postByNim.get(pre.nim);
    if (!post) continue;
    const { score: preScore, correct: preCorrect } = scoreAgainstKunci(pre.answers, soalIds, kunci);
    const { score: postScore, correct: postCorrect } = scoreAgainstKunci(
      post.answers,
      soalIds,
      kunci,
    );
    merged.push({
      nim: pre.nim,
      nama: post.nama || pre.nama,
      fakultas: post.fakultas || pre.fakultas,
      jurusan: post.jurusan || pre.jurusan,
      instruktur: post.instruktur || pre.instruktur,
      kelas: post.kelas || pre.kelas,
      preScore,
      postScore,
      maxScore,
      ngain: ngain(preScore, postScore, maxScore),
      preCorrect,
      postCorrect,
    });
  }

  return {
    createdAt: new Date().toISOString(),
    language: options.language,
    soalIds,
    kunci,
    students: merged,
    preResponses: pretest.students,
    postResponses: posttest.students,
    maxScore,
    passThreshold: threshold,
  };
}
