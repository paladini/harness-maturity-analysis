#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.join(root, 'corpus', 'content-audit-2026-10-14-geospatial-mapping.json');
const outputPath = path.join(root, 'corpus', 'pin-audit-2026-10-14-geospatial-mapping.json');
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const eligible = input.audited.filter((repo) => repo.approved).sort((a, b) => b.stars - a.stars);
const prior = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, 'utf8')) : null;
const results = new Map((prior?.results ?? []).map((repo) => [String(repo.databaseId), repo]));

function save() {
  const output = {
    schemaVersion: 1,
    roundId: 'geospatial-mapping-popularity-1000',
    observedAt: prior?.observedAt ?? new Date().toISOString(),
    sourceAudit: 'corpus/content-audit-2026-10-14-geospatial-mapping.json',
    candidateCount: eligible.length,
    candidates: eligible.map((repo) => ({ databaseId: repo.databaseId, fullName: repo.fullName, stars: repo.stars, searchCommit: repo.commit })),
    results: [...results.values()].sort((a, b) => b.stars - a.stars),
  };
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  return output;
}

function parseLsRemote(output) {
  const lines = output.trim().split(/\r?\n/);
  const symref = lines.find((line) => line.startsWith('ref:') && line.endsWith('\tHEAD'));
  const shaLine = lines.find((line) => /^[0-9a-f]{40}\tHEAD$/i.test(line));
  return {
    branch: symref?.replace(/^ref:\s*refs\/heads\//, '').replace(/\tHEAD$/, '') ?? null,
    commit: shaLine?.split('\t')[0] ?? null,
  };
}

async function resolve(repo) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { stdout } = await execFileAsync('rtk', ['git', 'ls-remote', '--symref', repo.repoUrl, 'HEAD'], {
        encoding: 'utf8', timeout: 90_000, maxBuffer: 1024 * 1024,
      });
      const current = parseLsRemote(stdout);
      return {
        databaseId: repo.databaseId,
        fullName: repo.fullName,
        repoUrl: repo.repoUrl,
        stars: repo.stars,
        searchCommit: repo.commit,
        branch: current.branch,
        commit: current.commit,
        movedSinceDiscovery: current.commit !== repo.commit,
        error: current.commit ? null : 'git ls-remote HEAD returned no 40-character SHA',
        observedAt: new Date().toISOString(),
      };
    } catch (error) {
      lastError = error;
      const detail = `${error.stderr ?? ''} ${error.message ?? ''}`;
      if (!/HTTP 5\d\d|timeout|timed out|TLS|connection|network/i.test(detail) || attempt === 4) break;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 1500 * (attempt + 1)));
    }
  }
  return {
    databaseId: repo.databaseId,
    fullName: repo.fullName,
    repoUrl: repo.repoUrl,
    stars: repo.stars,
    searchCommit: repo.commit,
    branch: null,
    commit: null,
    movedSinceDiscovery: false,
    error: String(lastError?.stderr ?? lastError?.message ?? 'git ls-remote failed').trim(),
    observedAt: new Date().toISOString(),
  };
}

let cursor = 0;
let completedSinceSave = 0;
const concurrency = 12;
async function worker() {
  while (cursor < eligible.length) {
    const repo = eligible[cursor++];
    if (results.has(String(repo.databaseId))) continue;
    results.set(String(repo.databaseId), await resolve(repo));
    completedSinceSave++;
    if (completedSinceSave >= 25) {
      save();
      completedSinceSave = 0;
      const done = results.size;
      console.log(`Pinned HEAD resolved for ${done}/${eligible.length} eligible candidates`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
const final = save();
console.log(JSON.stringify({
  candidates: final.candidateCount,
  resolved: final.results.filter((repo) => repo.commit && !repo.error).length,
  moved: final.results.filter((repo) => repo.movedSinceDiscovery).length,
  failed: final.results.filter((repo) => repo.error).length,
  output: outputPath,
}, null, 2));
