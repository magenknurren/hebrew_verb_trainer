import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { LocalizedVerb } from "../types/verb";
import { InfinitiveDisplay } from "./InfinitiveDisplay";

interface VerbOverviewProps {
  verbs: LocalizedVerb[];
  onClose: () => void;
}

export function VerbOverview({ verbs, onClose }: VerbOverviewProps) {
  const { t } = useTranslation();
  const sorted = [...verbs].sort((a, b) => a.lemma.localeCompare(b.lemma, undefined, { sensitivity: "base" }));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="verb-overview-backdrop" onClick={onClose} role="presentation">
      <div
        className="verb-overview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verb-overview-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="verb-overview-header">
          <h2 id="verb-overview-title">{t("verbOverviewTitle")}</h2>
          <button type="button" className="verb-overview-close" onClick={onClose} aria-label={t("close")}>
            ×
          </button>
        </header>
        <p className="verb-overview-count">
          {t("verbOverviewCount", { count: sorted.length })}
        </p>
        <ul className="verb-overview-list">
          {sorted.map((verb) => (
            <li key={verb.id} className="verb-overview-item">
              <span className="verb-overview-lemma">{verb.lemma}</span>
              <InfinitiveDisplay
                hebrew={verb.forms.infinitive.he[0]}
                pealimUrl={verb.pealimUrl}
                pealimLabel={t("openOnPealim")}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
