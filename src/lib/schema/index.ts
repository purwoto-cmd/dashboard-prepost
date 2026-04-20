import { z } from "zod";
import { nimSchema } from "./nim";

/**
 * Zod schema for a single parsed student response row (post-normalisation).
 * The parser produces objects matching this shape; the schema acts as a
 * runtime guard at the Web Worker → main-thread boundary.
 */
export const studentResponsesSchema = z.object({
  nim: nimSchema,
  nama: z.string().min(1, "NAMA LENGKAP wajib diisi"),
  fakultas: z.string().default(""),
  jurusan: z.string().default(""),
  instruktur: z.string().default(""),
  kelas: z.string().default(""),
  answers: z.record(z.string(), z.string()),
});

export const answerKeySchema = z.record(z.string(), z.string().regex(/^[A-Z]$/));

export const parsedExamSchema = z.object({
  kind: z.union([z.literal("pretest"), z.literal("posttest")]),
  soalIds: z.array(z.string()),
  kunci: answerKeySchema,
  students: z.array(studentResponsesSchema),
  diagnostics: z.object({
    totalRows: z.number().int().nonnegative(),
    accepted: z.number().int().nonnegative(),
    rejectedInvalidNim: z.number().int().nonnegative(),
    duplicateNim: z.number().int().nonnegative(),
    missingHeaders: z.array(
      z.union([
        z.literal("nim"),
        z.literal("nama"),
        z.literal("fakultas"),
        z.literal("jurusan"),
        z.literal("instruktur"),
        z.literal("kelas"),
      ]),
    ),
    soalCount: z.number().int().nonnegative(),
    hasKunci: z.boolean(),
    warnings: z.array(z.string()),
  }),
});

export type ParsedExamInput = z.input<typeof parsedExamSchema>;
export type ParsedExamOutput = z.infer<typeof parsedExamSchema>;

export { nimSchema, isValidNim, normaliseNim, NIM_REGEX } from "./nim";
export * from "./headers";
