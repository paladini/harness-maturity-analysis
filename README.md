# harness-maturity-analysis

**A reproducible study of AI-harness maturity across notable open-source
repositories** — scored deterministically with
[harness-score](https://github.com/paladini/harness-score), checked against
a blind human read of the same repos, and used to find what harness-score's
maturity model still gets wrong.

> **Status: Phase 0 — pilot.** The measurement pipeline is built and
> validated against 4 anchor repositories spanning the full L0–L4 range.
> The full ~20-repository corpus, blind ratings, and findings come next —
> see [Roadmap](#roadmap). Numbers below are a pipeline smoke test, not a
> result.

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

## Pilot results (4 anchors)

Four repositories chosen to span the tool's full output range, used to
validate the measurement pipeline before scaling to the full corpus. All
four scanned cleanly on the first pinned run — `harness-score@1.0.0`
against the exact commits recorded in
[`corpus/manifest.json`](corpus/manifest.json):

| Rank | Repository | Role | Level | Score |
|---|---|---|---|---|
| 1 | [harness-score](https://github.com/paladini/harness-score) | control · ceiling | **L4** · Self-correcting | 108/108 (100%) |
| 2 | [fakeflix](https://github.com/tech-leads-club/fakeflix) | harness-engineering exemplar | **L1** · Documented | 72/108 (67%) |
| 3 | [execa](https://github.com/sindresorhus/execa) | control · quality without AI artifacts | **L0** · Unharnessed | 36/108 (33%) |
| 4 | [octocat/Hello-World](https://github.com/octocat/Hello-World) | control · floor | **L0** · Unharnessed | 14/108 (13%) |

The spread alone validates the instrument: a known-excellent library with
zero AI-harness artifacts (execa) lands well above the empty floor on
Sensors/CI/Hygiene alone but can't clear L1 without a context file; the tool
scanning itself hits the ceiling it's supposed to hit.

**An unprompted first finding.** fakeflix — previously validated in
harness-score's own v0.1.2 field test as "genuinely excellent" — earns 67%
of all points but is capped at **L1**, one level below what the raw score
would suggest. Its own `level.nextLevelGaps` names why: `context ≥ 60%`.
The Context dimension sits at 45% not because its `AGENTS.md` is weak (79
non-empty lines, 17 headings — CTX-01/02 pass outright) but because it has
**zero scoped rule files** — no `.cursor/rules/*.mdc`, no nested
`AGENTS.md`/`CLAUDE.md` — so CTX-03 through CTX-06 all fail, even as Skills
& Commands sits at 82% and Sensors & Feedback at 100%. Whether "a single
excellent root file, no scoped rules" *should* cap a repository at L1
regardless of everything else is exactly a Q2-shaped question — recorded
here as a lead for Phase 3, not resolved by it; resolving it properly means
running the blind-rating protocol on fakeflix in Phase 2, not eyeballing
one JSON file. Full evidence: [`corpus/reports/fakeflix.json`](corpus/reports/fakeflix.json).

Full breakdown: [`results/leaderboard.md`](results/leaderboard.md) ·
[`results/dimension-heatmap.md`](results/dimension-heatmap.md) · raw
reports: [`corpus/reports/`](corpus/reports).

## How it works

1. [`corpus/manifest.json`](corpus/manifest.json) pins each repository to
   an exact commit SHA and a category.
2. [`corpus/run.mjs`](corpus/run.mjs) clones each pinned commit into a
   local, gitignored cache and runs `npx harness-score@<pinned-version>
   --json` against it — no code from the scanned repository is ever
   executed, and the same commit always produces the same report.
3. [`corpus/build-results.mjs`](corpus/build-results.mjs) turns the raw
   reports into `results/leaderboard.{md,csv}` and
   `results/dimension-heatmap.md` — deterministically, no hand-edited
   tables.
4. A human blind rating (recorded *before* seeing the tool's score —
   protocol in
   [METHODOLOGY.md](METHODOLOGY.md#blind-human-rating-q1-protocol)) checks
   whether the automated level agrees with expert judgment.
5. Disagreements and model gaps get written up in `analysis/` and turned
   into concrete check-change proposals in `proposals/`, using
   harness-score's own [check-change process](https://github.com/paladini/harness-score/blob/main/CONTRIBUTING.md#adding-or-changing-a-check).

## Reproduce it yourself

```bash
git clone https://github.com/paladini/harness-maturity-analysis
cd harness-maturity-analysis
npm run corpus
```

Everything is pinned and versioned — the raw JSON report for every scanned
repository lives in [`corpus/reports/`](corpus/reports), so any number in
this study is one click away from the filesystem fact it came from.

## Repository layout

```
corpus/       manifest, runner, raw scan reports (versioned JSON)
results/      generated leaderboard + dimension heatmap
analysis/     blind ratings, per-repo critiques, external-validity synthesis
proposals/    findings turned into harness-score check-change proposals
METHODOLOGY.md  research questions, corpus design, protocol, limitations
```

## This repo dogfoods itself

A repository studying harness maturity ought to have one. `harness-maturity-analysis`
scans itself at **L4 · Self-correcting — 96/108 (89%)**: a scoped `.cursor/rules/`
rule governing the data-integrity discipline below, a skill for the one
procedure Phase 1 will repeat ~20 times, real gate hooks (deny destructive
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
- [ ] **Phase 1.** Freeze the full ~20-repository corpus.
- [ ] **Phase 2.** Blind human ratings + per-repo critique.
- [ ] **Phase 3.** Synthesis — `analysis/findings.md`.
- [ ] **Phase 4.** Proposals filed against
      [harness-score](https://github.com/paladini/harness-score), findings
      published.

## License

[MIT](LICENSE) © 2026 Fernando Paladini
