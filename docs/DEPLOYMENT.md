# Deployment

The app is a **static website** (React + Vite). There is no server — only HTML, CSS, and JavaScript in the `dist/` folder.

## Preparation

1. Import verbs locally (if needed):

   ```bash
   npm run import:verbs
   ```

2. Create a production build:

   ```bash
   npm install
   npm run build
   ```

3. Test locally (optional):

   ```bash
   npm run preview
   ```

   Default URL: **http://localhost:4173**

Build output goes to **`dist/`** — that is the folder you publish.

---

## Option A: Quick test (no Git)

**[Netlify Drop](https://app.netlify.com/drop)**

1. Run `npm run build`
2. Drag and drop the **`dist`** folder onto the page
3. Netlify gives you a URL immediately (e.g. `https://random-name.netlify.app`)

For updates: rebuild and upload again.

---

## Option B: Recommended (Git + automatic deploy)

Push the repository to GitHub and connect a static host. Every push rebuilds and publishes the app.

### Build settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

### Providers (free tier is enough)

- **[Vercel](https://vercel.com)** — connect repo, use settings above, deploy
- **[Netlify](https://netlify.com)** — same as Vercel
- **[Cloudflare Pages](https://pages.cloudflare.com)** — same as Vercel

After the first deploy you get a URL like `https://hebrew-verb-trainer.vercel.app`.

### Custom domain (optional)

On Vercel, Netlify, or Cloudflare you can add your own domain later (DNS settings at your domain provider).

---

## Option C: GitHub Pages

Works, but requires a config change if the URL is **not** `username.github.io`.

In `vite.config.ts`:

```ts
export default defineConfig({
  base: "/hebrew_verb_trainer/", // your GitHub repo name
  plugins: [react()],
});
```

Then build and deploy via GitHub Actions or an `gh-pages` branch.

---

## Notes

- **`npm run import:verbs`** runs locally only. JSON files are bundled at build time — import before deploying if verbs changed.
- **`node_modules/`** and **`dist/`** should not be committed (see `.gitignore`).
- Pealim links in the app point to external pages; no backend is required.
