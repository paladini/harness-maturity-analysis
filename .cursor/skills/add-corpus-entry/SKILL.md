---
name: add-corpus-entry
description: Use when adding a new repository to the study corpus — pins it to an exact commit, scans it, and regenerates results/ the same reproducible way every existing entry was added.
---

# Add a corpus entry

This is the single most-repeated procedure in this repository's life: every
one of the ~20 (eventually more) corpus repositories was added this way.
Follow it exactly — the whole study's reproducibility depends on every
entry being pinned and scanned identically.

## Steps

1. **Resolve the commit to pin.** Don't clone by hand — resolve the current
   tip of the repo's default branch:
   ```bash
   git ls-remote --symref <repoUrl> HEAD
   ```
   This prints both the default branch name and its current SHA. Use that
   SHA verbatim — never a branch name — in the manifest entry.

2. **Add an entry to `corpus/manifest.json`.** Append to the `entries`
   array:
   ```json
   {
     "name": "<short-kebab-case-id>",
     "category": "<one of the categories in METHODOLOGY.md#corpus-selection>",
     "repoUrl": "https://github.com/<owner>/<repo>.git",
     "commit": "<the 40-char SHA from step 1>",
     "scanSubpath": null,
     "isStressCase": false,
     "notes": "<why this repo is in the corpus, one or two sentences>"
   }
   ```
   Set `scanSubpath` when only part of a monorepo should be scanned; set
   `isStressCase: true` when this entry was chosen specifically because the
   scanner is expected to score it surprisingly (see METHODOLOGY.md).

3. **Scan just that entry** — don't rerun the whole corpus:
   ```bash
   node corpus/run.mjs --only <name>
   ```
   This clones the pinned commit into the gitignored `.cache/`, runs the
   pinned `harness-score` version against it, and writes
   `corpus/reports/<name>.json`.

4. **Regenerate the derived results:**
   ```bash
   node corpus/build-results.mjs
   ```

5. **Sanity-check the report** before committing: does the level and score
   make sense for what you know about the repository? If a well-known-good
   repo scores surprisingly low (or vice versa), that's not necessarily a
   mistake — it might be exactly the kind of finding this study exists to
   surface. Note it; don't "fix" the manifest to make the number look
   better.

6. **Commit the manifest change, the new report, and the regenerated
   results together** — they're one atomic unit of study data.

## Writing the blind rating

If this entry is part of the formal Phase 2 corpus (not a pilot/smoke-test
addition), write `analysis/ratings/<name>.md` **before** step 3 — see
[METHODOLOGY.md](../../../METHODOLOGY.md#blind-human-rating-q1-protocol).
Scanning first and rating after breaks the whole point of a blind
comparison.
