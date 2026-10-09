# Phase 1D: cryptocurrency software analysis and execution

Selection date: 2026-10-08. [Corpus issue #5](https://github.com/paladini/harness-maturity-analysis/issues/5); [showcase issue #7](https://github.com/paladini/harness-maturity-showcase/issues/7).

## Scope and popularity

Add 25 previously unmeasured cryptocurrency/blockchain software repositories to the 101-entry baseline. The integrated126-entry corpus uses npm-current `harness-score@1.8.1`, verified before this round. This is scanner/showcase evidence without blind human ratings.

The [frozen search](../corpus/popularity-search-2026-10-08-crypto.json) contains 659 unique repository IDs from 28 complete GitHub REST searches across cryptocurrency, blockchain, Bitcoin, Ethereum, DeFi, Web3, Solidity, wallets and related terms/topics. Public non-fork software is eligible, including archived implementations. Each query returns up to 100 entries sorted by accumulated stars; capped boundaries are at most2,710 stars, below the 11,337-star admission cutoff.

Accumulated stars observed today approximate lifetime popularity. They are neither trending activity nor a reconstruction of historical peak stars. The25 entries are the highest eligible new software within this documented query universe, not a universal semantic classification of GitHub. No score determined admission. Canonical IDs deduplicate all 101 baseline repositories, including renames.

The [selection ledger](../corpus/selection-2026-10-08-crypto-popularity.json) freezes full40-character HEAD SHAs, real README/software purpose, implementation blob SHA and size, repository/licensing metadata, archive status, and all 24 higher-ranked exclusions. Pure cryptographic libraries, books/courses, awesome lists, specifications, general home-server platforms and multi-asset financial engines with incidental crypto support are excluded.

## What the 25 reports show

Level counts: **L0=15, L1=10, L2=0, L3=0, L4=0**. Median applicable score percentage: **50%**; arithmetic mean: **49.7%**; range: **30%-70%**.

Truncated crypto reports: **0**. Percentages use each report's applicable maximum; raw points alone are not comparable when maxima differ. Levels also depend on dimension gates and therefore need not follow total-percent order.

| Popularity rank | Repository | Stars observed | Harness level | Earned / applicable max | Percent | Raw report |
| --- | --- | ---: | --- | --- | ---: | --- |
| 1 | [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin/tree/acdb32693417c1b6596edfbdd19ab793c010d34f) | 90,328 | L0 Unharnessed | 37/105 | 35% | [JSON](../corpus/reports/bitcoin.json) |
| 2 | [unionlabs/union](https://github.com/unionlabs/union/tree/031785bb6dc6b957c624e62bc64c184409c97d7b) | 73,757 | L0 Unharnessed | 47/105 | 45% | [JSON](../corpus/reports/union.json) |
| 3 | [FuelLabs/fuel-core](https://github.com/FuelLabs/fuel-core/tree/251c8059cc072c780f6e1e2900d8771c8eb99403) | 56,807 | L1 Documented | 60/105 | 57% | [JSON](../corpus/reports/fuel-core.json) |
| 4 | [freqtrade/freqtrade](https://github.com/freqtrade/freqtrade/tree/a9a917649ff8e283cff9c37504863b02da88615a) | 55,147 | L0 Unharnessed | 56/105 | 53% | [JSON](../corpus/reports/freqtrade.json) |
| 5 | [ethereum/go-ethereum](https://github.com/ethereum/go-ethereum/tree/466c37e3329b119a222b5a275f696da697f6103b) | 51,390 | L1 Documented | 57/105 | 54% | [JSON](../corpus/reports/go-ethereum.json) |
| 6 | [ccxt/ccxt](https://github.com/ccxt/ccxt/tree/f0aca06eb7482f083bed8406fadfcc0c05e45b1c) | 44,287 | L1 Documented | 74/105 | 70% | [JSON](../corpus/reports/ccxt.json) |
| 7 | [anoma/anoma](https://github.com/anoma/anoma/tree/5bcbf8487a331a20748299ed4fd4d62027f0ffa8) | 33,571 | L0 Unharnessed | 32/105 | 30% | [JSON](../corpus/reports/anoma.json) |
| 8 | [linera-io/linera-protocol](https://github.com/linera-io/linera-protocol/tree/672d97bb2fce3127db351069df72f1d225d8f263) | 32,081 | L0 Unharnessed | 53/105 | 50% | [JSON](../corpus/reports/linera-protocol.json) |
| 9 | [shardeum/shardeum](https://github.com/shardeum/shardeum/tree/0c454caf067f7b896569eabdd5f47cb8b61738b3) | 31,194 | L1 Documented | 60/105 | 57% | [JSON](../corpus/reports/shardeum.json) |
| 10 | [slymnoyann/hey.xyz](https://github.com/slymnoyann/hey.xyz/tree/44dee0c1223b9202699915fd3e92e670fd8e34e6) | 29,349 | L1 Documented | 43/105 | 41% | [JSON](../corpus/reports/hey.json) |
| 11 | [OpenZeppelin/openzeppelin-contracts](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/cd3284fde41f1c56d19078f580a0aed751cf11d2) | 27,268 | L1 Documented | 68/105 | 65% | [JSON](../corpus/reports/openzeppelin-contracts.json) |
| 12 | [argotorg/solidity](https://github.com/argotorg/solidity/tree/37e27efdba13d47695f9a579df49129d6504ed53) | 25,748 | L0 Unharnessed | 32/105 | 30% | [JSON](../corpus/reports/solidity.json) |
| 13 | [zama-ai/fhevm](https://github.com/zama-ai/fhevm/tree/11b29f7b6b86fa8c1621eb4ec00c0b6a072f5675) | 24,786 | L1 Documented | 67/105 | 64% | [JSON](../corpus/reports/fhevm.json) |
| 14 | [hummingbot/hummingbot](https://github.com/hummingbot/hummingbot/tree/9af100d6822da7d2d0291a906c730ef172284ee2) | 20,346 | L0 Unharnessed | 46/105 | 44% | [JSON](../corpus/reports/hummingbot.json) |
| 15 | [web3/web3.js](https://github.com/web3/web3.js/tree/bf1691765bd9d4b0f7a4479e915207707d69226d) (archived) | 19,910 | L0 Unharnessed | 49/105 | 47% | [JSON](../corpus/reports/web3-js.json) |
| 16 | [subquery/subql](https://github.com/subquery/subql/tree/51e2a2c985c3c869510a36e8c37a3b3557af4a3c) | 18,732 | L1 Documented | 63/105 | 60% | [JSON](../corpus/reports/subquery.json) |
| 17 | [hyperledger/fabric](https://github.com/hyperledger/fabric/tree/1f06f620a21dbd7089dca01fd54b0fbbc5798d5a) | 16,736 | L0 Unharnessed | 50/105 | 48% | [JSON](../corpus/reports/hyperledger-fabric.json) |
| 18 | [diem/diem](https://github.com/diem/diem/tree/fc4714a8ea273b6efe8b13dbce72ea60aad9a16c) | 16,660 | L0 Unharnessed | 50/105 | 48% | [JSON](../corpus/reports/diem.json) |
| 19 | [sismo-core/sismo-badges](https://github.com/sismo-core/sismo-badges/tree/09206e396ca2342a88f7eaa897d55783f019f759) | 15,869 | L0 Unharnessed | 53/105 | 50% | [JSON](../corpus/reports/sismo-badges.json) |
| 20 | [dogecoin/dogecoin](https://github.com/dogecoin/dogecoin/tree/47a303a449999314abcf83bd1fc7e77dd4540fcd) | 15,233 | L0 Unharnessed | 32/105 | 30% | [JSON](../corpus/reports/dogecoin.json) |
| 21 | [solana-labs/solana](https://github.com/solana-labs/solana/tree/7700cb3128c1f19820de67b81aa45d18f73d2ac0) (archived) | 14,942 | L0 Unharnessed | 50/105 | 48% | [JSON](../corpus/reports/solana.json) |
| 22 | [ConsenSys-archive/truffle](https://github.com/ConsenSys-archive/truffle/tree/5b5312dbd5ffe2d5ec575e078ff09d98eb1b45c2) (archived) | 13,905 | L0 Unharnessed | 56/105 | 53% | [JSON](../corpus/reports/truffle.json) |
| 23 | [MetaMask/metamask-extension](https://github.com/MetaMask/metamask-extension/tree/a284fe9f478fb717712350ce0d1fedb58a1a6c10) | 13,224 | L1 Documented | 70/105 | 67% | [JSON](../corpus/reports/metamask-extension.json) |
| 24 | [QuipNetwork/quip-miner](https://github.com/QuipNetwork/quip-miner/tree/d58a7c79826c22b9bc071850a8f3bb453dd186b5) | 11,592 | L1 Documented | 60/105 | 57% | [JSON](../corpus/reports/quip-miner.json) |
| 25 | [QuipNetwork/ethereum-sdk](https://github.com/QuipNetwork/ethereum-sdk/tree/355f888cdffb643f6acdd50241fc44a93b37e230) | 11,337 | L0 Unharnessed | 41/105 | 39% | [JSON](../corpus/reports/quip-ethereum-sdk.json) |

These are descriptive statistics of a curated cohort, not a representative estimate of cryptocurrency developers or an evaluation of token value, trading returns, consensus correctness or security. A low level means scanner-recognized agent-workflow artifacts are absent or do not meet gates at this pinned commit; it is not evidence that the cryptocurrency product is unsafe. A high score proves neither test quality nor operational practice. No causal link between popularity and harness maturity is inferred.

## Historical and coverage limits

Web3.js, Solana and Truffle are archived at selection; these remain historical software measurements rather than claims of current maintenance. The [Hey README](https://github.com/slymnoyann/hey.xyz/blob/44dee0c1223b9202699915fd3e92e670fd8e34e6/README.md) explicitly identifies its code as the last public snapshot before May 15, 2026, despite GitHub not marking the repository archived. The score does not describe its later production implementation. Source/license metadata includes custom or unreported license identifiers and does not claim uniform licensing.

Full repository roots were scanned without new checkout exclusions. Git LFS smudging is disabled and submodules remain uninitialized, as in the existing pipeline; this describes each parent repository Git tree rather than vendored dependency contents. The pinned checkout audit records these boundaries explicitly. No measured repository install, build, test or code execution occurred.

The [checkout audit](../corpus/checkout-audit-2026-10-08-crypto-popularity.json) verifies25/25 exact source blobs and complete parent checkouts. It records12 submodule paths and0 checkouts with long paths. Windows long-path handling and raw-CRLF integrity checks preserve tracked inputs.

## Reproduction and integration

### CCXT scan environment

Windows Defender quarantined `js/src/pro/test/Exchange/test.watchOrderBook.js`
while the scanner was reading the pinned CCXT checkout. The failed Windows
attempt was not admitted as an authoritative report. Quarantine and protections
remained unchanged. CCXT was cloned and read in a separate Ubuntu 24.04 WSL
filesystem with checksum-verified official Node 22.20.0 and the same published
scanner 1.8.1; no CCXT code was executed.

The [Linux receipt](../corpus/scan-environment-2026-10-08-ccxt.json) and
[final CCXT audit](../corpus/checkout-audit-2026-10-08-crypto-popularity-ccxt-linux.json)
record the exact commit, implementation blob and complete input. The original
25-entry Windows audit is pre-scan evidence; the supplemental audit establishes
CCXT's final scan input after quarantine changed its Windows checkout.
No file was omitted to obtain a result.

CCXT's pinned `AGENTS.md` has Git mode120000 and points to `CLAUDE.md`. Native
Linux symlink behavior therefore matters to `CTX-02` (substantive agent context).
The authoritative Linux report records74/105,70%,L1. Comparison assumes the
recorded filesystem semantics, scanner version and commit; a Windows link-as-file
or a quarantined checkout is a different input. This records an environment
limitation and does not determine whether the antivirus detection is correct.

### Completed run

The first 71 entries completed through the sequential runner. Remaining entries
were completed in three disjoint `--only` groups; the sole failed CCXT scan was
resolved through the separately audited Linux read above. After all 126 matching
reports were present, `npm run corpus:history` recorded one complete named
snapshot. Partial groups did not write history. Results/site generation followed.

The same-day run uses `manifest.runId=crypto-popularity`. It appends `2026-10-08-harness-score-1.8.1-crypto-popularity.json`, preserving the earlier101-entry snapshot and all older evidence. The official runner records history only after all 126 entries succeed. Repeated identical history writes verify bytes without rewriting the file; conflicting content is rejected.

```bash
node corpus/audit-checkouts.mjs corpus/selection-2026-10-08-crypto-popularity.json
npm run corpus
npm test
npm run lint
```

On Windows hosts that quarantine the CCXT fixture, reproduce its whole pinned
checkout and scanner read on Linux, retaining the raw JSON output. Do not disable
protection or remove source files. Then verify all matching reports and run
`npm run corpus:history`, `npm run corpus:build` and `npm run site:build`.

CSV/leaderboard, dimension heatmap, score history and `docs/index.html` are generated from reports. Crypto star provenance is separate from maturity; same-version history is labeled coverage. The independent showcase imports an immutable public analysis source commit, verifies the 126 raw report bytes and matching history, preserves21 community records and uses a new named snapshot. Its expected registry has147 unique listings,146 full reports and1 badge.

## Delivery note and credit

Local verification passed 61 tests across 12 files, lint 40 files and Git
whitespace checks. Regeneration produced identical result/site bytes. All101
baseline manifest entries and raw reports, plus all 4 earlier history files,
remained byte-identical to source commit 6de12c5. All126 current reports match
the named history, with no truncation. CI and publication remain separate gates.

Maintainer request and contribution: @paladini. This delivery adds25 cryptocurrency software cases, source evidence, named same-day history and cohort analysis. No external contributor authored the integration. Tests, CI, PR and publication status are recorded on the linked issues/PRs; local generated data is distinct from a merged and publicly verified site.

Official contract: [GitHub REST search](https://docs.github.com/en/rest/search/search) supports star ordering, query bounds and incomplete-result metadata used in the frozen discovery.
