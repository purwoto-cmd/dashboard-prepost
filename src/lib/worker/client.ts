import type { ParsedExam } from "@/types";
import type { ParseWorkerRequest, ParseWorkerResponse } from "./excel.worker";

/**
 * Thin client around the Excel parser Web Worker. Falls back to
 * parsing synchronously on the main thread when Worker is unavailable
 * (e.g. during tests or server-side rendering).
 */
export async function parseInWorker(
  buffer: ArrayBuffer,
  kind: "pretest" | "posttest",
): Promise<ParsedExam> {
  if (typeof Worker === "undefined") {
    const { parseExamBuffer } = await import("@/lib/parser");
    return parseExamBuffer(buffer, { kind });
  }
  const worker = new Worker(new URL("./excel.worker.ts", import.meta.url), {
    type: "module",
  });
  try {
    return await new Promise<ParsedExam>((resolve, reject) => {
      const id = crypto.randomUUID();
      worker.addEventListener("message", (e: MessageEvent<ParseWorkerResponse>) => {
        if (e.data.id !== id) return;
        if (e.data.ok) resolve(e.data.result);
        else reject(new Error(e.data.error.message));
      });
      worker.addEventListener("error", (e) => reject(e.error ?? new Error(e.message)));
      const msg: ParseWorkerRequest = { id, kind, buffer };
      worker.postMessage(msg, [buffer]);
    });
  } finally {
    worker.terminate();
  }
}
