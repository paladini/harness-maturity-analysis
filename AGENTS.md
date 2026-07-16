# Agent Guide — harness-maturity-analysis

## What this is

A reproducible research repository: it scores notable open-source
repositories with [harness-score](https://github.com/paladini/harness-score),
checks the automated score against a blind human rating, and turns
discrepancies into concrete proposals for harness-score's maturity model.
See [METHODOLOGY.md](METHODOLOGY.md) for the two research questions and the
full protocol.

## Build & run

No build step — plain Node ESM scripts, zero runtime dependencies (the same
invariant harness-score itself holds).

```bash
npm run corpus:run                    # clone every pinned repo (or reuse cache) + scan -> corpus/reports/*.json
npm run corpus:build                  # regenerate results/leaderboard.{md,csv} + results/dimension-heatmap.md
npm run site:build                    # regenerate docs/index.html (the GitHub Pages site)
npm run corpus                        # all three, in order
node corpus/run.mjs --only <name>     # scan a single manifest entry while iterating

npm run score -- <repo-url-or-path>   # score ANY repo/local path ad-hoc, outside the corpus (see below)

npm test                              # vitest — pure functions in corpus/lib/, parseArgs, manifest.json shape
npm run lint                          # biome check
npm run format                        # biome check --write
```

CI (`.github/workflows/ci.yml`) runs lint, tests, and a data-integrity check
that regenerates `results/` and `docs/index.html` from the committed
`corpus/reports/*.json` and fails the build if either drifts from what's
committed — the same "generated, not hand-edited" rule below, enforced
instead of just documented.

## Conventions agents must follow

- **Every corpus entry is pinned.** `corpus/manifest.json` fixes `repoUrl`
  and an exact `commit` SHA per entry, and `toolVersion` fixes the
  harness-score version used to scan. Never change an existing entry's
  `commit` in place — add a new entry or a dated note instead. The point of
  this study is that every claim traces back to a specific commit.
- **`corpus/reports/*.json` are generated, not hand-edited.** They are the
  raw, versioned output of `npx harness-score@<pinned> <path> --json`. If a
  number looks wrong, fix the manifest or file a critique — never hand-edit
  a report.
- **`results/*` and `docs/index.html` are generated, not hand-edited.**
  Regenerate with `npm run corpus:build` and `npm run site:build` (or just
  `npm run corpus`, which does both) after any change under
  `corpus/reports/`. `docs/index.html` is the GitHub Pages site — it's
  built by `corpus/build-site.mjs` from `corpus/lib/site.mjs`, the same
  "pure render functions + thin CLI wrapper" shape as
  `corpus/build-results.mjs` / `corpus/lib/results.mjs`.
- **Write the blind rating before running the scanner on that repo.** If a
  report already exists for a repository with no rating file yet, write
  `analysis/ratings/<name>.md` without looking at the report first — the
  whole point of the protocol (see METHODOLOGY.md) is avoiding circularity.
- **Findings need file-level evidence.** A claim in `analysis/critiques/`
  or `analysis/findings.md` should cite the specific check ID and the
  file/path that makes it true or false — "this feels wrong" isn't a
  finding.
- **Proposals target harness-score's own process.** Anything in
  `proposals/` should be shaped as a harness-score check-change proposal
  (see [harness-score's CONTRIBUTING.md](https://github.com/paladini/harness-score/blob/main/CONTRIBUTING.md#adding-or-changing-a-check))
  — a new or changed check must stay deterministic and filesystem-only,
  exactly like every existing harness-score check.
- **Ad-hoc scoring never touches the corpus.** `corpus/score-adhoc.mjs`
  (skill: [`score-any-repo`](.claude/skills/score-any-repo/SKILL.md)) scores
  any repo or local path with the same pinned `harness-score` version, but
  writes nothing to `corpus/manifest.json` or `corpus/reports/` — it's for
  a one-off reading, not a study data point. If a result turns out to be
  corpus-worthy, redo it properly with `add-corpus-entry` instead of
  promoting the ad-hoc output.

## What not to touch

- Never run code *from* a scanned repository. `corpus/run.mjs` and
  `corpus/score-adhoc.mjs` clone and read files only; neither may ever `npm
  install`/`build`/`test` inside a scanned repo. That invariant is what
  makes it safe to point either at arbitrary third-party repositories.
