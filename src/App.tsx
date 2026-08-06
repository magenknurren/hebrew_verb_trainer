import { useState } from "react";
import { useTranslation } from "react-i18next";
import verbCores from "../data/verbs.json";
import { QuizScreen } from "./components/QuizScreen";
import { VerbOverview } from "./components/VerbOverview";
import { useLocalizedVerbs } from "./hooks/useLocalizedVerbs";
import { useSession } from "./hooks/useSession";
import { getAvailableLocales, getLocaleLabel } from "./locales";
import type { VerbCore } from "./types/verb";
import "./index.css";

const cores = verbCores as VerbCore[];
const localeOptions = getAvailableLocales();

function App() {
  const { t, i18n } = useTranslation();
  const [showVerbOverview, setShowVerbOverview] = useState(false);
  const verbs = useLocalizedVerbs(cores);
  const {
    state,
    currentForm,
    progress,
    submitAnswer,
    advanceAfterCorrect,
    clearFeedback,
    nextVerb,
    skipForm,
  } = useSession(verbs);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t("appTitle")}</h1>
          <p className="direction-hint">{t("directionHint")}</p>
        </div>
        <label className="lang-select">
          <span className="lang-label">{t("language")}</span>
          <select
            className="lang-menu"
            value={i18n.language}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
            aria-label={t("language")}
          >
            {localeOptions.map((code) => (
              <option key={code} value={code}>
                {getLocaleLabel(code)}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main>
        <QuizScreen
          state={state}
          currentForm={currentForm}
          progress={progress}
          onSubmit={submitAnswer}
          onAdvance={advanceAfterCorrect}
          onClearFeedback={clearFeedback}
          onNextVerb={nextVerb}
          onSkipForm={skipForm}
        />
      </main>

      <button
        type="button"
        className="info-fab"
        onClick={() => setShowVerbOverview(true)}
        aria-label={t("verbOverviewTitle")}
        title={t("verbOverviewTitle")}
      >
        i
      </button>

      {showVerbOverview && (
        <VerbOverview verbs={verbs} onClose={() => setShowVerbOverview(false)} />
      )}
    </div>
  );
}

export default App;
