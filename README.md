# SAT Sprint — GitHub Pages edition

380 original Reading, Writing, and Math questions (248 R&W + 132 Math);
Standard and Super hard levels; adjustable timed sets; two
98-question full practice tests; automatic grading and explanations; mistake
categories; weakness tracking; follow-up drills; goals and daily checklists;
fresh-question mastery tracking and an experimental score estimate.

No account, API key, server, or database is needed. Each visitor starts with
their own empty history. Completed practice and goals stay in that visitor's
browser. They do not sync across devices; private browsing and clearing site
data can erase them. Active attempts resume after a reload in the same tab,
and their clocks keep running.

## Publish without installing anything

The `docs/` folder is already built and ready for Pages.

1. Create a GitHub repository, for example `sat-prep`. On GitHub Free, use a
   public repository. This publishes the code and a publicly accessible site.
2. Extract this ZIP. Upload the **contents** of `sat-sprint-pages/` to the
   repository's root and commit to `main`. Keep `docs/index.html` and
   `docs/assets/` together; do not put another `sat-sprint-pages/` folder above
   them in the repository. Do not upload the ZIP itself.
3. Open **Settings → Pages**. Under **Build and deployment**, choose
   **Deploy from a branch**, then **main** and **/docs**, and click **Save**.
4. After publishing finishes, use **Visit site** on the Pages settings screen.
   The usual URL is `https://YOUR-USERNAME.github.io/sat-prep/`.

Relative asset links let this prebuilt version work with any repository name,
an account root site, or a custom domain. Normal GitHub Pages publication is
public even when the source repository is private. This package does not
publish anything by itself or alter the original private Sites project.

## Update your existing Pikachunou/sat-prep repository

Replace the existing app/source files and the **entire** `docs/` folder with
the corresponding contents of this package, then commit and push. Keep the
repository set to **main /docs** if that is how you already publish. The expected
URL remains `https://pikachunou.github.io/sat-prep/`; the actual deployment URL
appears under **Settings → Pages**. This package does not access or publish
your repository automatically. Your browser progress keys and old question
IDs are retained, so previously saved practice on the same site stays usable.

## Build and publish updates from source

Use Node.js **22.13 or newer**. From this folder:

```sh
npm ci
npm test
npm run build
npm run preview
```

`npm run build` replaces `docs/` with the latest static files. Visit the local
URL printed by `npm run preview`; opening `index.html` directly from your file
manager is not supported. Commit the changed source and `docs/` to update a
site that publishes from `main /docs`.

Alternatively, upload all source files including
`.github/workflows/pages.yml`, choose **GitHub Actions** as the Pages source,
then open **Actions → Publish SAT Sprint to GitHub Pages → Run workflow**.
The workflow installs dependencies, runs checks, builds with your actual
Pages base path, and deploys. Run it again after committing source changes.
No custom credentials or tokens are required.

## Files and customization

- `app/`: dashboard, tests, roadmap, and styling.
- `lib/questions.ts` and `lib/bank/`: questions, answers, and explanations.
- `lib/browser-store.ts`: local progress and goal storage.
- `lib/practice.ts`, `lib/full-tests.ts`, `lib/roadmap.ts`: grading, timing,
  question selection, test forms, and goal calculations.
- `tests/`: question, timing, grading, and storage checks.
- `docs/`: deployable HTML, CSS, JavaScript, and favicon.

The starting scores (1510: 720 R&W + 790 Math) and October 3, 2026 roadmap
remain the defaults from Peter's dashboard. Edit `app/dashboard.tsx` for the
starting score display and `lib/roadmap.ts` for the roadmap dates/content,
then rebuild. Progress starts empty; this package contains no saved personal
practice results, goals, ChatGPT credentials, or private database.

The test forms are original, fixed, nonadaptive practice. All items are multiple
choice. Grades report raw totals and accuracy. The Mastery & estimate tab shows an
unvalidated heuristic range only after sufficient fresh standard timed answers
(3 per skill and at least 24 per section). Repeats and untimed drills never
inflate mastery; Super hard performance is tracked separately. The estimate
is not an official SAT scale conversion or a validated test-day prediction. This project is not affiliated with College Board.

References:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://vite.dev/guide/static-deploy.html#github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
