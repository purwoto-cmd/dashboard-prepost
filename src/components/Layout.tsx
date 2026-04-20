import { type ReactNode } from "react";
import { useAppStore, currentDataset, type View } from "@/store/useAppStore";
import { dict } from "@/i18n";

export function Layout({ children }: { children: ReactNode }) {
  const { language, view, darkMode, setLanguage, setView, toggleDark } = useAppStore();
  const data = useAppStore(currentDataset);
  const t = dict(language);
  const disabled = !data;

  const nav: Array<{ id: View; label: string }> = [
    { id: "upload", label: t.nav.upload },
    { id: "dashboard", label: t.nav.dashboard },
    { id: "fakultas", label: t.nav.fakultas },
    { id: "butir-soal", label: t.nav.butirSoal },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700"
            />
            <h1 className="text-base font-semibold md:text-lg">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <fieldset
              className="flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700"
              aria-label={t.context.switch}
            >
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-sm ${
                  language === "ar"
                    ? "bg-brand-600 text-white"
                    : "text-slate-700 dark:text-slate-200"
                }`}
                aria-pressed={language === "ar"}
                onClick={() => setLanguage("ar")}
              >
                {t.context.arab}
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-sm ${
                  language === "en"
                    ? "bg-brand-600 text-white"
                    : "text-slate-700 dark:text-slate-200"
                }`}
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
              >
                {t.context.inggris}
              </button>
            </fieldset>
            <button
              type="button"
              className="btn-secondary"
              aria-pressed={darkMode}
              onClick={toggleDark}
              title={t.actions.darkMode}
            >
              {darkMode ? "☾" : "☀"}
              <span className="sr-only">{t.actions.darkMode}</span>
            </button>
          </div>
        </div>
        <nav aria-label="views" className="mx-auto max-w-7xl px-4">
          <ul className="flex gap-1 overflow-x-auto pb-2">
            {nav.map((n) => {
              const isDisabled = n.id !== "upload" && disabled;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      view === n.id
                        ? "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    } ${isDisabled ? "opacity-40" : ""}`}
                    aria-current={view === n.id ? "page" : undefined}
                    disabled={isDisabled}
                    onClick={() => setView(n.id)}
                  >
                    {n.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6" lang={language === "ar" ? "ar" : "en"}>
        {children}
      </main>
    </div>
  );
}
