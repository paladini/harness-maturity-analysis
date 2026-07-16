# 001 — Fix: `HKS-05` misses the unbraced `$VAR` hook-path form

**Change type:** Edit an existing check (logic only — no points/dimension change)
**Check ID:** `HKS-05`
**Dimension:** `hooks`
**Source finding:** [analysis/findings.md §1](../analysis/findings.md#1-bug-hks-05-misses-the-unbraced-var-hook-path-form)
**Corroborating evidence:** [`corpus/reports/cline.json`](../corpus/reports/cline.json), [`corpus/reports/promptfoo.json`](../corpus/reports/promptfoo.json)

## What it detects today

`hookCommandPathsResolve` in `packages/cli/src/harness/hooks.ts` resolves a
hook command's in-repo path reference by stripping a `${VAR}/` prefix:

```js
const stripped = normalized.replace(/^\$\{[^}]+\}\//, '');
```

This only matches the braced interpolation form. Claude Code hook commands
also legitimately use the unbraced form, `$VAR/...` — `cline` registers
exactly this in its committed `.claude/settings.json`:

```json
"command": "$CLAUDE_PROJECT_DIR/.claude/hooks/claude-code-for-web-setup.sh"
```

The referenced file is genuinely present and committed at
`.claude/hooks/claude-code-for-web-setup.sh`. `HKS-05` reports it as
missing anyway — a false negative, costing 2 points cline has legitimately
earned.

## Why this deserves a fix

`HKS-05`'s entire point is "the script your hooks config points at is
actually committed, not just present on your machine" — a real, valuable
signal. An incomplete variable-interpolation regex undermines that signal
for any repository using the (equally valid) unbraced form, silently. This
is not a design question — both forms are real Claude Code syntax, and a
check whose job is "resolve the path" should resolve both.

## Proposed fix

Extend the strip regex to match either form:

```js
const stripped = normalized.replace(/^\$\{?[A-Za-z_][A-Za-z0-9_]*\}?\/?/, '').replace(/^\//, '');
```

(Illustrative — the actual PR should keep this readable and add a comment
explaining *why* both forms are stripped, matching this project's existing
comment on the braced-only version.)

**Secondary, lower-priority case in the same check:** `promptfoo` fails
`HKS-05` on `${CLAUDE_PROJECT_DIR}/node_modules/.bin/block-no-verify` — a
real npm package binary populated by `npm install`, not a script anyone
forgot to commit. Worth a follow-up (same PR or separate, maintainer's
call): treat `node_modules/.bin/`-referenced commands as resolved via the
package manager rather than "missing," since the remediation message
("commit the scripts referenced...") doesn't apply to a dependency's own
binary.

## Points

No change — 2 points, unchanged dimension total. This is a detection-logic
fix, not a new signal.

## Fixture impact

None expected — no existing fixture under `fixtures/level-0..4` uses the
unbraced `$VAR` form in its hook commands (checked: all use `${VAR}` or
plain relative paths). A regression test fixture (a hook command using
`$CLAUDE_PROJECT_DIR/...` unbraced, resolving to a real committed file)
should be added to `packages/cli/test/checks.test.ts`, not necessarily to
the maturity-level fixtures.

## Sync checklist

- [x] `packages/cli/src/harness/hooks.ts` (`hookCommandPathsResolve`)
- [ ] `docs/guide/measure-and-improve.md` — no change expected (remediation
      text for `HKS-05` doesn't need to change)
- [ ] `docs/guide/maturity-model.md` — no change (points/thresholds unaffected)
- [ ] `fixtures/level-0..4` — no change expected; add a unit-test case instead
