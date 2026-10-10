#!/usr/bin/env bash
set -euo pipefail

work=/tmp/codex-ai500-aidlearning-framework
node_version=24.15.0
archive=node-v24.15.0-linux-x64.tar.xz
repo=$work/repo
runtime=$work/node-v24.15.0-linux-x64
commit=84d0676baffa905c12189959480c9a1bb14619a6
code_path=buildin/fastpose/webpose.py
code_sha=426bcb43e8cd36f93f2a4d78bf2ab0a863587c68
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
git -C "$repo" remote add origin https://github.com/aidlearning/AidLearning-FrameWork.git
git -C "$repo" -c http.version=HTTP/1.1 fetch --depth 1 origin "$commit"
git -C "$repo" checkout -q FETCH_HEAD
[[ "$(git -C "$repo" rev-parse HEAD)" == "$commit" ]]
git -C "$repo" diff-index --quiet HEAD --
[[ "$(git -C "$repo" rev-parse "HEAD:$code_path")" == "$code_sha" ]]
[[ "$(git -C "$repo" cat-file -s "$code_sha")" == 6200 ]]
git -C "$repo" ls-tree -r -z HEAD > "$workspace/corpus/aidlearning-framework-tree.bin"
git -C "$repo" grep -l -E 'filter[[:space:]]*=[[:space:]]*lfs' HEAD -- ':(glob)**/.gitattributes' > "$workspace/corpus/aidlearning-framework-lfs.txt" || true
git --version > "$workspace/corpus/aidlearning-framework-git-version.txt"
node --version
npx --yes harness-score@1.8.1 "$repo" --json > "$workspace/corpus/reports/aidlearning-framework.json"
node -e 'const r=require(process.argv[1]); if(r.tool.name!=="harness-score"||r.tool.version!=="1.8.1"||r.truncated) process.exit(1); console.log(`L${r.level.index} ${r.score.earned}/${r.score.max} (${r.score.percent}%), truncated=${r.truncated}`)' "$workspace/corpus/reports/aidlearning-framework.json"
echo 'Pinned Linux scan complete; tree, LFS paths and Git version receipts are in the workspace.'
