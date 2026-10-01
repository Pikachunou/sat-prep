# Validation — October 1, 2026

Passed `npm test` and `npm run build` (TypeScript checking and Vite production
build). The lockfile and dependency set remain unchanged.

Checked:
- 380 unique original questions, four distinct choices and four specific
  explanations per item, no duplicate passages, and all previous IDs retained.
- 48 additional standard items: three per skill, with 24 Reading/Writing and
  24 Math items. The 32 stretch items from the private Site are also included.
- Independent mathematical checks for every one of the 132 Math answer keys.
- Balanced fresh selection, complete standard and stretch bank reachability,
  selectable sizes, level-specific count limits, timing, expiration and grading.
- Two disjoint 98-question test forms retain their original question IDs,
  27/27/22/22 modules, section clocks, locks, break and raw answer-key grading.
- Mastery requires fresh standard timed answers; repeats and previously exposed
  drill questions cannot inflate it. Recent skill windows, domain weights,
  evidence gates, range bounds and separate stretch tracking pass unit checks.
- Persistent browser history, error categories, goals and checklists, isolated
  stores, duplicate-save prevention, corrupted data and blocked/full storage.
- Simulated DOM: answer selection, Math timing, navigation, reload recovery,
  local grading, error categorization, fresh follow-ups and immediate explanations,
  persistent goals, full-test locks and break recovery, 98-answer grading,
  Super hard mode, automatic count clamping, and mastery display after reload.
  All tested flows make zero server API requests.
- Prebuilt HTML, CSS, JavaScript and favicon served beneath `/sat-prep/` with
  working relative asset paths. ZIP contents match the checksum manifest.

Interaction checks use Happy DOM, not a full browser. Full-browser visual
inspection was unavailable; existing responsive styles were retained, with
wrapping tabs and responsive mastery panels. GitHub publication has not been
run. The package does not publish itself or change the private Sites project.

The score estimate is an explicitly unvalidated heuristic, not an official
SAT conversion or a validated prediction. Difficulty labels are editorial.
All questions are original, fictional SAT-style practice, not official items.
