import { z } from "zod";

/**
 * NIM (Nomor Induk Mahasiswa) must be a 10-digit numeric string after
 * trimming. We intentionally store NIM as a string to preserve leading zeros.
 */
export const NIM_REGEX = /^\d{10}$/;

export const nimSchema = z
  .string()
  .transform((v) => v.trim())
  .refine((v) => NIM_REGEX.test(v), { message: "NIM harus 10 digit angka" });

export function isValidNim(raw: unknown): raw is string {
  if (typeof raw !== "string" && typeof raw !== "number") return false;
  const s = String(raw).trim();
  return NIM_REGEX.test(s);
}

/** Normalise a raw cell value to a candidate NIM string. Returns null if obviously not a NIM. */
export function normaliseNim(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s) return null;
  // Excel sometimes stores numeric NIMs as floats like "1234567890" or with
  // scientific notation. Strip decimals/sci-notation.
  if (/^\d+(\.0+)?$/.test(s)) return s.replace(/\.0+$/, "");
  return s;
}
