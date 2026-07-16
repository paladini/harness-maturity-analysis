# analysis/

See [METHODOLOGY.md](../METHODOLOGY.md) for the full protocol.

- [`findings.md`](findings.md) — **done.** Corpus-wide synthesis of Q2: what
  the corpus reveals about gaps in the maturity model itself, grounded in
  check IDs and file evidence, no human judgment required.
- `ratings/<name>.md` — **Phase 2, not started.** Blind human L0–L4 rating,
  written *before* the scanner's report is read — needs a rater without
  implementation knowledge of harness-score, so this can't be filled in by
  the same agent that analyzed the check logic in `findings.md`.
- `critiques/<name>.md` — **Phase 2, not started.** Per-repository
  check-by-check critique: where the automated score and the human rating
  disagree, and why. Depends on `ratings/` existing first.
- `external-validity.md` — **Phase 2/3, not started.** Corpus-wide synthesis
  of Q1 (does the tool agree with expert judgment). Depends on `ratings/`
  and `critiques/`.
