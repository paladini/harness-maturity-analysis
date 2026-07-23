# harness-maturity-analysis

<a href="https://paladini.io/harness-score/guide/maturity-model#l4-%C2%B7-self-correcting" title="Harness Score — AI coding harness maturity"><img alt="Harness Score L4 (Self-correcting): measures AI-assisted development harness maturity with harness-score" src="https://paladini.github.io/harness-score/maturity/badge-l4.svg" height="20"></a>
**A reproducible study of AI-harness maturity across notable open-source
repositories** ÔÇö scored deterministically with
[harness-score](https://github.com/paladini/harness-score), checked against
a blind human read of the same repos, and used to find what harness-score's
maturity model still gets wrong.

> **Status: Phase 1 complete.** 20 of 21 pinned repositories scanned (one
> excluded for a documented platform limitation, not silently dropped ÔÇö
> see [`corpus/manifest.json`](corpus/manifest.json)). The model-calibration
> findings below (Q2) are done; the external-validity half of the study (Q1
> ÔÇö do the automated levels agree with a blind human read?) is Phase 2 and
> needs a human rater ÔÇö see [Roadmap](#roadmap).

## Why this exists

harness-score's own roadmap flags real-world corpus analysis as the thing
standing between "a maturity model that seems reasonable" and "a maturity
model calibrated against how AI-first teams actually build software." This
repository is that analysis: run the scanner against repositories from AI
labs, AI-first developer-tool companies, harness-engineering exemplars,
prompt/eval engineering projects, and artifact-governance collections ÔÇö
then look hard at whether the resulting number is *right*, and if not, why
not.

**The one thing to hold onto while reading any table here:** harness-score
measures a repository's harness, not the competence of the company that
owns it. A frontier lab's inference library can legitimately score low ÔÇö
it's a library, not an agent-first workspace. A small teaching repository
can legitimately score L4. See [METHODOLOGY.md](METHODOLOGY.md) for the
full framing, the two research questions this study asks, and the
blind-rating protocol used to check the scanner against human judgment
without circularity.

## Corpus results (20 repositories)

Every repository below is pinned to an exact commit in
[`corpus/manifest.json`](corpus/manifest.json) and scanned with
`harness-score@1.0.0`. A representative spread ÔÇö full table (all 20, every
dimension) in [`results/leaderboard.md`](results/leaderboard.md) and
[`results/dimension-heatmap.md`](results/dimension-heatmap.md):

| Repository | Category | Level | Score |
|---|---|---|---|
| [harness-score](https://github.com/paladini/harness-score) | control ┬À ceiling | **L4** | 108/108 (100%) |
| [anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook) | AI lab | **L3** | 99/108 (92%) |
| [promptfoo](https://github.com/promptfoo/promptfoo) | prompt/eval engineering | **L4** | 95/108 (88%) |
| [fakeflix](https://github.com/tech-leads-club/fakeflix) | harness-engineering exemplar | **L1** | 72/108 (67%) |
| [execa](https://github.com/sindresorhus/execa) | control ┬À quality w/o AI artifacts | **L0** | 36/108 (33%) |
| [anthropic-skills](https://github.com/anthropics/skills) | harness-engineering exemplar | **L0** | 17/108 (16%) |
| [octocat/Hello-World](https://github.com/octocat/Hello-World) | control ┬À floor | **L0** | 14/108 (13%) |

## What the corpus found

Full writeup, every claim cited to a check ID and a report file:
**[analysis/findings.md](analysis/findings.md)**. Two findings worth
reading even if you read nothing else:

### fakeflix earns 67% and is capped at L1

Discovered during the Phase 0 pilot, corroborated at scale in Phase 1.
fakeflix ÔÇö previously validated in harness-score's own v0.1.2 field test
as "genuinely excellent" ÔÇö earns 67% of all points but is capped at **L1**
because Context & Guides sits at 45%: a substantive root `AGENTS.md` (79
non-empty lines, 17 headings ÔÇö passes outright) but **zero scoped rule
files**, so `CTX-03` through `CTX-06` all fail, even as Skills & Commands
sits at 82% and Sensors & Feedback at 100%. The same shape ÔÇö real root
context file, no scoped rules ÔÇö turned out to be common in the wider
corpus, not a one-off. Whether that should cap a repository a full level
below everything else it earned is a question for Phase 2's blind rating,
not resolved here. Full evidence: [`corpus/reports/fakeflix.json`](corpus/reports/fakeflix.json).

### Anthropic's own skills showcase scores identically to an empty repo

`anthropic/skills` ÔÇö Anthropic's official showcase of Claude Skills ÔÇö
scores **L0 ┬À 16%**, indistinguishable in kind from `octocat/Hello-World`.
Its skills live at `skills/<name>/SKILL.md` (repository root) rather than
`.claude/skills/`, because this repo *distributes* skills rather than
using them to develop itself ÔÇö and `SKL-01` correctly answers the question
it's built to ask ("does this repo have a self-referential skill
harness?") with "no." But the model has no vocabulary today for "canonical
reference implementation of an artifact type" as distinct from "no harness
at all" ÔÇö a `.claude-plugin/` manifest at root (which this repo has) is a
strong, currently-ignored signal. Not a bug; a real category gap. Full
evidence and two more findings in the same vein (a confirmed parser bug in
`HKS-05`, and hook-config inflation via nested tutorial directories) in
[analysis/findings.md](analysis/findings.md).

Four of these findings are drafted as concrete proposals against
harness-score in [`proposals/`](proposals), following harness-score's own
[check-change process](https://github.com/paladini/harness-score/blob/main/CONTRIBUTING.md#adding-or-changing-a-check) ÔÇö
not yet filed as issues there.

## How it works

1. [`corpus/manifest.json`](corpus/manifest.json) pins each repository to
   an exact commit SHA and a category.
2. [`corpus/run.mjs`](corpus/run.mjs) clones each pinned commit into a
   local, gitignored cache and runs `npx harness-score@<pinned-version>
   --json` against it ÔÇö no code from the scanned repository is ever
   executed, and the same commit always produces the same report.
3. [`corpus/build-results.mjs`](corpus/build-results.mjs) turns the raw
   reports into `results/leaderboard.{md,csv}` and
   `results/dimension-heatmap.md` ÔÇö deterministically, no hand-edited
   tables.
4. A human blind rating (recorded *before* seeing the tool's score ÔÇö
   protocol in
   [METHODOLOGY.md](METHODOLOGY.md#blind-human-rating-q1-protocol)) checks
   whether the automated level agrees with expert judgment. **Not done
   yet** ÔÇö this is the part of the study that needs a human, not an agent.
5. Disagreements and model gaps get written up in
   [`analysis/findings.md`](analysis/findings.md) and turned into concrete
   check-change proposals in [`proposals/`](proposals).

## Reproduce it yourself

```bash
git clone https://github.com/paladini/harness-maturity-analysis
cd harness-maturity-analysis
npm run corpus
```

Everything is pinned and versioned ÔÇö the raw JSON report for every scanned
repository lives in [`corpus/reports/`](corpus/reports), so any number in
this study is one click away from the filesystem fact it came from.

## Score any repository, not just the corpus

The corpus is curated and pinned on purpose ÔÇö but the scanner behind it
works on anything. [`corpus/score-adhoc.mjs`](corpus/score-adhoc.mjs) scores
any repo URL or local path with this study's exact pinned `harness-score`
version, shows the dimension breakdown and the highest-value unmet checks,
and tells you where it would land among the current corpus ÔÇö without
writing anything to `corpus/manifest.json` or `corpus/reports/`:

```bash
npm run score -- https://github.com/owner/repo   # or a local path: npm run score -- .
```

Packaged as a Claude Code skill ÔÇö
[`score-any-repo`](.claude/skills/score-any-repo/SKILL.md) ÔÇö for "how does
X score?" questions asked in an agent session. If a result turns out to be
corpus-worthy, redo it properly with the `add-corpus-entry` skill instead
of promoting the ad-hoc output.

## Repository layout

```
corpus/       manifest, runner, ad-hoc scorer, raw scan reports (versioned JSON)
results/      generated leaderboard + dimension heatmap
analysis/     findings.md (Q2, done); ratings/ + external-validity.md (Q1, Phase 2)
proposals/    4 findings turned into harness-score check-change proposals
METHODOLOGY.md  research questions, corpus design, protocol, limitations
```

## This repo dogfoods itself

A repository studying harness maturity ought to have one. `harness-maturity-analysis`
scans itself at **L4 ┬À Self-correcting ÔÇö 96/108 (89%)**: a scoped `.cursor/rules/`
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
npm test           # vitest ÔÇö pure functions, parseArgs, manifest.json shape
npm run lint        # biome
```

## Roadmap

- [x] **Phase 0.** Pipeline scaffold, pinned-clone runner, results
      generator, validated against 4 anchor repositories.
- [x] **Phase 1.** Corpus frozen and scanned: 20/21 pinned repositories
      (1 excluded for a documented Windows checkout limitation, not silently
      dropped).
- [ ] **Phase 2.** Blind human ratings + per-repo critique ÔÇö needs a rater
      without implementation knowledge of the scanner. Not started.
- [x] **Phase 3 (Q2 only).** Model-calibration synthesis ÔÇö
      [`analysis/findings.md`](analysis/findings.md): 1 confirmed bug, 3
      model/category gaps, 1 aggregate pattern, 1 honest negative result.
      **Q1 synthesis (external validity) blocked on Phase 2.**
- [x] **Phase 4 (partial).** 4 findings drafted as check-change proposals
      in [`proposals/`](proposals). **Not yet filed as issues against
      harness-score**, and findings not yet published outside this repo.

## License

[MIT](LICENSE) ┬® 2026 Fernando Paladini
