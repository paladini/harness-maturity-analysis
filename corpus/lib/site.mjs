// Pure string-building, no filesystem access — corpus/build-site.mjs reads
// the data and calls renderSite(). Mirrors corpus/lib/results.mjs: a
// generated docs/index.html is exactly as "derived, not hand-edited" as
// results/leaderboard.md.

const CATEGORY_LABELS = {
  'control-ceiling': 'control · ceiling',
  'control-floor': 'control · floor',
  'control-non-ai-quality': 'control · quality w/o AI artifacts',
  'ai-lab': 'AI lab',
  'ai-first-dev-tool': 'AI-first dev tool',
  'harness-engineering-exemplar': 'harness-engineering exemplar',
  'prompt-eval-engineering': 'prompt / eval engineering',
  'artifact-governance': 'artifact governance',
};

function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

function categoryLabel(id) {
  return CATEGORY_LABELS[id] ?? id;
}

function repoLabel(repoUrl) {
  return repoUrl.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
}

function levelChip(level, levelName) {
  return `<span class="chip" style="--chip-color:var(--l${level})"><span class="dot"></span>L${level} ${esc(levelName)}</span>`;
}

function renderLeaderboardRow(row, rank) {
  const { entry, report } = row;
  const stressTag = entry.isStressCase ? '<span class="stress-tag">stress case</span>' : '';
  return `
      <div class="board-row">
        <div class="board-rank">${rank}</div>
        <div class="board-main">
          <div class="board-name-line">
            <span><a class="board-name" href="${esc(entry.repoUrl.replace(/\.git$/, ''))}" target="_blank" rel="noopener">${esc(repoLabel(entry.repoUrl))}</a>
              <span class="board-category">${esc(categoryLabel(entry.category))}</span>${stressTag}</span>
            <span class="board-score">${report.score.earned}/${report.score.max} · ${report.score.percent}%</span>
          </div>
          <div class="board-bar-track"><div class="board-bar-fill" style="width:${report.score.percent}%; --bar-color:var(--l${report.level.index})"></div></div>
        </div>
        <div class="board-level">${levelChip(report.level.index, report.level.name)}</div>
      </div>`;
}

function renderLeaderboard(rows) {
  return rows.map((row, i) => renderLeaderboardRow(row, i + 1)).join('\n');
}

function renderHeatmap(rows) {
  const dims = rows[0]?.report.dimensions.map((d) => ({ id: d.id, title: d.title })) ?? [];
  const head = dims.map((d) => `<th>${esc(d.title).replace(' & ', '<br>&amp; ')}</th>`).join('');
  const body = rows
    .map(({ entry, report }) => {
      const cells = dims
        .map((d) => {
          const found = report.dimensions.find((x) => x.id === d.id);
          const v = found ? found.percent : 0;
          return `<td><div class="cell" style="--v:${v}%">${v}</div></td>`;
        })
        .join('');
      return `          <tr><th scope="row">${esc(entry.name)}</th>${cells}</tr>`;
    })
    .join('\n');
  return { head, body };
}

function aiShare(report) {
  const byId = Object.fromEntries(report.dimensions.map((d) => [d.id, d]));
  const aiPts = ['context', 'skills', 'hooks'].reduce((s, id) => s + (byId[id]?.earned ?? 0), 0);
  const genPts = ['sensors', 'ci', 'hygiene'].reduce((s, id) => s + (byId[id]?.earned ?? 0), 0);
  const total = aiPts + genPts;
  return total === 0 ? 0 : Math.round((100 * aiPts) / total);
}

