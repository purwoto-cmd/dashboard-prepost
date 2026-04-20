import Dexie, { type Table } from "dexie";
import type { Dataset, Language } from "@/types";

export interface DatasetRecord {
  /** "ar" | "en" — enforced by Language type. One dataset per language. */
  id: Language;
  dataset: Dataset;
}

export interface PreferencesRecord {
  id: "prefs";
  language: Language;
  darkMode: boolean;
}

export class LpjDB extends Dexie {
  datasets!: Table<DatasetRecord, Language>;
  preferences!: Table<PreferencesRecord, "prefs">;

  constructor() {
    super("lpj-exam-analytics");
    this.version(1).stores({
      datasets: "id",
      preferences: "id",
    });
  }
}

export const db = new LpjDB();

export async function saveDataset(language: Language, dataset: Dataset): Promise<void> {
  await db.datasets.put({ id: language, dataset });
}

export async function loadDataset(language: Language): Promise<Dataset | null> {
  const row = await db.datasets.get(language);
  return row?.dataset ?? null;
}

export async function clearDataset(language: Language): Promise<void> {
  await db.datasets.delete(language);
}

export async function savePreferences(prefs: Omit<PreferencesRecord, "id">): Promise<void> {
  await db.preferences.put({ id: "prefs", ...prefs });
}

export async function loadPreferences(): Promise<PreferencesRecord | null> {
  const p = await db.preferences.get("prefs");
  return p ?? null;
}
