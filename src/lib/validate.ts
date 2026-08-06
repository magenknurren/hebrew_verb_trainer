import { normalizeHebrew } from "./hebrew";

export function validateAnswer(input: string, accepted: string[]): boolean {
  const normalized = normalizeHebrew(input);
  if (!normalized) return false;

  const acceptedNormalized = accepted.map(normalizeHebrew);
  return acceptedNormalized.includes(normalized);
}
