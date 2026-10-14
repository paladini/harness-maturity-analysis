#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(root, 'corpus', 'canonical-identity-inventory-2026-10-14.json');
const manifest = JSON.parse(readFileSync(path.join(root, 'corpus', 'manifest.json'), 'utf8'));
const showcasePath = 'D:/code/harness-maturity-showcase-geospatial-1000/data/projects.json';
const showcase = JSON.parse(readFileSync(showcasePath, 'utf8'));
const inventory = existsSync(inventoryPath)
  ? JSON.parse(readFileSync(inventoryPath, 'utf8'))
  : { schemaVersion: 1, capturedAt: new Date().toISOString(), repositories: [] };
const repos = new Map(inventory.repositories.map((repo) => [repo.slug.toLowerCase(), repo]));

function slug(value) {
  const text = String(value ?? '').trim();
  const match = /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?(?:[?#].*)?$/i.exec(text);
  if (match) return `${match[1]}/${match[2]}`;
  const alias = /^([^/]+)\/([^/]+)$/.exec(text.replace(/\.git$/i, ''));
  return alias ? `${alias[1]}/${alias[2]}` : null;
}
function escapeGraphQL(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
function save() {
  const result = {
    schemaVersion: 1,
    capturedAt: inventory.capturedAt,
    sources: {
      analysisCommit: '2a88ecc00a4fbf8aa13e14692bf673c3c2aba6b7',
      showcaseCommit: 'ddb9ddff34f1400eecb9ff5ab320dd4168b8099e',
      analysisManifestRows: manifest.entries.length,
      showcaseRecords: showcase.length,
    },
    repositories: [...repos.values()].sort((a, b) => a.slug.localeCompare(b.slug)),
  };
  mkdirSync(path.dirname(inventoryPath), { recursive: true });
  writeFileSync(inventoryPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  return result;
}

for (const entry of manifest.entries) {
  const repo = slug(entry.repoUrl);
  if (!repo) continue;
  const key = repo.toLowerCase();
  const previous = repos.get(key) ?? { slug: repo, sources: [] };
  if (!previous.sources.includes('analysis')) previous.sources.push('analysis');
  if (entry.selection?.githubRepositoryId) previous.databaseId = Number(entry.selection.githubRepositoryId);
  repos.set(key, previous);
}
for (const entry of showcase) {
  const repo = slug(entry.repo);
  if (!repo) continue;
  const key = repo.toLowerCase();
  const previous = repos.get(key) ?? { slug: repo, sources: [] };
  if (!previous.sources.includes('showcase')) previous.sources.push('showcase');
  repos.set(key, previous);
}
function recoverPriorIds(value) {
  if (Array.isArray(value)) {
    for (const child of value) recoverPriorIds(child);
    return;
  }
  if (!value || typeof value !== 'object') return;
  const id = value.githubRepositoryId ?? value.databaseId ?? value.canonicalId ?? value.id;
  const identity = value.fullName ?? value.canonicalSlug ?? value.repoUrl ?? value.cloneUrl ?? value.htmlUrl;
  const repo = slug(identity);
  if (repo && Number.isInteger(Number(id)) && Number(id) > 0) {
    const key = repo.toLowerCase();
    const previous = repos.get(key);
    if (previous && previous.databaseId === undefined) previous.databaseId = Number(id);
  }
  for (const child of Object.values(value)) recoverPriorIds(child);
}
for (const file of ['corpus']) {
  for (const name of (await import('node:fs')).readdirSync(path.join(root, file))) {
    if ((name.startsWith('selection-') || name.startsWith('discovery-')) && name.endsWith('.json')) {
      recoverPriorIds(JSON.parse(readFileSync(path.join(root, file, name), 'utf8')));
    }
  }
}
save();

function graphql(query) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const output = execFileSync('rtk', ['gh', 'api', 'graphql', '-f', `query=${query}`], {
        encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, timeout: 90_000,
      });
      const response = JSON.parse(output);
      if (response.errors?.length) throw new Error(JSON.stringify(response.errors));
      return response.data;
    } catch (error) {
      lastError = error;
      if (!/HTTP 5\d\d|timeout|timed out|unexpected end of JSON|JSON input/i.test(`${error.stderr ?? ''} ${error.message ?? ''}`) || attempt === 5) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000 * (attempt + 1));
    }
  }
  throw lastError;
}

const pending = [...repos.values()].filter((repo) => repo.databaseId === undefined);
const chunkSize = 35;
for (let offset = 0; offset < pending.length; offset += chunkSize) {
  const batch = pending.slice(offset, offset + chunkSize);
  const fields = batch.map((repo, i) => {
    const [owner, name] = repo.slug.split('/');
    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(name)) {
      throw new Error(`unexpected GitHub slug: ${repo.slug}`);
    }
    return `r${i}: repository(owner: "${escapeGraphQL(owner)}", name: "${escapeGraphQL(name)}") { databaseId nameWithOwner url }`;
  }).join('\n');
  const data = graphql(`query { ${fields} }`);
  batch.forEach((repo, i) => {
    const current = data[`r${i}`];
    repo.databaseId = current?.databaseId ?? null;
    repo.currentFullName = current?.nameWithOwner ?? null;
    repo.currentUrl = current?.url ?? null;
    repo.resolvedAt = new Date().toISOString();
  });
  save();
  console.log(`Resolved ${Math.min(offset + batch.length, pending.length)}/${pending.length}`);
}

const final = save();
console.log(JSON.stringify({
  repositories: final.repositories.length,
  resolved: final.repositories.filter((repo) => repo.databaseId).length,
  unresolved: final.repositories.filter((repo) => !repo.databaseId).length,
  output: inventoryPath,
}, null, 2));
