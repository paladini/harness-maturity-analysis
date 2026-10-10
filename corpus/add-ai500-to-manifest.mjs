import fs from 'node:fs/promises';

const manifestPath = 'corpus/manifest.json';
const selectionPath = 'corpus/selection-2026-10-09-ai-500.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const selection = JSON.parse(await fs.readFile(selectionPath, 'utf8'));
if (manifest.entries.length !== selection.baselineCount)
  throw new Error(`Baseline drift: expected ${selection.baselineCount}, found ${manifest.entries.length}`);
if (selection.candidates.length !== 500 || selection.validation?.exactTarget !== true)
  throw new Error('The frozen selection must contain exactly 500 validated repositories.');
const existingNames = new Set(manifest.entries.map((entry) => entry.name.toLowerCase()));
const existingUrls = new Set(
  manifest.entries.map((entry) => entry.repoUrl.toLowerCase().replace(/\.git$/, '')),
);
const ids = new Set();
const additions = [];
for (const project of selection.candidates) {
  if (ids.has(project.githubRepositoryId))
    throw new Error(`Duplicate canonical GitHub ID: ${project.githubRepositoryId}`);
  if (existingNames.has(project.name.toLowerCase()))
    throw new Error(`Manifest name collision: ${project.name}`);
  if (existingUrls.has(project.repoUrl.toLowerCase().replace(/\.git$/, '')))
    throw new Error(`Repository already in manifest: ${project.repoUrl}`);
  ids.add(project.githubRepositoryId);
  existingNames.add(project.name.toLowerCase());
  existingUrls.add(project.repoUrl.toLowerCase().replace(/\.git$/, ''));
  const purpose = (project.purpose || '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 420);
  const archiveNote = project.archived ? ' Archived at selection; stars indicate lifetime popularity.' : '';
  additions.push({
    name: project.name,
    category: project.category,
    repoUrl: project.repoUrl,
    commit: project.commit,
    scanSubpath: null,
    isStressCase: false,
    notes: `Phase 1F AI popularity rank ${project.popularityRank}; observed GitHub stars ${project.githubStars}.${archiveNote} Purpose: ${purpose}`,
  });
}
manifest.runId = selection.runId;
manifest.entries.push(...additions);
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `manifestEntries=${manifest.entries.length}; added=${additions.length}; runId=${manifest.runId}; tool=${manifest.toolVersion}`,
);
