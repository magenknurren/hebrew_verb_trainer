# Hebrew Verb Trainer

Webbasierte Lern-App für hebräische Pa'al-Konjugationen. **Richtung:** Übersetzung (DE/EN) → hebräische Eingabe ohne Nikud.

## Voraussetzungen

- [Node.js](https://nodejs.org/) 18+

## Installation

```bash
npm install
```

## Verben aus Pealim importieren

Siehe **[docs/ADDING_VERBS.md](docs/ADDING_VERBS.md)** für eine ausführliche Anleitung (Englisch).

Kurzfassung: URL + deutsches Lemma in [`data/verb-seed.json`](data/verb-seed.json) eintragen, dann:

```bash
npm run import:verbs
```

Das Skript liest jede Pealim-Seite und schreibt:
- [`data/verbs.json`](data/verbs.json) — sprachneutral (nur Hebräisch)
- [`locales/verbs/de.json`](locales/verbs/de.json) — deutsche Prompts
- [`locales/verbs/en.json`](locales/verbs/en.json) — englische Prompts (von Pealim)

## Neue Sprache hinzufügen (z. B. Italienisch)

1. **App-UI:** [`locales/app/it.json`](locales/app/it.json) anlegen (Texte wie in `de.json`)
2. **Verb-Prompts:** [`locales/verbs/it.json`](locales/verbs/it.json) anlegen:
   ```json
   {
     "leehov": {
       "lemma": "amare",
       "forms": {
         "infinitive": "amare",
         "present_ms": "io amo / lui ama",
         "...": "..."
       }
     }
   }
   ```
3. **Label im Sprachumschalter:** Eintrag in [`locales/labels.json`](locales/labels.json) ergänzen:
   ```json
   { "it": "Italiano" }
   ```

Die App erkennt Sprachen automatisch, sobald **sowohl** `locales/app/{code}.json` **als auch** `locales/verbs/{code}.json` existieren.

Struktur:
```
locales/
  app/          ← UI-Texte (Buttons, Meldungen)
  verbs/        ← Verb-Übersetzungen & Konjugations-Prompts
  labels.json   ← Anzeigenamen im Sprachumschalter
data/
  verbs.json    ← Hebräische Formen (sprachneutral)
```

## App starten (Entwicklung)

```bash
npm run dev
```

Vite zeigt die lokale URL an (standardmäßig **http://localhost:5173**). Im Browser öffnen.

## Produktions-Build

```bash
npm run build
npm run preview
```

`preview` startet einen lokalen Server für den Build (standardmäßig **http://localhost:4173**).

Siehe **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** für eine Anleitung zum Veröffentlichen im Netz.

## Ablauf pro Session

1. Bedeutung des Infinitivs anzeigen → hebräischen Infinitiv eingeben
2. Zufällige konjugierte Formen → hebräische Form eingeben (Infinitiv bleibt sichtbar)
3. Wiederholen bis alle Formen durch oder „Nächstes Verb“

## Datenquelle

Verbformen werden aus [pealim.com](https://www.pealim.com) importiert und lokal in JSON gespeichert.
