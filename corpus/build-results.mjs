#!/usr/bin/env node
// Deterministic: results/* is entirely derived from corpus/reports/*.json +
// corpus/manifest.json. Never hand-edit anything under results/ — rerun this.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  rankReports,
  renderHeatmapMarkdown,
  renderLeaderboardCsv,
  renderLeaderboardMarkdown,
} from './lib/results.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(__dirname, 'reports');
const RESULTS_DIR = path.join(ROOT, 'results');

const manifest = JSON.parse(readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

const reportsByName = new Map();
for (const entry of manifest.entries) {
  const reportPath = path.join(REPORTS_DIR, `${entry.name}.json`);
  if (existsSync(reportPath)) {
    reportsByName.set(entry.name, JSON.parse(readFileSync(reportPath, 'utf8')));
  }
}

const { rows, skipped } = rankReports(manifest.entries, reportsByName);

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(
  path.join(RESULTS_DIR, 'leaderboard.md'),
  renderLeaderboardMarkdown(rows, manifest, skipped),
  'utf8',
);
writeFileSync(path.join(RESULTS_DIR, 'leaderboard.csv'), renderLeaderboardCsv(rows), 'utf8');
writeFileSync(path.join(RESULTS_DIR, 'dimension-heatmap.md'), renderHeatmapMarkdown(rows, manifest), 'utf8');

process.stdout.write(`Wrote results/ from ${rows.length} report(s).\n`);
if (skipped.length) process.stdout.write(`Not yet scanned: ${skipped.join(', ')}\n`);
