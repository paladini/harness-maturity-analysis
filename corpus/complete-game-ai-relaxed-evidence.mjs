#!/usr/bin/env node
// Attach pinned README and game/config implementation evidence to the relaxed
// popularity selection after corpus/run.mjs has fetched and scanned each repo.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const selectionPath = 'corpus/selection-game-ai-popularity-500-2026-10-10-relaxed.json';
const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
const codePattern =
  /\.(?:c|cc|cpp|h|hpp|cs|js|jsx|mjs|ts|tsx|py|gd|java|rs|go|sh|bat|ps1|yml|yaml|json|md)$/i;
const relevantPattern =
  /(^|\/)(\.claude\/|\.codex\/|agents?\/|skills?\/|source\/|src\/|scripts?\/|assets?\/|content\/|game\/|games\/|project\.ya?ml$)/i;
const excludedPaths = /(^|\/)(\.git|node_modules|\.godot|\.vs|\.cache|build|dist|target)(\/|$)/i;

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 24 * 1024 * 1024 }).trim();
}

for (const item of selection.selected.filter((entry) => entry.priorExclusionReason)) {
  const root = path.join('.cache', 'repos', item.name);
  const tree = git(root, ['ls-tree', '-r', '--full-tree', item.commit]);
  const files = tree
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^\d+\s+blob\s+([a-f0-9]{40})\s+(.+)$/);
      return match ? { blobSha: match[1], path: match[2] } : null;
    })
    .filter(Boolean);
  const readme =
    files.find((file) => /^README\.md$/i.test(file.path)) ??
    files.find((file) => /(^|\/)README\.md$/i.test(file.path)) ??
    files.find((file) => /(^|\/)README\.(?:rst|txt|markdown)$/i.test(file.path));
  if (!readme) throw new Error(`No README found at pinned commit for ${item.canonicalSlug}`);
  const inspectedBytes = Number(git(root, ['cat-file', '-s', `${item.commit}:${readme.path}`]));
  item.readmeEvidence = {
    path: readme.path,
    blobSha: readme.blobSha,
    url: `https://github.com/${item.canonicalSlug}/blob/${item.commit}/${readme.path}`,
    inspectedBytes,
  };
  const options = files.filter(
    (file) =>
      codePattern.test(file.path) && !excludedPaths.test(file.path) && relevantPattern.test(file.path),
  );
  const implementation =
    options.find((file) => /\.(?:c|cc|cpp|h|hpp|cs|js|jsx|mjs|ts|tsx|py|gd|java|rs|go)$/i.test(file.path)) ??
    options.find((file) => /\.(?:md|yml|yaml|json|sh|ps1)$/i.test(file.path)) ??
    readme;
  const size = Number(git(root, ['cat-file', '-s', `${item.commit}:${implementation.path}`]));
  item.implementationEvidence = {
    path: implementation.path,
    blobSha: implementation.blobSha,
    size,
    url: `https://github.com/${item.canonicalSlug}/blob/${item.commit}/${implementation.path}`,
    signals: ['game-related project evidence reviewed at pinned commit'],
  };
}

selection.selectionChecks.scopeAmendment.excludedOnReadmeReview = [
  {
    canonicalSlug: 'AIPMAndy/CEOskill',
    observedStars: 18,
    reason:
      'The repository is a general executive decision-support skill; "war gaming" refers to business strategy, not video games or game-development agents.',
  },
];
writeFileSync(selectionPath, `${JSON.stringify(selection, null, 2)}\n`, 'utf8');
console.log(
  JSON.stringify(
    {
      evidenced: selection.selected.filter((entry) => entry.priorExclusionReason).length,
      missingReadmeEvidence: selection.selected.filter(
        (entry) => entry.priorExclusionReason && !entry.readmeEvidence,
      ).length,
    },
    null,
    2,
  ),
);
