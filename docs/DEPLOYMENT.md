# Deployment

Die App ist eine **statische Webseite** (React + Vite). Es gibt keinen Server — nur HTML, CSS und JavaScript im Ordner `dist/`.

## Vorbereitung

1. Verben lokal importieren (falls nötig):

   ```bash
   npm run import:verbs
   ```

2. Produktions-Build erstellen:

   ```bash
   npm install
   npm run build
   ```

3. Lokal testen (optional):

   ```bash
   npm run preview
   ```

   Standard-URL: **http://localhost:4173**

Der Build-Output liegt in **`dist/`** — genau diesen Ordner stellst du online bereit.

---

## Option A: Schnell testen (ohne Git)

**[Netlify Drop](https://app.netlify.com/drop)**

1. `npm run build` ausführen
2. Den Ordner **`dist`** per Drag & Drop auf die Seite ziehen
3. Netlify gibt dir sofort eine URL (z. B. `https://random-name.netlify.app`)

Für Updates: neu bauen und erneut hochladen.

---

## Option B: Empfohlen (Git + automatisches Deploy)

Repository auf GitHub pushen und mit einem Static-Host verbinden. Bei jedem Push wird neu gebaut und veröffentlicht.

### Build-Einstellungen

| Einstellung | Wert |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

### Anbieter (kostenloser Tarif reicht)

- **[Vercel](https://vercel.com)** — Repo verbinden, Einstellungen übernehmen, deployen
- **[Netlify](https://netlify.com)** — wie Vercel
- **[Cloudflare Pages](https://pages.cloudflare.com)** — wie Vercel

Nach dem ersten Deploy erhältst du eine URL wie `https://hebrew-conjugations.vercel.app`.

### Eigene Domain (optional)

Bei Vercel, Netlify oder Cloudflare kannst du später eine eigene Domain eintragen (DNS-Einstellung beim Domain-Anbieter).

---

## Option C: GitHub Pages

Funktioniert, erfordert aber eine Anpassung, wenn die URL **nicht** `username.github.io` heißt.

In `vite.config.ts`:

```ts
export default defineConfig({
  base: "/hebrew-conjugations/", // Name deines GitHub-Repos
  plugins: [react()],
});
```

Danach Build + Deploy über GitHub Actions oder `gh-pages`-Branch.

---

## Hinweise

- **`npm run import:verbs`** läuft nur lokal. Die JSON-Dateien werden beim Build ins Bundle gepackt — vor dem Deploy importieren, wenn sich Verben geändert haben.
- **`node_modules/`** und **`dist/`** gehören nicht ins Git (`.gitignore`).
- Pealim-Links in der App zeigen auf externe Seiten; dafür ist kein Backend nötig.
