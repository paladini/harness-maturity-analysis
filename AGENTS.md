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
npm run corpus                        # both, in order
node corpus/run.mjs --only <name>     # scan a single manifest entry while iterating

npm test                              # vitest — pure functions in corpus/lib/, parseArgs, manifest.json shape
npm run lint                          # biome check
npm run format                        # biome check --write
```

CI (`.github/workflows/ci.yml`) runs lint, tests, and a data-integrity check
that regenerates `results/` from the committed `corpus/reports/*.json` and
fails the build if it drifts from what's committed — the same "generated,
not hand-edited" rule below, enforced instead of just documented.

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
- **`results/*` are generated, not hand-edited.** Regenerate with
  `npm run corpus:build` after any change under `corpus/reports/`.
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

## What not to touch

- Never run code *from* a scanned repository. `corpus/run.mjs` clones and
  reads files only; it must never `npm install`/`build`/`test` inside a
  scanned repo. That invariant is what makes it safe to point this at
  arbitrary third-party repositories.
