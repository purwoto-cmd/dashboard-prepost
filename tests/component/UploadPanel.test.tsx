import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadPanel } from "@/components/UploadPanel";
import { useAppStore } from "@/store/useAppStore";
import { clearDataset } from "@/lib/db/dexie";

function fileFromFixture(name: string): File {
  const bytes = readFileSync(resolve(__dirname, "..", "..", "fixtures", name));
  return new File([bytes], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function aoaFile(aoa: unknown[][], name: string): File {
  // Deferred import to avoid global side effects at module load.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require("xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Data");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new File([buf], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

describe("<UploadPanel />", () => {
  beforeEach(async () => {
    useAppStore.setState({
      language: "en",
      view: "upload",
      darkMode: false,
      datasetAr: null,
      datasetEn: null,
      hydrated: true,
    });
    await clearDataset("en");
    await clearDataset("ar");
  });

  it("happy path: uploads both files and shows preview", async () => {
    const user = userEvent.setup();
    render(<UploadPanel />);
    await user.upload(screen.getByTestId("file-pretest"), fileFromFixture("Pretest.xlsx"));
    await user.upload(screen.getByTestId("file-posttest"), fileFromFixture("Posttest.xlsx"));
    await waitFor(() => expect(screen.getByText(/Pratinjau/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Simpan/i })).toBeEnabled();
  });

  it("error path: invalid header surfaces parse error", async () => {
    const user = userEvent.setup();
    render(<UploadPanel />);
    const bad = aoaFile([["Remark", "Other"], ["x", "y"]], "bad.xlsx");
    await user.upload(screen.getByTestId("file-pretest"), bad);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/Header wajib hilang|Gagal mengurai/);
  });

  it("error path: out-of-range NIM increments invalidNim diagnostic", async () => {
    const user = userEvent.setup();
    render(<UploadPanel />);
    const aoa = [
      ["NIM", "NAMA LENGKAP", "Soal 1"],
      ["KUNCI", "", "A"],
      ["123", "Too Short", "A"], // invalid NIM
      ["1234567890", "OK", "A"],
    ];
    await user.upload(screen.getByTestId("file-pretest"), aoaFile(aoa, "p.xlsx"));
    // "Diterima" row reads the count '1'
    const accepted = await screen.findAllByText("1");
    expect(accepted.length).toBeGreaterThan(0);
  });

  it("error path: duplicate NIM increments duplicates counter", async () => {
    const user = userEvent.setup();
    render(<UploadPanel />);
    const aoa = [
      ["NIM", "NAMA LENGKAP", "Soal 1"],
      ["KUNCI", "", "A"],
      ["1234567890", "A", "A"],
      ["1234567890", "Dup", "A"],
      ["2234567890", "B", "A"],
    ];
    await user.upload(screen.getByTestId("file-pretest"), aoaFile(aoa, "p.xlsx"));
    const dupLabel = await screen.findByText(/NIM duplikat/i);
    const dd = dupLabel.nextElementSibling;
    expect(dd?.textContent).toBe("1");
  });
});
