import type { VerbCore, VerbLocaleEntry, VerbLocaleFile } from "../types/verb";
import labels from "../../locales/labels.json";
import { DEFAULT_LOCALE, FALLBACK_LOCALES, type LocaleCode } from "./config";

const appModules = import.meta.glob("../../locales/app/*.json", {
  eager: true,
  import: "default",
}) as Record<string, Record<string, string>>;

const verbModules = import.meta.glob("../../locales/verbs/*.json", {
  eager: true,
  import: "default",
}) as Record<string, VerbLocaleFile>;

function localeFromPath(path: string): LocaleCode {
  const match = path.match(/\/([^/]+)\.json$/);
  return match?.[1] ?? "";
}

function indexByLocale<T>(modules: Record<string, T>): Record<LocaleCode, T> {
  const indexed: Record<LocaleCode, T> = {};
  for (const [path, value] of Object.entries(modules)) {
    const code = localeFromPath(path);
    if (code) indexed[code] = value;
  }
  return indexed;
}

export const appLocales = indexByLocale(appModules);
export const verbLocales = indexByLocale(verbModules);

export function getAvailableLocales(): LocaleCode[] {
  const appCodes = Object.keys(appLocales);
  const verbCodes = Object.keys(verbLocales);
  return appCodes.filter((code) => verbCodes.includes(code)).sort();
}

export function getLocaleLabel(code: LocaleCode): string {
  const label = labels[code as keyof typeof labels];
  return label ?? code.toUpperCase();
}

export function buildI18nResources() {
  return Object.fromEntries(
    Object.entries(appLocales).map(([code, translation]) => [
      code,
      { translation },
    ]),
  );
}

function getVerbLocaleEntry(
  verbId: string,
  locale: LocaleCode,
): VerbLocaleEntry | undefined {
  const chain = [locale, ...FALLBACK_LOCALES.filter((l) => l !== locale)];
  for (const code of chain) {
    const entry = verbLocales[code]?.[verbId];
    if (entry) return entry;
  }
  return undefined;
}

export function getVerbLemma(verbId: string, locale: LocaleCode): string {
  return getVerbLocaleEntry(verbId, locale)?.lemma ?? verbId;
}

export function getVerbFormPrompt(
  verbId: string,
  formKey: string,
  locale: LocaleCode,
): string {
  const entry = getVerbLocaleEntry(verbId, locale);
  return entry?.forms[formKey] ?? formKey;
}

export function localizeVerbs(cores: VerbCore[], locale: LocaleCode) {
  return cores.map((core) => {
    const entry = getVerbLocaleEntry(core.id, locale);
    const forms = Object.fromEntries(
      Object.entries(core.forms).map(([formKey, formCore]) => [
        formKey,
        {
          ...formCore,
          prompt: entry?.forms[formKey] ?? formKey,
        },
      ]),
    );

    return {
      ...core,
      lemma: entry?.lemma ?? core.id,
      forms,
    };
  });
}

export function resolveInitialLocale(): LocaleCode {
  const available = getAvailableLocales();
  const stored = localStorage.getItem("locale");
  if (stored && available.includes(stored)) return stored;

  const browser = navigator.language.slice(0, 2);
  if (available.includes(browser)) return browser;

  if (available.includes(DEFAULT_LOCALE)) return DEFAULT_LOCALE;
  return available[0] ?? DEFAULT_LOCALE;
}

export function persistLocale(code: LocaleCode) {
  localStorage.setItem("locale", code);
}
