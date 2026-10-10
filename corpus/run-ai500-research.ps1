$ErrorActionPreference = 'Stop'
$env:CODEX_AI_RESEARCH_GH_TOKEN = (rtk gh auth token)
if ($LASTEXITCODE -ne 0 -or -not $env:CODEX_AI_RESEARCH_GH_TOKEN) {
  throw 'Could not acquire the authenticated GitHub research token.'
}
rtk node corpus/research-ai500-replacements.mjs
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
