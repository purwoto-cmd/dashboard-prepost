import { describe, expect, it } from "vitest";
import { clamp, ngain, ngainBand } from "@/lib/analytics/ngain";

describe("ngain", () => {
  it("clamps values to [-1, 1]", () => {
    expect(clamp(2, -1, 1)).toBe(1);
    expect(clamp(-5, -1, 1)).toBe(-1);
    expect(clamp(0.25, -1, 1)).toBe(0.25);
    expect(clamp(Number.NaN, -1, 1)).toBe(0);
  });

  it("computes standard Hake gain when post >= pre", () => {
    // (8 - 4) / (10 - 4) = 0.6667
    expect(ngain(4, 8, 10)).toBeCloseTo(2 / 3, 4);
  });

  it("computes loss-normalised gain when post < pre", () => {
    // (4 - 8) / 8 = -0.5
    expect(ngain(8, 4, 10)).toBeCloseTo(-0.5, 4);
  });

  it("is exactly 1 when going from 0 → max", () => {
    expect(ngain(0, 10, 10)).toBe(1);
  });

  it("is exactly -1 when going from max → 0 (capped via loss formula)", () => {
    expect(ngain(10, 0, 10)).toBe(-1);
  });

  it("handles degenerate perfect-both case as 0", () => {
    expect(ngain(10, 10, 10)).toBe(0);
  });

  it("handles max=0 gracefully", () => {
    expect(ngain(0, 0, 0)).toBe(0);
  });

  it("is clamped into [-1, +1] for adversarial inputs", () => {
    expect(ngain(-5, 20, 10)).toBeLessThanOrEqual(1);
    expect(ngain(-5, 20, 10)).toBeGreaterThanOrEqual(-1);
  });

  it("classifies Hake bands", () => {
    expect(ngainBand(-0.1)).toBe("negatif");
    expect(ngainBand(0)).toBe("rendah");
    expect(ngainBand(0.29)).toBe("rendah");
    expect(ngainBand(0.3)).toBe("sedang");
    expect(ngainBand(0.69)).toBe("sedang");
    expect(ngainBand(0.7)).toBe("tinggi");
    expect(ngainBand(1)).toBe("tinggi");
  });
});
