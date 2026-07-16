# /refresh-corpus

Run `npm run corpus` from the repository root. This clones every pinned
entry in `corpus/manifest.json` (or reuses the gitignored `.cache/` when
already at the pinned commit), scans each with the pinned `harness-score`
version, and regenerates `results/leaderboard.md`, `results/leaderboard.csv`,
and `results/dimension-heatmap.md` from the fresh reports.

Report which entries changed level or score versus the previous committed
`corpus/reports/*.json` (`git diff --stat corpus/reports results`) — a
score moving between runs of the *same pinned commit* means the tool
version changed (check `manifest.json`'s `toolVersion`) or something in the
pipeline is non-deterministic, either of which is a bug worth its own
investigation before committing.

To refresh a single entry instead of the whole corpus, use the
`add-corpus-entry` skill's scan step: `node corpus/run.mjs --only <name>`.
