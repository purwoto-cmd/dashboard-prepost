import { describe, expect, it } from "vitest";
import {
  itemDifficulty,
  itemDiscrimination,
  kr20,
  pointBiserial,
} from "@/lib/analytics/psikometri";

describe("psikometri", () => {
  it("itemDifficulty P", () => {
    expect(itemDifficulty([true, true, false, false])).toBe(0.5);
    expect(itemDifficulty([true, true, true, true])).toBe(1);
    expect(itemDifficulty([])).toBe(0);
  });

  it("itemDiscrimination D upper27 - lower27", () => {
    // 10 students; top27 = 2, bottom27 = 2. Total scores strictly ordered.
    // Students 0..9 with totals 0..9. Item correct only for top 3 and bottom 1.
    const totals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const responses = [true, false, false, false, false, false, false, true, true, true];
    // upper27 (top 2) -> students 9, 8 both correct -> 2/2 = 1
    // lower27 (bottom 2) -> students 0, 1 -> only student 0 correct -> 0.5
    const d = itemDiscrimination(responses, totals);
    expect(d).toBeCloseTo(0.5, 6);
  });

  it("pointBiserial is 0 when item is too easy or too hard", () => {
    expect(pointBiserial([true, true, true], [1, 2, 3])).toBe(0);
    expect(pointBiserial([false, false, false], [1, 2, 3])).toBe(0);
  });

  it("pointBiserial matches closed-form on a simple dataset", () => {
    // 4 students, totals [1, 2, 3, 4]; item correct for top 2 only.
    // Mp = 3.5, Mq = 1.5, s = sqrt(1.25), p=0.5, q=0.5
    // r_pb = (3.5-1.5)/sqrt(1.25) * sqrt(0.25) = 2/1.1180... * 0.5 ≈ 0.8944
    const rpb = pointBiserial([false, false, true, true], [1, 2, 3, 4]);
    expect(rpb).toBeCloseTo(0.8944, 3);
  });

  it("kr20 falls in [0, 1] for a well-formed matrix", () => {
    const items = [
      [true, false, true, true, false, true, true, false, true, false],
      [true, true, true, false, false, true, false, false, true, false],
      [false, false, true, true, false, true, true, false, true, false],
      [true, false, true, true, false, false, true, true, true, true],
    ];
    const r = kr20(items);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(1);
  });

  it("kr20 returns 0 for degenerate input", () => {
    expect(kr20([])).toBe(0);
    expect(kr20([[true, true, true, true]])).toBe(0);
    expect(kr20([[true, true], [false, false]])).toBe(0); // identical totals => varTotal 0
  });
});
