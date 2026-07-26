#!/usr/bin/env node
// Deterministic: results/* is entirely derived from corpus/reports/*.json +
// corpus/manifest.json. Never hand-edit anything under results/ — rerun this.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderScoreHistoryMarkdown, reportMatchesToolVersion, sortHistoryRuns } from './lib/history.mjs';
import {
  rankReports,
  renderHeatmapMarkdown,
  renderLeaderboardCsv,
  renderLeaderboardMarkdown,
} from './lib/results.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(__dirname, 'reports');
const HISTORY_DIR = path.join(__dirname, 'history');
const RESULTS_DIR = path.join(ROOT, 'results');

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

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(
  path.join(RESULTS_DIR, 'leaderboard.md'),
  renderLeaderboardMarkdown(rows, manifest, skipped),
  'utf8',
);
writeFileSync(path.join(RESULTS_DIR, 'leaderboard.csv'), renderLeaderboardCsv(rows), 'utf8');
writeFileSync(path.join(RESULTS_DIR, 'dimension-heatmap.md'), renderHeatmapMarkdown(rows, manifest), 'utf8');
writeFileSync(
  path.join(RESULTS_DIR, 'score-history.md'),
  renderScoreHistoryMarkdown(historyRuns, manifest.entries),
  'utf8',
);

process.stdout.write(`Wrote results/ from ${rows.length} report(s).\n`);
process.stdout.write(`Recorded runs: ${historyRuns.length}.\n`);
if (skipped.length) process.stdout.write(`Not yet scanned: ${skipped.join(', ')}\n`);
