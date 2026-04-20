import { useCallback, useMemo, useState } from "react";
import type { ParsedExam } from "@/types";
import { parseInWorker } from "@/lib/worker/client";
import { mergeExams } from "@/lib/analytics";
import { useAppStore } from "@/store/useAppStore";
import { dict } from "@/i18n";

interface FileState {
  name: string;
  parsed: ParsedExam;
}

interface ErrorState {
  scope: "pretest" | "posttest";
  message: string;
}

export function UploadPanel() {
  const language = useAppStore((s) => s.language);
  const setDataset = useAppStore((s) => s.setDataset);
  const setView = useAppStore((s) => s.setView);
  const t = dict(language);

  const [pretest, setPretest] = useState<FileState | null>(null);
  const [posttest, setPosttest] = useState<FileState | null>(null);
  const [busy, setBusy] = useState<null | "pretest" | "posttest">(null);
  const [error, setError] = useState<ErrorState | null>(null);

  const onFile = useCallback(async (kind: "pretest" | "posttest", file: File) => {
    setError(null);
    setBusy(kind);
    try {
      const buf = await file.arrayBuffer();
      const parsed = await parseInWorker(buf, kind);
      const state = { name: file.name, parsed };
      if (kind === "pretest") setPretest(state);
      else setPosttest(state);
    } catch (e) {
      setError({ scope: kind, message: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }, []);

  const canConfirm = !!pretest && !!posttest;

  const confirm = useCallback(async () => {
    if (!pretest || !posttest) return;
    const dataset = mergeExams(pretest.parsed, posttest.parsed, { language });
    await setDataset(language, dataset);
    setView("dashboard");
  }, [pretest, posttest, language, setDataset, setView]);

  return (
    <section aria-labelledby="upload-heading" className="grid gap-4 md:grid-cols-2">
      <h2 id="upload-heading" className="sr-only">
        Unggah Pretest & Posttest
      </h2>
      <DropZone
        kind="pretest"
        label={t.upload.pretestLabel}
        file={pretest}
        busy={busy === "pretest"}
        error={error?.scope === "pretest" ? error.message : null}
        onFile={onFile}
      />
      <DropZone
        kind="posttest"
        label={t.upload.posttestLabel}
        file={posttest}
        busy={busy === "posttest"}
        error={error?.scope === "posttest" ? error.message : null}
        onFile={onFile}
      />
      <div className="md:col-span-2">
        {canConfirm && pretest && posttest && (
          <PreviewModal
            pretest={pretest.parsed}
            posttest={posttest.parsed}
            onConfirm={confirm}
            onCancel={() => {
              setPretest(null);
              setPosttest(null);
            }}
          />
        )}
      </div>
    </section>
  );
}

interface DropZoneProps {
  kind: "pretest" | "posttest";
  label: string;
  file: FileState | null;
  busy: boolean;
  error: string | null;
  onFile: (k: "pretest" | "posttest", f: File) => void;
}

function DropZone({ kind, label, file, busy, error, onFile }: DropZoneProps) {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  const inputId = `file-${kind}`;
  return (
    <div
      className="card p-4"
      role="group"
      aria-labelledby={`${inputId}-label`}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) onFile(kind, f);
      }}
    >
      <div className="flex items-center justify-between">
        <label id={`${inputId}-label`} htmlFor={inputId} className="font-medium">
          {label}
        </label>
        {busy && (
          <span className="text-sm text-slate-500" role="status">
            {t.upload.processing}
          </span>
        )}
      </div>
      <input
        id={inputId}
        data-testid={`file-${kind}`}
        type="file"
        accept=".xlsx,.xls"
        className="mt-3 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(kind, f);
        }}
      />
      {file && (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <dt className="text-slate-500">{t.upload.accepted}</dt>
          <dd className="font-medium">{file.parsed.diagnostics.accepted}</dd>
          <dt className="text-slate-500">{t.upload.invalidNim}</dt>
          <dd className="font-medium">{file.parsed.diagnostics.rejectedInvalidNim}</dd>
          <dt className="text-slate-500">{t.upload.duplicates}</dt>
          <dd className="font-medium">{file.parsed.diagnostics.duplicateNim}</dd>
          <dt className="text-slate-500">Soal</dt>
          <dd className="font-medium">{file.parsed.diagnostics.soalCount}</dd>
        </dl>
      )}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
        >
          {t.errors.parseFailed}: {error}
        </p>
      )}
    </div>
  );
}

interface PreviewModalProps {
  pretest: ParsedExam;
  posttest: ParsedExam;
  onConfirm: () => void;
  onCancel: () => void;
}

function PreviewModal({ pretest, posttest, onConfirm, onCancel }: PreviewModalProps) {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  const matched = useMemo(() => {
    const postNim = new Set(posttest.students.map((s) => s.nim));
    return pretest.students.filter((s) => postNim.has(s.nim)).length;
  }, [pretest, posttest]);
  const kunciCount = useMemo(
    () => new Set([...Object.keys(pretest.kunci), ...Object.keys(posttest.kunci)]).size,
    [pretest, posttest],
  );
  return (
    <div className="card p-4" role="region" aria-label={t.upload.preview}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2>{t.upload.preview}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {matched} NIM cocok antara pretest & posttest · {kunciCount} kunci terdeteksi
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {t.upload.cancel}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            disabled={matched === 0 || kunciCount === 0}
          >
            {t.upload.confirm}
          </button>
        </div>
      </div>
      <SampleTable exam={pretest} title="Pretest" />
      <SampleTable exam={posttest} title="Posttest" />
    </div>
  );
}

function SampleTable({ exam, title }: { exam: ParsedExam; title: string }) {
  const sample = exam.students.slice(0, 3);
  const cols = exam.soalIds.slice(0, 5);
  return (
    <div className="mt-4">
      <h3 className="mb-1 text-sm font-semibold">
        {title} · {exam.students.length} peserta · {exam.soalIds.length} soal
      </h3>
      <div className="overflow-auto rounded border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-2 py-1">NIM</th>
              <th className="px-2 py-1">Nama</th>
              <th className="px-2 py-1">Fakultas</th>
              {cols.map((c) => (
                <th key={c} className="px-2 py-1">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sample.map((s) => (
              <tr key={s.nim} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-2 py-1 font-mono">{s.nim}</td>
                <td className="px-2 py-1">{s.nama}</td>
                <td className="px-2 py-1">{s.fakultas}</td>
                {cols.map((c) => (
                  <td key={c} className="px-2 py-1">
                    {s.answers[c] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
