# Project context

Build a web app that helps me learn Hebrew verb forms.

Use [pealim.com](https://www.pealim.com/) as the source for verb data (start with common verbs; expand later).

## Session flow

1. Show the verb infinitive meaning, e.g. “gehen” (to go)
2. I type the Hebrew form; it is validated — if wrong, try again
3. A random conjugated form is shown, e.g. “they went”; I type the Hebrew form (without nikud)
   - the Hebrew infinitive stays visible above
4. If correct, show the next random form, e.g. “he will go”
5. Repeat until all forms are done or “next verb”

Start with a prototype. Store Hebrew forms in a sensible JSON structure.

No user accounts or login for now; that may come later for progress, favorites, preferences, etc.

## Open questions (initial planning)

- Technology choices for the project
- How to fetch content from Pealim
