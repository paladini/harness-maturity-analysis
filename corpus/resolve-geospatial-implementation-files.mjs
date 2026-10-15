#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const auditPath = path.join(root, 'corpus', 'content-audit-2026-10-14-geospatial-mapping.json');
const pinsPath = path.join(root, 'corpus', 'pin-audit-2026-10-14-geospatial-mapping.json');
const outputPath = path.join(root, 'corpus', 'implementation-audit-2026-10-14-geospatial-mapping.json');
const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
const pins = JSON.parse(readFileSync(pinsPath, 'utf8'));
const pinById = new Map(pins.results.map((repo) => [String(repo.databaseId), repo]));
const eligible = audit.audited
  .filter((repo) => repo.approved && pinById.get(String(repo.databaseId))?.commit)
  .sort((a, b) => b.stars - a.stars);
const prior = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, 'utf8')) : null;
const implementations = new Map((prior?.results ?? []).map((repo) => [String(repo.databaseId), repo]));
for (const [id, result] of implementations) {
  if (result.commit !== pinById.get(id)?.commit) implementations.delete(id);
}
const codePattern =
  /\.(?:c|cc|cpp|cxx|h|hpp|cs|go|java|js|jsx|mjs|cjs|py|rs|rb|php|ts|tsx|swift|kt|kts|vue|svelte|dart|ex|exs|scala|clj|cljs|r|jl|lua|pl|pm|sql|sol|zig|elm|hs|ml|fs|fsx|vb|pas|m|mm)$/i;
const ignored =
  /^(test|tests|spec|specs|fixture|fixtures|example|examples|demo|demos|docs|doc|assets|static|public|vendor|third.party|node_modules|\.git)$/i;
const ignoredFile = /^(?:__init__\.py|.*\.d\.ts|.*\.(?:test|spec)\.[^/]+)$/i;

function save() {
  const output = {
    schemaVersion: 1,
    roundId: 'geospatial-mapping-popularity-1000',
    capturedAt: prior?.capturedAt ?? new Date().toISOString(),
    sourceContentAudit: 'corpus/content-audit-2026-10-14-geospatial-mapping.json',
    sourcePinAudit: 'corpus/pin-audit-2026-10-14-geospatial-mapping.json',
    eligibleCandidates: eligible.length,
    results: [...implementations.values()].sort((a, b) => b.stars - a.stars),
  };
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  return output;
}

function graphql(query) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const raw = execFileSync('rtk', ['gh', 'api', 'graphql', '-f', `query=${query}`], {
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        timeout: 90_000,
      });
      const response = JSON.parse(raw);
      if (response.errors?.length) throw new Error(JSON.stringify(response.errors));
      return response.data;
    } catch (error) {
      lastError = error;
      if (
        !/HTTP 5\d\d|timeout|timed out|unexpected end of JSON|JSON input/i.test(
          `${error.stderr ?? ''} ${error.message ?? ''}`,
        ) ||
        attempt === 5
      )
        throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000 * (attempt + 1));
    }
  }
  throw lastError;
}

function chooseCode(entries, basePath) {
  const valid = entries.filter(
    (entry) =>
      entry.type?.toLowerCase() === 'blob' &&
      !entry.name.startsWith('.') &&
      !ignoredFile.test(entry.name) &&
      codePattern.test(entry.name),
  );
  if (valid.length > 0) {
    const file =
      valid.find((entry) =>
        /^(index|main|app|server|cli|mod|lib|map|tile|geo|route|render|engine|core)\./i.test(entry.name),
      ) ?? valid[0];
    return { path: `${basePath}/${file.name}`, blobSha: file.oid, kind: 'implementation-file' };
  }
  const dirs = entries.filter((entry) => entry.type?.toLowerCase() === 'tree' && !ignored.test(entry.name));
  const directory =
    dirs.find((entry) =>
      /^(src|lib|app|main|core|geo|map|tile|route|engine|server|client|implementation)$/i.test(entry.name),
    ) ?? dirs[0];
  return directory ? { nextPath: `${basePath}/${directory.name}` } : null;
}

for (let depth = 0; depth < 12; depth++) {
  const pending = eligible.filter((repo) => {
    const previous = implementations.get(String(repo.databaseId));
    if (!previous) return depth === 0 && repo.implementation?.kind === 'source-directory';
    return previous.nextPath && !previous.complete;
  });
  if (pending.length === 0) break;
  const batchSize = 20;
  for (let offset = 0; offset < pending.length; offset += batchSize) {
    const batch = pending.slice(offset, offset + batchSize);
    const data = graphql(
      `query { ${batch
        .map((repo, i) => {
          const pin = pinById.get(String(repo.databaseId));
          const basePath = implementations.get(String(repo.databaseId))?.nextPath ?? repo.implementation.path;
          return `r${i}: repository(owner:"${repo.fullName.split('/')[0]}",name:"${repo.fullName.split('/')[1]}") { object(expression:"${pin.commit}:${basePath}") { ... on Tree { entries { name type oid } } } }`;
        })
        .join(' ')} }`,
    );
    batch.forEach((repo, i) => {
      const previous = implementations.get(String(repo.databaseId));
      const startPath = previous?.nextPath ?? repo.implementation.path;
      const entries = data[`r${i}`]?.object?.entries ?? [];
      const chosen = chooseCode(entries, startPath);
      const result = {
        databaseId: repo.databaseId,
        fullName: repo.fullName,
        stars: repo.stars,
        commit: pinById.get(String(repo.databaseId)).commit,
        depth: depth + 1,
        ...(chosen?.nextPath ? { nextPath: chosen.nextPath } : {}),
        ...(chosen?.path ? { path: chosen.path, blobSha: chosen.blobSha } : {}),
        complete: Boolean(chosen?.path),
      };
      implementations.set(String(repo.databaseId), result);
    });
    save();
    console.log(
      `Implementation blobs found for ${[...implementations.values()].filter((repo) => repo.complete).length}; examined depth ${depth + 1} candidates ${offset + 1}-${Math.min(offset + batchSize, pending.length)}/${pending.length}`,
    );
  }
}

for (const repo of eligible.filter((candidate) => candidate.implementation?.kind === 'root-file')) {
  if (!implementations.has(String(repo.databaseId))) {
    implementations.set(String(repo.databaseId), {
      databaseId: repo.databaseId,
      fullName: repo.fullName,
      stars: repo.stars,
      commit: pinById.get(String(repo.databaseId)).commit,
      path: repo.implementation.path,
      blobSha: repo.implementation.blobSha,
      complete: true,
    });
  }
}
const final = save();
const complete = final.results.filter((repo) => repo.complete);
console.log(
  JSON.stringify(
    {
      eligible: eligible.length,
      completeImplementations: complete.length,
      missing: eligible.length - complete.length,
      selectedCutoffStars: complete[999]?.stars ?? null,
      output: outputPath,
    },
    null,
    2,
  ),
);
