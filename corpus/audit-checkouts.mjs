import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { worktreeMatchesHead } from './lib/scan.mjs';

// Read pinned Git metadata only; no target-repository code is executed.
const selectionPath = process.argv[2] ?? 'corpus/selection-2026-10-07.json';
const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
if (!/^\d{4}-\d{2}-\d{2}$/.test(selection.selectionDate)) {
  throw new Error('Selection date must use YYYY-MM-DD');
}
if (selection.runId !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(selection.runId)) {
  throw new Error('Selection runId must be a lowercase slug');
}
const run = (cwd, args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
const audit = {
  date: selection.selectionDate,
  ...(selection.runId ? { runId: selection.runId } : {}),
  note: 'Derived by reading each pinned Git tree and checking the worktree index. Submodules are not initialized, LFS smudging is disabled, and Git long-path support preserves deep paths. For successful scan caches moved across volumes after scanning, the runner verification, pinned HEAD marker, and complete report were rechecked, but the copied file tree was not independently re-audited after the move. AI4VJ was independently checked with WSL Git on a case-sensitive ext4 clone because two tracked source files differ only by case. No repository code was executed.',
  entries: [],
};
const checkpointPath = `corpus/.checkout-audit-progress-${selection.runId ?? selection.selectionDate}.json`;
if (existsSync(checkpointPath)) {
  const checkpoint = JSON.parse(readFileSync(checkpointPath, 'utf8'));
  if (checkpoint.date !== audit.date || checkpoint.runId !== audit.runId)
    throw new Error('Audit checkpoint does not match this selection.');
  audit.entries = checkpoint.entries;
}
const auditedNames = new Set(audit.entries.map((entry) => entry.name));
const saveCheckpoint = () => writeFileSync(checkpointPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
for (const candidate of selection.candidates) {
  if (auditedNames.has(candidate.name)) continue;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(candidate.name)) throw new Error(`Invalid name: ${candidate.name}`);
  const cwd = path.resolve(candidate.checkoutPath ?? path.join('.cache', 'repos', candidate.name));
  if (candidate.scanVerifiedAtRun) {
    const head = readFileSync(path.join(cwd, '.git', 'HEAD'), 'utf8').trim();
    if (head !== candidate.commit) throw new Error(`Moved cache HEAD marker mismatch for ${candidate.name}`);
    const report = JSON.parse(readFileSync(path.join('corpus', 'reports', `${candidate.name}.json`), 'utf8'));
    if (
      report.tool?.name !== 'harness-score' ||
      report.tool?.version !== '1.8.1' ||
      report.truncated ||
      report.verdicts?.maturity?.status !== 'complete' ||
      report.verdicts?.effective?.status !== 'complete'
    ) {
      throw new Error(`The successful scan report does not verify ${candidate.name}`);
    }
    audit.entries.push({
      name: candidate.name,
      commit: head,
      checkoutStatus: 'complete',
      verificationMethod:
        candidate.verificationMethod ??
        'successful pinned scanner run before cache move; current SHA marker and complete report rechecked afterward; file tree not re-audited after the move',
      trackedTreeEntries: candidate.auditTrackedTreeEntries ?? null,
      ntfsInvalidPaths: [],
      lfsAttributeFiles: [],
      submodulePaths: [],
      symlinkCount: null,
      ...(candidate.readmeEvidence
        ? {
            readmeEvidence: {
              path: candidate.readmeEvidence.path,
              blobSha: candidate.readmeEvidence.blobSha,
              status: 'pinned-and-verified-during-selection-and-scan',
            },
          }
        : {}),
      ...(candidate.codeEvidence
        ? {
            codeEvidence: {
              path: candidate.codeEvidence.path,
              blobSha: candidate.codeEvidence.blobSha,
              size: candidate.codeEvidence.size,
              status: 'pinned-and-verified-during-selection-and-scan',
            },
          }
        : {}),
    });
    auditedNames.add(candidate.name);
    saveCheckpoint();
    process.stdout.write(
      `${audit.entries.length}/${selection.candidates.length} ${candidate.name}: complete (scan-time checkout evidence)\n`,
    );
    continue;
  }
  if (cwd.startsWith('\\\\wsl.localhost\\')) {
    const count = Number(process.env.GIT_CONFIG_COUNT ?? '0');
    process.env.GIT_CONFIG_COUNT = String(count + 1);
    process.env[`GIT_CONFIG_KEY_${count}`] = 'safe.directory';
    process.env[`GIT_CONFIG_VALUE_${count}`] = cwd.replace(/\\/g, '/');
  }
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
  let codeEvidence;
  if (candidate.codeEvidence) {
    const { path: file, blobSha, size } = candidate.codeEvidence;
    const actualBlob = run(cwd, ['rev-parse', `HEAD:${file}`]).trim();
    const actualSize = Number(run(cwd, ['cat-file', '-s', actualBlob]).trim());
    if (actualBlob !== blobSha || actualSize !== size) {
      throw new Error(`Implementation evidence mismatch: ${candidate.name}/${file}`);
    }
    codeEvidence = { path: file, blobSha: actualBlob, size: actualSize, status: 'verified' };
  }
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
    ...(codeEvidence ? { codeEvidence } : {}),
  });
  auditedNames.add(candidate.name);
  saveCheckpoint();
  process.stdout.write(
    `${audit.entries.length}/${selection.candidates.length} ${candidate.name}: complete\n`,
  );
}
const output = `corpus/checkout-audit-${selection.selectionDate}${selection.runId ? `-${selection.runId}` : ''}.json`;
const serialized = `${JSON.stringify(audit, null, 2)}\n`;
try {
  writeFileSync(output, serialized, { encoding: 'utf8', flag: 'wx' });
} catch (error) {
  if (error.code !== 'EEXIST' || readFileSync(output, 'utf8') !== serialized) throw error;
}
process.stdout.write(`Audited ${audit.entries.length} complete pinned checkouts\n`);
