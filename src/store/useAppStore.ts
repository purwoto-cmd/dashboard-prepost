import { create } from "zustand";
import type { Dataset, Language } from "@/types";
import {
  clearDataset,
  loadDataset,
  loadPreferences,
  saveDataset,
  savePreferences,
} from "@/lib/db/dexie";

export type View = "upload" | "dashboard" | "fakultas" | "butir-soal";

interface AppState {
  language: Language;
  view: View;
  darkMode: boolean;
  datasetAr: Dataset | null;
  datasetEn: Dataset | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (l: Language) => void;
  setView: (v: View) => void;
  toggleDark: () => void;
  setDataset: (l: Language, d: Dataset) => Promise<void>;
  reset: (l: Language) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  language: "ar",
  view: "upload",
  darkMode: false,
  datasetAr: null,
  datasetEn: null,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    const prefs = await loadPreferences();
    const [ar, en] = await Promise.all([loadDataset("ar"), loadDataset("en")]);
    set({
      language: prefs?.language ?? "ar",
      darkMode: prefs?.darkMode ?? false,
      datasetAr: ar,
      datasetEn: en,
      hydrated: true,
      view: ar || en ? "dashboard" : "upload",
    });
    applyDarkClass(prefs?.darkMode ?? false);
  },

  setLanguage(l) {
    set({ language: l });
    void savePreferences({ language: l, darkMode: get().darkMode });
  },

  setView(v) {
    set({ view: v });
  },

  toggleDark() {
    const next = !get().darkMode;
    applyDarkClass(next);
    set({ darkMode: next });
    void savePreferences({ language: get().language, darkMode: next });
  },

  async setDataset(l, d) {
    await saveDataset(l, d);
    if (l === "ar") set({ datasetAr: d });
    else set({ datasetEn: d });
  },

  async reset(l) {
    await clearDataset(l);
    if (l === "ar") set({ datasetAr: null });
    else set({ datasetEn: null });
  },
}));

function applyDarkClass(on: boolean): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (on) root.classList.add("dark");
  else root.classList.remove("dark");
}

export function currentDataset(state: AppState): Dataset | null {
  return state.language === "ar" ? state.datasetAr : state.datasetEn;
}
