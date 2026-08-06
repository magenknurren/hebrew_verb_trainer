import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuizPhase, LocalizedVerb } from "../types/verb";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomVerb(verbs: LocalizedVerb[], excludeId?: string): LocalizedVerb {
  const pool = excludeId ? verbs.filter((v) => v.id !== excludeId) : verbs;
  const source = pool.length ? pool : verbs;
  return source[Math.floor(Math.random() * source.length)];
}

export interface SessionState {
  verb: LocalizedVerb;
  phase: QuizPhase;
  conjugationQueue: string[];
  currentFormKey: string | null;
  completedFormKeys: string[];
  feedback: "correct" | "incorrect" | null;
  attemptId: number;
  totalConjugationForms: number;
}

export function useSession(verbs: LocalizedVerb[]) {
  const startSession = useCallback(
    (excludeId?: string): SessionState => {
      const verb = pickRandomVerb(verbs, excludeId);
      const conjugationKeys = Object.keys(verb.forms).filter((k) => k !== "infinitive");

      return {
        verb,
        phase: "infinitive",
        conjugationQueue: shuffle(conjugationKeys),
        currentFormKey: null,
        completedFormKeys: [],
        feedback: null,
        attemptId: 0,
        totalConjugationForms: conjugationKeys.length,
      };
    },
    [verbs],
  );

  const [state, setState] = useState<SessionState>(() => startSession());

  useEffect(() => {
    setState((prev) => {
      const updatedVerb = verbs.find((verb) => verb.id === prev.verb.id);
      if (!updatedVerb || updatedVerb === prev.verb) return prev;
      return { ...prev, verb: updatedVerb };
    });
  }, [verbs]);

  const currentForm = useMemo(() => {
    if (!state.currentFormKey) return null;
    return state.verb.forms[state.currentFormKey] ?? null;
  }, [state.currentFormKey, state.verb.forms]);

  const progress = useMemo(() => {
    if (state.phase === "infinitive") return 0;
    if (state.phase === "complete") return state.totalConjugationForms;
    return state.completedFormKeys.length;
  }, [state]);

  const submitAnswer = useCallback((_input: string, isCorrect: boolean) => {
    setState((prev) => ({
      ...prev,
      feedback: isCorrect ? "correct" : "incorrect",
      attemptId: prev.attemptId + 1,
    }));
  }, []);

  const advanceAfterCorrect = useCallback(() => {
    setState((prev) => {
      if (prev.feedback !== "correct") return prev;

      if (prev.phase === "infinitive") {
        const [nextKey, ...rest] = prev.conjugationQueue;
        if (!nextKey) {
          return { ...prev, phase: "complete", feedback: null };
        }
        return {
          ...prev,
          phase: "conjugation",
          currentFormKey: nextKey,
          conjugationQueue: rest,
          feedback: null,
        };
      }

      if (prev.phase === "conjugation" && prev.currentFormKey) {
        const completed = [...prev.completedFormKeys, prev.currentFormKey];
        const [nextKey, ...rest] = prev.conjugationQueue;

        if (!nextKey) {
          return {
            ...prev,
            phase: "complete",
            completedFormKeys: completed,
            currentFormKey: null,
            feedback: null,
          };
        }

        return {
          ...prev,
          completedFormKeys: completed,
          currentFormKey: nextKey,
          conjugationQueue: rest,
          feedback: null,
        };
      }

      return { ...prev, feedback: null };
    });
  }, []);

  const clearFeedback = useCallback(() => {
    setState((prev) => ({ ...prev, feedback: null }));
  }, []);

  const nextVerb = useCallback(() => {
    setState(startSession(state.verb.id));
  }, [startSession, state.verb.id]);

  const skipForm = useCallback(() => {
    setState((prev) => {
      if (prev.phase === "complete" || prev.feedback === "correct") return prev;

      if (prev.phase === "infinitive") {
        const [nextKey, ...rest] = prev.conjugationQueue;
        if (!nextKey) {
          return { ...prev, phase: "complete", feedback: null };
        }
        return {
          ...prev,
          phase: "conjugation",
          currentFormKey: nextKey,
          conjugationQueue: rest,
          feedback: null,
        };
      }

      if (prev.phase === "conjugation" && prev.currentFormKey) {
        const [nextKey, ...rest] = prev.conjugationQueue;

        if (!nextKey) {
          return {
            ...prev,
            phase: "complete",
            currentFormKey: null,
            feedback: null,
          };
        }

        return {
          ...prev,
          currentFormKey: nextKey,
          conjugationQueue: rest,
          feedback: null,
        };
      }

      return prev;
    });
  }, []);

  return {
    state,
    currentForm,
    progress,
    submitAnswer,
    advanceAfterCorrect,
    clearFeedback,
    nextVerb,
    skipForm,
  };
}
