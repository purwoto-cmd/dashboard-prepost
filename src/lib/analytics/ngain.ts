/**
 * Normalised gain (Hake, 1998) with [-1, +1] clamp.
 *
 *   g = (post - pre) / (max - pre)   if post >= pre
 *   g = (post - pre) / pre           if post <  pre  (loss-normalised)
 *
 * We clamp to [-1, +1] to guard against degenerate denominators.
 */
export function clamp(v: number, min: number, max: number): number {
  if (Number.isNaN(v)) return 0;
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

export function ngain(pre: number, post: number, max: number): number {
  if (max <= 0) return 0;
  if (!Number.isFinite(pre) || !Number.isFinite(post)) return 0;
  if (pre === max && post === max) return 0; // perfect on both — no gain defined
  let g: number;
  if (post >= pre) {
    const denom = max - pre;
    g = denom === 0 ? 0 : (post - pre) / denom;
  } else {
    const denom = pre;
    g = denom === 0 ? 0 : (post - pre) / denom;
  }
  return clamp(g, -1, 1);
}

/** Classify N-Gain into Hake bands. */
export type NGainBand = "tinggi" | "sedang" | "rendah" | "negatif";
export function ngainBand(g: number): NGainBand {
  if (g < 0) return "negatif";
  if (g >= 0.7) return "tinggi";
  if (g >= 0.3) return "sedang";
  return "rendah";
}
