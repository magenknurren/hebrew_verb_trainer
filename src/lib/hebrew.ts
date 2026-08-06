const NIKUD_RE = /[\u0591-\u05C7\u05F3-\u05F4]/g;
const BIDI_RE = /[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

const FINAL_TO_REGULAR: Record<string, string> = {
  "\u05DA": "\u05DB", // ך → כ
  "\u05DD": "\u05DE", // ם → מ
  "\u05DF": "\u05E0", // ן → נ
  "\u05E3": "\u05E4", // ף → פ
  "\u05E5": "\u05E6", // ץ → צ
};

export function normalizeHebrew(input: string): string {
  let text = input.trim().replace(NIKUD_RE, "").replace(BIDI_RE, "").replace(/\u05BE/g, "");

  text = [...text]
    .map((char) => FINAL_TO_REGULAR[char] ?? char)
    .join("");

  return text;
}

export function isHebrewText(input: string): boolean {
  return /[\u0590-\u05FF]/.test(input);
}
