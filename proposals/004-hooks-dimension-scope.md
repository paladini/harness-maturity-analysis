# 004 — What should "Hooks & Guardrails" mean: vendor hook config, or any runtime-enforced gate?

**Change type:** none proposed — this is a scoping question, not a specific check edit
**Check ID:** n/a (cuts across `HKS-01`–`05` vs. `CI-04`)
**Dimension:** `hooks` vs `ci`
**Source finding:** [analysis/findings.md §4](../analysis/findings.md#4-model-gap-pre-commit-tooling-earns-zero-hooks-credit)
**Corroborating evidence:** [`corpus/reports/continue.json`](../corpus/reports/continue.json), [`corpus/reports/goose.json`](../corpus/reports/goose.json), [`corpus/reports/cline.json`](../corpus/reports/cline.json)

## The question

`continue` has real, committed pre-commit tooling (husky + lint-staged —
`CI-04` passes) and zero Hooks & Guardrails credit (no `.claude/settings.json`
or `.cursor/hooks.json` at all). harness-score's own guide draws the "rule
→ sensor → gate" escalation explicitly and calls a pre-commit hook exactly
that: something that "keeps being violated" escalating into machinery that
blocks the action outright. By that definition, husky + lint-staged *is* a
gate — it can block a `git commit` before it completes.

The scoring model currently disagrees with its own guide's framing: it
scores pre-commit tooling only in CI Feedback (`CI-04`), and reserves Hooks
& Guardrails exclusively for two vendor-specific runtime hook formats
(Cursor's `hooks.json`, Claude Code's `settings.json` hooks key).

This proposal does not presuppose an answer. Two defensible positions:

**A. Keep them separate on purpose.** A pre-commit hook blocks a `git
commit`; a runtime hook blocks an in-session agent action (a shell command,
a file read, an MCP call) *before it happens, inside the loop*. That's a
real, meaningful difference — a pre-commit hook can't stop an agent from
running `rm -rf` mid-session, only catch the aftermath at commit time. If
this distinction matters for what "harness maturity" is supposed to
predict, the current separation is correct, and `continue`/`goose`/`cline`
genuinely lack a signal the dimension is right to withhold credit for.

**B. Broaden the dimension.** If "Hooks & Guardrails" is meant to mean
"any runtime-enforced guardrail regardless of mechanism," a well-configured
pre-commit setup should earn *some* credit there too — even if less than a
true in-session gate, since it intercepts later in the loop.

## Why this needs Q1 data, not a corpus-only call

This is exactly the kind of question this study's own corpus (N=20,
curated for depth) isn't positioned to settle on its own — see
[METHODOLOGY.md's limitations](../METHODOLOGY.md#limitations). Resolving it
well means checking whether a human rater, looking at `continue`'s actual
guardrail posture, agrees it "feels like" it has none — or feels
under-scored. Recorded here as a framing question for Phase 2/3, not a
proposal with a proposed fix.

## Points

Not applicable — no specific change proposed.

## Fixture impact

Not applicable until a direction is chosen.

## Sync checklist

- [ ] Not applicable — this proposal is a scoping question for maintainer
      discussion, not an implementation-ready change.
