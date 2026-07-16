# Findings — Phase 1

## Scope: this is Q2 only

This document synthesizes what the 20-repository corpus reveals about gaps,
biases, and miscalibrations in harness-score's maturity model itself
(**Q2 — model calibration**, per [METHODOLOGY.md](../METHODOLOGY.md)). It does
**not** attempt Q2's sibling question — whether the automated level agrees
with expert human judgment (**Q1 — external validity**) — because that
requires the blind human-rating protocol
([METHODOLOGY.md](../METHODOLOGY.md#blind-human-rating-q1-protocol)), which
has to be done by a rater without implementation knowledge of the scanner to
mean anything. That's Phase 2, and it needs a human, not this document.

What follows instead is code-and-repository-grounded: every claim below cites
a specific check ID and a specific file path in a specific pinned commit
(all in [`corpus/reports/`](../corpus/reports)), independent of whether that
repository "deserves" a given level.

Corpus for this pass: 20/21 repositories scanned (`openai-cookbook` excluded
— see [`corpus/manifest.json`](../corpus/manifest.json)'s note: a Windows
NTFS path-safety limitation unrelated to harness-score itself).

## Summary

| # | Finding | Kind | Confidence |
|---|---|---|---|
| 1 | `HKS-05` misses the unbraced `$VAR` hook-path form | Bug | High — reproduced, root-caused, one-line fix |
| 2 | Hook-config inflation via nested tutorial/example directories | Model gap | High — confirmed independently in 2 unrelated repos |
| 3 | Skill/plugin **marketplace** repos score identically to neglected ones | Category gap | High — structurally clear, not a judgment call |
| 4 | Pre-commit tooling and Hooks & Guardrails measure fully disjoint things | Model gap | Medium-high — real overlap, design choice needed |
| 5 | Most "AI-relevant" repos' scores are overwhelmingly generic-hygiene, not AI-harness | Aggregate pattern | Medium — descriptive, needs Q1 to interpret |
| 6 | `fakeflix` capped at L1 despite 67% (carried from Phase 0) | Level-threshold question | Medium — real, but N=1 |
| 7 | Large-monorepo truncation hypothesis did not materialize for `zed` | Negative result | High — but N=1, don't over-generalize |

---

## 1. Bug: `HKS-05` misses the unbraced `$VAR` hook-path form

**`packages/cli/src/harness/hooks.ts`, `hookCommandPathsResolve`** strips a
`${VAR}/` prefix before checking whether a hook command references a
committed file:

```js
const stripped = normalized.replace(/^\$\{[^}]+\}\//, '');
```

This only matches the **braced** form. `cline` ([`corpus/reports/cline.json`](../corpus/reports/cline.json))
registers a real, committed hook:

```json
"SessionStart": [{ "hooks": [{ "type": "command",
  "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/claude-code-for-web-setup.sh" }] }]
```

`$CLAUDE_PROJECT_DIR/.claude/hooks/claude-code-for-web-setup.sh` — no braces.
The file genuinely exists at exactly that path in the repo (verified by
hand: `.claude/hooks/claude-code-for-web-setup.sh` is present and
committed). `HKS-05` still reports it as missing:

> `Hook command(s) reference missing files: $CLAUDE_PROJECT_DIR/.claude/hooks/claude-code-for-web-setup.sh`

This is a **false negative** — cline loses 2 points it has legitimately
earned, purely from an incomplete regex. Both `$VAR/...` and `${VAR}/...`
are valid in Claude Code hook commands; the check should strip either form.
One-line fix, no design discussion needed — candidate for
`proposals/001-hks-05-unbraced-var.md`.

*Secondary, lower-confidence observation in the same check:* `promptfoo`
([`corpus/reports/promptfoo.json`](../corpus/reports/promptfoo.json)) fails
`HKS-05` on `${CLAUDE_PROJECT_DIR}/node_modules/.bin/block-no-verify` — a
real npm package binary, populated by `npm install`, not something anyone
"forgot to commit." Paths under `node_modules/.bin/` (or equivalent
dependency-manager output dirs) probably shouldn't be held to "commit the
script" — worth folding into the same proposal as a secondary case, lower
priority than the `$VAR` fix.

## 2. Model gap: hook-config inflation via nested tutorial/example directories

`anthropic-cookbook` scores **57% on Hooks & Guardrails (8/14)** — the
second-highest Hooks score in the entire corpus after harness-score itself.
The evidence:

> `HKS-01`: `skills/.claude/settings.json parses as JSON.`
> `HKS-03`: `Gate hook(s) registered on: PreToolUse.`

`skills/.claude/settings.json` is not anthropic-cookbook's own operational
harness — `skills/` is a **teaching module about Claude Skills**, evidenced
by its own contents: `skills/CLAUDE.md`, `skills/notebooks/01_skills_introduction.ipynb`,
`skills/assets/skills-conceptual-diagram.png`, `skills/custom_skills/`. The
nested `.claude/settings.json` is almost certainly a worked example shown
*to learners*, not a hooks configuration governing agents working on the
cookbook repository itself. `collectHookConfigs`'s path pattern
(`(^|\/)\.claude\/settings\.json$`) matches at any depth with no distinction
between "this repo's own harness" and "an example file bundled arbitrarily
deep in a tutorial."

This is exactly the inflation pattern this study's corpus design
anticipated and built `awesome-cursorrules` specifically to probe (see
[METHODOLOGY.md](../METHODOLOGY.md#corpus-selection)) — except it surfaced
**independently, unprompted, in a repository picked for an unrelated
reason** (`ai-lab`, not `artifact-governance`). That's stronger evidence
than if it had only shown up in the repo designed to find it: this is a
structural risk across the whole corpus, not a property of one collection
repo. (`awesome-cursorrules` itself did *not* show the same pattern for
rules at this pinned commit — its rules aren't organized under a path
`CTX-03` recognizes — so the two stress cases caught different failure
modes, which is its own useful data point.)

Candidate direction for `proposals/002-nested-config-inflation.md`: give
root-level harness configs priority over nested ones the same way
`readNormalizedHooks` already prefers "most events" among *root-plausible*
configs (shipped in v0.5.0 for the hooks-shadowing regression) — extend
that precedent to also weight path depth, or exclude configs found under
conventionally-non-operational paths (`notebooks/`, `examples/`, `tutorial/`,
paths containing a nested `CLAUDE.md`/`README` that itself reads as
instructional content). This needs care: a monorepo's real sub-package
harness (e.g. `packages/cli/.cursor/...`) is legitimate and must not be
penalized by the same fix.

## 3. Category gap: skill/plugin marketplace repos score identically to neglected ones

`anthropic-skills` — Anthropic's own official showcase of Claude Skills —
scores **L0 · 16% (17/108)**, with **zero** on Skills & Commands, identical
in kind to `octocat/Hello-World`. The repository's actual structure:

```
skills/<name>/SKILL.md   (17 skill folders, at repo root)
.claude-plugin/          (a real plugin manifest)
```

`SKL-01` looks for `.cursor/skills/`, `.claude/skills/`, or
`.agents/skills/` — paths that mean "this project has configured its own
agent to use these skills while working on this repository." A skill
**marketplace** repo doesn't have that structure by construction: the
skills aren't for developing anthropic/skills itself, they're the
product being distributed. This is not a bug — the check is correctly
answering the question it asks. But the *model* has no vocabulary for
"this repository is the canonical reference implementation of an artifact
type" as a distinct, creditable category from "this repository has no
harness at all." Both currently read as L0.

A `.claude-plugin/` manifest at the repository root is a strong,
completely ignored signal today. Candidate direction for
`proposals/003-plugin-marketplace-category.md`: a small positive check
(existence of `.claude-plugin/plugin.json`, `.cursor-plugin/`, or
equivalent marketplace manifests) — not to reward this repo type with a
maturity *level* it doesn't structurally have (marketplace repos still
lack context files, hooks, tests in the way that matters for "safe to run
an agent here"), but to stop conflating "distributes the artifact" with
"has none of the artifact." Needs its own design session per this
project's own established practice for any new check
(see [ROADMAP.md's "why these aren't quick adds"](https://github.com/paladini/harness-score/blob/main/ROADMAP.md#why-these-arent-quick-adds)).

## 4. Model gap: pre-commit tooling earns zero Hooks credit

Across the corpus, `CI-04` (pre-commit checks installed) and `HKS-*`
(Hooks & Guardrails) move **completely independently**:

| Repo | CI-04 | Hooks | Evidence |
|---|---|---|---|
| `continue` | PASS — `.husky/`, husky + lint-staged in package.json | 0% | No `.claude/settings.json` or `.cursor/hooks.json` at all |
| `goose` | FAIL — no pre-commit tooling detected | 0% | (consistent — no guardrail signal anywhere) |
| `cline` | PASS — `.husky/`, husky + lint-staged | 29% (partial, see §1) | Has `.claude/settings.json`, but the *pre-commit* tooling itself earns nothing here |

A husky + lint-staged pre-commit hook **is** a gate in the plain-English
sense this study's own README uses ("guardrails prevent"): it can block a
commit before it completes. harness-score's own guide draws exactly this
line in its Guardrails chapter ("guidance that keeps being violated moves
from rule → sensor → **gate**"), yet the scoring model puts pre-commit
tooling in CI Feedback and reserves Hooks & Guardrails exclusively for
Cursor's `hooks.json` / Claude Code's `settings.json` hooks key.

This may well be the *right* call — a runtime hook (blocks an in-session
agent action) and a pre-commit hook (blocks a `git commit`) are genuinely
different points in the loop, and conflating them could blur a real
distinction the model is right to keep. Recorded here as a design
question, not a bug: does "Hooks & Guardrails" mean "vendor hook config,"
or "any runtime-enforced guardrail regardless of mechanism"? The dimension
's own name suggests the latter; the implementation is the former. Worth
a `proposals/004-hooks-dimension-scope.md` framing the question rather
than presupposing the answer — this is exactly the kind of change that
needs Phase 2's external-validity data before deciding, not a corpus-only
call.

## 5. Aggregate pattern: how much of the score is actually "AI harness"?

Splitting each report's earned points into **AI-specific** (Context +
Skills + Hooks, 51 of 108 possible points) versus **generic engineering
hygiene** (Sensors + CI + Hygiene, 57 of 108 possible points) and computing
the AI-specific share of *earned* points:

| Repo | Level | Score | AI-specific share of earned points |
|---|---|---|---|
| harness-score | L4 | 100% | 47% |
| anthropic-cookbook | L3 | 92% | 45% |
| promptfoo | L4 | 88% | 40% |
| goose | L3 | 74% | 36% |
| zed | L3 | 69% | 35% |
| continue | L3 | 73% | 32% |
| fakeflix | L1 | 67% | 32% |
| cline | L1 | 72% | 31% |
| mcp-servers | L1 | 61% | 30% |
| opencode | L1 | 69% | 27% |
| langfuse | L1 | 68% | 26% |
| openhands | L1 | 67% | 25% |
| anthropic-skills | L0 | 16% | 12% |
| smolagents | L0 | 49% | 11% |
| awesome-cursorrules | L0 | 33% | 6% |
| openai-evals | L0 | 38% | 5% |
| aider | L0 | 43% | 4% |
| dspy | L0 | 48% | 4% |
| execa | L0 | 33% | 3% |
| octocat-hello-world | L0 | 13% | 7% |

Full numbers: [`results/dimension-heatmap.md`](../results/dimension-heatmap.md).

Reading this honestly: most of the well-known agent-native tools and
frameworks in this corpus (`dspy`, `aider`, `smolagents`, `openai/evals`)
earn the *large majority* of their points from tests/CI/lockfiles/license —
dimensions with nothing specifically to do with AI agents — while scoring
near-zero on the dimensions that are actually about harnessing an agent.
This is consistent with this study's own central caveat
([METHODOLOGY.md](../METHODOLOGY.md#the-central-caveat)): a repository can
be built *by* or *for* AI-first work and still not itself be *harnessed*
for agents. It is **not**, on its own, evidence that the model is
miscalibrated — a repo genuinely might not need scoped rules or hooks to
be safely agent-editable. Flagged as a pattern worth carrying into Phase 2:
if the blind human ratings agree that these are legitimately low-harness
repositories, this pattern is the model working as intended; if a rater
looks at `dspy` or `aider` and sees real, if informal, harness practice the
scanner is blind to, this becomes Q2 evidence instead.

## 6. Level-threshold question, carried forward: `fakeflix`

Documented in depth in the [README](../README.md#an-unprompted-first-finding)
during the Phase 0 pilot: `fakeflix` earns 67% of all points but is capped
at L1 because Context & Guides sits at 45% (`CTX-03`–`CTX-06` all fail —
zero scoped rule files, despite a substantive root `AGENTS.md`). Restated
here because it's now corroborated by the same structural shape appearing
elsewhere in the corpus (§1 `anthropic-cookbook`, §3 `anthropic-skills`):
**a real, substantive root context file with zero scoped rules is a
common, not rare, shape** in this corpus, and it caps a repository at L1
regardless of what else it has earned. Whether that's the right gate is a
Q1 question (does a human rater agree fakeflix "feels like" L1?), not
resolved here.

## 7. Honest negative result: `zed` did not truncate

The corpus was designed to include one deliberately large monorepo
(`zed-industries/zed`) specifically to stress-test `MAX_FILES` truncation
and dimension dilution. At the pinned commit, `zed`'s report shows
`"truncated": false` — the walk completed without hitting the 20,000-file
cap. Recorded as a negative result rather than silently dropped: the
hypothesis that "a large monorepo will visibly truncate" did not hold for
this specific repository at this specific commit (likely because `target/`
and other build-artifact directories are already in `SKIP_DIRS`, and Rust
source trees are smaller in raw file count than their line count suggests).
This doesn't mean truncation isn't a real risk elsewhere — it means this
particular anchor didn't demonstrate it, and a claim about truncation
behavior needs a repository that actually trips it, not an assumption.

## What's explicitly not in this document

- **Any claim that a repository's score "is right" or "is wrong."** That's
  Q1, and it needs the blind human-rating protocol run by a rater without
  implementation knowledge of the scanner — see
  [METHODOLOGY.md](../METHODOLOGY.md#blind-human-rating-q1-protocol). Claude
  authored this analysis and built the scanner being analyzed; a "blind"
  rating from the same source would be circular, not independent.
- **Level-threshold recalibration.** N=20, curated for depth and stress
  cases, not sampled for statistical power — see
  [METHODOLOGY.md's limitations](../METHODOLOGY.md#limitations). Real, but
  not sufficient on its own to justify moving a percentage threshold.
