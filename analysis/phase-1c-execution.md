# Phase 1C: popular AI software corpus and showcase

Selection date: 2026-10-08. Public plan:
[issue #3](https://github.com/paladini/harness-maturity-analysis/issues/3).

## Scope and plan

Add 30 new AI software repositories to the 71-entry Phase 1B baseline, then
scan and present the complete 101-entry collection. The current npm scanner
was verified as `harness-score@1.8.1` and remains pinned. All 71 previous
commits and URLs are retained. This is a showcase expansion with no blind
human-rating or Q1 agreement deliverables.

1. Freeze a GitHub popularity discovery snapshot and canonical identities
   for the existing corpus.
2. Review software source before any new scanner report; record immutable
   SHAs, implementation-file blobs and every higher-ranked exclusion.
3. Append the 30 candidates in one manifest integration and prepare disjoint
   pinned checkout groups.
4. Audit complete checkouts and exact implementation blobs; execute no target
   code, builds, tests or installers.
5. Run all 101 entries and append one matching current history snapshot.
6. Generate CSV, leaderboard, heatmap, history and showcase; validate tests,
   lint, data integrity and CI.
7. Integrate through a reviewed PR and verify the Pages deployment after merge.

## Popularity and software eligibility

The [discovery snapshot](../corpus/popularity-search-2026-10-08.json) contains
495 unique repositories from 25 GitHub REST searches, sorted by stars. Every
query restricts results to public, non-fork, non-archived repositories with at
least 20,000 stars and retrieves up to 100 entries. All limited pages extend
below the selected cohort's 92,063-star cutoff; search reported no incomplete
results. Stars are first-observed values during the collection, with the date
and collection timestamp recorded.

The [selection ledger](../corpus/selection-2026-10-08-ai-popularity.json)
contains the first 30 eligible new software repositories in that search
universe, with 24 higher-ranked exclusions. It is not an assertion of a
complete semantic classification of all GitHub projects. Existing repository
IDs were resolved through GitHub's canonical API, so renamed projects such
as OpenHands or Goose are not admitted a second time.

Admission requires an application, agent engine, CLI or reusable AI library
at the pinned commit. README and package metadata establish the software
purpose; a source file, blob SHA and byte size establish implementation
evidence. Guides, courses, external resource lists, prompt/personality packs
and model/product announcements without implementation are excluded. Small
installers or bootstrap wrappers for textual instructions do not suffice.

Mixed projects remain eligible when their executable software is real source:

- ECC: `src/llm/cli/selector.py`, plus provider library and runtime CLIs.
- prompts.chat: `src/app/page.tsx`, application/database source and self-hosting
  configuration, beyond its historical prompt collection.
- Spec Kit: `src/specify_cli/__init__.py`, implementing the Specify CLI.
- Caveman: `proxy/cmd/caveman-proxy/main.go`, implementing a Go proxy beyond
  the accompanying textual skill.
- autoresearch: `train.py`, an executable LLM training/evaluation setup.

Every source permalink is fixed to a 40-character commit. GitHub size and
license identifiers are metadata, not exact checkout sizes or legal findings.
The cohort includes public source with custom or unreported licenses; it does
not claim that every entry has the same licensing status.

## Reproduction

Discovery requires authenticated GitHub CLI and produces a new immutable
evidence file, without changing the corpus:

```bash
npm run corpus:discover-ai -- --date YYYY-MM-DD --out .cache/new-ai-search.json
```

Discovery does not automatically admit candidates. After source review and
manifest integration, use the normal pinned runner. Audit this cohort with:

```bash
node corpus/audit-checkouts.mjs corpus/selection-2026-10-08-ai-popularity.json
npm run corpus
```

The checkout audit compares each implementation blob and its size with the
preregistered GitHub evidence. LFS smudging is disabled, submodules are not
initialized, symlinks and Windows hazards are recorded, and complete roots
are preserved using the existing long-path and raw-CRLF integrity checks.

## Dataset and showcase integration

The manifest's optional `selection` metadata records cohort, observation date,
canonical repository ID, stars and eligible popularity rank. Those fields are
separate from the report's automated level, earned points and applicable
maximum. The CSV preserves its original leading columns and appends
`selectionCohort`, `selectionDate`, `githubStars`, and `popularityRank`.
Older entries have blank provenance cells; unknown stars are not represented
as zero.

The showcase presents star provenance on the 30 new rows while retaining
harness-based leaderboard order. A same-version history expansion is labeled
as coverage history rather than a new scoring model. Repository source and
method links preserve the distinction between software popularity and
repository-local harness artifacts.

The delivery carries the previously local Phase 1B baseline commit
`2b1f1e5e7a0cd11b0729478d3d143abc830f26bb` because main still held 21 entries
when this work started. The PR therefore makes both completed cohorts
available together. GitHub Pages is configured to publish from `main:/docs`;
the public showcase changes when that integration is merged.

## Execution and validation

The official complete run produced 101 successful reports and the append-only
`2026-10-08-harness-score-1.8.1.json` snapshot, with no truncated scans. All 71
previous commits and scores were retained, and the three earlier snapshots
remained byte-identical. The 30 implementation blobs matched their recorded
SHA and size. Eleven checkouts contain long paths; none required exclusions.

Local validation passed 51 tests across 11 files and the repository lint gate.
Regenerating all results and the site a second time produced identical bytes.
The discovery CLI rejected an attempt to overwrite frozen evidence. The CSV
contains 101 data rows, including exactly 30 rows with popularity provenance.
Browser verification found 101 showcase rows and 30 provenance notes, with no
horizontal overflow in the normal desktop viewport. The leaderboard visibly
keeps stars separate from harness points and maturity levels.

The public deployment requires PR integration into `main`. CI and deployment
status are recorded on the PR; these local checks do not imply publication.

## Delivery note and credit

This dataset delivery adds 30 popularity-selected AI software repositories,
publishes implementation-source and checkout evidence, and exposes frozen
star provenance in the CSV and showcase. Maintainer request and contribution:
@paladini. No external contributor authored this integration.

The collection follows the official
[GitHub REST search contract](https://docs.github.com/en/rest/search/search)
for star ordering, pagination and incomplete-result handling. The repository's
Pages API reports a branch publishing source, consistent with
[GitHub Pages source configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
Before this integration, the independently retrieved public page still showed
21 repositories. A prepared PR is distinct from a merged or deployed site.
