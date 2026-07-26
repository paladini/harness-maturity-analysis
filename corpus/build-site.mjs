#!/usr/bin/env node
// Deterministic, same as build-results.mjs: docs/index.html is entirely
// derived from corpus/reports/*.json + corpus/manifest.json. Never
// hand-edit docs/index.html — rerun this.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportMatchesToolVersion, sortHistoryRuns } from './lib/history.mjs';
import { rankReports } from './lib/results.mjs';
import { renderSite } from './lib/site.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(__dirname, 'reports');
const HISTORY_DIR = path.join(__dirname, 'history');
const DOCS_DIR = path.join(ROOT, 'docs');

const manifest = JSON.parse(readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

const reportsByName = new Map();
for (const entry of manifest.entries) {
  const reportPath = path.join(REPORTS_DIR, `${entry.name}.json`);
  if (existsSync(reportPath)) {
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    if (reportMatchesToolVersion(report, manifest.toolVersion)) {
      reportsByName.set(entry.name, report);
    }
  }
}

const { rows, skipped } = rankReports(manifest.entries, reportsByName);
const historyRuns = existsSync(HISTORY_DIR)
  ? sortHistoryRuns(
      readdirSync(HISTORY_DIR)
        .filter((name) => name.endsWith('.json'))
        .map((name) => JSON.parse(readFileSync(path.join(HISTORY_DIR, name), 'utf8'))),
    )
  : [];

mkdirSync(DOCS_DIR, { recursive: true });
writeFileSync(path.join(DOCS_DIR, 'index.html'), renderSite(rows, manifest, historyRuns), 'utf8');
writeFileSync(path.join(DOCS_DIR, '.nojekyll'), '', 'utf8');

process.stdout.write(`Wrote docs/index.html from ${rows.length} report(s).\n`);
if (skipped.length) process.stdout.write(`Not yet scanned: ${skipped.join(', ')}\n`);
