# harness-maturity-analysis

<a href="https://paladini.io/harness-score/guide/maturity-model#l4-%C2%B7-self-correcting" title="Harness Score — AI coding harness maturity"><img alt="Harness Score L4 (Self-correcting): measures AI-assisted development harness maturity with harness-score" src="https://paladini.github.io/harness-score/maturity/badge-l4.svg" height="20"></a>
**A reproducible study of AI-harness maturity across notable public
repositories** — scored deterministically with
[harness-score](https://github.com/paladini/harness-score), checked against
a blind human read of the same repos, and used to find what harness-score's
maturity model still gets wrong.

> **Status: Phase 1G video game AI expansion.** The corpus now includes 1,151 pinned
> repositories: the original 21, 50 stratified additions from
> [issue #2](https://github.com/paladini/harness-maturity-analysis/issues/2),
> and 30 new AI software projects selected by GitHub popularity in
> [issue #3](https://github.com/paladini/harness-maturity-analysis/issues/3),
> 25 cryptocurrency software projects from
> [issue #5](https://github.com/paladini/harness-maturity-analysis/issues/5),
> and 25 media editing projects selected from a recorded GitHub search union
> in [issue #7](https://github.com/paladini/harness-maturity-analysis/issues/7),
> plus 500 AI software repositories selected from a bounded GitHub search union
> in [issue #9](https://github.com/paladini/harness-maturity-analysis/issues/9),
> and 500 video game AI projects from expanded bounded GitHub searches in
> [issue #11](https://github.com/paladini/harness-maturity-analysis/issues/11).
> The current scanner pin is `harness-score@1.8.1`. The Q2 findings below
> describe the original 21-repository analysis; Q1 still needs independent
> blind human ratings.

## Why this exists

harness-score's own roadmap flags real-world corpus analysis as the thing
standing between "a maturity model that seems reasonable" and "a maturity
model calibrated against how AI-first teams actually build software." This
repository is that analysis: run the scanner against repositories from AI
labs, AI-first developer-tool companies, harness-engineering exemplars,
prompt/eval engineering projects, and artifact-governance collections —
then look hard at whether the resulting number is *right*, and if not, why
not.

**The one thing to hold onto while reading any table here:** harness-score
measures a repository's harness, not the competence of the company that
owns it. A frontier lab's inference library can legitimately score low —
it's a library, not an agent-first workspace. A small teaching repository
can legitimately score L4. See [METHODOLOGY.md](METHODOLOGY.md) for the
full framing, the two research questions this study asks, and the
blind-rating protocol used to check the scanner against human judgment
without circularity.

## Corpus results

Every repository is pinned to an exact commit in
[`corpus/manifest.json`](corpus/manifest.json). The
[Phase 1B selection ledger](corpus/selection-2026-10-07.json) records the
50 repositories' default branches, SHAs, categories, provenance, size and
research waves. The [Phase 1C selection](corpus/selection-2026-10-08-ai-popularity.json)
records the 30 software candidates, observed stars, executable-source evidence,
canonical GitHub IDs and higher-ranked exclusions.
The [Phase 1E media editing selection](corpus/selection-2026-10-09-media-editing-popularity.json)
records the 25 selected repositories, observed stars, pinned commits, source
evidence and higher-ranked exclusions. Its discovery snapshot is
[here](corpus/popularity-search-2026-10-09-media-editing.json). The generated
[`results/leaderboard.md`](results/leaderboard.md) contains the current
scores for all 1,151 repositories after this round completes; see also the
[`results/dimension-heatmap.md`](results/dimension-heatmap.md),
[`results/leaderboard.csv`](results/leaderboard.csv), and
[`results/score-history.md`](results/score-history.md).

The Phase 1F [AI software selection](corpus/selection-2026-10-09-ai-500.json)
records 500 new projects, canonical GitHub IDs, observed stars, immutable
commits, README and implementation-blob evidence, and exclusions. Its bounded
discovery snapshot is [here](corpus/popularity-search-2026-10-09-ai-500.json).
An eligibility review replaced 18 books, tutorials, surveys, and reference
collections with pinned AI software. The [Phase 1F execution report](analysis/phase-1f-execution.md)
records the final score distribution and checkout audit.

The [Phase 1G video game AI selection](corpus/selection-game-ai-popularity-500-2026-10-10.json)
records 500 newly pinned games and game-development tools using AI, plus canonical
GitHub IDs, observed stars, immutable commits, pinned README and implementation
evidence, and screened exclusions. Its 24-query bounded discovery snapshot is
[here](corpus/popularity-search-2026-10-10-extended-game-ai-500.json). The request
covers both games created with AI and AI used in games or game development. The
minimum selection threshold is six stars; this is not a global GitHub ranking.
This scanner-only cohort has no blind human ratings.

The collection is a repository-local harness showcase. It does not rank the
organizations behind the projects, and this expansion has no blind human
ratings. Historical 1.5.0 scores remain in the append-only history.

The [Phase 1D crypto selection](corpus/selection-2026-10-08-crypto-popularity.json)
adds 25 new cryptocurrency software projects by accumulated stars in the
[recorded crypto search universe](corpus/popularity-search-2026-10-08-crypto.json).
Archived software remains eligible for this lifetime-popularity cohort, with
maintenance status recorded. Guides, lists, courses and duplicate IDs are
excluded. Accumulated stars observed today are not a historical peak ranking.
The [crypto execution and analysis](analysis/phase-1d-execution.md) records the
25 reports, applicable maxima, levels and limitations. This assesses harness
artifacts, not token value, trading performance or blockchain security.

The [Phase 1E execution and analysis](analysis/phase-1e-execution.md) records
the media editing cohort's bounded search scope, pinned scan outcomes and
limitations. GitHub stars are source metadata observed at selection time, not
a global rank or part of the harness score. This scanner-only expansion adds
no blind human ratings.

The AI software cohort is selected by descending GitHub stars within the
[recorded search universe](corpus/popularity-search-2026-10-08.json), after
excluding the existing corpus, instructional-only projects and general
software whose AI support is incidental. It is not a universal ranking of
every repository on GitHub. Stars are frozen at the selection date and are
displayed separately from harness maturity. The CSV appends
`selectionCohort`, `selectionDate`, `githubStars` and `popularityRank` to its
existing columns; older entries without that selection metadata have blank
cells in those columns.

Multiple complete runs on the same day use an optional `manifest.runId`.
Each popularity cohort has its own `manifest.runId` history identity. The
media editing run appends a 151-entry same-day snapshot and preserves all
earlier history files.

To collect a future discovery snapshot with the authenticated GitHub CLI:

```bash
npm run corpus:discover-ai -- --date YYYY-MM-DD --out .cache/new-ai-search.json
```

This discovers candidates only. Review actual software source, resolve exact
SHAs and admit entries through the corpus workflow. Existing discovery
snapshots are never overwritten. See
[Phase 1C execution](analysis/phase-1c-execution.md) for the completed protocol.

## What the corpus found

The original 21-repository Q2 writeup, with check IDs and file evidence, is
**[analysis/findings.md](analysis/findings.md)**. Two findings worth
reading even if you read nothing else:

### fakeflix earns 67% and is capped at L1

Discovered during the Phase 0 pilot, corroborated at scale in Phase 1.
fakeflix — previously validated in harness-score's own v0.1.2 field test
as "genuinely excellent" — earns 67% of all points but is capped at **L1**
because Context & Guides sits at 45%: a substantive root `AGENTS.md` (79
non-empty lines, 17 headings — passes outright) but **zero scoped rule
files**, so `CTX-03` through `CTX-06` all fail, even as Skills & Commands
sits at 82% and Sensors & Feedback at 100%. The same shape — real root
context file, no scoped rules — turned out to be common in the wider
corpus, not a one-off. Whether that should cap a repository a full level
below everything else it earned is a question for Phase 2's blind rating,
not resolved here. Full evidence: [`corpus/reports/fakeflix.json`](corpus/reports/fakeflix.json).

### Anthropic's skills showcase receives the same L0 level as a minimal repo

`anthropic/skills` — Anthropic's official showcase of Claude Skills —
scores **L0 · 16%**, sharing a maturity level with `octocat/Hello-World`.
Its skills live at `skills/<name>/SKILL.md` (repository root) rather than
`.claude/skills/`, because this repo *distributes* skills rather than
using them to develop itself — and `SKL-01` correctly answers the question
it's built to ask ("does this repo have a self-referential skill
harness?") with "no." But the model has no vocabulary today for "canonical
reference implementation of an artifact type" as distinct from "no harness
at all" — a `.claude-plugin/` manifest at root (which this repo has) is a
strong, currently-ignored signal. Not a bug; a real category gap. Full
evidence and two more findings in the same vein (a parser bug in `HKS-05`
that is resolved in 1.5.0, and hook-config inflation via nested tutorial
directories) in [analysis/findings.md](analysis/findings.md).

Four of these findings are drafted as concrete proposals against
harness-score in [`proposals/`](proposals), following harness-score's own
[check-change process](https://github.com/paladini/harness-score/blob/main/CONTRIBUTING.md#adding-or-changing-a-check) —
not yet filed as issues there.

## How it works

1. [`corpus/manifest.json`](corpus/manifest.json) pins each repository to
   an exact commit SHA and a category.
2. [`corpus/run.mjs`](corpus/run.mjs) clones each pinned commit into a
   local, gitignored cache and runs `npx harness-score@<pinned-version>
   --json` against it — no code from the scanned repository is ever
   executed, Git LFS assets are not smudged, and the same commit always
   produces the same report.
3. [`corpus/build-results.mjs`](corpus/build-results.mjs) turns the raw
   reports into `results/leaderboard.{md,csv}` and
   `results/dimension-heatmap.md` — deterministically, no hand-edited
   tables. A complete run also appends a compact snapshot under
   [`corpus/history/`](corpus/history), which generates
   `results/score-history.md`.
4. A human blind rating (recorded *before* seeing the tool's score —
   protocol in
   [METHODOLOGY.md](METHODOLOGY.md#blind-human-rating-q1-protocol)) can check
   whether the automated level agrees with expert judgment. **Not part of
   this showcase expansion** — it needs independent human raters.
5. Disagreements and model gaps get written up in
   [`analysis/findings.md`](analysis/findings.md) and turned into concrete
   check-change proposals in [`proposals/`](proposals).

## Reproduce it yourself

```bash
git clone https://github.com/paladini/harness-maturity-analysis
cd harness-maturity-analysis
npm run corpus
```

Everything is pinned and versioned. The current raw JSON report for every
repository lives in [`corpus/reports/`](corpus/reports), and compact
append-only run snapshots preserve older scores in
[`corpus/history/`](corpus/history).

## Score any repository, not just the corpus

The corpus is curated and pinned on purpose — but the scanner behind it
works on anything. [`corpus/score-adhoc.mjs`](corpus/score-adhoc.mjs) scores
any repo URL or local path with this study's exact pinned `harness-score`
version, shows the dimension breakdown and the highest-value unmet checks,
and tells you where it would land among the current corpus — without
writing anything to `corpus/manifest.json` or `corpus/reports/`:

```bash
npm run score -- https://github.com/owner/repo   # or a local path: npm run score -- .
```

Packaged as a Claude Code skill —
[`score-any-repo`](.claude/skills/score-any-repo/SKILL.md) — for "how does
X score?" questions asked in an agent session. If a result turns out to be
corpus-worthy, redo it properly with the `add-corpus-entry` skill instead
of promoting the ad-hoc output.

## Repository layout

```
corpus/       manifest, runner, raw reports, and append-only run history
results/      generated leaderboard, dimension heatmap, and score history
analysis/     findings.md (Q2, done); ratings/ + external-validity.md (Q1, Phase 2)
proposals/    4 findings turned into harness-score check-change proposals
METHODOLOGY.md  research questions, corpus design, protocol, limitations
```

## This repo dogfoods itself

A repository studying harness maturity ought to have one. `harness-maturity-analysis`
scanned itself at **L4 · Self-correcting — 96/108 (89%)** in the original
baseline: a scoped `.cursor/rules/`
rule governing the data-integrity discipline above, a skill for the one
procedure Phase 1 repeated 17 times, real gate hooks (deny destructive
shell commands, deny reading credential-shaped files) and a feedback hook
(format on edit), a vitest suite for every pure function, and CI that lints,
tests, and fails the build if `results/` ever drifts from committed reports.

The four points it doesn't claim are deliberate, not oversights: no
fabricated subagent (`AGT-01/02`) with no real delegate task yet, no
TypeScript conversion (`SNS-03`) for what's meant to stay plain Node ESM
scripts, no invented MCP config (`HYG-08`) this pipeline doesn't need. A
study that critiques other repositories for gaming a maturity score
shouldn't game its own.

## Development

```bash
npm install
npm test           # vitest — pure functions, parseArgs, manifest.json shape
npm run lint        # biome
```

## Roadmap

- [x] **Phase 0.** Pipeline scaffold, pinned-clone runner, results
      generator, validated against 4 anchor repositories.
- [x] **Phase 1.** Corpus frozen and rescanned: 21/21 pinned repositories
      with `harness-score@1.5.0`, including a deterministic sparse checkout
      for the Windows-incompatible data paths in `openai-cookbook`.
- [x] **Phase 1B.** Added 50 preregistered repositories across eight strata,
      pinned their commits, and rescanned all 71 with `harness-score@1.8.1`
      for the showcase. This expansion does not supply Q1 ratings.
- [x] **Phase 1C.** Added 30 previously unmeasured AI software repositories
      by recorded GitHub popularity, verified implementation-file evidence,
      and integrated the 101-entry corpus and showcase with 1.8.1.
- [ ] **Phase 2.** Blind human ratings + per-repo critique — needs a rater
      without implementation knowledge of the scanner. Not started.
- [x] **Phase 3 (Q2 only).** Model-calibration synthesis —
      [`analysis/findings.md`](analysis/findings.md): 1 confirmed bug, 3
      model/category gaps, 1 aggregate pattern, 1 honest negative result.
      **Q1 synthesis (external validity) blocked on Phase 2.**
- [x] **Phase 4 (partial).** Findings drafted as check-change proposals
      in [`proposals/`](proposals). **Not yet filed as issues against
      harness-score**, and findings not yet published outside this repo.

## License

[MIT](LICENSE) © 2026 Fernando Paladini
