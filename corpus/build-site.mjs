#!/usr/bin/env node
// Deterministic, same as build-results.mjs: docs/index.html is entirely
// derived from corpus/reports/*.json + corpus/manifest.json. Never
// hand-edit docs/index.html — rerun this.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rankReports } from './lib/results.mjs';
import { renderSite } from './lib/site.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(__dirname, 'reports');
const DOCS_DIR = path.join(ROOT, 'docs');

const manifest = JSON.parse(readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

const reportsByName = new Map();
for (const entry of manifest.entries) {
  const reportPath = path.join(REPORTS_DIR, `${entry.name}.json`);
  if (existsSync(reportPath)) {
    reportsByName.set(entry.name, JSON.parse(readFileSync(reportPath, 'utf8')));
  }
}

const { rows, skipped } = rankReports(manifest.entries, reportsByName);

mkdirSync(DOCS_DIR, { recursive: true });
writeFileSync(path.join(DOCS_DIR, 'index.html'), renderSite(rows, manifest), 'utf8');
writeFileSync(path.join(DOCS_DIR, '.nojekyll'), '', 'utf8');

process.stdout.write(`Wrote docs/index.html from ${rows.length} report(s).\n`);
if (skipped.length) process.stdout.write(`Not yet scanned: ${skipped.join(', ')}\n`);
