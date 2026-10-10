# Methodology

## Thesis

An AI coding agent's reliability depends on the **harness** wrapped around
it — context files, rules, skills, hooks, sensors, and guardrails — not on
which lab built the underlying model, and not on how prominent the company
behind a repository is. This study asks two separate questions about a
curated set of notable public repositories:

- **Q1 — External validity.** Does [harness-score](https://github.com/paladini/harness-score)'s
  automated maturity level (L0–L4) agree with a blind human read of the same
  repository?
- **Q2 — Model calibration.** What do these repositories reveal about gaps,
  biases, and miscalibrations in harness-score's maturity model — checks it
  should have but doesn't, harness patterns it doesn't recognize, category
  boundaries that don't hold, scoring logic that's too coarse, and level
  thresholds that don't discriminate the way they should?

## The central caveat

**Harness maturity is not company AI competence.** harness-score measures
whether a *specific repository* ships the guides, sensors, and guardrails
that make it safe and productive to work in with an AI agent. It says
nothing about how sophisticated the organization behind it is at building AI
systems. A frontier lab's inference library can legitimately score low —
it's a library, not an agent-first workspace. A small teaching repository
can legitimately score L4. Any ranking in this study ranks *repositories'
harnesses*, never the teams or companies that own them.

## What harness-score measures — and what it doesn't

harness-score is a deterministic, filesystem-only scanner across six
dimensions (Context & Guides, Skills & Commands, Hooks & Guardrails,
Sensors & Feedback, CI Feedback, Hygiene & Safety), gating into five
maturity levels. The applicable maximum can vary by repository and scanner
version, so compare scores only within a versioned report. Every check is a
filesystem fact — a file exists, parses,
matches a pattern — never a judgment call, never a network request. Full
definition: [the Maturity Model](https://paladini.github.io/harness-score/guide/maturity-model).

It deliberately does not measure whether tests are *good*, whether rules are
*true*, functional correctness, or team practice — see harness-score's own
["what it deliberately does not measure"](https://paladini.github.io/harness-score/guide/maturity-model#what-the-model-deliberately-does-not-measure).
This study inherits that ceiling. Q1 exists specifically to probe how much
it matters in practice.

## Corpus selection

The original 21 repositories were chosen — not randomly sampled — across six
groups, plus deliberate stress cases picked because the tool was expected to
score them surprisingly, making critique useful:

1. **AI labs / model companies**
2. **AI-first / agent-native developer tools**
3. **Harness-engineering exemplars**
4. **Prompt / eval engineering**
5. **Artifact governance** (skills, hooks, MCP registries/collections)
6. **Controls** — harness-score itself (ceiling), a well-run non-AI library
   (engineering quality without AI artifacts), a minimal repository (floor)

Phase 1B adds 50 public repositories across eight strata: AI and automation,
developer tools, cloud/IaC/platforms, data/ML/science, observability and
networking, security, community applications, and language/runtime/framework
controls. The [selection ledger](corpus/selection-2026-10-07.json) records the
five preregistered waves, default branches, immutable SHAs, GitHub license
metadata and approximate sizes. Some GitHub license identifiers are
`NOASSERTION`; inclusion here makes no legal claim about their licenses.
Phase 1C adds 30 new AI software repositories selected by descending GitHub
stars within a [frozen discovery snapshot](corpus/popularity-search-2026-10-08.json).
Canonical repository IDs deduplicate the 71-entry baseline, including renames.
The [selection ledger](corpus/selection-2026-10-08-ai-popularity.json) records
software purpose, immutable commits, verified implementation blobs, star counts
and every higher-ranked exclusion. Pure guides, courses, awesome-lists,
instructional skill packs and documentation-only product/model announcements
are excluded. Mixed repositories qualify when they contain their own executable
application, engine, CLI or reusable library; an installer or bootstrap for
external instructions alone does not qualify.

Phase 1D adds 25 cryptocurrency software repositories by accumulated stars
in the [frozen crypto search universe](corpus/popularity-search-2026-10-08-crypto.json).
Public, non-fork software includes archived implementations for the lifetime
popularity request, with status recorded. Canonical IDs deduplicate the
101-entry baseline. The [selection ledger](corpus/selection-2026-10-08-crypto-popularity.json)
records real software purpose, exact source blobs, immutable commits and all
higher-ranked exclusions. Instructional collections and guides are excluded.
Stars observed on the selection date approximate accumulated popularity,
not historical peak stars. Cryptocurrency protocols, wallets, contracts and
trading tools remain distinct categories within this repository-local study.

Phase 1E adds 25 media editing software projects selected from a recorded
bounded union of GitHub searches on video, audio, image, vector graphics and
animation tools. The [search snapshot](corpus/popularity-search-2026-10-09-media-editing.json)
and [selection ledger](corpus/selection-2026-10-09-media-editing-popularity.json)
preserve query counts, canonical repository IDs, observed stars, exact commits,
implementation-file evidence and higher-ranked exclusions. The bounded union
had 645 unique repositories; several searches reached GitHub's 100-result cap,
so this cohort is not a claim about GitHub's universal top 25. Canonical IDs
deduplicate the 126-entry baseline. Stars are selection metadata, not a score
input or a historical peak. The [execution report](analysis/phase-1e-execution.md)
contains scanner outcomes and limitations. This remains a showcase expansion
without blind human ratings.

The original 151-repository collection is a showcase and topology stress sample, not a
statistical sample or a completed external-validity study. Popularity selects
coverage; it does not determine the automated maturity score. The cohort is
the top eligible new software in the recorded search universe, with no claim
that GitHub topic labels perfectly identify every AI repository. All capped
search pages extend below the 30th eligible candidate's star count.

Phase 1F adds 500 AI software projects selected from eight GitHub searches
covering AI, artificial intelligence, LLMs, agents, generative AI, coding
assistants, machine learning, and AI IDEs. The [discovery snapshot](corpus/popularity-search-2026-10-09-ai-500.json)
preserves 2,015 returned records across the query pages and 1,689 unique
canonical repository IDs. The [selection ledger](corpus/selection-2026-10-09-ai-500.json)
records the 500 admitted projects, observed stars, numeric IDs, immutable
default-branch commits, software purpose, README and implementation-blob
evidence, archive state, and rejected candidates. The selected range was
159,604 to 3,613 stars in this bounded search universe after the final
eligibility review. That review removed 18 learning-only books, surveys,
interview notes, tutorial collections, and reference repositories and replaced
them with pinned AI software candidates. The replacement list and evidence are
recorded in the selection ledger. The 300-result query
windows, topic coverage, and GitHub Search semantics limit the universe; this
is not a claim of a universal GitHub top 500. Canonical IDs deduplicate the
151-entry baseline and Showcase projects. AI/LLM/agent work was already an
explored topic; this expansion was explicitly requested. General-purpose
projects with incidental AI mentions, guides, courses, skill packs, and
reference-only repositories are excluded. Popularity is selection metadata,
not a score input. The cohort is scanner-only and makes no blind-rating or
external-validity claim.

The completed cohort has 500 reports at `harness-score@1.8.1`, all pinned to
the selected commits, with no truncated reports. The [Phase 1F execution
report](analysis/phase-1f-execution.md) summarizes the score and level
distribution, checkout audit, and one Windows checkout exception handled on
Linux without omitting tracked files. No scanned repository code was run,
installed, built, or tested.

Stress cases folded into the corpus on purpose:

- A **single-tool repository** (only Windsurf/Continue/Cline, no
  Cursor/Claude Code) — exposes tool bias in the Hooks dimension and
  whether L4 is reachable at all outside two specific tools.
- A **curated collection repository** (e.g. an "awesome-cursorrules"-style
  list) — exposes score inflation from harness artifacts matched inside
  `examples/`/`fixtures/`/`templates/` directories rather than the
  repository's own root harness.
- A **large monorepo** — exposes scan truncation (`MAX_FILES`) and signal
  dilution.
- An **eval-first repository** (promptfoo/evals-style) — exposes the
  model's blindness to AI-specific sensors (no credit for eval suites,
  LLM-as-judge configs, or prompt regression tests today).

Every entry is public, clonable, and pinned to an exact commit SHA — see
[Measurement protocol](#measurement-protocol). The full list lives in
[`corpus/manifest.json`](corpus/manifest.json).

## Measurement protocol

Reproducibility is non-negotiable — it's the same property harness-score
holds itself to (same input ⇒ same output, forever).

1. **Pin everything.** Each corpus entry records `repoUrl` and an exact
   `commit` SHA. The scanner version is pinned once, in `manifest.json`'s
   `toolVersion` (currently `harness-score@1.8.1`), and stamped into every
   report via the tool's own `tool.version` field. `runDate` identifies the
   current snapshot date. Optional `runId` names separate complete cohorts on
   that same date/version; `crypto-popularity` preserves the earlier 101-entry
   snapshot rather than rewriting it. Same-version additions measure coverage,
   not a scoring-model change.
2. **Clone at the pinned commit**, never at a moving branch tip —
   [`corpus/run.mjs`](corpus/run.mjs) shallow-fetches the exact SHA,
   falling back to a full fetch when a host won't serve an arbitrary SHA
   directly. Checkout skips Git LFS smudging, because large LFS assets are
   not harness signals. The `openai-cookbook` entry documents one
   deterministic partial+sparse checkout that omits 773 MB of datasets and
   image assets, including paths that NTFS cannot represent.
3. **Scan with `npx harness-score@<pinned> <path> --json`** — no network
   access by the scanner itself, no LLM calls, and no code from the scanned
   repository is ever executed. The raw JSON report is the unit of record.
4. **Version the raw reports and score history.**
   [`corpus/reports/*.json`](corpus/reports) stores the current run as-is.
   Every complete run also writes an append-only compact snapshot under
   [`corpus/history/`](corpus/history), preserving the date, scanner
   version, pinned commit, level, and score for each repository.
5. **Derive, don't hand-edit.** Everything under `results/` is generated
   from `corpus/reports/*.json` by
   [`corpus/build-results.mjs`](corpus/build-results.mjs) — deterministically,
   no manually edited tables.

## Blind human rating (Q1 protocol)

To test external validity without circularity, a human maturity rating is
recorded **before** looking at the tool's output:

1. Read the repository (README, root context file if any, `.cursor/` /
   `.claude/` / `.windsurf/` / etc., CI config, tests) as a developer
   evaluating "how safe would it be to turn an AI agent loose in here."
2. Assign an independent L0–L4 rating using the *same* level definitions
   harness-score publishes (deliberately — the comparison is only
   meaningful if both sides rate the same construct), recorded in
   `analysis/ratings/<name>.md` with the reasoning written down.
3. Only then run the scanner and compare.
4. Where they disagree, write it up in `analysis/critiques/<name>.md`:
   which specific check(s) produced a false positive or false negative,
   with file-level evidence.

Phase 1B adds scanner reports for showcase coverage without collecting blind
human ratings. Its reports are not Q1 agreement evidence. Independent raters
can apply this protocol to a future, report-free sample; results must not be
called blind if a rater has already seen the scanner output.

`analysis/external-validity.md` can synthesize agreement and disagreement
only once a valid blind-rating cohort exists.

## Limitations

- **N=101 is qualitative, not statistical.** This corpus is curated for
  depth and stress-testing, not sampled for statistical power. It can
  surface real gaps and support strong qualitative findings; it cannot
  responsibly justify moving a numeric threshold (e.g. "sensors ≥ 60%") by
  a few percentage points. That calibration needs a larger, closer-to-random
  corpus — a natural next phase, not attempted here.
- **Snapshot in time.** Every score reflects one pinned commit.
  Repositories actively improve their harnesses (harness-score itself is a
  case study in that); a later visit to the same repository may score
  differently. The score history in this study holds repository commits
  fixed across scanner versions, so its deltas measure the model rather
  than repository evolution.
- **No independent human validation yet.** The current corpus supplies
  scanner reports. It has no blind-rating cohort or inter-rater agreement
  measurements, so Q1 remains open.
- **Deterministic-scanner ceiling.** Every limitation harness-score
  declares about itself applies here too; this study cannot exceed what a
  filesystem scan can honestly claim.

## How to reproduce

```bash
git clone https://github.com/paladini/harness-maturity-analysis
cd harness-maturity-analysis
npm run corpus        # clone each pinned repo, scan it, rebuild results/
```

Scan a single entry while iterating:

```bash
node corpus/run.mjs --only octocat-hello-world
```
