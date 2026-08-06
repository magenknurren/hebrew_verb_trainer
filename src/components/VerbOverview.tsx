import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LocalizedVerb } from "../types/verb";
import { PealimLink } from "./PealimLink";

interface VerbOverviewProps {
  verbs: LocalizedVerb[];
  currentVerbId?: string;
  onSelectVerb: (verbId: string) => void;
  onClose: () => void;
}

function matchesSearch(verb: LocalizedVerb, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const infinitive = verb.forms.infinitive.he[0] ?? "";
  return (
    verb.lemma.toLowerCase().includes(normalized) ||
    infinitive.includes(normalized) ||
    verb.id.toLowerCase().includes(normalized)
  );
}

export function VerbOverview({ verbs, currentVerbId, onSelectVerb, onClose }: VerbOverviewProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(
    () => [...verbs].sort((a, b) => a.lemma.localeCompare(b.lemma, undefined, { sensitivity: "base" })),
    [verbs],
  );

  const filtered = useMemo(
    () => sorted.filter((verb) => matchesSearch(verb, search)),
    [sorted, search],
  );

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const countLabel =
    search.trim().length > 0
      ? t("verbOverviewFilteredCount", { filtered: filtered.length, total: sorted.length })
      : t("verbOverviewCount", { count: sorted.length });

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
        <div className="verb-overview-toolbar">
          <input
            ref={searchRef}
            type="search"
            className="verb-overview-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("verbOverviewSearchPlaceholder")}
            aria-label={t("verbOverviewSearchPlaceholder")}
          />
          <p className="verb-overview-count">{countLabel}</p>
          <p className="verb-overview-hint">{t("verbOverviewHint")}</p>
        </div>
        <ul className="verb-overview-list">
          {filtered.length === 0 ? (
            <li className="verb-overview-empty">{t("verbOverviewNoResults")}</li>
          ) : (
            filtered.map((verb) => (
              <li
                key={verb.id}
                className={`verb-overview-item${verb.id === currentVerbId ? " verb-overview-item--active" : ""}`}
              >
                <button
                  type="button"
                  className="verb-overview-select"
                  onClick={() => onSelectVerb(verb.id)}
                  aria-current={verb.id === currentVerbId ? "true" : undefined}
                >
                  <span className="verb-overview-lemma">{verb.lemma}</span>
                  <span className="hebrew infinitive-he" dir="rtl" lang="he">
                    {verb.forms.infinitive.he[0]}
                  </span>
                </button>
                <PealimLink url={verb.pealimUrl} label={t("openOnPealim")} />
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}