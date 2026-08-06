import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SEED_PATH = join(ROOT, "data", "verb-seed.json");
const CORE_OUTPUT_PATH = join(ROOT, "data", "verbs.json");
const VERB_LOCALES_DIR = join(ROOT, "locales", "verbs");

const PEALIM_ID_MAP: Record<string, string> = {
  "INF-L": "infinitive",
  "AP-ms": "present_ms",
  "AP-fs": "present_fs",
  "AP-mp": "present_mp",
  "AP-fp": "present_fp",
  "PERF-1s": "past_1sg",
  "PERF-1p": "past_1pl",
  "PERF-2ms": "past_2ms",
  "PERF-2fs": "past_2fs",
  "PERF-2mp": "past_2mp",
  "PERF-2fp": "past_2fp",
  "PERF-3ms": "past_3ms",
  "PERF-3fs": "past_3fs",
  "PERF-3p": "past_3pl",
  "IMPF-1s": "future_1sg",
  "IMPF-1p": "future_1pl",
  "IMPF-2ms": "future_2ms",
  "IMPF-2fs": "future_2fs",
  "IMPF-2mp": "future_2mp",
  "IMPF-2fp": "future_2fp",
  "IMPF-3ms": "future_3ms",
  "IMPF-3fs": "future_3fs",
  "IMPF-3mp": "future_3mp",
  "IMPF-3fp": "future_3fp",
  "IMP-2ms": "imperative_ms",
  "IMP-2fs": "imperative_fs",
  "IMP-2mp": "imperative_mp",
  "IMP-2fp": "imperative_fp",
};

const FORM_ORDER = Object.values(PEALIM_ID_MAP);

interface SeedEntry {
  url: string;
  de?: string;
  lemma?: Record<string, string>;
}

interface VerbFormCore {
  he: string[];
}

interface VerbCore {
  id: string;
  pealimUrl: string;
  root: string;
  binyan: string;
  forms: Record<string, VerbFormCore>;
}

interface VerbLocaleEntry {
  lemma: string;
  forms: Record<string, string>;
}

type VerbLocaleFile = Record<string, VerbLocaleEntry>;

interface ImportedVerb {
  core: VerbCore;
  locales: {
    en: VerbLocaleEntry;
    de?: VerbLocaleEntry;
  };
}

