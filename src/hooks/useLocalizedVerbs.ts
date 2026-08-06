import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { localizeVerbs } from "../locales";
import type { VerbCore } from "../types/verb";

export function useLocalizedVerbs(cores: VerbCore[]) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return useMemo(
    () => localizeVerbs(cores, locale),
    [cores, locale],
  );
}
