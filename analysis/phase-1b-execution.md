# Phase 1B showcase expansion

Date: 2026-10-07. Source: [issue #2](https://github.com/paladini/harness-maturity-analysis/issues/2).

## Scope and decisions

The expanded collection contains the original 21 pinned repository commits
and the 50 candidates named in issue #2. The user requested the latest
published scanner and explicitly limited this work to showcase coverage,
without blind ratings. The scanner pin is `harness-score@1.8.1`, verified
against the npm registry before execution. This supersedes the issue's
1.5.0 pin and blind-rating work for this delivery.

All original commits remain fixed. Every addition was resolved with
`git ls-remote --symref <repoUrl> HEAD` before scanning. The
[selection ledger](../corpus/selection-2026-10-07.json) records the exact
SHAs, default branches, eight strata, five waves of ten, GitHub provenance,
license metadata and approximate repository sizes. The first wave matches
the issue's seed list. A single integrated manifest is used for the official
evidence run.

## Execution plan

1. Resolve and deduplicate all 50 candidate identities, preserving the 21
   original pins.
2. Prepare complete pinned checkouts with LFS smudging disabled. Read target
   files only; never install, build, test or execute target repository code.
3. Audit checkout hazards and integrity without introducing scan subpaths or
   checkout exclusions for the new cohort.
4. Run the complete 71-entry corpus with 1.8.1 and append one matching history
   snapshot. Partial preparation runs create no snapshot.
5. Regenerate the leaderboard, CSV, dimension heatmap, history table and
   showcase site through the project generators.
6. Run lint, tests and a second generation pass to verify there is no drift.

## Windows checkout repair

The first preparation attempt encountered long fixture paths in n8n. The
complete run was interrupted before history was recorded. The runner now
enables Git's `core.longpaths` in each new clone and checks the working tree
against its index after checkout. A checkout that loses tracked files can
no longer be scanned as successful. The regression test creates a path over
260 characters and confirms that an incomplete cache is replaced.

n8n, Elasticsearch and Semgrep were then checked out and scanned successfully
without excluding any paths. The
[checkout audit](../corpus/checkout-audit-2026-10-07.json) records the pinned
tree size, long paths, NTFS hazards, LFS attribute files, submodule paths and
symlink count for every new candidate.

Jitsi Meet also stores `twa/gradlew.bat` as CRLF while declaring
`text eol=crlf`. Git's clean normalization marks that unchanged blob dirty.
The integrity check now compares unfiltered hashes for such paths, accepting
only bytes that match the pinned tree. The regression fixture includes this
case; missing tracked files still force a new checkout.
Node.js has the same normalization case in `tools/gyp/gyp.bat` and
`tools/sign.bat`; their unfiltered hashes also match the pinned tree.

The final audit found 1,278 paths at least 260 characters long in this Windows
cache across seven repositories, and no NTFS-invalid paths in the new cohort.
Two repositories declare LFS filters and six contain submodule entries. The
audit records these inputs explicitly instead of removing them from the
selection.

Reproduce the audit after preparing the pinned caches:

```bash
node corpus/audit-checkouts.mjs corpus/selection-2026-10-07.json
```

## Interpretation

This run supplies repository-local scanner evidence for showcase coverage.
It supplies no Q1 agreement measurements or blind human ratings. The prior
Q2 findings remain historical observations about the original 21 entries
under the versions cited there.

GitHub's repository size is approximate and includes history; it is not the
size of the checkout. Its license metadata is also not a legal determination.
`NOASSERTION` entries remain visible in the ledger. Submodules are recorded
but are not initialized, and LFS objects are not downloaded. The scanner's
own truncation flag must be retained when interpreting large repositories.

The original cohort's older repository commits and the new cohort's October
commits differ in age. Comparisons across scanner versions for an existing
entry keep its commit fixed; comparisons between repositories are a curated
snapshot, with this age difference visible in their pins.

## Delivered evidence and validation

The complete run scored 71/71 repositories with `harness-score@1.8.1` and
reported no truncated scans. Its matching snapshot is
[`2026-10-07-harness-score-1.8.1.json`](../corpus/history/2026-10-07-harness-score-1.8.1.json).
The two older history snapshots remain byte-for-byte unchanged.

The generated [leaderboard](../results/leaderboard.md),
[CSV](../results/leaderboard.csv),
[dimension heatmap](../results/dimension-heatmap.md),
[score history](../results/score-history.md) and [site](../docs/index.html)
all contain the completed cohort. The level distribution is L0: 23,
L1: 29, L2: 0, L3: 15, L4: 4.

`npm test` passed all 43 tests, `npm run lint` passed, and a second results/site
generation produced identical SHA-256 hashes. Each historical score, level,
truncation flag and commit was also checked against its current report and
manifest identity.
