// Pure functions only — no filesystem access — so they're directly
// unit-testable. corpus/build-results.mjs is the thin CLI wrapper that
// reads corpus/reports/*.json, calls these, and writes results/.

/**
 * Pairs each manifest entry with its report (when scanned), sorted by score
 * percent descending, ties broken by level index descending. Entries with
 * no report yet are returned separately rather than dropped silently.
 */
export function rankReports(manifestEntries, reportsByName) {
  const rows = [];
  const skipped = [];
  for (const entry of manifestEntries) {
    const report = reportsByName.get(entry.name);
    if (!report) {
      skipped.push(entry.name);
      continue;
    }
    rows.push({ entry, report });
  }
  rows.sort(
    (a, b) => b.report.score.percent - a.report.score.percent || b.report.level.index - a.report.level.index,
  );
  return { rows, skipped };
}

export function renderLeaderboardMarkdown(rows, manifest, skipped) {
  const lines = [
    '# Leaderboard',
    '',
    `_${rows.length}/${manifest.entries.length} corpus repositories scanned with \`${manifest.toolVersion}\`. ` +
      'A high score measures harness infrastructure, not company AI competence — see [METHODOLOGY.md](../METHODOLOGY.md).' +
      (skipped.length ? ` Not yet scanned: ${skipped.join(', ')}.` : '') +
      '_',
    '',
    '| Rank | Repository | Category | Level | Score | Detected harnesses | Flags |',
    '|---|---|---|---|---|---|---|',
  ];
  rows.forEach(({ entry, report }, i) => {
    const flags = [report.truncated ? 'truncated' : null, entry.isStressCase ? 'stress case' : null]
      .filter(Boolean)
      .join(', ');
    lines.push(
      `| ${i + 1} | [${entry.name}](${entry.repoUrl}) | ${entry.category} | ` +
        `L${report.level.index} · ${report.level.name} | ${report.score.earned}/${report.score.max} (${report.score.percent}%) | ` +
        `${report.detectedHarnesses.join(', ') || '—'} | ${flags || '—'} |`,
    );
  });
  return `${lines.join('\n')}\n`;
}

export function renderLeaderboardCsv(rows) {
  const lines = [
    'rank,name,category,repoUrl,commit,level,levelName,earned,max,percent,truncated,isStressCase,detectedHarnesses',
  ];
  rows.forEach(({ entry, report }, i) => {
    lines.push(
      [
        i + 1,
        entry.name,
        entry.category,
        entry.repoUrl,
        entry.commit,
        report.level.index,
        report.level.name,
        report.score.earned,
        report.score.max,
        report.score.percent,
        report.truncated,
        entry.isStressCase,
        `"${report.detectedHarnesses.join(';')}"`,
      ].join(','),
    );
  });
  return `${lines.join('\n')}\n`;
}

export function renderHeatmapMarkdown(rows, manifest) {
  const dims = rows[0]?.report.dimensions.map((d) => ({ id: d.id, title: d.title })) ?? [];
  const lines = [
    '# Dimension Heatmap',
    '',
    `_Percent earned per dimension, \`${manifest.toolVersion}\`._`,
    '',
    `| Repository | ${dims.map((d) => d.title).join(' | ')} |`,
    `|---|${dims.map(() => '---').join('|')}|`,
  ];
  rows.forEach(({ entry, report }) => {
    const cells = dims.map((d) => {
      const found = report.dimensions.find((x) => x.id === d.id);
      return found ? `${found.percent}%` : '—';
    });
    lines.push(`| ${entry.name} | ${cells.join(' | ')} |`);
  });
  return `${lines.join('\n')}\n`;
}
