# Adding & Importing Verbs

This guide explains how `verb-seed.json` relates to the generated verb data, and how to add new verbs.

## How the pieces fit together

```
data/verb-seed.json          ← your input (Pealim URLs; optional locale lemmas)
        │
        │  npm run import:verbs
        ▼
data/verbs.json              ← Hebrew forms only (language-neutral)
locales/verbs/de.json        ← German prompts (keyed by verb id)
locales/verbs/en.json        ← English prompts (from Pealim)
        │
        │  app runtime: join on verb id
        ▼
localized quiz prompts
```

### The mapping key: `id`

Every verb gets a stable **`id`** derived from the Pealim URL slug:

| Pealim URL | `id` |
|---|---|
| `https://www.pealim.com/dict/67-leehov/` | `leehov` |
| `https://www.pealim.com/dict/30-leechol/` | `leechol` |
| `https://www.pealim.com/dict/7-lalechet/` | `lalechet` |

The same `id` is used in:

- `data/verbs.json` → `{ "id": "leehov", "forms": { ... } }`
- `locales/verbs/de.json` → `{ "leehov": { "lemma": "...", "forms": { ... } } }`
- `locales/verbs/en.json` → `{ "leehov": { ... } }`

At runtime the app loads Hebrew from `verbs.json` and prompts from `locales/verbs/{lang}.json`, joined by `id`.

---

## Adding a new verb

### 1. Find the verb on Pealim

Open [pealim.com](https://www.pealim.com), search for a **Pa'al** verb, and copy the dictionary URL, e.g.:

`https://www.pealim.com/dict/7-lalechet/`

### 2. Add an entry to `data/verb-seed.json`

**Minimum (URL only — enough for Hebrew + English):**

```json
{
  "url": "https://www.pealim.com/dict/7-lalechet/"
}
```

**Optional — generate German prompts on import:**

```json
{
  "url": "https://www.pealim.com/dict/7-lalechet/",
  "de": "gehen"
}
```

| Field | Required | Description |
|---|---|---|
| `url` | yes | Full Pealim dictionary URL |
| `de` | no | German infinitive — if set, generates `locales/verbs/de.json` entries |
| `lemma` | no | Multi-language override, e.g. `{ "de": "gehen" }` (same as `de`) |

Without `de`, the import still produces Hebrew and English. German users then see **English prompts as fallback** until someone adds German to `locales/verbs/de.json` manually or re-imports with `de` set.

You only need to add **new** verbs to the seed file for that import run. Existing verbs in `verbs.json` are preserved (merged by `id`).

### 3. Run the import

```bash
npm run import:verbs
```

The script will:

1. Fetch each URL in `verb-seed.json` from Pealim
2. Extract Hebrew forms (without nikud) → merge into `data/verbs.json`
3. Extract English prompts from Pealim → merge into `locales/verbs/en.json`
4. If `de` (or `lemma.de`) is set → generate German prompts → merge into `locales/verbs/de.json`

**Re-importing** an existing verb (same URL / same `id`) **updates** that verb in all three files.

### 4. Restart / refresh the app

```bash
npm run dev
```

The new verb appears in the random quiz pool immediately.

---

## Adding prompts in another language (e.g. Italian)

The import script only generates **de** and **en**. For other languages, edit the locale file manually (or add your own generator later):

**`locales/verbs/it.json`**

```json
{
  "lalechet": {
    "lemma": "andare",
    "forms": {
      "infinitive": "andare",
      "present_ms": "io vado / lui va",
      "past_3pl": "loro andarono"
    }
  }
}
```

Use the same `id` and the same form keys as in `locales/verbs/de.json`. Copy an existing verb block as a template.

Also add `locales/app/it.json` and an entry in `locales/labels.json` — see the main [README](../README.md).

---

## Form keys reference

Each verb has up to **28 forms** (full Pa'al table):

| Key | Tense / mood |
|---|---|
| `infinitive` | infinitive |
| `present_ms`, `present_fs`, `present_mp`, `present_fp` | present |
| `past_1sg` … `past_3pl` | past (9 forms) |
| `future_1sg` … `future_3fp` | future (10 forms) |
| `imperative_ms`, `imperative_fs`, `imperative_mp`, `imperative_fp` | imperative |

---

## Troubleshooting

| Problem | Check |
|---|---|
| Verb not in quiz | Is it in `data/verbs.json`? Does `locales/verbs/de.json` **and** `en.json` have the same `id`? |
| Wrong German prompts | Edit `de` in seed and re-import, or edit `locales/verbs/de.json` directly |
| Import fails | Pa'al verbs only; check URL is reachable; rate limit is 1 req/s |
| Missing form | Some Pealim pages lack rare forms — check console warnings during import |
