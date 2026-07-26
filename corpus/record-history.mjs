#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHistorySnapshot, historyFileName, reportMatchesToolVersion } from './lib/history.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
const resultsByName = new Map();

for (const entry of manifest.entries) {
  const reportPath = path.join(__dirname, 'reports', `${entry.name}.json`);
  if (!existsSync(reportPath)) continue;
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  if (reportMatchesToolVersion(report, manifest.toolVersion)) {
    resultsByName.set(entry.name, { status: 'scored', report });
  }
}

const snapshot = createHistorySnapshot(manifest, resultsByName);
const historyDir = path.join(__dirname, 'history');
const outputPath = path.join(historyDir, historyFileName(snapshot.date, snapshot.toolVersion));
mkdirSync(historyDir, { recursive: true });
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
if (existsSync(outputPath) && readFileSync(outputPath, 'utf8') !== serialized) {
  throw new Error(`history snapshot already exists with different content: ${outputPath}`);
}
if (!existsSync(outputPath)) {
  writeFileSync(outputPath, serialized, 'utf8');
}
process.stdout.write(`History verified: ${path.relative(process.cwd(), outputPath)}.\n`);
