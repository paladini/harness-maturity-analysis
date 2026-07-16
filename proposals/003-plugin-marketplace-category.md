# 003 — A positive signal for skill/plugin marketplace repositories

**Change type:** Add a new check (tentative — see "why this isn't a quick add" below)
**Check ID:** none yet (proposed dimension: `skills`)
**Dimension:** `skills`
**Source finding:** [analysis/findings.md §3](../analysis/findings.md#3-category-gap-skillplugin-marketplace-repos-score-identically-to-neglected-ones)
**Corroborating evidence:** [`corpus/reports/anthropic-skills.json`](../corpus/reports/anthropic-skills.json)

## What it would detect

Existence of a marketplace/distribution manifest — `.claude-plugin/plugin.json`,
`.cursor-plugin/plugin.json`, or an equivalent convention — at the
repository root. harness-score's own repository already uses this exact
pattern (`.claude-plugin/marketplace.json`, `plugins/*/`.claude-plugin/plugin.json`),
so the convention is not hypothetical.

## Why this deserves points

`anthropic/skills` — Anthropic's own official showcase of Claude Skills —
scores **L0 · 16%**, identical in kind to `octocat/Hello-World`, because
its skills live at `skills/<name>/SKILL.md` (repository root) rather than
`.claude/skills/`: correct, since this repo doesn't use its own skills to
develop itself, it *distributes* them. `SKL-01` is answering the right
question ("does this repo have a configured, self-referential skill
harness") correctly. But the model currently has no way to credit "this
repository is the canonical reference implementation of an artifact type"
as anything other than indistinguishable-from-neglected. A `.claude-plugin/`
manifest at root is a strong, structurally unambiguous signal that a repo
is a marketplace, not an oversight — and today it earns nothing anywhere
in the model.

## Why this isn't a quick add

Per this project's own documented practice
([ROADMAP.md — "why these aren't quick adds"](https://github.com/paladini/harness-score/blob/main/ROADMAP.md#why-these-arent-quick-adds)):
any new positively-weighted check shifts the dimension's earned/max ratio
for **every** existing repository and fixture, and needs a genuine design
decision, not a drive-by addition. Specific open questions this proposal
does *not* resolve:

- Should this live in the `skills` dimension (closest thematically) or
  imply a new, small cross-cutting signal that doesn't compete with the
  existing skill-authorship checks (`SKL-01`–`04`)?
- Should a marketplace repo be *capped* from reaching high maturity levels
  regardless of this new check, since it genuinely lacks the context files,
  hooks, and tests that "safe to run an agent here" depends on? Awarding
  points without addressing level-gating risks making marketplace repos
  look more mature than they structurally are.
- Is a `.claude-plugin/` manifest specific enough, or does it need
  additional validation (e.g. that it actually lists skills, not just an
  empty manifest) to avoid becoming a 3-point freebie?

Recorded as a proposal to discuss, not a ready specification.

## Points

Not proposed here — depends on the design decisions above.

## Fixture impact

Would need a new fixture (or an addition to an existing one) representing
a marketplace-shaped repository, distinct from the existing
`fixtures/level-0..4` ladder which represents ordinary product repositories.

## Sync checklist

- [ ] `packages/cli/src/checks/skills.ts` (or a new file, pending the dimension question)
- [ ] `docs/guide/measure-and-improve.md`
- [ ] `docs/guide/maturity-model.md`
- [ ] `fixtures/level-0..4` (or a new fixture category)