const NIKUD_RE = /[\u0591-\u05C7\u05F3-\u05F4]/g;
const BIDI_RE = /[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

function stripNikud(text: string): string {
  return text.replace(NIKUD_RE, "").replace(BIDI_RE, "").replace(/\u05BE/g, "").trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function slugFromUrl(url: string): string {
  const match = url.match(/\/dict\/\d+-([^/]+)\/?$/);
  if (!match) throw new Error(`Cannot parse slug from URL: ${url}`);
  return match[1];
}

function cleanMeaning(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractHebrewForms($: cheerio.CheerioAPI, pealimId: string): string[] {
  const div = $(`div[id="${pealimId}"]`);
  if (!div.length) return [];

  const forms: string[] = [];

  div.find("span.chaser").each((_, el) => {
    const plain = $(el).text().replace(/^\s*~\s*/, "").trim();
    if (plain) forms.push(stripNikud(plain));
  });

  div.find("span.menukad").each((_, el) => {
    const vowelled = $(el).text().trim();
    if (vowelled) forms.push(stripNikud(vowelled));
  });

  return unique(forms);
}

function extractEnglishPrompt($: cheerio.CheerioAPI, pealimId: string): string {
  const div = $(`div[id="${pealimId}"]`);
  const meaning = cleanMeaning(div.find(".meaning").first().text());
  if (meaning) return meaning;

  if (pealimId === "INF-L") {
    const lead = cleanMeaning($("div.lead").first().text());
    return lead.startsWith("to ") ? lead : `to ${lead}`;
  }

  return "";
}

interface DeConjugation {
  past?: Record<string, string>;
  imperative?: string;
}

const DE_IRREGULAR: Record<string, DeConjugation> = {
  essen: {
    past: {
      "1sg": "aß",
      "1pl": "aßen",
      "2ms": "aßest",
      "2fs": "aßest",
      "2mp": "aßt",
      "2fp": "aßt",
      "3ms": "aß",
      "3fs": "aß",
      "3pl": "aßen",
    },
    imperative: "iss",
  },
  kommen: {
    past: {
      "1sg": "kam",
      "1pl": "kamen",
      "2ms": "kamst",
      "2fs": "kamst",
      "2mp": "kamt",
      "2fp": "kamt",
      "3ms": "kam",
      "3fs": "kam",
      "3pl": "kamen",
    },
    imperative: "komm",
  },
};

function verbStem(de: string): string {
  if (de.endsWith("en")) return de.slice(0, -2);
  return de;
}

function germanPast(stem: string, person: string): string {
  const irregular = DE_IRREGULAR[stem]?.past?.[person];
  if (irregular) return irregular;
  return `${verbStem(stem)}te`;
}

function germanPastPlural(stem: string): string {
  const irregular = DE_IRREGULAR[stem]?.past?.["3pl"];
  if (irregular) return irregular;
  return `${verbStem(stem)}ten`;
}

function imperativeStem(de: string): string {
  const irregular = DE_IRREGULAR[de]?.imperative;
  if (irregular) return irregular;
  return verbStem(de);
}

function generateDePrompt(formKey: string, deInfinitive: string): string {
  const stem = verbStem(deInfinitive);

  switch (formKey) {
    case "infinitive":
      return deInfinitive;
    case "present_ms":
      if (deInfinitive === "essen") return "ich esse / er isst";
      if (deInfinitive === "kommen") return "ich komme / er kommt";
      return `ich ${stem}e / er ${stem}t`;
    case "present_fs":
      if (deInfinitive === "essen") return "ich esse / sie isst";
      if (deInfinitive === "kommen") return "ich komme / sie kommt";
      return `ich ${stem}e / sie ${stem}t`;
    case "present_mp":
    case "present_fp":
      if (deInfinitive === "essen") return "wir essen / sie essen";
      if (deInfinitive === "kommen") return "wir kommen / sie kommen";
      return `wir ${deInfinitive} / sie ${deInfinitive}`;
    case "past_1sg":
      return `ich ${germanPast(deInfinitive, "1sg")}`;
    case "past_1pl":
      return `wir ${germanPastPlural(deInfinitive)}`;
    case "past_2ms":
      return `du ${germanPast(deInfinitive, "2ms")}`;
    case "past_2fs":
      return `du ${germanPast(deInfinitive, "2fs")}`;
    case "past_2mp":
      return `ihr ${germanPast(deInfinitive, "2mp")}`;
    case "past_2fp":
      return `ihr ${germanPast(deInfinitive, "2fp")}`;
    case "past_3ms":
      return `er ${germanPast(deInfinitive, "3ms")}`;
    case "past_3fs":
      return `sie ${germanPast(deInfinitive, "3fs")}`;
    case "past_3pl":
      return `sie ${germanPastPlural(deInfinitive)}`;
    case "future_1sg":
      return `ich werde ${deInfinitive}`;
    case "future_1pl":
      return `wir werden ${deInfinitive}`;
    case "future_2ms":
    case "future_2fs":
      return `du wirst ${deInfinitive}`;
    case "future_2mp":
    case "future_2fp":
      return `ihr werdet ${deInfinitive}`;
    case "future_3ms":
      return `er wird ${deInfinitive}`;
    case "future_3fs":
      return `sie wird ${deInfinitive}`;
    case "future_3mp":
    case "future_3fp":
      return `sie werden ${deInfinitive}`;
    case "imperative_ms":
    case "imperative_fs":
      return `${imperativeStem(deInfinitive)}!`;
    case "imperative_mp":
    case "imperative_fp":
      return `${imperativeStem(deInfinitive)}t!`;
    default:
      return deInfinitive;
  }
}

function extractRoot($: cheerio.CheerioAPI): string {
  const rootPara = $("p")
    .filter((_, el) => $(el).text().trim().startsWith("Root:"))
    .first();

  const linkText = rootPara.find("a").first().text().trim();
  if (linkText) {
    return linkText.replace(/\s*-\s*/g, "-").replace(/\s+/g, "");
  }

  return rootPara
    .text()
    .replace(/^Root:\s*/i, "")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, "")
    .trim();
}

function getGermanLemma(seed: SeedEntry): string | undefined {
  if (seed.lemma?.de) return seed.lemma.de;
  if (seed.de) return seed.de;
  return undefined;
}

async function fetchVerb(seed: SeedEntry): Promise<ImportedVerb> {
  const response = await fetch(seed.url, {
    headers: { "User-Agent": "hebrew-conjugations-import/0.1 (personal learning project)" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${seed.url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const enLemma = cleanMeaning($("div.lead").first().text());
  const deLemma = getGermanLemma(seed);

  const coreForms: Record<string, VerbFormCore> = {};
  const deForms: Record<string, string> = {};
  const enForms: Record<string, string> = {};

  for (const [pealimId, formKey] of Object.entries(PEALIM_ID_MAP)) {
    const he = extractHebrewForms($, pealimId);
    if (!he.length) {
      console.warn(`  warning: no Hebrew forms for ${pealimId} at ${seed.url}`);
      continue;
    }

    coreForms[formKey] = { he };
    enForms[formKey] = extractEnglishPrompt($, pealimId) || enLemma;
    if (deLemma) {
      deForms[formKey] = generateDePrompt(formKey, deLemma);
    }
  }

  const orderedCoreForms = Object.fromEntries(
    FORM_ORDER.filter((key) => coreForms[key]).map((key) => [key, coreForms[key]]),
  );

  const orderedDeForms = Object.fromEntries(
    FORM_ORDER.filter((key) => deForms[key]).map((key) => [key, deForms[key]]),
  );

  const orderedEnForms = Object.fromEntries(
    FORM_ORDER.filter((key) => enForms[key]).map((key) => [key, enForms[key]]),
  );

  return {
    core: {
      id: slugFromUrl(seed.url),
      pealimUrl: seed.url,
      root: extractRoot($),
      binyan: "paal",
      forms: orderedCoreForms,
    },
    locales: {
      en: {
        lemma: enLemma.startsWith("to ") ? enLemma : `to ${enLemma}`,
        forms: orderedEnForms,
      },
      ...(deLemma
        ? { de: { lemma: deLemma, forms: orderedDeForms } }
        : {}),
    },
  };
}

function mergeLocaleFile(
  existing: VerbLocaleFile,
  verbId: string,
  entry: VerbLocaleEntry,
): VerbLocaleFile {
  return {
    ...existing,
    [verbId]: entry,
  };
}

function readLocaleFile(path: string): VerbLocaleFile {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as VerbLocaleFile;
  } catch {
    return {};
  }
}

function readCoreVerbs(): VerbCore[] {
  try {
    return JSON.parse(readFileSync(CORE_OUTPUT_PATH, "utf-8")) as VerbCore[];
  } catch {
    return [];
  }
}

function mergeCoreVerbs(existing: VerbCore[], imported: VerbCore[]): VerbCore[] {
  const byId = new Map(existing.map((verb) => [verb.id, verb]));
  for (const verb of imported) {
    byId.set(verb.id, verb);
  }
  return [...byId.values()];
}

async function main() {
  const seed: SeedEntry[] = JSON.parse(readFileSync(SEED_PATH, "utf-8"));
  const importedCores: VerbCore[] = [];
  let deLocale = readLocaleFile(join(VERB_LOCALES_DIR, "de.json"));
  let enLocale = readLocaleFile(join(VERB_LOCALES_DIR, "en.json"));
  const existingCores = readCoreVerbs();

  mkdirSync(VERB_LOCALES_DIR, { recursive: true });

  console.log(`Importing ${seed.length} verbs from Pealim...\n`);

  for (const entry of seed) {
    console.log(`→ ${entry.url}`);
    const verb = await fetchVerb(entry);
    console.log(
      `  ✓ ${verb.locales.en.lemma} (${Object.keys(verb.core.forms).length} forms)`,
    );
    importedCores.push(verb.core);
    enLocale = mergeLocaleFile(enLocale, verb.core.id, verb.locales.en);
    if (verb.locales.de) {
      deLocale = mergeLocaleFile(deLocale, verb.core.id, verb.locales.de);
    } else {
      console.log("  (no de lemma — skipped German locale for this verb)");
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const cores = mergeCoreVerbs(existingCores, importedCores);

  writeFileSync(CORE_OUTPUT_PATH, `${JSON.stringify(cores, null, 2)}\n`, "utf-8");
  writeFileSync(join(VERB_LOCALES_DIR, "de.json"), `${JSON.stringify(deLocale, null, 2)}\n`, "utf-8");
  writeFileSync(join(VERB_LOCALES_DIR, "en.json"), `${JSON.stringify(enLocale, null, 2)}\n`, "utf-8");

  console.log(`\nWrote ${importedCores.length} imported verb(s); ${cores.length} total in:`);
  console.log(`  - ${CORE_OUTPUT_PATH}`);
  console.log(`  - ${join(VERB_LOCALES_DIR, "de.json")}`);
  console.log(`  - ${join(VERB_LOCALES_DIR, "en.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
