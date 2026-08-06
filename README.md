# Hebrew Verb Trainer

Web app for learning Hebrew Pa'al verb conjugations. **Direction:** translation (DE/EN/IT) → Hebrew input without nikud.

## Requirements

- [Node.js](https://nodejs.org/) 18+

## Installation

```bash
npm install
```

## Import verbs from Pealim

See **[docs/ADDING_VERBS.md](docs/ADDING_VERBS.md)** for a detailed guide.

Quick start: add a Pealim URL (and optional German lemma) to [`data/verb-seed.json`](data/verb-seed.json), then:

```bash
npm run import:verbs
```

The script fetches each Pealim page and writes:
- [`data/verbs.json`](data/verbs.json) — language-neutral (Hebrew only)
- [`locales/verbs/de.json`](locales/verbs/de.json) — German prompts
- [`locales/verbs/en.json`](locales/verbs/en.json) — English prompts (from Pealim)

## Add a new language (e.g. Italian)

1. **App UI:** create [`locales/app/it.json`](locales/app/it.json) (same keys as `de.json`)
2. **Verb prompts:** create [`locales/verbs/it.json`](locales/verbs/it.json):
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
3. **Language switcher label:** add an entry to [`locales/labels.json`](locales/labels.json):
   ```json
   { "it": "Italiano" }
   ```

The app auto-detects languages once **both** `locales/app/{code}.json` **and** `locales/verbs/{code}.json` exist.

Structure:
```
locales/
  app/          ← UI strings (buttons, messages)
  verbs/        ← verb translations & conjugation prompts
  labels.json   ← display names in the language switcher
data/
  verbs.json    ← Hebrew forms (language-neutral)
```

## Development

```bash
npm run dev
```

Vite prints the local URL (default **http://localhost:5173**). Open it in your browser.

## Production build

```bash
npm run build
npm run preview
```

`preview` serves the build locally (default **http://localhost:4173**).

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for publishing the app online.

## Session flow

1. Show the infinitive meaning → type the Hebrew infinitive
2. Random conjugated forms → type the Hebrew form (infinitive stays visible)
3. Repeat until all forms are done or skip to the next verb

## Data source

Verb forms are imported from [pealim.com](https://www.pealim.com) and stored locally as JSON.
