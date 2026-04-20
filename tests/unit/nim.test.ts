import { describe, expect, it } from "vitest";
import { isValidNim, nimSchema, normaliseNim } from "@/lib/schema/nim";

describe("NIM validator", () => {
  it("accepts 10-digit strings", () => {
    expect(isValidNim("1234567890")).toBe(true);
    expect(isValidNim("0000000001")).toBe(true);
  });

  it("rejects short/long/non-numeric", () => {
    expect(isValidNim("123")).toBe(false);
    expect(isValidNim("12345678901")).toBe(false);
    expect(isValidNim("12345ABCDE")).toBe(false);
    expect(isValidNim("")).toBe(false);
    expect(isValidNim(null)).toBe(false);
    expect(isValidNim(undefined)).toBe(false);
  });

  it("normalises Excel-style numeric values", () => {
    expect(normaliseNim(1234567890)).toBe("1234567890");
    expect(normaliseNim("1234567890.0")).toBe("1234567890");
    expect(normaliseNim(" 1234567890 ")).toBe("1234567890");
  });

  it("zod schema throws on invalid", () => {
    expect(() => nimSchema.parse("123")).toThrow();
    expect(nimSchema.parse("1234567890")).toBe("1234567890");
  });
});
