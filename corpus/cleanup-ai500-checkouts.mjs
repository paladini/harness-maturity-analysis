#!/usr/bin/env node
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportMatchesToolVersion } from './lib/history.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const cacheRoot = path.join(root, '.cache', 'repos');
const selection = JSON.parse(readFileSync(path.join(here, 'selection-2026-10-09-ai-500.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(here, 'manifest.json'), 'utf8'));
const receipt = JSON.parse(
  readFileSync(path.join(here, 'scan-receipt-2026-10-09-ai-popularity-500.json'), 'utf8'),
);
const audit = JSON.parse(
  readFileSync(path.join(here, 'checkout-audit-2026-10-09-ai-popularity-500.json'), 'utf8'),
);
if (receipt.completedCount !== 500 || receipt.reportCount !== 500 || audit.entries.length !== 500)
  throw new Error('Run evidence is not complete; refusing cache cleanup.');
const activeNames = new Set(selection.candidates.map((item) => item.name));
const auditedNames = new Set(audit.entries.map((item) => item.name));
const allowedNames = new Set([
  ...activeNames,
  ...selection.qualityReview.exclusions.map((item) => item.name),
]);
for (const candidate of selection.candidates) {
  const reportPath = path.join(here, 'reports', `${candidate.name}.json`);
  if (!existsSync(reportPath)) throw new Error(`Active report missing: ${candidate.name}`);
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  if (!reportMatchesToolVersion(report, manifest.toolVersion) || report.truncated)
    throw new Error(`Active report invalid: ${candidate.name}`);
  if (!auditedNames.has(candidate.name)) throw new Error(`Active checkout audit missing: ${candidate.name}`);
}
let removedCount = 0;
for (const name of readdirSync(cacheRoot)) {
  const target = path.resolve(cacheRoot, name);
  if (
    !allowedNames.has(name) ||
    !target.startsWith(`${path.resolve(cacheRoot)}${path.sep}`) ||
    !lstatSync(target).isDirectory() ||
    lstatSync(target).isSymbolicLink()
  ) {
    throw new Error(`Refusing unverified cache cleanup: ${target}`);
  }
  rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
  removedCount += 1;
}
console.log(`Verified all 500 final reports and audits; removed ${removedCount} named task checkout paths.`);
