import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { worktreeMatchesHead } from './lib/scan.mjs';

// Read pinned Git metadata only; no target-repository code is executed.
const selectionPath = process.argv[2] ?? 'corpus/selection-2026-10-07.json';
const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
if (!/^\d{4}-\d{2}-\d{2}$/.test(selection.selectionDate)) {
  throw new Error('Selection date must use YYYY-MM-DD');
}
const run = (cwd, args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
const audit = {
  date: selection.selectionDate,
  note: 'Derived by reading each pinned Git tree and checking the worktree index. Submodules are not initialized, LFS smudging is disabled, and Git long-path support preserves deep paths. No repository code was executed.',
  entries: [],
};
for (const candidate of selection.candidates) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(candidate.name)) throw new Error(`Invalid name: ${candidate.name}`);
  const cwd = path.resolve('.cache/repos', candidate.name);
  const head = run(cwd, ['rev-parse', 'HEAD']).trim();
  if (head !== candidate.commit) throw new Error(`SHA mismatch for ${candidate.name}`);
  if (!worktreeMatchesHead(cwd)) throw new Error(`Incomplete checkout: ${candidate.name}`);
  const tree = run(cwd, ['ls-tree', '-r', '-z', 'HEAD'])
    .split('\0')
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf('\t');
      const header = line.slice(0, separator);
      const file = line.slice(separator + 1);
      return { mode: header.split(' ')[0], path: file };
    });
  let lfsAttributeFiles = [];
  try {
    lfsAttributeFiles = run(cwd, [
      'grep',
      '-l',
      '-z',
      '-E',
      'filter[[:space:]]*=[[:space:]]*lfs',
      'HEAD',
      '--',
      ':(glob)**/.gitattributes',
    ])
      .split('\0')
      .filter(Boolean)
      .map((file) => file.replace(/^HEAD:/, ''));
  } catch (error) {
    if (error.status !== 1) throw error;
  }
  const ntfsInvalidPaths = tree
    .filter((item) =>
      item.path
        .split('/')
        .some(
          (segment) =>
            /[<>:"|?*]/.test(segment) ||
            /[. ]$/.test(segment) ||
            /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(segment),
        ),
    )
    .map((item) => item.path);
  audit.entries.push({
    name: candidate.name,
    commit: head,
    checkoutStatus: 'complete',
    trackedTreeEntries: tree.length,
    longPathCount: tree.filter((item) => path.join(cwd, item.path).length >= 260).length,
    ntfsInvalidPaths,
    lfsAttributeFiles,
    submodulePaths: tree.filter((item) => item.mode === '160000').map((item) => item.path),
    symlinkCount: tree.filter((item) => item.mode === '120000').length,
  });
  process.stdout.write(
    `${audit.entries.length}/${selection.candidates.length} ${candidate.name}: complete\n`,
  );
}
writeFileSync(`corpus/checkout-audit-${selection.selectionDate}.json`, `${JSON.stringify(audit, null, 2)}\n`);
process.stdout.write(`Audited ${audit.entries.length} complete pinned checkouts\n`);
