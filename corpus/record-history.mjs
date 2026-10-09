#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHistorySnapshot, reportMatchesToolVersion, writeHistorySnapshot } from './lib/history.mjs';

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
const outputPath = writeHistorySnapshot(historyDir, snapshot);
process.stdout.write(`History verified: ${path.relative(process.cwd(), outputPath)}.\n`);
