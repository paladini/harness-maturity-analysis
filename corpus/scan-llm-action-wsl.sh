#!/usr/bin/env bash
set -euo pipefail

work=/tmp/codex-ai500-llm-action
node_version=24.15.0
archive=node-v24.15.0-linux-x64.tar.xz
repo=$work/repo
runtime=$work/node-v24.15.0-linux-x64
commit=3a1e24448ec451108f448580fa8a37f04ee834f2
code_path=ai-framework/deepspeed/hello_bert/train_bert.py
code_sha=6ffd2dd9b1f6ad117fc7c42757f27d461abd7ca2
workspace='/mnt/c/Users/Fernando Paladini/.codex/worktrees/ai500-clean'

if [[ -e "$work" ]]; then
  echo "Refusing to overwrite existing temporary path: $work" >&2
  exit 2
fi
mkdir -p "$work/npm-cache"
cd "$work"
curl --fail --location --silent --show-error "https://nodejs.org/dist/v${node_version}/SHASUMS256.txt" -o SHASUMS256.txt
curl --fail --location --silent --show-error "https://nodejs.org/dist/v${node_version}/${archive}" -o "$archive"
grep " ${archive}$" SHASUMS256.txt | sha256sum --check --status
tar -xJf "$archive"
export PATH="$runtime/bin:$PATH"
export npm_config_cache="$work/npm-cache"
export GIT_LFS_SKIP_SMUDGE=1
git init -q "$repo"
git -C "$repo" remote add origin https://github.com/liguodongiot/llm-action.git
git -C "$repo" -c http.version=HTTP/1.1 fetch --depth 1 origin "$commit"
git -C "$repo" checkout -q FETCH_HEAD
[[ "$(git -C "$repo" rev-parse HEAD)" == "$commit" ]]
git -C "$repo" diff-index --quiet HEAD --
test -f "$repo/llm-algo/transformer/README.md "
[[ "$(git -C "$repo" rev-parse "HEAD:$code_path")" == "$code_sha" ]]
[[ "$(git -C "$repo" cat-file -s "$code_sha")" == 30343 ]]
git -C "$repo" ls-tree -r -z HEAD > "$workspace/corpus/llm-action-tree.bin"
git -C "$repo" grep -l -E 'filter[[:space:]]*=[[:space:]]*lfs' HEAD -- ':(glob)**/.gitattributes' > "$workspace/corpus/llm-action-lfs.txt" || true
git --version > "$workspace/corpus/llm-action-git-version.txt"
node --version
npx --yes harness-score@1.8.1 "$repo" --json > "$workspace/corpus/reports/llm-action.json"
node -e 'const r=require(process.argv[1]); if(r.tool.name!=="harness-score"||r.tool.version!=="1.8.1"||r.truncated) process.exit(1); console.log(`L${r.level.index} ${r.score.earned}/${r.score.max} (${r.score.percent}%), truncated=${r.truncated}`)' "$workspace/corpus/reports/llm-action.json"
echo 'Pinned Linux scan complete; tree, LFS paths and Git version receipts are in the workspace.'
