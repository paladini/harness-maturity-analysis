const TOOL_VERSION_RE = /^harness-score@(\d+\.\d+\.\d+)$/;
const RUN_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function toolSemver(toolVersion) {
  return TOOL_VERSION_RE.exec(toolVersion)?.[1] ?? null;
}

export function reportMatchesToolVersion(report, toolVersion) {
  const version = toolSemver(toolVersion);
  return report?.tool?.name === 'harness-score' && report.tool.version === version;
}

export function historyFileName(runDate, toolVersion) {
  const version = toolSemver(toolVersion);
  if (!RUN_DATE_RE.test(runDate) || !version) {
    throw new Error(`invalid history identity: ${runDate}, ${toolVersion}`);
  }
  return `${runDate}-harness-score-${version}.json`;
}

export function createHistorySnapshot(manifest, resultsByName) {
  if (!RUN_DATE_RE.test(manifest.runDate ?? '')) {
    throw new Error('manifest.runDate must use YYYY-MM-DD');
  }
  if (!toolSemver(manifest.toolVersion)) {
    throw new Error('manifest.toolVersion must pin harness-score@X.Y.Z');
  }

  return {
    schemaVersion: 1,
    date: manifest.runDate,
    toolVersion: manifest.toolVersion,
    entries: manifest.entries.map((entry) => {
      const result = resultsByName.get(entry.name);
      const identity = {
        name: entry.name,
        repoUrl: entry.repoUrl,
        commit: entry.commit,
      };
      if (!result?.report) {
        return {
          ...identity,
          status: result?.status ?? 'not-scanned',
          note: result?.error ?? 'No matching report was available for this run.',
        };
      }
      const { report } = result;
      return {
        ...identity,
        status: 'scored',
        level: {
          index: report.level.index,
          name: report.level.name,
        },
        score: {
          earned: report.score.earned,
          max: report.score.max,
          percent: report.score.percent,
        },
        truncated: report.truncated,
      };
    }),
  };
}

export function sortHistoryRuns(runs) {
  return [...runs].sort((a, b) => a.date.localeCompare(b.date) || a.toolVersion.localeCompare(b.toolVersion));
}

function formatDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}

function scoreCell(entry) {
  if (entry?.status !== 'scored') return entry?.status ?? 'not recorded';
  return `L${entry.level.index} · ${entry.score.earned}/${entry.score.max} (${entry.score.percent}%)`;
}

function latestDelta(entries) {
  const scored = entries.filter((entry) => entry?.status === 'scored');
  if (scored.length < 2) return '—';
  const delta = scored.at(-1).score.percent - scored.at(-2).score.percent;
  if (delta === 0) return '0 pp';
  return `${delta > 0 ? '+' : ''}${delta} pp`;
}

export function renderScoreHistoryMarkdown(runs, manifestEntries) {
  const orderedRuns = sortHistoryRuns(runs);
  const headings = orderedRuns.map((run) => `${formatDate(run.date)}<br>\`${run.toolVersion}\``);
  const lines = [
    '# Score history',
    '',
    '_Entries present in multiple runs keep the same pinned repository commit. Their deltas measure scoring-model changes. New entries have no earlier score._',
    '',
    `| Repository | ${headings.join(' | ')} | Latest change |`,
    `|---|${orderedRuns.map(() => '---').join('|')}|---|`,
  ];

  for (const manifestEntry of manifestEntries) {
    const entries = orderedRuns.map((run) => run.entries.find((entry) => entry.name === manifestEntry.name));
    lines.push(
      `| [${manifestEntry.name}](${manifestEntry.repoUrl}) | ${entries
        .map(scoreCell)
        .join(' | ')} | ${latestDelta(entries)} |`,
    );
  }

  lines.push(
    '',
    'A `failed` or `not-scanned` cell is retained as part of the historical record. It is never replaced with a score from another tool version.',
    '',
  );
  return lines.join('\n');
}
