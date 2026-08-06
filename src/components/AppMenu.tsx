import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAvailableLocales, getLocaleLabel } from "../locales";

interface AppMenuProps {
  onOpenVerbOverview: () => void;
}

export function AppMenu({ onOpenVerbOverview }: AppMenuProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const localeOptions = getAvailableLocales();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openVerbOverview = () => {
    setOpen(false);
    onOpenVerbOverview();
  };

  return (
    <div className="app-menu" ref={menuRef}>
      <button
        type="button"
        className="app-menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t("menuLabel")}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="app-menu-icon" aria-hidden="true">
          ☰
        </span>
      </button>

      {open && (
        <div className="app-menu-dropdown" role="menu">
          <button
            type="button"
            className="app-menu-item"
            role="menuitem"
            onClick={openVerbOverview}
          >
            {t("verbOverviewTitle")}
          </button>

          <div className="app-menu-divider" role="separator" />

          <label className="app-menu-lang">
            <span className="app-menu-lang-label">{t("language")}</span>
            <select
              className="app-menu-lang-select"
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
        </div>
      )}
    </div>
  );
}
