# Phase 1E: media editing software cohort

## Scope and selection

Phase 1E adds 25 media editing software projects to the 126-entry corpus baseline, producing a 151-entry run on `harness-score@1.8.1`. The cohort covers end-user software for image, video, graphics and audio editing. It is a scanner-only showcase expansion; it contains no blind human ratings and answers no external-validity question.

The [preregistration issue](https://github.com/paladini/harness-maturity-analysis/issues/7) froze the candidate list before scanning. The [GitHub search snapshot](../corpus/popularity-search-2026-10-09-media-editing.json) records eight queries at 2026-10-09T18:17:35Z: video editor, audio editor, digital audio workstation, image editor, photo editor, vector graphics editor, animation software, and media editor in name/description. The bounded union contains 671 search hits and 645 unique canonical repository IDs; six queries reached GitHub's 100-result cap. The minimum stars on capped result pages remained below the admission cutoff. The cohort is the first 25 eligible candidates in this recorded bounded union, not a universal or global top-25 ranking.

The [selection ledger](../corpus/selection-2026-10-09-media-editing-popularity.json) records repository IDs, observed stars, exact commits, default branches, license metadata, README and implementation-file evidence, plus 11 higher-ranked exclusions and their reasons. Canonical IDs deduplicated all 126 baseline entries. No selected ID overlaps the baseline. Candidates were selected by popularity and source eligibility, never by score. Observed stars are cumulative counts at selection time, not historical peaks.

The scanner pinned each repository to a full SHA, checked out the full repository root and did not initialize submodules, install dependencies, build, test or execute target code. No checkout exclusions were used. The complete append-only run is [2026-10-09-harness-score-1.8.1-media-editing-popularity.json](../corpus/history/2026-10-09-harness-score-1.8.1-media-editing-popularity.json), identified by `manifest.runId=media-editing-popularity`.

## Scanner outcomes

All 25 pinned scans produced reports. None was truncated. Twenty repositories scored L0 Unharnessed and five scored L1 Documented. The mean score was 36.4%, the median was 41%, and the range was 15% to 54%. Report maxima vary by repository (105 or 108 points) according to applicable checks.

| Report | Repository | Stars at selection | Level | Score | Percent |
|---|---|---:|---|---:|---:|
| [lossless-cut](../corpus/reports/lossless-cut.json) | [mifi/lossless-cut](https://github.com/mifi/lossless-cut) | 44,406 | Unharnessed | 47/105 | 45% |
| [photocraft](../corpus/reports/photocraft.json) | [storytold/photocraft](https://github.com/storytold/photocraft) | 33,546 | Documented | 55/105 | 52% |
| [graphite](../corpus/reports/graphite.json) | [GraphiteEditor/Graphite](https://github.com/GraphiteEditor/Graphite) | 27,514 | Unharnessed | 48/105 | 46% |
| [shotcut](../corpus/reports/shotcut.json) | [mltframework/shotcut](https://github.com/mltframework/shotcut) | 15,375 | Documented | 43/105 | 41% |
| [imagetoolbox](../corpus/reports/imagetoolbox.json) | [T8RIN/ImageToolbox](https://github.com/T8RIN/ImageToolbox) | 14,918 | Unharnessed | 32/105 | 30% |
| [palmier-pro](../corpus/reports/palmier-pro.json) | [palmier-io/palmier-pro](https://github.com/palmier-io/palmier-pro) | 14,535 | Documented | 29/105 | 28% |
| [olive](../corpus/reports/olive.json) | [olive-editor/olive](https://github.com/olive-editor/olive) | 9,132 | Unharnessed | 32/105 | 30% |
| [vue-fabric-editor](../corpus/reports/vue-fabric-editor.json) | [ikuaitu/vue-fabric-editor](https://github.com/ikuaitu/vue-fabric-editor) | 7,992 | Unharnessed | 46/105 | 44% |
| [jspaint](../corpus/reports/jspaint.json) | [1j01/jspaint](https://github.com/1j01/jspaint) | 7,889 | Unharnessed | 40/105 | 38% |
| [filmcraft](../corpus/reports/filmcraft.json) | [storytold/filmcraft](https://github.com/storytold/filmcraft) | 6,680 | Documented | 58/108 | 54% |
| [editly](../corpus/reports/editly.json) | [mifi/editly](https://github.com/mifi/editly) | 5,522 | Unharnessed | 53/105 | 50% |
| [concat](../corpus/reports/concat.json) | [jub0t/concat](https://github.com/jub0t/concat) | 4,398 | Unharnessed | 44/105 | 42% |
| [pinta](../corpus/reports/pinta.json) | [PintaProject/Pinta](https://github.com/PintaProject/Pinta) | 4,079 | Unharnessed | 33/105 | 31% |
| [clypra](../corpus/reports/clypra.json) | [AIEraDev/Clypra](https://github.com/AIEraDev/Clypra) | 3,311 | Unharnessed | 50/105 | 48% |
| [better-shot](../corpus/reports/better-shot.json) | [KartikLabhshetwar/better-shot](https://github.com/KartikLabhshetwar/better-shot) | 2,375 | Documented | 47/105 | 45% |
| [photodemon](../corpus/reports/photodemon.json) | [tannerhelland/PhotoDemon](https://github.com/tannerhelland/PhotoDemon) | 2,373 | Unharnessed | 26/105 | 25% |
| [videoeditor](../corpus/reports/videoeditor.json) | [trykimu/videoeditor](https://github.com/trykimu/videoeditor) | 2,245 | Unharnessed | 44/105 | 42% |
| [freecut](../corpus/reports/freecut.json) | [walterlow/freecut](https://github.com/walterlow/freecut) | 2,239 | Unharnessed | 55/105 | 52% |
| [openchatcut](../corpus/reports/openchatcut.json) | [0xsline/OpenChatCut](https://github.com/0xsline/OpenChatCut) | 2,222 | Unharnessed | 51/108 | 47% |
| [visomaster](../corpus/reports/visomaster.json) | [visomaster/VisoMaster](https://github.com/visomaster/VisoMaster) | 2,092 | Unharnessed | 19/105 | 18% |
| [vidcutter](../corpus/reports/vidcutter.json) | [ozmartian/vidcutter](https://github.com/ozmartian/vidcutter) | 1,992 | Unharnessed | 16/105 | 15% |
| [milton](../corpus/reports/milton.json) | [serge-rgb/milton](https://github.com/serge-rgb/milton) | 1,890 | Unharnessed | 21/105 | 20% |
| [react-video-editor](../corpus/reports/react-video-editor.json) | [openvideodev/react-video-editor](https://github.com/openvideodev/react-video-editor) | 1,805 | Unharnessed | 26/105 | 25% |
| [ffmpeg-webcli](../corpus/reports/ffmpeg-webcli.json) | [tejaswigowda/ffmpeg-webCLI](https://github.com/tejaswigowda/ffmpeg-webCLI) | 1,456 | Unharnessed | 21/105 | 20% |
| [android-video-editor](../corpus/reports/android-video-editor.json) | [LLhon/Android-Video-Editor](https://github.com/LLhon/Android-Video-Editor) | 1,326 | Unharnessed | 23/105 | 22% |

## Interpretation and limits

The distribution describes only this selected cohort, scanner version and pinned commits. It is not a representative estimate of media software or its developers. Harness Score measures scanner-recognized agent-workflow artifacts in a repository; a low level does not measure product quality, and a high percentage does not establish software quality or operational practice. The popularity cutoff and search query set shape the cohort. No association or causal claim between popularity and harness maturity is inferred. Blind expert ratings would be required for Q1 comparison.

The [selection issue](https://github.com/paladini/harness-maturity-analysis/issues/7) and immutable pin/source links preserve the selection audit. Generated leaderboard, heatmap, score history and site files are derived from the raw reports; the report JSON files remain the source of truth.
