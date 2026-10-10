# Phase 1G: 500 video game AI repositories

Completed 2026-10-10 for the scanner-only corpus expansion tracked in
[issue #11](https://github.com/paladini/harness-maturity-analysis/issues/11).

## Scope and evidence

- The cohort adds 500 public repositories to the 651-entry baseline, for 1,151
  pinned repositories in the manifest and generated analysis site.
- The requested scope includes both games created with AI and AI used in
  videogames or game development.
- Discovery saved a bounded union of 2,417 unique repository records from 24
  GitHub searches. The frozen selection is ordered by observed stars within
  that search universe, from 3,573 down to six; it is not a global GitHub
  ranking. The snapshot and ledger retain repository IDs, observed stars,
  immutable commit SHAs, README and implementation evidence, screening, and
  exclusions.
- An eligibility review removed an out-of-scope general chatbot and recorded
  the reason and replacement. The final selection contains exactly 500 unique
  repositories pinned to immutable commits.
- All 500 reports use `harness-score@1.8.1` and are present, complete, and
  untruncated. The append-only run snapshot is
  [2026-10-10-harness-score-1.8.1-game-ai-popularity-500.json](../corpus/history/2026-10-10-harness-score-1.8.1-game-ai-popularity-500.json).
- The checkout audit contains 500 complete records. For 474 checkouts, the
  audit verified the pinned tree and source evidence. For 25 caches moved
  after successful scans, it rechecked the pinned SHA marker and complete
  report but did not independently re-audit the file tree after the move. One
  additional repository with case-colliding tracked paths was verified on a
  case-sensitive Linux filesystem through WSL (pinned HEAD, clean tree, and
  source blob evidence). These limits are retained per entry in the audit.
- No code from scanned repositories was installed, built, tested, or executed.

## Score distribution

| Measure | Result |
|---|---:|
| Repositories | 500 |
| Combined earned points | 13,793 / 52,539 (26.25%) |
| Mean repository score | 26.20% |
| Median repository score | 21% |
| Lowest and highest repository scores | 11% and 91% |
| Truncated reports | 0 |
| Archived repositories at selection time | 19 |

| Maturity level | Repositories |
|---|---:|
| L0 Unharnessed | 431 |
| L1 Documented | 61 |
| L2 Repeatable | 3 |
| L3 Sensing | 3 |
| L4 Adaptive | 2 |

These values describe scanner outputs for the selected repositories. They do
not rank organizations, establish blind human agreement, or estimate external
validity. Popularity was selection metadata and did not affect scoring. No
controlled score-improvement claim is made; this cohort has no blind human
ratings.

## Generated outputs

After writing the complete history snapshot, the results and Pages site were
regenerated from all 1,151 reports. Earlier history snapshots remain unchanged.
