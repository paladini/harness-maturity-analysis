# Phase 1F: 500 AI software repositories

Completed 2026-10-09 for the scanner-only corpus expansion tracked in
[issue #9](https://github.com/paladini/harness-maturity-analysis/issues/9).

## Scope and evidence

- The cohort adds 500 public repositories to the 151-entry baseline, for 651
  projects in the manifest and generated analysis site.
- Discovery used eight GitHub Search API queries and saved 2,015 returned
  records, representing 1,689 unique repository IDs. This bounded query union
  is not a claim to cover the global top 500 AI repositories.
- The frozen selection records observed stars from 159,604 down to 3,613,
  immutable default-branch commits, numeric repository IDs, README links,
  implementation blob SHAs and sizes, archive state, and exclusions.
- A quality review removed 18 learning-only books, surveys, interview notes,
  tutorial collections, and reference repositories. The ledger records each
  exclusion and its replacement. The final selection still contains exactly
  500 unique repository IDs and pinned source commits.
- Every active report is from `harness-score@1.8.1`; 500 of 500 reports are
  present and untruncated. The append-only run snapshot is
  [2026-10-09-harness-score-1.8.1-ai-popularity-500.json](../corpus/history/2026-10-09-harness-score-1.8.1-ai-popularity-500.json).
- The checkout audit has 500 complete entries and verifies each commit and
  source blob. No code from scanned repositories was installed, built, tested,
  or executed.

## Score distribution

| Measure | Result |
|---|---:|
| Repositories | 500 |
| Combined earned points | 25,811 / 52,596 (49.07%) |
| Mean repository score | 49.01% |
| Median repository score | 50% |
| Lowest and highest repository scores | 14% and 90% |
| Truncated reports | 0 |
| Archived repositories at selection time | 25 |

| Maturity level | Repositories |
|---|---:|
| L0 Unharnessed | 274 |
| L1 Documented | 166 |
| L2 Repeatable | 3 |
| L3 Sensing | 51 |
| L4 Adaptive | 6 |

| Category | Repositories |
|---|---:|
| AI model and inference | 163 |
| AI agent frameworks | 134 |
| AI applications | 122 |
| AI coding tools | 46 |
| AI vision and media | 27 |
| AI memory and retrieval | 5 |
| Prompt and evaluation engineering | 3 |

These values describe scanner outputs for the selected repositories. They do
not rank organizations, establish blind human agreement, or estimate external
validity. Popularity was selection metadata and did not affect scoring. No
controlled score-improvement claim is made.

## Checkout exceptions

- `liguodongiot/llm-action` contains the tracked path
  `llm-algo/transformer/README.md ` with a trailing space, which Windows cannot
  represent faithfully. Its exact commit was checked out and scanned on the
  Linux filesystem under WSL; no files were excluded.
- `aidlearning/AidLearning-FrameWork` checked out with two tracked PNG files
  differing from their pinned Git blobs on Windows. The exact commit was
  checked out cleanly and scanned on the Linux filesystem under WSL; no files
  were excluded.

Both exceptions retain the exact source commit, code evidence, scanner output,
Git tree inventory, and platform details in the selection, report, and
checkout-audit records.

## Generated outputs

After writing the complete history snapshot, the results and Pages site were
regenerated from all 651 reports. Earlier history snapshots remain unchanged.
