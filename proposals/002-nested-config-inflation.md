# 002 — Guard against hook-config inflation via nested tutorial/example directories

**Change type:** Edit an existing check (logic only, within `hooks` dimension)
**Check ID:** `HKS-01` through `HKS-05` (all read from `readNormalizedHooks`, the shared root cause)
**Dimension:** `hooks`
**Source finding:** [analysis/findings.md §2](../analysis/findings.md#2-model-gap-hook-config-inflation-via-nested-tutorialexample-directories)
**Corroborating evidence:** [`corpus/reports/anthropic-cookbook.json`](../corpus/reports/anthropic-cookbook.json)

## What it detects today

`collectHookConfigs` matches `.claude/settings.json` / `.cursor/hooks.json`
at **any depth** in the tree (`(^|\/)\.claude\/settings\.json$`). Among all
matches, `readNormalizedHooks` already picks "the config with the most
registered events" (a v0.5.0 fix for a different inflation vector — a
hook-less root config shadowing a real one). It does not distinguish a
root-level, operational config from one nested arbitrarily deep inside
clearly-non-operational content.

`anthropic-cookbook` scores 57% (8/14) on Hooks & Guardrails entirely from
`skills/.claude/settings.json` — a config embedded inside a *teaching
module about Claude Skills* (`skills/CLAUDE.md`,
`skills/notebooks/01_skills_introduction.ipynb`,
`skills/assets/skills-conceptual-diagram.png`). It reads as a worked
example shown to learners, not a hooks configuration governing agents
working on the cookbook repository's own tree.

## Why this deserves a fix

The dimension is supposed to measure "does *this repository* have a
working, committed guardrail layer." A config nested inside tutorial
content answers a different question ("does this repo *teach about* hook
configs") that happens to look identical to the scanner. Left as-is, any
repository containing example/tutorial content about hooks — cookbooks,
courses, template collections — can inflate its Hooks score without any
real guardrail governing its own tree. This is the same class of risk this
study's corpus was designed to probe with `awesome-cursorrules` (which
didn't trigger it for rules at its pinned commit — a useful negative data
point) and it surfaced independently in a repository picked for an
unrelated reason.

## Proposed direction (needs discussion — not a one-line fix)

Two non-exclusive options, in rough order of how surgical they are:

1. **Prefer root-level configs over nested ones**, only falling back to a
   nested config when no root config exists at all — cheapest change,
   mirrors the existing "most events wins" precedent, but a real monorepo
   sub-package's own legitimate hooks config (e.g. `packages/cli/.cursor/...`)
   must not be penalized by this.
2. **Exclude configs found under conventionally-instructional paths** —
   `examples/`, `tutorial/`, `notebooks/`, or any directory containing a
   Jupyter notebook / its own nested `README`/`CLAUDE.md` that itself reads
   as course content. Riskier: heuristics on "does this look like a
   tutorial" are exactly the kind of judgment call this project's checks
   are built to avoid (every check is meant to be a filesystem fact, not
   an inference).

This needs a maintainer decision on which tradeoff is acceptable before
implementation — flagged in `analysis/findings.md` as a model gap, not
handed here as a ready-to-merge fix.

## Points

No change — this is a detection-logic change, not a new signal or a
reweighting.

## Fixture impact

Likely needs a new fixture case: a repository with a nested example
`.claude/settings.json` under a tutorial-shaped path, asserting it does
*not* inflate the root repo's Hooks score. Whether this needs a new
`fixtures/` entry or is better covered by `packages/cli/test/checks.test.ts`
depends on which of the two directions above gets chosen.

## Sync checklist

- [ ] `packages/cli/src/harness/hooks.ts` / `collectors.ts` (path-selection logic)
- [ ] `docs/guide/measure-and-improve.md` — remediation text for `HKS-01`
      may need a note about root-vs-nested precedence
- [ ] `docs/guide/maturity-model.md` — no points/threshold change
- [ ] `fixtures/level-0..4` — likely needs a new regression case (see above)
