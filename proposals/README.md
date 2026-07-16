# proposals/

Each `NNN-<slug>.md` turns a finding from
[`analysis/findings.md`](../analysis/findings.md) into a proposal shaped
like a [harness-score check-change issue](https://github.com/paladini/harness-score/blob/main/CONTRIBUTING.md#adding-or-changing-a-check) —
naming the check, dimension, points, and what fixture/doc changes it
implies. Not yet filed as issues against
[harness-score](https://github.com/paladini/harness-score), and not
implemented in this repository.

| # | Proposal | Type |
|---|---|---|
| [001](001-hks-05-unbraced-var.md) | `HKS-05` misses the unbraced `$VAR` hook-path form | Bug fix — ready to implement |
| [002](002-nested-config-inflation.md) | Hook-config inflation via nested tutorial/example directories | Needs a design decision |
| [003](003-plugin-marketplace-category.md) | A positive signal for skill/plugin marketplace repos | Needs a design decision |
| [004](004-hooks-dimension-scope.md) | Does "Hooks & Guardrails" mean vendor config, or any runtime gate? | Framing question, needs Phase 2 data |
