export interface VerbFormCore {
  he: string[];
}

export interface VerbCore {
  id: string;
  pealimUrl: string;
  root: string;
  binyan: string;
  forms: Record<string, VerbFormCore>;
}

export interface VerbLocaleEntry {
  lemma: string;
  forms: Record<string, string>;
}

export type VerbLocaleFile = Record<string, VerbLocaleEntry>;

export interface LocalizedVerbForm extends VerbFormCore {
  prompt: string;
}

export interface LocalizedVerb extends VerbCore {
  lemma: string;
  forms: Record<string, LocalizedVerbForm>;
}

export type FormKey = keyof LocalizedVerb["forms"];

export type QuizPhase = "infinitive" | "conjugation" | "complete";
