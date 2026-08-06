import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SessionState } from "../hooks/useSession";
import type { LocalizedVerbForm } from "../types/verb";
import { validateAnswer } from "../lib/validate";
import { InfinitiveDisplay } from "./InfinitiveDisplay";
import { PealimLink } from "./PealimLink";

const FEEDBACK_DELAY_MS = 1000;

interface QuizScreenProps {
  state: SessionState;
  currentForm: LocalizedVerbForm | null;
  progress: number;
  onSubmit: (input: string, isCorrect: boolean) => void;
  onAdvance: () => void;
  onClearFeedback: () => void;
  onNextVerb: () => void;
  onSkipForm: () => void;
}

export function QuizScreen({
  state,
  currentForm,
  progress,
  onSubmit,
  onAdvance,
  onClearFeedback,
  onNextVerb,
  onSkipForm,
}: QuizScreenProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSuccess = state.feedback === "correct";
  const isLocked = isSuccess;

  const infinitiveForm = state.verb.forms.infinitive;
  const promptForm =
    state.phase === "infinitive" ? infinitiveForm : currentForm;

  useEffect(() => {
    setInput("");
    setShowSolution(false);
    setShowErrorOverlay(false);
    onClearFeedback();
    inputRef.current?.focus();
  }, [state.verb.id, state.phase, state.currentFormKey, onClearFeedback]);

  useEffect(() => {
    if (state.feedback !== "incorrect") return;

    setShowErrorOverlay(true);

    const selectInput = () => inputRef.current?.select();
    requestAnimationFrame(selectInput);

    const timer = window.setTimeout(() => {
      setShowErrorOverlay(false);
      selectInput();
    }, FEEDBACK_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [state.feedback, state.attemptId]);

  useEffect(() => {
    if (state.feedback !== "correct") return;

    const timer = window.setTimeout(() => {
      onAdvance();
    }, FEEDBACK_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [state.feedback, state.attemptId, state.phase, state.currentFormKey, state.verb.id, onAdvance]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!promptForm || state.phase === "complete" || isLocked) return;

    const isCorrect = validateAnswer(input, promptForm.he);
    onSubmit(input, isCorrect);
  };

  if (state.phase === "complete") {
    return (
      <div className="quiz complete">
        <div className="success-badge success-badge--large" aria-hidden="true">
          <span className="success-check">✓</span>
        </div>
        <p className="prompt complete-message">{t("complete")}</p>
        <p className="verb-meta">
          {state.verb.lemma} ·{" "}
          <InfinitiveDisplay
            hebrew={infinitiveForm.he[0]}
            pealimUrl={state.verb.pealimUrl}
            pealimLabel={t("openOnPealim")}
          />
        </p>
        <button type="button" className="btn primary" onClick={onNextVerb}>
          {t("nextVerb")}
        </button>
      </div>
    );
  }

  return (
    <div className={`quiz${isSuccess ? " quiz--success" : ""}${showErrorOverlay ? " quiz--error" : ""}`}>
      {isSuccess && (
        <div className="success-overlay" role="status" aria-live="polite">
          <div className="success-badge">
            <span className="success-check">✓</span>
          </div>
          <p className="success-message">{t("correct")}</p>
        </div>
      )}

      {showErrorOverlay && (
        <div className="error-overlay" role="alert" aria-live="assertive">
          <div className="error-badge">
            <span className="error-mark">✕</span>
          </div>
          <p className="error-message">{t("incorrect")}</p>
        </div>
      )}

      <p className="phase-label">
        {state.phase === "infinitive" ? t("infinitivePhase") : t("conjugationPhase")}
      </p>

      {state.phase === "conjugation" && infinitiveForm && (
        <div className="infinitive-banner">
          <span className="infinitive-label">{t("infinitiveLabel")}</span>
          <span className="hebrew infinitive-he" dir="rtl" lang="he">
            {infinitiveForm.he[0]}
          </span>
        </div>
      )}

      <p className="prompt" dir="ltr">
        {promptForm?.prompt}
      </p>

      <form onSubmit={handleSubmit} className="answer-form">
        <input
          ref={inputRef}
          type="text"
          className={`hebrew-input${showErrorOverlay ? " incorrect" : ""}${isSuccess ? " correct" : ""}`}
          dir="rtl"
          lang="he"
          value={input}
          disabled={isLocked}
          onChange={(e) => {
            setInput(e.target.value);
            setShowErrorOverlay(false);
            if (state.feedback === "incorrect") onClearFeedback();
            if (showSolution) setShowSolution(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.length !== 1) return;

            if (state.feedback === "incorrect") {
              onClearFeedback();
            }
            setShowErrorOverlay(false);
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={t("conjugationPhase")}
        />
        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={isLocked}>
            {t("check")}
          </button>
          <button
            type="button"
            className={`btn outline${showSolution ? " active" : ""}`}
            onClick={() => setShowSolution((visible) => !visible)}
            disabled={isLocked}
          >
            {showSolution ? t("hideSolution") : t("showSolution")}
          </button>
        </div>
      </form>

      {showSolution && promptForm && (
        <div className="solution" role="status">
          <PealimLink
            url={state.verb.pealimUrl}
            label={t("openOnPealim")}
          />
          <div className="solution-content" dir="rtl" lang="he">
            <span className="solution-label">{t("solution")}: </span>
            <span className="hebrew solution-text">{promptForm.he.join(" / ")}</span>
          </div>
        </div>
      )}

      {state.phase === "conjugation" && (
        <p className="progress">
          {t("progress", { done: progress, total: state.totalConjugationForms })}
        </p>
      )}

      <div className="quiz-nav">
        <button
          type="button"
          className="btn secondary"
          onClick={onNextVerb}
          disabled={isLocked}
        >
          {t("skipVerb")}
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={onSkipForm}
          disabled={isLocked}
        >
          {t("skipForm")}
        </button>
      </div>
    </div>
  );
}
