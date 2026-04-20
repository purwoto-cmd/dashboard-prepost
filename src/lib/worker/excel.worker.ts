/// <reference lib="webworker" />
import { parseExamBuffer, ParseError } from "@/lib/parser";
import type { ParsedExam } from "@/types";

export interface ParseWorkerRequest {
  id: string;
  kind: "pretest" | "posttest";
  buffer: ArrayBuffer;
}

export type ParseWorkerResponse =
  | { id: string; ok: true; result: ParsedExam }
  | { id: string; ok: false; error: { message: string; code: string } };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: DedicatedWorkerGlobalScope = self as any;

ctx.addEventListener("message", (e: MessageEvent<ParseWorkerRequest>) => {
  const { id, kind, buffer } = e.data;
  try {
    const result = parseExamBuffer(buffer, { kind });
    const msg: ParseWorkerResponse = { id, ok: true, result };
    ctx.postMessage(msg);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = err instanceof ParseError ? err.code : "UNKNOWN";
    const msg: ParseWorkerResponse = { id, ok: false, error: { message, code } };
    ctx.postMessage(msg);
  }
});

export {}; // make this a module
