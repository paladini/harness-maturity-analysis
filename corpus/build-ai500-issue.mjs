import fs from 'node:fs/promises';

const selection = JSON.parse(await fs.readFile('corpus/selection-2026-10-09-ai-500.json', 'utf8'));
const lines = [
  '## Goal',
  '',
  'Add 500 new, reproducible AI software repositories to the analysis corpus. This is an explicit expansion of the AI/LLM/agent category, which already appears in prior cohorts. It remains scanner-only and creates no blind human ratings or external-validity claims.',
  '',
  '## Frozen selection and baseline',
  '',
  `- Baseline: ${selection.baselineCount} repositories on main; expected total after integration: ${selection.baselineCount + selection.targetCount}.`,
  `- Scanner: ${selection.baselineToolVersion}, compatible with the existing reports.`,
  `- Selection metric: GitHub stars observed on 2026-10-09, sorted descending within the bounded search union; selected range ${selection.candidates[0].githubStars.toLocaleString('en-US')} to ${selection.candidates.at(-1).githubStars.toLocaleString('en-US')} stars. Stars do not affect harness scores.`,
  '- All entries are public, non-fork software with a pinned 40-character commit, root README evidence, and a source file/blob at that commit. Guides, courses, documentation-only collections, skill packs, forks, aliases already in the corpus or Showcase, and AI-incidental general-purpose projects are excluded.',
  '- No scanned project code will be executed, installed, built or tested. Existing reports and histories remain append-only.',
  '',
  '## Search scope and limits',
  '',
  'The linked discovery snapshot records eight GitHub REST Search API queries, returned pages, result counts, incomplete-result flags and the full candidate records. Queries were sorted by stars descending, with up to 300 results per query (the AI-coding and AI-IDE queries returned fewer). The union is a bounded search universe, not a claim of global GitHub top-500 coverage. Observed stars are cumulative counts at collection time, not historical peaks.',
  '',
  'Queries: `topic:ai stars:>100`; `topic:artificial-intelligence stars:>100`; `topic:llm stars:>100`; `topic:ai-agent stars:>100`; `topic:generative-ai stars:>100`; `topic:ai-coding-assistant stars:>50`; `topic:machine-learning stars:>500`; `AI IDE in:name,description stars:>100`.',
  '',
  '## Selected repositories',
  '',
  'Ordered by observed stars within the frozen search union. Each line contains canonical repository, GitHub numeric ID, observed stars, exact default-branch commit and a short purpose.',
  '',
  '<details><summary>Show all 500 pinned projects</summary>',
  '',
  '| Repository | GitHub ID | Stars | Commit | Purpose |',
  '|---|---:|---:|---|---|',
  ...selection.candidates.map(
    (item) =>
      `| ${item.canonicalSlug} | ${item.githubRepositoryId} | ${item.githubStars} | ${item.commit} | ${(item.purpose || '').replaceAll('|', '/').replace(/\s+/g, ' ').slice(0, 20)} |`,
  ),
  '',
  '</details>',
  '',
  '## Acceptance',
  '',
  '- [ ] Selection and discovery ledgers are committed with immutable source evidence and exclusion reasons.',
  '- [x] Exactly 500 new canonical GitHub IDs are scanned; pins, reports, scanner versions and completeness match.',
  '- [x] A new complete append-only history snapshot preserves all earlier snapshots.',
  '- [x] Generated results and analysis site are rebuilt; tests and lint pass, and the corpus evidence validator passes.',
  '- [ ] Review and merge the analysis PR, then import the merged evidence into the Showcase through its own issue and PR.',
  '- [ ] Public analysis and Showcase data match the merged source commits and show the complete cohort.',
  '',
  'Tracked selection ledger: `corpus/selection-2026-10-09-ai-500.json`. Discovery snapshot: `corpus/popularity-search-2026-10-09-ai-500.json`.',
  '',
  'Requested by Fernando Paladini.',
];
const body = `${lines.join('\n')}\n`;
await fs.writeFile('corpus/issue-ai500-body.md', body);
console.log(`issueBodyBytes=${Buffer.byteLength(body)} selected=${selection.candidates.length}`);
