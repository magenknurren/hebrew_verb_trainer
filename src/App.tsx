import { useState } from "react";
import { useTranslation } from "react-i18next";
import verbCores from "../data/verbs.json";
import { QuizScreen } from "./components/QuizScreen";
import { AppMenu } from "./components/AppMenu";
import { VerbOverview } from "./components/VerbOverview";
import { useLocalizedVerbs } from "./hooks/useLocalizedVerbs";
import { useSession } from "./hooks/useSession";
import type { VerbCore } from "./types/verb";
import "./index.css";

const cores = verbCores as VerbCore[];

function App() {
  const { t } = useTranslation();
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
    selectVerb,
    skipForm,
  } = useSession(verbs);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t("appTitle")}</h1>
          <p className="direction-hint">{t("directionHint")}</p>
        </div>
        <AppMenu onOpenVerbOverview={() => setShowVerbOverview(true)} />
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

      {showVerbOverview && (
        <VerbOverview
          verbs={verbs}
          currentVerbId={state.verb.id}
          onSelectVerb={(verbId) => {
            selectVerb(verbId);
            setShowVerbOverview(false);
          }}
          onClose={() => setShowVerbOverview(false)}
        />
      )}
    </div>
  );
}

export default App;
