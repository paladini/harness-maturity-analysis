#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const corpusDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(corpusDir);
const selection = JSON.parse(
  readFileSync(path.join(corpusDir, 'selection-2026-10-11-scientific-software-random-500.json'), 'utf8'),
);
const manifest = JSON.parse(readFileSync(path.join(corpusDir, 'manifest.json'), 'utf8'));
if (
  selection.targetCount !== 500 ||
  selection.achievedCount !== 500 ||
  manifest.runId !== selection.cohort ||
  manifest.entries.length !== 3686
) {
  throw new Error('Frozen selection or manifest baseline does not match the 500-repository scan.');
}

const missing = selection.selected.filter(
  (candidate) => !existsSync(path.join(corpusDir, 'reports', `${candidate.name}.json`)),
);
const groupCount = 5;
const groupSize = Math.ceil(missing.length / groupCount);
const groups = Array.from({ length: groupCount }, (_, index) =>
  missing.slice(index * groupSize, (index + 1) * groupSize),
).filter((group) => group.length > 0);
const groupNames = groups.flat().map((candidate) => candidate.name);
if (groupNames.length !== missing.length || new Set(groupNames).size !== missing.length)
  throw new Error('Missing-report scan groups contain duplicates or omitted repositories.');

const logDir = path.join(root, '.cache', 'scientific-software-random-500');
mkdirSync(logDir, { recursive: true });
const startedAt = new Date().toISOString();
const results = await Promise.all(
  groups.map(
    (group, index) =>
      new Promise((resolve) => {
        const groupId = index + 1;
        const logPath = path.join(logDir, `group-${groupId}.log`);
        const log = createWriteStream(logPath, { flags: 'w' });
        const child = spawn(
          process.execPath,
          [path.join(corpusDir, 'run.mjs'), '--only', group.map((candidate) => candidate.name).join(',')],
          {
            cwd: root,
            env: process.env,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe'],
          },
        );
        child.stdout.pipe(log);
        child.stderr.pipe(log);
        console.log(`Started scan group ${groupId}/${groupCount} (${group.length} repositories).`);
        child.on('error', (error) =>
          resolve({
            group: groupId,
            names: group.map((candidate) => candidate.name),
            exitCode: null,
            error: String(error),
            log: path.relative(root, logPath),
          }),
        );
        child.on('close', (exitCode) => {
          log.end();
          console.log(`Finished scan group ${groupId}/${groupCount}: exit ${exitCode}.`);
          resolve({
            group: groupId,
            names: group.map((candidate) => candidate.name),
            exitCode,
            log: path.relative(root, logPath),
          });
        });
      }),
  ),
);

const reports = [];
for (const candidate of selection.selected) {
  const reportPath = path.join(corpusDir, 'reports', `${candidate.name}.json`);
  if (!existsSync(reportPath)) {
    reports.push({ name: candidate.name, present: false });
    continue;
  }
  const bytes = readFileSync(reportPath);
  const report = JSON.parse(bytes);
  reports.push({
    name: candidate.name,
    present: true,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    toolVersion: report.tool?.version,
    commit: candidate.commit,
    truncated: report.truncated === true,
    complete:
      report.verdicts?.maturity?.status === 'complete' || (!report.verdicts && Array.isArray(report.checks)),
  });
}
const receipt = {
  schemaVersion: 1,
  cohort: selection.cohort,
  runDate: manifest.runDate,
  toolVersion: manifest.toolVersion,
  startedAt,
  finishedAt: new Date().toISOString(),
  strategy: `${results.length} disjoint runner processes for reports missing at start; ${groupSize}-repository maximum per process. Pinned clones are read only; repository code is never executed.`,
  groups: results,
  reports,
  summary: {
    selected: selection.selected.length,
    present: reports.filter((report) => report.present).length,
    complete: reports.filter(
      (report) =>
        report.complete &&
        !report.truncated &&
        report.toolVersion === manifest.toolVersion.replace('harness-score@', ''),
    ).length,
    failedGroups: results.filter((result) => result.exitCode !== 0).map((result) => result.group),
  },
};
writeFileSync(
  path.join(corpusDir, 'scan-receipt-2026-10-11-scientific-software-random-500.json'),
  `${JSON.stringify(receipt, null, 2)}\n`,
  'utf8',
);
console.log(JSON.stringify(receipt.summary, null, 2));
if (
  receipt.summary.complete !== 500 ||
  receipt.summary.present !== 500 ||
  receipt.summary.failedGroups.length
)
  process.exitCode = 1;
