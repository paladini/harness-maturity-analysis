---
name: score-any-repo
description: Use when asked to check, measure, rate, or compare the AI-harness maturity of any repository, project, or codebase not already in the corpus — clones or reads it, scans it with the exact pinned harness-score version this study uses, and reports the level, dimension breakdown, and biggest wins without touching the curated corpus.
---

# Score any repository

For a quick, one-off harness-maturity reading of *any* repository — not one
of the 20 already frozen into this study's corpus. Same scanner, same
pinned version, same invariants (zero LLM calls, zero code execution from
the scanned repo) as everything else in this repository — just without the
manifest entry, the commit-pinning, or the versioned report that make a
corpus result citable.

## When to use this vs. `add-corpus-entry`

- **This skill**: "How does `github.com/foo/bar` score?" / "Check my
  project's harness maturity." One-off curiosity, comparison, or a sanity
  check before deciding whether something is corpus-worthy. Nothing gets
  committed.
- **[`add-corpus-entry`](../../../.cursor/skills/add-corpus-entry/SKILL.md)**:
  the result matters enough to become a permanent, citable data point in
  the published study — pinned commit, versioned report, entry in
  `results/leaderboard.md`. If this skill turns up something interesting
  ("huh, that's surprisingly low/high"), that's the cue to switch to
  `add-corpus-entry` and do it properly instead of just noting the number
  and moving on.

## How to invoke

```bash
node corpus/score-adhoc.mjs <repo-url-or-local-path> [options]
```

Works on:
- **A repo URL** (`https://github.com/owner/repo` or `.git`) — shallow-clones
  the default branch tip into a gitignored scratch dir and deletes it
  afterward.
- **A local path** (`.`, `../some-project`, an absolute path) — scans
  directly, no clone, nothing to clean up. This is the answer to "check my
  own project" — never clone something the user already has checked out.

Options that matter most:
- `--ref <branch-or-sha>` — pin to something other than the default branch tip.
- `--subpath <path>` — scan one part of a monorepo.
- `--json` — raw harness-score JSON on stdout (nothing else), for
  programmatic use.
- `--md <file>` — also write a full markdown report (harness-score's own
  renderer, the same one `--md` produces natively).
- `--keep` — keep the clone under `.cache/adhoc/<slug>/` instead of
  deleting it (useful if you want to poke around the checkout afterward).

Full flag list: `node corpus/score-adhoc.mjs --help`.

## What you get back

A level, a score, a per-dimension breakdown, the highest-value unmet
checks ("Biggest wins available"), and — unless `--no-compare` is
passed — where this would land among the current corpus, by neighbor
("Among the 20 corpus repositories, this would land below X, above Y").

## Reporting the result

Don't just paste the raw output. Say what it means:
- Name the level and score, and the single biggest blocker to the next
  level (`level.nextLevelGaps` in the JSON, or the "To reach L*" line in
  the default summary).
- If a "biggest win" is a single cheap fix (e.g. adding a `LICENSE` file),
  say so plainly — that's exactly the kind of actionable read this whole
  tool exists to produce.
- **Never editorialize about the *company* or *team* behind the
  repository from this number alone.** A low score means this repository
  lacks agent-harness infrastructure — not that the team is careless. See
  [METHODOLOGY.md's central caveat](../../../METHODOLOGY.md#the-central-caveat):
  a repository can be excellent, widely used, and well engineered while
  legitimately scoring low, because harness maturity and general
  engineering quality are different things.

## Boundaries

- **Git repositories only.** This scans a filesystem tree — it can't score
  a live website, a rendered page, or anything without a `.git`-cloneable
  source. If asked to score "a site," confirm you mean its source repo.
- **Never runs code from the scanned repository.** `corpus/score-adhoc.mjs`
  (like `corpus/run.mjs`) only clones and reads files; it must never `npm
  install`/`build`/`test` inside a scanned repo. That's what makes it safe
  to point at an arbitrary, untrusted third-party URL.
- **Private repositories will fail to clone** (no credentials are ever
  passed) — that's expected, not a bug to work around.