export function renderSite(rows, manifest) {
  const scannedCount = rows.length;
  const totalCount = manifest.entries.length;
  const anthropicSkills = rows.find((r) => r.entry.name === 'anthropic-skills');
  const lowestAiShare = [...rows]
    .filter((r) => r.report.score.earned > 0)
    .sort((a, b) => aiShare(a.report) - aiShare(b.report))[0];
  const { head: heatmapHead, body: heatmapBody } = renderHeatmap(rows);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Harness Maturity Analysis — ${scannedCount} repositories scored</title>
<meta name="description" content="A reproducible study of AI-harness maturity across ${scannedCount} notable open-source repositories, scored with harness-score.">
<style>
${SITE_CSS}
</style>
</head>
<body>
<div class="page">

  <header class="masthead">
    <p class="eyebrow">harness-maturity-analysis · phase 1 complete</p>
    <h1>Does the score<br>hold up?</h1>
    <p class="lede">
      ${scannedCount} of ${totalCount} pinned repositories, one deterministic scanner,
      one question: when <code>harness-score</code> calls a repository L4 or L0,
      does it hold up? <strong>A high reading measures a repository's harness —
      never the competence of the company that owns it.</strong>
    </p>
    <div class="meta-strip">
      <span>harness-score@1.0.0</span><span class="sep">·</span>
      <span>${scannedCount}/${totalCount} pinned commits scanned</span><span class="sep">·</span>
      <span>zero LLM calls · zero network at scan time</span><span class="sep">·</span>
      <span><a href="https://github.com/paladini/harness-maturity-analysis">source on GitHub</a></span>
    </div>
  </header>

  <section class="leaderboard">
    <div class="section-head">
      <h2>The leaderboard</h2>
      <span class="section-num">01</span>
    </div>
    <p class="section-note">
      Every bar is one pinned commit, scanned once, byte-reproducible. Bar length is total
      score; color is the gated maturity level — they can diverge, and where they do is the
      most interesting part of this study. Full raw data:
      <a href="https://github.com/paladini/harness-maturity-analysis/blob/main/results/leaderboard.csv">leaderboard.csv</a>.
    </p>
    <div class="board">
${renderLeaderboard(rows)}
    </div>
  </section>

  <section class="heatmap-section">
    <div class="section-head">
      <h2>Dimension heatmap</h2>
      <span class="section-num">02</span>
    </div>
    <p class="section-note">Percent earned per dimension. Shade intensity is the same number as the label — never color alone.</p>
    <div class="heatmap-wrap">
      <table class="heatmap">
        <thead><tr><th></th>${heatmapHead}</tr></thead>
        <tbody>
${heatmapBody}
        </tbody>
      </table>
    </div>
  </section>

  <section class="finding">
    <div class="finding-card">
      <p class="eyebrow finding-eyebrow">category gap, not a bug</p>
      <h2>Anthropic's own skills showcase scores identically to an empty repo</h2>
      <p>
        <code>anthropic/skills</code> — Anthropic's official showcase of Claude Skills — scores
        <strong>${anthropicSkills ? `L${anthropicSkills.report.level.index} · ${anthropicSkills.report.score.percent}%` : 'L0 · 16%'}</strong>,
        indistinguishable in kind from <code>octocat/Hello-World</code>. Its skills live at
        <code>skills/&lt;name&gt;/SKILL.md</code> (repository root) rather than <code>.claude/skills/</code>,
        because this repository <em>distributes</em> skills rather than using them to develop
        itself — and the relevant check correctly answers the question it's built to ask
        ("does this repo have a self-referential skill harness?") with "no." But the model has
        no vocabulary today for "canonical reference implementation of an artifact type" as
        distinct from "no harness at all." A <code>.claude-plugin/</code> manifest at root —
        which this repo has — is a strong, currently-ignored signal.
      </p>
    </div>
  </section>

  <section class="finding">
    <div class="finding-card" style="border-left-color:var(--accent)">
      <p class="eyebrow finding-eyebrow" style="color:var(--accent-ink)">confirmed bug, ready to fix</p>
      <h2><code>HKS-05</code> misses the unbraced <code>$VAR</code> hook-path form</h2>
      <p>
        <code>cline</code> registers a real, committed hook —
        <code>$CLAUDE_PROJECT_DIR/.claude/hooks/claude-code-for-web-setup.sh</code>, no curly
        braces. The file genuinely exists at exactly that path. The check still reports it
        missing: its path-resolution regex only strips the <em>braced</em> <code>\${VAR}/</code>
        form. A false negative, costing 2 points cline has legitimately earned — a one-line
        regex fix, no design discussion needed.
      </p>
    </div>
  </section>

  <section class="stat-callout">
    <div class="section-head">
      <h2>How much of the score is actually "AI harness"?</h2>
      <span class="section-num">03</span>
    </div>
    <p class="section-note">
      Splitting each report's earned points into AI-specific (Context + Skills + Hooks) versus
      generic engineering hygiene (Sensors + CI + Hygiene): most well-known agent-native tools
      in this corpus earn the large majority of their points from tests, CI, and lockfiles —
      dimensions with nothing specifically to do with AI agents. ${lowestAiShare ? `<code>${esc(lowestAiShare.entry.name)}</code> sits at just ${aiShare(lowestAiShare.report)}% AI-specific share despite scoring ${lowestAiShare.report.score.percent}% overall.` : ''}
      Full table and reading in
      <a href="https://github.com/paladini/harness-maturity-analysis/blob/main/analysis/findings.md#5-aggregate-pattern-how-much-of-the-score-is-actually-ai-harness">analysis/findings.md</a>.
    </p>
  </section>

  <footer class="colophon">
    <div class="colophon-grid">
      <div>
        <h3>WHAT THIS DOESN'T CLAIM</h3>
        <p>
          Not whether the tests are <em>good</em>, whether the rules are <em>true</em>, or
          whether the team practices code review. A high reading means the infrastructure for
          reliable agent work exists. Necessary, not sufficient. Full framing in
          <a href="https://github.com/paladini/harness-maturity-analysis/blob/main/METHODOLOGY.md">METHODOLOGY.md</a>.
        </p>
      </div>
      <div>
        <h3>PHASE STATUS</h3>
        <ol>
          <li class="done">Pipeline scaffold, validated against 4 anchors</li>
          <li class="done">Corpus frozen: ${scannedCount}/${totalCount} repositories scanned</li>
          <li>Blind human ratings — needs a rater, not an agent</li>
          <li class="done">Q2 model-calibration synthesis — 7 findings, 4 proposals</li>
        </ol>
      </div>
    </div>
    <p class="repo-link">
      <span>github.com/paladini/harness-maturity-analysis · MIT</span>
      <span>scores computed by <a href="https://github.com/paladini/harness-score">harness-score</a></span>
    </p>
  </footer>

</div>
</body>
</html>
`;
}

const SITE_CSS = `
  :root {
    --bg: #E8ECED; --bg-grid: #C7CDD1; --surface: #F6F7F5; --surface-raised: #FFFFFF;
    --ink: #181D22; --ink-muted: #4B535C; --ink-faint: #7A828A;
    --border: #C7CDD1; --border-strong: #9BA4AA;
    --accent: #B8631E; --accent-ink: #7A3F0F;
    --l0: #5B6470; --l1: #6E8FB4; --l2: #4E9A8B; --l3: #C99A3D; --l4: #B8631E;
    --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Noto Serif", ui-serif, serif;
    --font-body: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Noto Serif", ui-serif, serif;
    --font-mono: ui-monospace, "Cascadia Code", "JetBrains Mono", "Fira Code", Consolas, "SF Mono", Menlo, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #14181C; --bg-grid: #262D33; --surface: #1B2126; --surface-raised: #20272C;
      --ink: #E7E9E4; --ink-muted: #9AA3A8; --ink-faint: #6B747B;
      --border: #2E363C; --border-strong: #414C53;
      --accent: #E08A3C; --accent-ink: #F3B679;
      --l0: #8C96A3; --l1: #85AAD1; --l2: #63B8A6; --l3: #E6B94C; --l4: #E08A3C;
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background:
      repeating-linear-gradient(0deg, transparent, transparent 27px, var(--bg-grid) 27px, var(--bg-grid) 28px),
      repeating-linear-gradient(90deg, transparent, transparent 27px, var(--bg-grid) 27px, var(--bg-grid) 28px),
      var(--bg);
    color: var(--ink);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
  .page { max-width: 920px; margin: 0 auto; padding: 56px 28px 80px; }
  h1, h2, h3 { font-family: var(--font-display); font-weight: 600; text-wrap: balance; margin: 0; }
  p { margin: 0; }
  a { color: var(--accent-ink); text-decoration-color: color-mix(in srgb, var(--accent-ink) 40%, transparent); text-underline-offset: 2px; }
  a:hover { text-decoration-color: var(--accent-ink); }
  code { font-family: var(--font-mono); background: var(--surface-raised); border: 1px solid var(--border); padding: 1px 5px; font-size: 0.88em; color: var(--ink); }
  .eyebrow { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--ink-faint); margin: 0 0 14px; }
  .masthead { padding-bottom: 36px; border-bottom: 1px solid var(--border); }
  .masthead h1 { font-size: clamp(34px, 5vw, 46px); line-height: 1.08; letter-spacing: -0.01em; }
  .masthead .lede { margin-top: 18px; max-width: 66ch; font-size: 17px; line-height: 1.6; color: var(--ink-muted); }
  .masthead .lede strong { color: var(--ink); font-weight: 600; }
  .meta-strip { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 8px 14px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint); }
  .meta-strip .sep { color: var(--border-strong); }
  section { padding: 44px 0; border-bottom: 1px solid var(--border); }
  .section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
  .section-head h2 { font-size: 22px; }
  .section-num { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: 0.09em; color: var(--accent-ink); }
  .section-note { max-width: 68ch; font-size: 14.5px; line-height: 1.6; color: var(--ink-muted); margin-top: -6px; margin-bottom: 24px; }
  .board { border: 1px solid var(--border); background: var(--surface); padding: 6px 20px; }
  .board-row { display: grid; grid-template-columns: 26px 1fr auto; gap: 14px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--border); }
  .board-row:last-child { border-bottom: none; }
  .board-rank { font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint); text-align: right; font-variant-numeric: tabular-nums; }
  .board-name-line { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
  .board-name { font-weight: 600; color: var(--ink); text-decoration: none; }
  .board-name:hover { text-decoration: underline; }
  .board-category { font-size: 11.5px; color: var(--ink-faint); margin-left: 8px; }
  .board-score { font-family: var(--font-mono); font-size: 12.5px; font-variant-numeric: tabular-nums; color: var(--ink-muted); white-space: nowrap; }
  .board-bar-track { height: 7px; background: var(--border); }
  .board-bar-fill { height: 100%; background: var(--bar-color, var(--l0)); }
  .stress-tag { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--l3); margin-left: 8px; }
  .chip { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 11px; font-weight: 600; padding: 3px 8px; border: 1px solid var(--chip-color, var(--l0)); color: var(--chip-color, var(--l0)); background: var(--surface-raised); background: color-mix(in srgb, var(--chip-color, var(--l0)) 12%, var(--surface-raised)); white-space: nowrap; }
  .chip .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--chip-color, var(--l0)); flex: none; }
  .heatmap-wrap { overflow-x: auto; }
  .heatmap { border-collapse: collapse; font-size: 12px; min-width: 760px; width: 100%; }
  .heatmap th, .heatmap td { padding: 0; }
  .heatmap thead th { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.02em; color: var(--ink-faint); font-weight: 500; text-align: center; padding: 0 4px 8px; vertical-align: bottom; line-height: 1.2; }
  .heatmap thead th:first-child { text-align: left; }
  .heatmap tbody th { text-align: left; font-weight: 600; padding: 0 10px 0 0; white-space: nowrap; font-size: 12.5px; }
  .heatmap td { text-align: center; padding: 2px; }
  .cell { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 11px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--surface); background: color-mix(in srgb, var(--accent) var(--v, 0%), var(--surface)); color: var(--ink-muted); border: 1px solid var(--border); }
  .finding { padding: 40px 0 44px; }
  .finding-card { border-left: 3px solid var(--l1); background: var(--surface); background: color-mix(in srgb, var(--l1) 7%, var(--surface)); padding: 22px 26px; }
  .finding-eyebrow { color: var(--l1); margin-bottom: 10px; }
  .finding h2 { font-size: 20px; margin-bottom: 14px; max-width: 38ch; }
  .finding p { max-width: 68ch; font-size: 15px; line-height: 1.65; color: var(--ink-muted); }
  .stat-callout .section-note { margin-bottom: 0; }
  .colophon { padding-top: 44px; border-bottom: none; }
  .colophon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; }
  .colophon h3 { font-size: 14px; font-family: var(--font-mono); letter-spacing: 0.03em; margin-bottom: 10px; }
  .colophon p, .colophon li { font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); }
  .colophon ol { margin: 0; padding-left: 0; list-style: none; counter-reset: phase; }
  .colophon li { counter-increment: phase; position: relative; padding-left: 26px; margin-bottom: 9px; }
  .colophon li::before { content: "0" counter(phase); position: absolute; left: 0; top: 0; font-family: var(--font-mono); font-size: 11px; color: var(--accent-ink); font-weight: 600; }
  .colophon li.done { color: var(--ink); }
  .colophon li.done::before { content: "\\2713"; color: var(--l2); }
  .repo-link { margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  @media (max-width: 640px) {
    .page { padding: 36px 18px 60px; }
    .colophon-grid { grid-template-columns: 1fr; }
    .board-row { grid-template-columns: 22px 1fr; }
    .board-level { grid-column: 2; justify-self: start; margin-top: 6px; }
  }
`;
