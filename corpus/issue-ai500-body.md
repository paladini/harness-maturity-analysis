## Goal

Add 500 new, reproducible AI software repositories to the analysis corpus. This is an explicit expansion of the AI/LLM/agent category, which already appears in prior cohorts. It remains scanner-only and creates no blind human ratings or external-validity claims.

## Frozen selection and baseline

- Baseline: 151 repositories on main; expected total after integration: 651.
- Scanner: harness-score@1.8.1, compatible with the existing reports.
- Selection metric: GitHub stars observed on 2026-10-09, sorted descending within the bounded search union; selected range 159,604 to 3,613 stars. Stars do not affect harness scores.
- All entries are public, non-fork software with a pinned 40-character commit, root README evidence, and a source file/blob at that commit. Guides, courses, documentation-only collections, skill packs, forks, aliases already in the corpus or Showcase, and AI-incidental general-purpose projects are excluded.
- No scanned project code will be executed, installed, built or tested. Existing reports and histories remain append-only.

## Search scope and limits

The linked discovery snapshot records eight GitHub REST Search API queries, returned pages, result counts, incomplete-result flags and the full candidate records. Queries were sorted by stars descending, with up to 300 results per query (the AI-coding and AI-IDE queries returned fewer). The union is a bounded search universe, not a claim of global GitHub top-500 coverage. Observed stars are cumulative counts at collection time, not historical peaks.

Queries: `topic:ai stars:>100`; `topic:artificial-intelligence stars:>100`; `topic:llm stars:>100`; `topic:ai-agent stars:>100`; `topic:generative-ai stars:>100`; `topic:ai-coding-assistant stars:>50`; `topic:machine-learning stars:>500`; `AI IDE in:name,description stars:>100`.

## Selected repositories

Ordered by observed stars within the frozen search union. Each line contains canonical repository, GitHub numeric ID, observed stars, exact default-branch commit and a short purpose.

<details><summary>Show all 500 pinned projects</summary>

| Repository | GitHub ID | Stars | Commit | Purpose |
|---|---:|---:|---|---|
| DietrichGebert/ponytail | 1266797999 | 159604 | 9cc65d03aa2da1db7121b912d03596409ee340b8 | Makes your AI agent  |
| rasbt/LLMs-from-scratch | 669879380 | 106274 | cdbd33e6d57a71e20ea31434841095fac50cecd8 | Implement a ChatGPT- |
| infiniflow/ragflow | 730534580 | 91917 | ebb71552a2653d5c9719d1348037e15efe853b80 | RAGFlow is a leading |
| koala73/worldmonitor | 1130564872 | 88141 | d49477575bb0e6282cb03080f792989136818ee7 | Real-time global int |
| unclecode/crawl4ai | 798201435 | 85094 | 8afd0a68064ff7049303c9f9d037ab6228aac43c | Open-source web craw |
| lobehub/lobehub | 643445235 | 83084 | d65f485941cca3e558074ac080590f7efd82a9fb | 🤯 LobeHub is your C |
| rtk-ai/rtk | 1139971460 | 82784 | e12ca86afb7f87c61827975b8488be94a3706880 | CLI proxy that reduc |
| netdata/netdata | 10744183 | 80858 | 08e6119217ebf5bd9a32b6ea3c9395b3ae3e3c39 | The fastest path to  |
| unslothai/unsloth | 725205304 | 77648 | 6c723f747799b56c8ecda16d0a93523eca3a2d61 | Local UI to run and  |
| tesseract-ocr/tesseract | 22887094 | 76886 | 16fb182476ebf26e7574135a83e4cf1917f4fcc2 | Tesseract Open Sourc |
| headroomlabs-ai/headroom | 1129940957 | 74841 | a9815bbb5fa2d2347ceeeac0f01cc9f041e2ded2 | Compress tool output |
| openbq-org/OpenBB | 323048702 | 74030 | ae0268771f761b036996d81bd21522ce79d95415 | Open Data Platform f |
| Fission-AI/OpenSpec | 1032459340 | 71482 | 9111a7654d7800391459431fff4eaf66e33a3d2e | Spec-driven developm |
| FoundationAgents/MetaGPT | 660551251 | 70784 | 11cdf466d042aece04fc6cfd13b28e1a70341b1f | 🌟 The Multi-Agent F |
| code-yeongyu/oh-my-openagent | 1108837393 | 69918 | acdc869c14b051e415e325abbade0a0442dd1bc3 | OmO: Just type "mass |
| docling-project/docling | 826168160 | 68607 | d0f55469c56d38d93ed47049b8c9d17f6785e94b | Get your documents r |
| usestrix/strix | 1032808806 | 67551 | 62b496430da5df5e9e79a190e7af6f92529883a3 | Open-source AI penet |
| mem0ai/mem0 | 656099147 | 66900 | b7ad69afda6b6ed030347c66d48a13e4de9dec08 | The Memory Layer for |
| Mintplex-Labs/anything-llm | 649170660 | 66867 | 2a10d052a1812d7be12c43f9024072cf26a27a8b | Stop renting your in |
| ZhuLinsen/daily_stock_analysis | 1131513930 | 66099 | ce364e457aab288863a5707e7b3df79786ad07f2 | LLM 驱动的多市场股票智能分析系统：多 |
| calesthio/OpenMontage | 1195360525 | 65840 | 9327439db69021ab4b0e2776729bf3b58fdb5a87 | World's first open-s |
| keras-team/keras | 33015583 | 64358 | 005dc1ddb80f63a83dc9b6de50d6d2fd57a574a4 | Deep Learning for hu |
| jingyaogong/minimind | 834369920 | 63439 | f659b55761b754d306bd140573493a6543cafd7f | 🧠 Train a 64M-param |
| upstash/context7 | 955620917 | 62839 | 522c4db4fa2e1e31f1b320f09fa8c8fab376987a | Context7 Platform -- |
| sansan0/TrendRadar | 974186260 | 62761 | 064911f655667018547d15e0b87eef0d4e88ff7c | ⭐AI-driven public op |
| BerriAI/litellm | 671269505 | 60641 | 3069a467d0deb9f6cdf9c65e4b56ca93d57ff774 | The fastest, litest  |
| meilisearch/meilisearch | 130688011 | 59531 | 9d3365c81607e17ec9df1473f97d5dc9109bb1c4 | A lightning-fast sea |
| crewAIInc/crewAI | 710601088 | 59508 | 6b93fa0e25a926215ca7bb52a95d4db7d9d7262d | Framework for orches |
| MemPalace/mempalace | 1201656210 | 59485 | d439d1e6d01e2680d79fe3f5de5a336722cec779 | The best-benchmarked |
| pathwaycom/llm-app | 668195240 | 58813 | beb17f1ea0894b2430727388b78be4b26e37c16f | Ready-to-run cloud t |
| hugohe3/ppt-master | 1113573066 | 58716 | b4efe3ddf237a97a42880164759162f8e2412f2f | AI turns documents o |
| zylon-ai/private-gpt | 635240594 | 57566 | 7cd326f5a0a590fbb1d07568d995e9ad8a1a8183 | Complete API layer f |
| jamiepine/voicebox | 1141782198 | 56749 | 8af7efe62fab8d33e2a5dfbedabaa45f68a5184f | The open-source AI v |
| debpalash/VoiceStudio | 1206390571 | 56242 | 06c6e077f0fc35149efefc3561e9be5ae835d916 | VoiceStudio is the o |
| FlowiseAI/Flowise | 621803253 | 55493 | 9291856d1ea4a4ceea9f8fef8ce14f4f6c81e8eb | Build AI Agents, Vis |
| AntonOsika/gpt-engineer | 634224458 | 55040 | a90fcd543eedcc0ff2c34561bc0785d2ba83c47e | CLI platform to expe |
| lencx/ChatGPT | 575340621 | 54593 | a6de9a8b61077fa63ad5c3ecbe2bc12e0cb4b4b9 | ❄️ ChatGPT Desktop A |
| bmad-code-org/BMAD-METHOD | 965615190 | 53991 | bda3c5929f672019b90f39a3ea27259d35d00974 | Breakthrough Method  |
| CherryHQ/cherry-studio | 805155266 | 52492 | 66aa49cd7f38e35fbdd21eedfd39054d8cc51655 | AI productivity stud |
| run-llama/llama_index | 560704231 | 52448 | 6dd2f3cdd9ce7ff927ea8d46ccee08875bb00f95 | LlamaIndex is the do |
| roboflow/supervision | 571613891 | 51160 | 0802a0e79ae097bfaad45a65f94cba9a2ae2a1c2 | We write your reusab |
| upscayl/upscayl | 519577891 | 50357 | a00d55fee90e0f9435d5eaa86e76700df8199af8 | 🆙 Upscayl - #1 Free |
| mudler/LocalAI | 615869301 | 49452 | da10cbb65e4e0952ec9e15a30394b4848d29910d | LocalAI is the open- |
| microsoft/qlib | 287463830 | 49244 | 54355232463878d2eebb91fe0ee5fa7fa1f5976c | Qlib is an AI-orient |
| HKUDS/nanobot | 1147094660 | 48905 | 2748b647aa4dc22226768fdafe7078656d696e08 | Ultra-lightweight, o |
| zhayujie/CowAgent | 522158088 | 47301 | 4c97822d2541e1b2e84d11bd65ed61e9649107cd | Open-source personal |
| siyuan-note/siyuan | 291438522 | 46701 | fb3355f07d22bff36f1d785999fd5ded6a90d468 | An open-source, priv |
| LibreChat-AI/LibreChat | 600596928 | 45461 | e1dfc10449ff713faffacd60273fddcfe2c0a698 | Enhanced ChatGPT Clo |
| MadsLorentzen/ai-job-search | 1185389803 | 45390 | a011214d60f943770e33f7d5f070e1a5f91e3822 | The job search that  |
| janhq/jan | 679506386 | 44862 | f2cd837fabe99cd6b8bbe985891bab8782e4034b | Jan is an open sourc |
| Kong/kong | 26783295 | 44255 | 2d2e67ea7a90cc9d81c53177e9fdbe61bd142236 | 🦍 The API and AI Ga |
| danielmiessler/Fabric | 738733003 | 44191 | 76cd291d4704a12933263ac7cb2d667509408db2 | Fabric is an open-so |
| ray-project/ray | 71932349 | 43998 | 990ff9f6ff1977516e866aca29d7313000b83efe | Ray is an AI compute |
| gradio-app/gradio | 162405963 | 43699 | 526c24340024dfae9c9a7709aad552382ed99f86 | Build and share deli |
| deepspeedai/DeepSpeed | 235860204 | 43215 | b7f51df9713331ad8049af5d75e728010a767abb | DeepSpeed is a deep  |
| agno-agi/agno | 488641606 | 42639 | c15c55ea7d405ac8bc3414536b6aab7dfc845bd1 | Build, run, and mana |
| tinyhumansai/openhuman | 1161163182 | 41750 | bc746427c8fc227bb309b530e343dc085784f282 | The fastest, cheapes |
| AstrBotDevs/AstrBot | 575865240 | 41616 | 8763c58a98a3a404cf1aa531a7b424836d935802 | AI Agent Assistant & |
| hpcaitech/ColossalAI | 422274596 | 41437 | 99e44f1a477e08383e23e3f13376dd77f7b62a9e | Making large AI mode |
| codewhale-hq/Codewhale | 1137711311 | 41074 | f723f64f333086604cfa507bfa50b041166d03a4 | Open-source Rust age |
| photoprism/photoprism | 119160553 | 40277 | d791684158102b2bf73999486ee86ed4b33008d1 | AI-Powered Photos Ap |
| 2noise/ChatTTS | 806709826 | 39891 | 77b89ee281cd479f5b1a787ada330dc975ca1f2a | A generative speech  |
| RSSNext/Folo | 783512367 | 39075 | 0dca01f3f04e3af53ab63c1ee29c502bd515d8d2 | 🧡 Folo is the AI RS |
| VectifyAI/PageIndex | 958531089 | 39022 | 1a060dfc5c512ece03aeaa9cb80d76dbb5358bdf | 📑 PageIndex: Docume |
| chatchat-space/Langchain-Chatchat | 621799276 | 38672 | 49165d6af4438aa7e8a1f71ce276db55f4405151 | Langchain-Chatchat（原 |
| CopilotKit/CopilotKit | 655515393 | 37871 | 04bc56aeff506d8d529fe3ebd4b1b442c49fdee5 | The Frontend Stack f |
| khoj-ai/khoj | 396569538 | 37610 | ae229ca894c0b80ad84664afcfdde523b5e87057 | Your AI second brain |
| ItzCrazyKns/Vane | 784181462 | 37183 | 348feca3e378fb4157b217724ed508dc707f853f | Vane is an AI-powere |
| linshenkx/prompt-optimizer | 931352845 | 37181 | 1f8cb19c2e506cb27dfff7fe971f65d71ea65863 | An AI prompt optimiz |
| sgl-project/sglang | 740303686 | 36925 | 2d3893449380864c178ec74be0a6bf24d0131175 | SGLang is a high-per |
| babysor/MockingBird | 393571599 | 36894 | 28dc5e14f12d7c754612af2fde8e78a4b03f8616 | 🚀Clone a voice in 5 |
| JCodesMore/ai-website-cloner-template | 1180745961 | 36354 | ee3f5a2f31fd549b9593fa4f7cf6d2955ee593bb | Clone any website wi |
| reworkd/AgentGPT | 624681066 | 36294 | 18b073ab05b2902e1d052c3d2799786d8623b5e5 | 🤖 Assemble, configu |
| microsoft/graphrag | 778431525 | 36276 | 5faaaf4f5685fa2056fa8c3bf9342cb089f2942f | A modular graph-base |
| DayuanJiang/next-ai-draw-io | 953521037 | 36156 | e117095c7b7f695aa960e795fdb07d12dc854291 | A next.js web applic |
| esengine/DeepSeek-Reasonix | 1216785679 | 35749 | 65b51b7c02ffe49fdc358bd688195ff29298fa49 | A reliable coding ag |
| lyogavin/airllm | 652712035 | 35546 | 0c3a85ead842948ba846b7b114ae5f5cb38be544 | AirLLM 70B inference |
| agentscope-ai/QwenPaw | 1165324947 | 35534 | a211f474f7423a794de8b915c9a58efaa780970f | Your Personal AI Ass |
| HKUDS/Vibe-Trading | 1198306812 | 35075 | b1f6ce7194f7b90fbda3fb29c67d3e7246266f6e | "Vibe-Trading: Your  |
| qdrant/qdrant | 268163609 | 34990 | 016542aa5deb6c66380bb137badf73d54f742bde | Qdrant - High-perfor |
| can1357/oh-my-pi | 1125856365 | 34792 | 703a261df9533e74f16aa8d38e64eb41977ccf89 | ⌥ Coding agent with  |
| BVLC/caffe | 12791642 | 34552 | 9b891540183ddc834a02b2bd81b31afae71b2153 | Caffe: a fast open f |
| SillyTavern/SillyTavern | 599524116 | 34268 | 06bde939fb1e9c4c8d8641d810f0a916b5bce127 | LLM Frontend for Pow |
| datawhalechina/happy-llm | 806854629 | 34255 | 1e0b3a1e6f8936b8ba4bbd0673e8e2227d196c96 | 📚 从零开始构建大模型 |
| TabbyML/tabby | 614764248 | 33904 | 21b29048d7bcf6b94f9f482f2d0fd05efadfd19f | Self-hosted AI codin |
| Pythagora-io/gpt-pilot | 679237742 | 33650 | 9b763fdaf0020c7d8abacc7b58b2b09e57494623 | The first real AI de |
| lutzroeder/netron | 1198539 | 33554 | 0bf5d6f0cb6dba6be7cb13e2beb90c6de349e4d0 | Visualizer for neura |
| iOfficeAI/AionUi | 1033778670 | 33398 | 6744099b279b991c17e31c243f0920477bd31cb6 | Open-source 24/7 Cow |
| eriklindernoren/ML-From-Scratch | 80990461 | 32963 | a2806c6732eee8d27762edd6d864e0c179d8e9e8 | Machine Learning Fro |
| zeroclaw-labs/zeroclaw | 1156956890 | 32948 | 3465758fb70ee59290754dc7d0aee442b7cdcc2d | Fast, small, and ful |
| Tencent/WeKnora | 1024118326 | 32829 | 602d0c388bf17d894f467fe0cd65d1d62c73d303 | Open-source LLM know |
| datawhalechina/self-llm | 719367888 | 32416 | e0fe14a35123f5cab6d32cb9e716b571bf0994cf | 《开源大模型食用指南》针对中国宝宝量身打 |
| onyx-dot-app/onyx | 633262635 | 32375 | 15733cd8789b6a450144107e08ee859e54ff4e2d | Open Source AI Platf |
| facebookresearch/fairseq | 101782647 | 32207 | 3d262bb25690e4eb2e7d3c1309b1e9c406ca4b99 | Facebook AI Research |
| feder-cr/invisible_dots | 837911756 | 31910 | 569ccda4758c640e9f60f2ec97ca0bf70d409695 | Open-source, self-ho |
| topoteretes/cognee | 679343504 | 31905 | 0ec7a9fa61c9ff04bf7e02e0d57af363a993a5e1 | Cognee is the open-s |
| iOfficeAI/OfficeCLI | 1182212878 | 31765 | 699cafbc8f0b8a7841c6cca53dafd0c24e982f56 | OfficeCLI is the fir |
| jumpserver/jumpserver | 21484781 | 31732 | 0bde65ae085e259750d2baf053719f6cc903df0e | JumpServer is an Ope |
| ScrapeGraphAI/Scrapegraph-ai | 749126547 | 31659 | 194055e203afce41ed4e70365dbc416bad756115 | Python scraper based |
| Zackriya-Solutions/meetily | 908589694 | 31568 | a2cb62e827da7ef59f65064c97233efb2313878e | Privacy first, AI me |
| Lightning-AI/pytorch-lightning | 178626720 | 31394 | 84df182f50ab34301aabb3c0eb4031815bfb413d | Pretrain, finetune A |
| decolua/9router | 1128025899 | 30528 | ce4460ef79382bfddb4aa5fc0ff9f3cb0d5f95a8 | Unlimited FREE AI co |
| ComposioHQ/composio | 762304524 | 30475 | f9ce49953598e13371c406ac346846696a4d8385 | Composio powers 1000 |
| ahujasid/mcp-for-blender | 944414751 | 30324 | 7a0373ec9199183cb460068c4f96aed9c579fb4f | Community plugin to  |
| oraios/serena | 953683578 | 30132 | 1de556f71569f3acfc0743e526dd60aca40a545e | A powerful MCP toolk |
| langchain-ai/deepagents | 1027384981 | 30081 | a2ad7b8b2c4db7865db31825eb238f1f279e63e6 | The batteries-includ |
| JaidedAI/EasyOCR | 247266215 | 30059 | 363afb184047ce452e436f4224f3098422df872e | Ready-to-use OCR wit |
| assafelovic/gpt-researcher | 639835356 | 29977 | 0957c301ed06c2a5857b834358c7227c739041d4 | An autonomous agent  |
| jackwener/OpenCLI | 1181982220 | 29975 | 24136945847afbfad266c6c46a8cd335377f9112 | Make Any Website int |
| Anil-matcha/Open-Generative-AI | 638513786 | 29945 | d8d624dcf48a581fde18102f53d76a01a95ec58c | Unrestricted Open-so |
| openai/openai-agents-python | 946380199 | 29933 | 125efa029b4bfd84238bd2c4fd69c3406f802663 | A lightweight, power |
| simstudioai/sim | 912559512 | 29792 | b1b084ddb2262385dfba07e359818d084604e532 | Sim is the collabora |
| labring/FastGPT | 605673387 | 29788 | 95c6a2b58cf29b6b511e86a155d3a4efc0ac13a5 | FastGPT is a knowled |
| chroma-core/chroma | 546206616 | 29471 | 5f30478c11ffdcf8cba1f872993c29d8f84ce0d9 | Search infrastructur |
| alibaba/page-agent | 1062458369 | 29359 | 9eb6b6646500264d9034dd466a4270cb9fc1ef1e | JavaScript in-page G |
| rohitg00/agentmemory | 1166408297 | 29263 | da91cc05b3c79c59f6c0480f728bb9c09127e000 | #1 Persistent memory |
| yamadashy/repomix | 828119367 | 28772 | 8d6429121e98ed178e4d3a975c2bdbbecc958c4a | 📦 Repomix is a powe |
| mastra-ai/mastra | 839037098 | 28673 | 918704fd4608aa4d9d90d4d92c0a3429de2b880a | Mastra is the modern |
| microsoft/semantic-kernel | 607289185 | 28636 | 11f072362e24207da9db55779c0fd73eb15123b1 | Integrate cutting-ed |
| srbhr/Resume-Matcher | 253975496 | 28614 | 29fc1fec57ec3f8c468687a53cb7302db5000e83 | The #1 AI Harness fo |
| invoke-ai/InvokeAI | 525592995 | 28501 | eb25293ce2a29d27b893a0a21e1a6d68980a92e5 | Invoke is a leading  |
| QwenLM/qwen-code | 1008713177 | 28383 | 085a44f336dc94ce43e46daaa3a035ff7bf32720 | An open-source AI co |
| mlflow/mlflow | 136202695 | 28330 | 0a881c229f6aa5118fd5322f28d2b99f183ad235 | The open source AI e |
| OtterMind/Chat2DB | 656227652 | 28305 | ea3a5c68ca290199dc86726706eb3006495ca34f | Chat2DB is a free, c |
| fastai/fastai | 102973646 | 28218 | 46231bdc3e88a457c940dd7bde8a03c92fb42901 | The fastai deep lear |
| eyaltoledano/claude-task-master | 942837343 | 28184 | c0c98d367c55296bfe69e65680625b6db437af02 | An AI-powered task-m |
| svc-develop-team/so-vits-svc | 612139233 | 28087 | 730930d337d171479eadf305f96cbed4bb393e77 | SoftVC VITS Singing  |
| TencentCloud/TencentDB-Agent-Memory | 1203558071 | 27859 | c4a06f2b4e89dcc830cdfde09472c1e4368f318f | TencentDB Agent Memo |
| Kilo-Org/kilocode | 946087422 | 27537 | fb7e96eda5409517a05948b9efaf01c53997bf6e | Kilo is the all-in-o |
| Fosowl/agenticSeek | 935604638 | 27463 | 9a2df27c121b902d073f1a6fd5e2a833ca4a0e18 | Fully Local Manus AI |
| vercel/ai | 644461337 | 27212 | 1f7e5ad1f5cefbfc6948ade2cfa8454bf44b7bc2 | The AI Toolkit for T |
| onlook-dev/onlook | 820087727 | 26887 | 423e2e924366419e418ee049093872d535eea41a | The Developer Tool f |
| mozilla/DeepSpeech | 60273704 | 26770 | 6913ae817bc09159c64def7f130708682c197ba3 | DeepSpeech is an ope |
| deepset-ai/haystack | 221654678 | 26707 | c5e13354117d1376d4d8caf0efe77abe80120fc0 | Open-source AI orche |
| humanlayer/12-factor-agents | 957658915 | 26626 | d20c728368bf9c189d6d7aab704744decb6ec0cc | What are the princip |
| shap/shap | 74505259 | 25801 | 6514e362205190554db658ac6e03c2f6d971d51b | A game theoretic app |
| browserbase/stagehand | 776908852 | 25594 | 1fc884992b68a0196ea5c6e96cc29924b0922ef4 | The SDK to extract d |
| lucidrains/vit-pytorch | 300996055 | 25537 | c3622978f68a114b5ae45c4322b54391b24f5c3d | Implementation of Vi |
| toon-format/toon | 1081397957 | 25477 | e247c423e0a38bca3477b17fecdf6ef4feeb5584 | 🎒 Token-Oriented Ob |
| liguodongiot/llm-action | 644235905 | 25145 | 3a1e24448ec451108f448580fa8a37f04ee834f2 | 本项目旨在分享大模型相关技术原理以及实战 |
| flipped-aurora/gin-vue-admin | 205679232 | 25049 | bcc3d1475aa0ea9bf24e281888fb53be1452a2e8 | 🚀Vite+Vue3+Gin拥有AI辅 |
| activepieces/activepieces | 573661753 | 24967 | 945ac21284fa4103bc6f3c52a78c55f457f7e6b3 | AI Agents & MCPs & A |
| trekhleb/homemade-machine-learning | 155662306 | 24813 | 963d77f17f66da1f8357cb71e3680fb212e4684d | 🤖 Python examples o |
| nocobase/nocobase | 306829688 | 24509 | a879e4d8aae9427644cacb035ec54efcd5045596 | NocoBase is an open- |
| PaddlePaddle/Paddle | 65711522 | 24120 | 8f9b58186cddfb59a3689ed08d9a0b26f6672e4e | PArallel Distributed |
| Tencent/ncnn | 95879426 | 23928 | 1efcd3ac4a20a136cb9b5234465118a0d95eb38e | ncnn is a high-perfo |
| sinaptik-ai/pandas-ai | 631258918 | 23864 | bbbb771d31062d81f6fa19bafb40620d5cbe48f4 | Chat with your datab |
| guillaumemeyer/watermarks-remover | 1331135699 | 23708 | c5297e9e69fec0779c29127c7892427e673fafd9 | A privacy-first app  |
| coleam00/Archon | 929121414 | 23656 | 7009a90a089adb16a545141dc162b9aaa988b4dd | The first open-sourc |
| mlc-ai/mlc-llm | 634081686 | 23226 | 8978ea9aec626d64096aaa92fbc89bda2e3ea802 | Universal LLM Deploy |
| Skyvern-AI/skyvern | 764723738 | 23164 | f5f3f28a9ce0021a1db24286928a7bff6582a1eb | Automate browser bas |
| ifixai-ai/iFixAi | 1222527844 | 23011 | bef9c5eeb96fd255d83ee00a2930c4d19a329f6c | Independent Auditing |
| jundot/omlx | 1157171418 | 22665 | c0b1056b41ebde9422af316cf5038a423eb8f24c | LLM inference server |
| comet-ml/opik | 638951438 | 22475 | ddde88854f9c2e64f812c04bd80d11fb01abadf7 | Debug, evaluate, and |
| winfunc/opcode | 1004995740 | 22416 | d1ca30a3c0c39fff01fde2f86c2d5af6a1db658b | A powerful GUI app a |
| BuilderIO/gpt-crawler | 718379614 | 22402 | d2245d66a5ad60bf227a55c849135394cbecc9b5 | Crawl a site to gene |
| steipete/CodexBar | 1097695258 | 22348 | b8c6a1eb8b0e67754806b9aabe0a0186e201afc9 | Show usage stats for |
| k4yt3x/video2x | 122758193 | 22113 | 7db9c18d6278bbad9c3eda0e4e4ae210f9a688eb | A machine learning-b |
| huggingface/datasets | 250213286 | 22044 | 9e7496a4d11caf68da2846d84c9596cda4a4f984 | 🤗 The largest hub o |
| QwenLM/Qwen | 674075444 | 21892 | 2df8e8ac450fa185c421a08b0090ef81826caa6e | The official repo of |
| teableio/teable | 560299175 | 21876 | 5ef2238883cad7c3980084de9a9031135fb9734f | ✨ AI Spreadsheet for |
| dyad-sh/dyad | 964395174 | 21798 | 4764c7f20b764b66ead32b836480965efcf8f970 | Local, open-source A |
| google/adk-python | 958830659 | 21759 | 10b24434ec076cd3f8bb0266717fc7754b7deb7e | An open-source, code |
| coze-dev/coze-studio | 1008726722 | 21694 | fefb05ff27be1da939612fbf9faf5db62583b8ae | An AI agent developm |
| Zeyi-Lin/HivisionIDPhotos | 655413331 | 21611 | 5c191e2577f14755a69d9df6db415fab23aca484 | ⚡️HivisionIDPhotos:  |
| onnx/onnx | 102692863 | 21572 | 03c0c21b25b18a5f04e6a01b489ee6ef25003ade | Open standard for ma |
| AI4Finance-Foundation/FinGPT | 600544354 | 21392 | fdb04c9a273d1ccc3764b09b8e3ed1e708e57566 | FinGPT: Open-Source  |
| RasaHQ/rasa | 70908208 | 21345 | 60a3cff9c08183760355b07bd60f5223d8916d6b | 💬 Open source machi |
| stefan-jansen/machine-learning-for-trading | 132754148 | 21277 | 24849f728c98b8b12d4b7d1c140d7d44e0321332 | Code for Machine Lea |
| jnMetaCode/agency-agents-zh | 1174369519 | 21145 | e5a6c0a730878aaa871ec5b95859aec2c2728475 | 🎭 277 个即插即用的 AI 专家角 |
| cube-js/cube | 149026292 | 20985 | b162d11cc48a681b77c6d9cb9e957662bfa06251 | 📊 Cube Core is open |
| hypit-ai/hypit | 1316470719 | 20581 | 85e01c76716498e6ec5b8bdfb6b374ca67f0195a | Clone any viral vide |
| SWE-agent/SWE-agent | 780737106 | 20512 | 3ea751c087f32b16e039a2233dd6eefecef325d5 | SWE-agent takes a Gi |
| 1jehuang/jcode | 1128204614 | 20371 | 02ae3edc0a424410eefa61fd2c4f69a54ead1508 | High performance cod |
| kortix-ai/suna | 868173144 | 20262 | afc5e8d039680c9c0a16fbfaca953c9ff88e6927 | The open-source AI O |
| camel-ai/owl | 942114501 | 20151 | d67601b245bb91a38876c603cb8a70aa2f5faae8 | 🦉 OWL: Optimized Wo |
| eosphoros-ai/DB-GPT | 627480054 | 20106 | ad203de5c7301c9a103caa1198d17aaee18c6647 | open-source agentic  |
| Alibaba-NLP/DeepResearch | 914316754 | 20024 | f72f75d8c3eb842f2bbbab096a12206ff66e270f | Tongyi Deep Research |
| dzhng/deep-research | 926861272 | 19772 | 1f8f3e285bbc23e80b98a66a64effab9069f3ad4 | An AI-powered resear |
| Unity-Technologies/ml-agents | 102904613 | 19727 | 2f97e1cbb408fe40169b720aa82a46f3f8a0a8e9 | The Unity Machine Le |
| agent0ai/agent-zero | 812975380 | 19402 | e3051fb584b1a36be2b0a0c90606f1c2c2d356ec | Agent Zero AI framew |
| nari-labs/dia | 969010919 | 19400 | 876125e461a03b157ec905b0fe8b57a0f8b9e7a0 | A TTS model capable  |
| danielmiessler/LifeOS | 1052845083 | 19370 | 5e2f2e8c0abde612da0e99c16c0d07d4ec21b88c | ⛰️ LifeOS — The univ |
| mlc-ai/web-llm | 627561173 | 19250 | fb3a7fc2149e21fd926bd29a611bf8cfda8a4846 | High-performance In- |
| ymcui/Chinese-LLaMA-Alpaca | 614325365 | 18930 | 5b8bb552e8b738da0f19a8e2cedf6db6b5c3fd14 | 中文LLaMA&Alpaca大语言模型+ |
| lightgbm-org/LightGBM | 64991887 | 18851 | b807c224dc44c3c9579d2303232b1e85ecf18fe6 | A fast, distributed, |
| jlcodes99/cockpit-tools | 1135492298 | 18760 | be24ce6171279741c2cd141bc02bd9f380f4b67c | 🚀 通用 AI IDE 账号管理工具： |
| google/magika | 681566005 | 18701 | 2136599b6943fe32e3aef94e96620ea14cbc8e62 | Fast and accurate AI |
| microsoft/agent-lightning | 1004147641 | 18625 | 69f5a40b36d9bff646b8e7a5532e8b78bd41eaf9 | The absolute trainer |
| UFund-Me/Qbot | 569509049 | 18581 | f0425ae4ae8bd02b79656b8f7039f4cd6874095e | [🔥updating ...] AI  |
| NVIDIA-NeMo/Speech | 200722670 | 18564 | e4a34fd25f895ecd7f64f0e56bc288165e078da9 | A scalable generativ |
| microsoft/AirSim | 81887991 | 18543 | 1ca93f6f77e4e8a39b2b241c1fe2764da4d7dd41 | Open source simulato |
| teambit/bit | 79723839 | 18494 | f1600c566a328465c7a1f096102aa6dd8ad51dc7 | AI-powered developme |
| arc53/DocsGPT | 596516907 | 18313 | 0d994485d2ac5e3a1eff6020ccbe7d4f99adc612 | Private AI platform  |
| emcie-co/parlant | 758197374 | 18298 | ea737442b8ae65854a842542e544fbe7e6144bad | Build reliable custo |
| xming521/WeClone | 750678695 | 18286 | 6ded5330bb653050ae36fbcf371282b01e9e4e24 | 🚀 One-stop solution |
| RightNow-AI/openfang | 1166139870 | 18215 | acf2587e46be174c10200489c9a2d23a39a98aeb | Open-source Agent Op |
| avante-corp/avante.nvim | 842586148 | 18178 | 4f49656657d0e1b55a03c23510ccc1ef1eeaa9e9 | Use your Neovim like |
| AsyncFuncAI/deepwiki-open | 975318071 | 18157 | d92819a9c9f3b99416e3580ff235fc9d3adf8b89 | Open Source DeepWiki |
| langbot-app/LangBot | 575321313 | 18068 | 4c7592887d537bce916703bd9ecfb651d0ae2ed6 | Production-grade pla |
| rowboatlabs/rowboat | 916009087 | 18002 | 72e9d8ca73362f16f96f7fe54925dc2010a87cda | AI coworker with mem |
| camel-ai/camel | 615510678 | 17843 | 24fde60ad739b4be8f8f533fea9ba54256fbc4a2 | 🐫 CAMEL: The first  |
| Canner/WrenAI | 771350543 | 17830 | fedf182b4bb8294623d9cc0a9db4fbae1edf63fb | GenBI (Generative BI |
| rocketride-org/rocketride-server | 1155576139 | 17808 | f6537c86498641c41728407f35bee8ce360dac9b | High-performance AI  |
| TransformerOptimus/SuperAGI | 640182997 | 17701 | c3c1982e7bd6a11cfed53c5a193ea502f924b1b6 | <⚡️> SuperAGI - A de |
| NVlabs/instant-ngp | 444886996 | 17568 | abe236ee00cf90cfca6e36e65c00435d5b21f50a | Instant neural graph |
| tensorflow/tensor2tensor | 94460704 | 17477 | bafdc1b67730430d38d6ab802cbd51f9d053ba2e | Library of deep lear |
| tradecatlabs/vibe-coding-cn | 1102195393 | 17350 | a800de9bf939d8b8c7dd1e22756ddbd19780bd25 | Vibe Coding 从入门到精通教程 |
| lidge-jun/opencodex | 1273824907 | 17193 | 19bd34a15354ba8c21fca89598fb18467f9cf9ee | Universal provider p |
| MemoriLabs/Memori | 1025381911 | 17148 | 574b1ea3e876f100ef82c37817d603eb7e258e59 | Memori is agent-nati |
| citrolabs/ego-lite | 1212503250 | 17016 | dca7003349c5f7132189ba00547cbbd7ff8e597e | The fastest browser  |
| cft0808/edict | 1164832776 | 16979 | 14a207557719c046af0f993a7bff1cc5a5015b33 | 🏛️ 三省六部制 · OpenClaw |
| HBAI-Ltd/Toonflow-app | 1145022970 | 16974 | 2c7fb257affb65777110fe4c6e60cd3c09187d9b | Toonflow 是开源 AI 创作平台 |
| xbtlin/ai-berkshire | 1203777920 | 16673 | a221a20def751ec03a82c15caca03634b0ca90b2 | AI 时代的伯克希尔：基于 Claude |
| udecode/plate | 225260962 | 16646 | 45aee8fd81a596fad5efc4e61ab377bb225fb11c | Rich-text editor wit |
| browser-use/web-ui | 910986056 | 16606 | 61962296c38a0d064e0ba02c827192b7a81d1819 | 🖥️ Run AI Agent in  |
| lukas-blecher/LaTeX-OCR | 320628155 | 16587 | 5c1ac929bd19a7ecf86d5fb8d94771c8969fcb80 | pix2tex: Using a ViT |
| mayooear/ai-pdf-chatbot-langchain | 615113749 | 16585 | 4b2647c41992a50b72ff6befb9a0bd71461e3dbe | AI PDF chatbot agent |
| memvid/memvid | 991431142 | 16583 | e6bd9f7b9c38cd8d5370fa0fc936ac1dcd751813 | Memory layer for AI  |
| emilwallner/Screenshot-to-code | 107119649 | 16536 | f7f8ceee38094e990fec5a76e10f50d8b91a5033 | A neural network tha |
| ai-shifu/ChatALL | 625187946 | 16503 | 6d089c2ab72dde2ba1010cc1e910ceb766458546 | Concurrently chat wi |
| ddbourgin/numpy-ml | 179893494 | 16322 | b0359af5285fbf9699d64fd5ec059493228af03e | Machine learning, in |
| pipecat-ai/pipecat | 736272311 | 16310 | 0123a2eacd5993edb7ed3a5c0c4b435d67feff21 | Open Source framewor |
| WEIFENG2333/VideoCaptioner | 881171866 | 16199 | 95842ecb5618c0b6a548a336bdfb0eb859bdb501 | 🎬 卡卡字幕助手 / VideoCap |
| alibaba/MNN | 181436799 | 16198 | 9c1788748c4d8aba00f9b644f50f5c15576d7d80 | MNN: A blazing-fast, |
| tracel-ai/burn | 515368123 | 16082 | 88b8dd55e156f53edb57e721c2a66fa98b2532ba | Burn is a next gener |
| apache/doris | 99919302 | 16044 | b527efd6e78d8bac541ae4ac3560a199bef3cc17 | Apache Doris is a re |
| vibrantlabsai/ragas | 637924634 | 15975 | 298b68274234c060deacab3cf5fb52aa3a20e885 | Supercharge Your LLM |
| GLips/Figma-Context-MCP | 931892749 | 15964 | c083d65c7e002923e7cb98f4e3bdafb105e90f6d | MCP server to provid |
| budtmo/docker-android | 77145066 | 15954 | 21926469063a3401685229deb5f8dce4babdfa16 | Android in docker so |
| coderamp-labs/gitingest | 895942941 | 15876 | 4e259a02fe72115bee538271622f1234a81c8e1a | Replace 'hub' with ' |
| GreyDGL/PentestGPT | 607013954 | 15860 | e8b1bb77d1ac00329675cec3b060aba971ec1ac8 | Automated Penetratio |
| opensandbox-group/OpenSandbox | 1118085970 | 15758 | 531700ca18a7fa5fab6a2f25d6dc68a76eddab12 | Secure, Fast, and Ex |
| Anionex/banana-slides | 1106663535 | 15725 | bf7d6406c4b40619bdec6c799a4d36a750652588 | 一站式原生AI PPT生成应用，几分钟内 |
| plandex-ai/plandex | 709538270 | 15704 | e2d772072efadbe41d2946d97d79be55532dbab5 | Open source AI codin |
| Unstructured-IO/unstructured | 541798154 | 15555 | e2f22b38b995858c870dade7cbf6fcf06a9c801c | Convert documents to |
| zai-org/ChatGLM2-6B | 657895120 | 15497 | cb8e8b43c0951b32614f25c03e1ab593a0603a1c | ChatGLM2-6B: An Open |
| ggml-org/ggml | 538180525 | 15459 | ffa4e8b80930029a35991f94e7c8a93cd67730ab | Tensor library for m |
| yc-software/qm | 1316527318 | 15370 | 81a08e00eb103955ae383b0bb1e486d428c7e466 | Multiplayer agent ha |
| ConardLi/easy-dataset | 942756187 | 14983 | 4002b09d9c5726cafb9f61a8d12765cb96a2d94b | A powerful tool for  |
| botpress/botpress | 73964895 | 14947 | 7fbb9e570eb3dc96f09bdc5413420c81f0155ca7 | The open-source hub  |
| kyegomez/OpenMythos | 1214346700 | 14912 | 155430a88d2a98322fc4c79b2a067792c3c9579a | A theoretical recons |
| xcanwin/KeepChatGPT | 620458878 | 14900 | bdc253cb96bdf7f4741d9bf87c4c6532967ffdb3 | 这是一款提高ChatGPT的数据安全能力 |
| microsoft/RD-Agent | 781261349 | 14870 | 484776c211e4fbbeef03e0ec00d6bbee7362a4f4 | Research and develop |
| llmware-ai/llmware | 698288684 | 14820 | 33b611adeb3378a474b69f12d303d1750babad41 | Unified framework fo |
| CoplayDev/unity-mcp | 950564038 | 14796 | 142ea0af4890337f0ff6658df61db23982313717 | Unity MCP acts as a  |
| LlamaChinese/Llama-Chinese | 668122773 | 14765 | 6fa0fffb0dd82fe3cfaa1449ee54a5806d26ae9b | Llama中文社区，实时汇总最新Llam |
| aleju/imgaug | 38900806 | 14744 | 0101108d4fed06bc5056c4a03e2bcb0216dac326 | Image augmentation f |
| Usagi-org/ai-goofish-monitor | 1020672081 | 14728 | 097c91107a793ef26c14d66621f6748ba7a8ba73 | 基于 Playwright 和AI实现的 |
| livekit/agents | 707441527 | 14666 | 294de277c49ffa879ff7194a08f87c1a96a87a99 | A framework for buil |
| casdoor/casdoor | 306366900 | 14532 | 43a6aabc68d7790d1698bd9eb50ef0f682952516 | An open-source Agent |
| gunthercox/ChatterBot | 24561828 | 14518 | 10b56f750f3bcbff745a24c93ccfc00e3258c9bc | ChatterBot is a mach |
| waooAI/waoowaoo | 1139782619 | 14459 | dfec20e32298ed675050329e4a41477024148399 | 首家工业级全流程 AI 影视生产平台。I |
| davisking/dlib | 16331291 | 14455 | ac7d55406eae4faf59603df2b27d33057ba2b1a9 | A toolkit for making |
| fathah/hermes-desktop | 1199668171 | 14382 | 2ed89070bc6c9e8231a37bb55df8a7722a3776b8 | Desktop Companion fo |
| microsoft/nni | 135673451 | 14367 | 767ed7f22e1e588ce76cbbecb6c6a4a76a309805 | An open source AutoM |
| deeplearning4j/deeplearning4j | 14734876 | 14269 | 4c22ac5fe4a8350d05d224e7f4499429f7f69c93 | Suite of tools for d |
| microsoft/agent-framework | 974445592 | 14037 | fd52de71579162a888fb2dd7510c57c6014dcdfc | A framework for buil |
| nanobrowser/nanobrowser | 910418754 | 14026 | ad47282a17ecdfb894745af093e0f7332fc1f71a | Open-Source Chrome e |
| Open-LLM-VTuber/Open-LLM-VTuber | 722844356 | 14026 | 992309c0aa19845960228f880013d4685fde93b5 | Talk to any LLM with |
| semantica-agi/semantica | 1008304614 | 13866 | 5115dc322d592e9a542977c2a03e41c5bf6e67ef | Graph-Native Infrast |
| browseros-ai/BrowserOS | 985839104 | 13854 | 9d4eaf6ae878390f4341171f0a5b8d354deaddba | 🌐 The open-source A |
| apache/tvm | 70746484 | 13814 | 4e03bc537db3ded29e29d41d2bd8c4b13426a807 | Open Machine Learnin |
| opencode-ai/opencode | 949662713 | 13791 | 73ee493265acf15fcd8caab2bc8cd3bd375b63cb | A powerful AI coding |
| cactus-compute/needle | 1165361576 | 13734 | ef3cf7543204d99878c0dd913a05f6a506da4be8 | Automation foundatio |
| BasedHardware/omi | 776121034 | 13673 | a1cfd2683b38cff64522a890acb5ea8467ef0567 | AI that sees your sc |
| doocs/md | 218952803 | 13409 | d9132ab5a1f8f907ebf6107abd76f2c54586b429 | ✍ WeChat Markdown Ed |
| huggingface/speech-to-speech | 839428333 | 13408 | a32e945579b123f99a0d3cb2a692669dc6ac5b7f | Build voice agents w |
| EverMind-AI/EverOS | 1085086903 | 13383 | d2aa9494da062246e665a21e3f045583d81df90f | One portable memory  |
| The-PR-Agent/pr-agent | 662766482 | 13321 | 668b9bd6eb2a6f37d38f6e536fec7ce38764d995 | 🚀 PR Agent: The Ori |
| cloudwego/eino | 898304583 | 13268 | 58d184303f4e73413c454a9626f79c17af0fd9fb | The ultimate LLM/AI  |
| langchain4j/langchain4j | 656264456 | 13221 | 872eca4b97b85a42f8409d0437ed4fc1994157b5 | LangChain4j is an id |
| YaoFANGUK/video-subtitle-remover | 709603902 | 13205 | e109b9ddc1d0e8f153199dfa05c1d767546906d8 | 基于AI的图片/视频硬字幕去除、文本水印 |
| Portkey-AI/gateway | 682080300 | 13159 | 669825cbe89ee51569918b8f78a9db486fd69dd4 | A blazing fast AI Ga |
| InsForge/InsForge | 1028159967 | 13070 | 2ec64b6734e331119979a88883336fce6e30b9ba | The all-in-one, open |
| NoFxAiOS/nofx | 1084802670 | 13020 | ef476f28926c7d0c03f105a19b18f91e30a652a7 | Your AI trading term |
| neuml/txtai | 286301447 | 13000 | ca9563daac12ec14cb6eb807a420803941c6b4ea | 💡 All-in-one AI fra |
| jacobgil/pytorch-grad-cam | 92983437 | 12994 | 704393448a7b0c620ee2c2b9597723f1d7f17b3d | Advanced AI Explaina |
| codexu/note-gen | 838659679 | 12878 | a4d912f853d1ed502b057059a6bbbc23b47e784a | Capture first. Organ |
| simonw/llm | 622352364 | 12600 | 05d7ae7dedc524b024ab463b063854e7c43fee01 | Access large languag |
| mrexodia/ida-pro-mcp | 954963562 | 12582 | c133c3853faa111a9b00ee615c013b720d0c4acd | AI-powered reverse e |
| 0x4m4/hexstrike-ai | 1017550802 | 12574 | d689933ff579d839c676c82b231f8e98326c5f04 | HexStrike AI MCP Age |
| bentoml/OpenLLM | 629749002 | 12554 | ec2355ce1a75176164c451cbb7592b3046531540 | Run any open-source  |
| datalab-to/chandra | 1072539730 | 12484 | d4f7467435aa4137d9539f000ddf0b7ced3eb43f | OCR model that handl |
| elie222/inbox-zero | 665613753 | 12437 | 7524881a876272d2130c7011b65626af5afd1d97 | The world's best AI  |
| TheR1D/shell_gpt | 590604203 | 12291 | a082bd5327ce0c4ef5a0284d9060e833be9444a6 | A command-line produ |
| bytedance/trae-agent | 1001452682 | 12130 | e839e559ac61bdd0e057c375dd1dee391fee797d | Trae Agent is an LLM |
| jina-ai/reader | 784546140 | 12124 | 1574bfd380d249c86c82db4dace0d9c8fe17e2b1 | Convert any URL to a |
| calesthio/Crucix | 1181479848 | 12090 | 3db7068817e0c815df353fa0f19657c85142789d | Your personal intell |
| FareedKhan-dev/train-llm-from-scratch | 915520679 | 12029 | bdd480a518094ca834e05ab32131dc126b522d3d | A straightforward me |
| dataelement/bisheng | 684031003 | 12028 | ed3b46171de940736d7c4c3710ac041967c22a17 | BISHENG is an open L |
| tadata-org/fastapi_mcp | 944976593 | 12018 | e5cad13cabfc725bbcb047e526816d887d96da62 | Expose your FastAPI  |
| LMCache/LMCache | 807305060 | 11983 | ee68e5ba955cb51147767c207fc462932b87ab04 | LMCache: Supercharge |
| altic-dev/FluidVoice | 1061327311 | 11974 | 7daffb529fb9f7c8d075f686a2d3da34695a66e4 | Fastest and only mac |
| h2oai/h2ogpt | 618613272 | 11948 | 5af700f5bdd155816de33cf95a41ced8393c48dc | Private chat with lo |
| ludwig-ai/ludwig | 163346054 | 11772 | 0e84ffa776d5707c9200fb475611834250343d2e | Low-code framework f |
| MemTensor/MemOS | 1014729376 | 11770 | a7367d07e55db61099f7b4e2c1108bc5831a24f3 | Self-evolving memory |
| tensorzero/tensorzero | 829640443 | 11709 | 62eb8f63e8ec62018d70420dbf1a8c5d1c026315 | TensorZero is an ope |
| cleanlab/cleanlab | 132975485 | 11692 | 750625747de1b26d8530954f51f0530bd0b51d3c | Cleanlab's open-sour |
| jo-inc/camofox-browser | 1142274728 | 11506 | 39c82094013480b373df6600d44c7f036f58356e | Stealth headless bro |
| holaboss-ai/holaOS | 1188521544 | 11447 | 4684714ee133794cdbb86630e42b7d93447fb2e2 | Open-source agentic  |
| cobusgreyling/loop-engineering | 1263648864 | 11444 | 0978edd85966d77703522ca3a7974314db92d5d4 | Practical patterns,  |
| kornia/kornia | 145693916 | 11411 | 58262b9f14421b4b899167f7dfb803931c045f58 | 🐍 Geometric Compute |
| openchamber/openchamber | 1054790989 | 11346 | c2d14f3e92e8a7f6ec2e24365969a29c7f0cda3f | Agentic Development  |
| linyqh/NarratoAI | 841472636 | 11341 | 9fa69e022d4add41205ee385207561df8796b3f1 | 利用 AI 大模型，一键解说并剪辑视频 |
| EKKOLearnAI/ekko-studio | 1207639951 | 11338 | 46ae5f6fc78bc98be68d4e11fc850538aa030d53 | Ekko Studio is a loc |
| lucidrains/DALLE2-pytorch | 478823173 | 11299 | 680dfc4d93b70f9ab23c814a22ca18017a738ef6 | Implementation of DA |
| wandb/wandb | 86031674 | 11273 | 9e1db608f34b5b87a51b7e83c8a2ea29a3bf4d3d | The AI developer pla |
| microsoft/promptflow | 660489378 | 11243 | 3928a727b406e66d64ff42621534bb58e0ca18ce | Build high-quality L |
| The-Pocket/PocketFlow | 907624056 | 11228 | f74d023f93607b8c3268133339a5e532a949898c | Pocket Flow: 100-lin |
| tambo-ai/tambo | 815634288 | 11185 | 6e2c1bff3b68a00c094b6d876788cc8f33f7bb02 | Generative UI SDK fo |
| rushter/MLAlgorithms | 70036319 | 11178 | e31f5f768707da216f650aeca267c98703fb7cf5 | Minimal and clean ex |
| voxel51/fiftyone | 257913595 | 11165 | 81e85efba226869543bad2801944c385e1c34268 | Refine high-quality  |
| bytebot-ai/bytebot | 926709003 | 11077 | 3d37894ce07ef8d8b40adc7fd309ad96c2a71313 | Bytebot is a self-ho |
| triton-inference-server/server | 151636194 | 11061 | 20e8b513baf37405e0f528b95b4cd8dee7f2a584 | The Triton Inference |
| presenton/presenton | 981177285 | 11016 | 7376573fb30e4faf6225ff77d2cc74d06634b2e0 | Open-Source AI Prese |
| alibaba/spring-ai-alibaba | 854337508 | 10981 | 17e26ff6fe951d605771c1845229ca3edb043634 | Agentic AI Framework |
| openvinotoolkit/openvino | 153097643 | 10975 | d3c3a1b09fc06ae57ed4181c873b362f34400513 | OpenVINO™ is an open |
| getumbrel/llama-gpt | 669601481 | 10930 | 43994a365ffb067d58fc36cd363b2114a9037a48 | A self-hosted, offli |
| TykTechnologies/tyk | 19537979 | 10855 | e48d03b18a264d20de9a5cc46fe7bef48737aca5 | Open Source API and  |
| langchain-ai/open-swe | 987975584 | 10830 | 5edd6249da2d11996eefa61ab68b4af70321708b | An Open-Source Async |
| mistralai/mistral-inference | 697302510 | 10822 | 9eaeb91c17450e09021b6065a1d5cc69876507c8 | Official inference l |
| doccano/doccano | 132709824 | 10792 | ab6b765ea326d07b2b806a4280cd097565e62321 | Open source annotati |
| codota/TabNine | 156332497 | 10767 | c1d225f98b5504ce27ff9fa243e5ea0dcffb8f00 | AI Code Completions |
| VoltAgent/voltagent | 967530387 | 10760 | 72a46c76b4507e1f98b41d5050a92bd30587eb70 | AI Agent Engineering |
| omnigent-ai/omnigent | 1266212515 | 10706 | 12a0d5c8737571980b84869c2df00b17d0b42c9b | Omnigent is an open- |
| lucidrains/denoising-diffusion-pytorch | 290373506 | 10705 | c8155b1dc622e3f1ef0d53dc6e5a570ca105bcec | Implementation of De |
| skypilot-org/skypilot | 395140743 | 10688 | f616a2fe11056e5779920feab3b87e86f8c78975 | The AI Compute Platf |
| Acly/krita-ai-diffusion | 686161611 | 10683 | 828b70c33c5c97f326e03170cd693beef798231e | Streamlined interfac |
| CVHub520/X-AnyLabeling | 644293378 | 10636 | a75f31f02eb2de591b2bd537167c767791432bf5 | X-AnyLabeling: A lig |
| bigscience-workshop/petals | 502482803 | 10616 | 22afba627a7eb4fcfe9418c49472c6a51334b8ac | 🌸 Run LLMs at home, |
| thesysdev/openui | 897268988 | 10568 | adc023433e0ebfd4e1fd33a48b12ee8b2cace8bb | The Open Standard fo |
| sigoden/aichat | 608896930 | 10490 | 82976d349ad97ac9aae0655ad631dace5e2a6385 | All-in-one LLM CLI t |
| RunanywhereAI/runanywhere-sdks | 1023959202 | 10312 | acc341c8eae9078a5ab99102bad0ca8bb0377fc7 | Production ready too |
| chaitin/PandaWiki | 984133376 | 10310 | 394e42a8b12c19e5c2e50d810505ab88bb37e768 | PandaWiki 是一款 AI 大模型 |
| Netflix/metaflow | 209120637 | 10299 | cb63fe94d6ae223ece6776edd567a59cb40eea0b | Build, Manage and De |
| Narcooo/inkos | 1179413000 | 10218 | 8fc2ae57080b9821257dee3e37cc677e2b6f389a | Story Creation AI Ag |
| OpenGVLab/InternVL | 721995615 | 10166 | 2410d1dbf208f0e799459aff9376e5747dbf41a2 | [CVPR 2024 Oral] Int |
| GetBindu/Bindu | 949646929 | 10083 | d4efe4816cbe48423e7e7fb707824a71344ca234 | Bindu: The identity, |
| sktime/sktime | 156401841 | 10061 | 5ba6fba23e4929395aa0fab1061967d85eb86c86 | A unified framework  |
| EpistasisLab/tpot | 45495679 | 10053 | 1bca6c6a51a79dc7370fbd2a8864a561fc5d7529 | A Python Automated M |
| microsoft/UFO | 740316987 | 9975 | a795552d976c4c019d7c2f778a0effb5cef7de6b | UFO³: Weaving the Di |
| google-deepmind/sonnet | 87067212 | 9971 | 8e7158b2beb8c8269b1b322601214083afc5607f | TensorFlow-based neu |
| Companion-Inc/feynman | 1186559664 | 9920 | 5a1f82b2380d074c7b7b403de74f0abac3d616e5 | The open source AI r |
| microsoft/computervision-recipes | 170161374 | 9896 | 679f1bf82b22b8c948f3703933557a2ba090739d | Best Practices, code |
| gorse-io/gorse | 144708327 | 9868 | 7bf68e513a35e1a630d9c8bfaa51dd18d1077c76 | AI powered open sour |
| aliasrobotics/cai | 957859485 | 9846 | 6dc79257777f5f1c9500b4d2319935d34a47412e | Cybersecurity AI (CA |
| Tiiny-AI/PowerInfer | 731842419 | 9819 | 8bd56d69906c9d2dba4d3bf6899763401e01a9a4 | High-speed Large Lan |
| trailhq/Graft | 1288325627 | 9765 | fe30ead39d5e6f0c921018d364da2bdbc9d4b3ad | Turbocharge Claude C |
| roboflow/rf-detr | 951534260 | 9754 | eca736acab9f6fe93f2cbc82a1d9f6edfb53f0ea | RF-DETR is a real-ti |
| frankbria/ralph-claude-code | 1045721921 | 9675 | bed9312c39a50966bf3b6e98be1c7d4ed841a76c | Autonomous AI develo |
| Lightricks/LTX-2 | 1127234517 | 9633 | 9ec55f9f22798a3198d9c923856824821bc3317e | Official Python infe |
| xorbitsai/inference | 653496050 | 9604 | 6148667e09c7943c09f67eeaa187c6c65f3efb55 | Swap GPT for any LLM |
| Thysrael/Horizon | 1162410458 | 9583 | 74a70a29ac45ae9ce6d6f82c465452a157aa7a46 | 📡 Your own AI-power |
| tflearn/tflearn | 55147386 | 9570 | db5176773299b67a2a75c5889fb2aba7fd0fea8a | Deep learning librar |
| spring-projects/spring-ai | 659402878 | 9522 | 00f230f9ee828f12517b2234e5a279cc9c061851 | An Application Frame |
| replicate/cog | 342728683 | 9489 | 6b32b31dfaff88705e19f6de63ca51b1b1592296 | Containers for machi |
| Oneflow-Inc/oneflow | 81634683 | 9437 | 25c8978c1c8b1371ef6aa4187dae4495bd233c35 | OneFlow is a deep le |
| oumi-ai/oumi | 797371964 | 9388 | af4c9d15b401b4262ac1013b11a1d335f81fdda4 | Easily fine-tune (SF |
| dotnet/machinelearning | 132021166 | 9354 | 68b8ee6a451c3e1eaac95982bf01c0c4436fd390 | ML.NET is an open so |
| FMInference/FlexLLMGen | 602270517 | 9346 | 004ffef82b46e8dc8685c55d0cdda650bdaf1269 | Running large langua |
| keras-team/autokeras | 111340129 | 9333 | a2446cf16edcca48ba558d70ac5345e4f30c78e1 | AutoML library for d |
| shaxiu/XianyuAutoAgent | 948663423 | 9318 | 540bbc26cf02ee6348d997843942776a9be9460b | 智能闲鱼客服机器人系统：专为闲鱼平台打造 |
| zhouxiaoka/autoclip | 1015815983 | 9283 | 80bf1d6c41b97b45aa965d670f6f955299d5899c | AutoClip｜一个链接，一键出片。开 |
| activeloopai/deeplake | 201403923 | 9249 | f432041fabbf4a1fc1d342aeb550e0a7de41b0da | Deeplake is AI Data  |
| modelscope/modelscope | 517552648 | 9162 | 0bb6e4fcb5b3f0f60827ae5e708fe9c65b19d521 | ModelScope: bring th |
| miurla/morphic | 782539945 | 9157 | 425971d45dfdb483608fe068aea283afdd03ecb3 | An AI-powered search |
| EvoMap/evolver | 1147063571 | 9140 | 31b0691acd97ba18878019312e646f1f2d970d43 | The GEP-powered self |
| catboost/catboost | 97556265 | 9135 | bacae19eb57f2d07c92ff168c5c8f961d5d3053d | A fast, scalable, hi |
| genspark-ai/genoffice | 1318187016 | 9109 | 1ca5e9adfc1807a158db19741eff825dba9ab757 | Free, open-source AI |
| poloclub/cnn-explainer | 219378850 | 9060 | d0971f9447ed9806022a3d47587b62394682bc51 | Learning Convolution |
| OlafenwaMoses/ImageAI | 125932201 | 8893 | 2156d1a39a196c72057771d1d16226388c1d7baf | A python library bui |
| bentoml/BentoML | 178976529 | 8887 | 517b343b81aeb0b01bbd908e58e53ad9c12ef7eb | The easiest way to s |
| iflytek/astron-agent | 1060001762 | 8883 | 7d17ece9c401a265a14d210e112a9d208c21ebb1 | Enterprise-grade, co |
| clips/pattern | 1696822 | 8856 | af754685cca3713db0abc4f020f2e94467c19d85 | Web mining module fo |
| google/adk-go | 978236277 | 8855 | 987c7bc0bed6af5a4bae305df54c00019033d6d0 | An open-source, code |
| intel/ipex-llm | 66823715 | 8849 | de6bce27133ab250f13fd5d549c197519ce16d30 | Accelerate local LLM |
| 0xPlaygrounds/rig | 810861466 | 8840 | 9e7cb6000355b7ae1a89c913bf98b8a6f17661ee | ⚙️🦀 Build modular a |
| poloclub/transformer-explainer | 801763739 | 8839 | bfe50afba10b9b560b84143ee1107d977defa74f | Transformer Explaine |
| mage-ai/mage-ai | 493014338 | 8828 | b15fe8c11b344784cdd0cccf3139a67979e713a2 | 🧙 Build, run, and m |
| rockbenben/ChatGPT-Shortcut | 606031950 | 8811 | f91ed81ed69f0ded46e6f3fe0afa7c9808ae3c10 | Stop writing prompts |
| strands-agents/harness-sdk | 983715534 | 8749 | 54775ee2e22b3cf1e019d118cb48feaffa4df642 | Build an agent harne |
| FoundationVision/VAR | 780522250 | 8737 | 78b95394fc5896192e3a003e4b295f8ea743c48f | [NeurIPS 2024 Best P |
| VowpalWabbit/vowpal_wabbit | 265995 | 8728 | 00196b35f63bcb8a6d66966e2b4cf67d6a2bd335 | Vowpal Wabbit is a m |
| maximhq/bifrost | 951115072 | 8674 | 25e458710658d008c871b60914efddb71ae084b8 | Fastest enterprise A |
| lastmile-ai/mcp-agent | 905016458 | 8571 | f62d849350816588b1c6294e7914bbe4d8b84072 | Build effective agen |
| AAswordman/Operit | 948839453 | 8529 | dbf71916fae9750cfdc9f9a774f5a0fee56633fb | The most powerful AI |
| bitsandbytes-foundation/bitsandbytes | 373674258 | 8516 | 833649043474794b8fe7a4136e0c40faf077b2e0 | Accessible large lan |
| lucidrains/imagen-pytorch | 495587598 | 8432 | 192f8b924ba8ebd7b5d2b02422d6b2755e123b1d | Implementation of Im |
| facebookarchive/caffe2 | 38066334 | 8369 | 5f7cccf14a453cb8b7d556e2d2a3fa2be699185f | Caffe2 is a lightwei |
| SWE-agent/mini-swe-agent | 1010318950 | 8349 | 04d809ceab9df28f9adaed044884180159172930 | The 100 line AI agen |
| py-why/dowhy | 135584946 | 8339 | b06369ed4a01a54c9d6422a24f103626fbcaec19 | DoWhy is a Python li |
| nebuly-ai/optimate | 458588993 | 8327 | a6d302f912b481c94370811af6b11402f51d377f | A collection of libr |
| google/trax | 213020264 | 8304 | 31022d6cd7dd525ed11a04d84cd3936228499173 | Trax — Deep Learning |
| TencentCloud/Octop | 1293600453 | 8234 | 0c5a46ab5f82e5ad9d1a56fa09b00e542f042fda | A smarter, self-host |
| deeplethe/utopia | 1327088798 | 8201 | 72f6ef681f2547de2083127f76503ddb2bb80f9d | World's first open-s |
| jessevig/bertviz | 162021652 | 8197 | 79dbaebfe31ada110c1268de7bb6509b14fe9df3 | BertViz: Visualize A |
| PriorLabs/TabPFN | 509436902 | 8150 | 15f5e6b2b629b905879b9be907261416f20d0df5 | ⚡ TabPFN: Foundation |
| leptonai/search_with_lepton | 747030811 | 8057 | 0a2fe3713ee42c4c0c6da1bb56d3cbbeccf431d5 | Building a quick con |
| RayVentura/ShortGPT | 659412092 | 8012 | 3df4e0f7a422bf7386565d498bf4521a2544c614 | 🚀🎬 ShortGPT - Expe |
| SciPhi-AI/R2R | 756142546 | 8012 | 9c5a94d151f90876bd7eb860f300a8fd662dc481 | SoTA production-read |
| cortexlabs/cortex | 167304464 | 8009 | dc48c02ed50a523a87166709f6fe361b5c836e3e | Production infrastru |
| evidentlyai/evidently | 315977578 | 7979 | 34771fe41c08ca074d96a52aaf4a45cd640cbaf5 | Evidently is ​​an op |
| 2FastLabs/agent-squad | 832647441 | 7789 | 729d5f52869c8280f599a9fa5cf27fc1df445602 | Flexible and powerfu |
| flyteorg/flyte | 216628419 | 7663 | e77a9770474dd25659aaf079e309291b7a46b725 | Type-safe, distribut |
| di-sukharev/opencommit | 610217037 | 7546 | 250d49ab5eae07d9081d0175ac50e1b0bb25b9d5 | top #1 and most feat |
| h2oai/h2o-3 | 17371412 | 7509 | bcd39665671494f1032824acee0c2a3bdad84104 | H2O is an Open Sourc |
| ChatLab/ChatLab | 1104370536 | 7502 | 7b791785b7f72f3cee04728b0ddd2ab69c0b47d7 | Local-first chat his |
| wiseodd/generative-models | 75829600 | 7491 | b930d5fa9e2f69adfd4ea8ec759f38f6ce6da4c2 | Collection of genera |
| shengjidaguai-china/goutoujunshi | 1306722822 | 7488 | 6db7354a4002dc7c448a9c87ffdad8132570c9d3 | 一个先接住情绪、再分析关系并给出可执行策 |
| traceloop/openllmetry | 686364232 | 7480 | df4921a40940cdce136c4409380a55e9d4c7a96d | Open-source observab |
| open-mmlab/mmagic | 203999962 | 7473 | 0a560bba9b79ebe78574e1d4cbbdd0e798e63568 | OpenMMLab Multimodal |
| google-deepmind/lab | 75190475 | 7385 | b1db91af5b4d2f3a24466f4632a3e5e1b0829cca | A customisable 3D pl |
| tensorlayer/TensorLayer | 60626727 | 7384 | 0681633252667b317a23b803c11a8a060a44bf31 | Deep Learning and Re |
| PAIR-code/facets | 96544175 | 7332 | 44d9b60437bff00c2541e37aa45fa69a546f22b6 | Visualizations for m |
| feast-dev/feast | 161133770 | 7323 | 7b9fad2ac46e70c7b4b72c11174085efb6d0bc45 | The Open Source Feat |
| Zipstack/unstract | 761150311 | 7278 | 3713a27815f924897cefcc25336b7eb3fff6ca87 | LLM-Driven Extractio |
| NVIDIA-NeMo/Guardrails | 629494390 | 7270 | 4512d081cb970be8a99ac2ccd1c6a39b1a81d352 | NeMo Guardrails is a |
| kyegomez/swarms | 639195966 | 7240 | dff4c37d5e305dbb1bfab543790954bdfaeb7e0e | The Enterprise-Grade |
| flwrlabs/flower | 241095326 | 7155 | f6d8c9c98f62a1b0d67bea5618997dcfa26eea94 | Flower: A Friendly F |
| katanemo/plano | 826498000 | 7082 | a031d31105d0cd9801dc75f37d7507c44b65ab1c | Plano is an AI-nativ |
| grab/cursor-talk-to-figma-mcp | 949523404 | 7047 | ddd90f3a6d454ea0b2fc29f1b084f50fd062b880 | TalkToFigma: MCP int |
| deeppavlov/DeepPavlov | 111113343 | 6994 | 5f9fbed0c7191466bc7621e604b810f66f254c03 | An open source libra |
| SerpentAI/SerpentAI | 88444621 | 6990 | 00a487dd088c6ca2528d025f3273c0a796efe210 | Game Agent Framework |
| interpretml/interpret | 184704903 | 6955 | 452a6b8b25c798c7eae0e5a4aa8bb29334a36aa0 | Fit interpretable mo |
| mishushakov/llm-scraper | 789480255 | 6936 | 2b43d999a17eac040f7cc315fc21dd526870564f | Turn any webpage int |
| TencentQQGYLab/AppAgent | 733899994 | 6899 | 2c1900422caf6f9e94e96d5dd984b530e5a5fbf8 | AppAgent: Multimodal |
| postgresml/postgresml | 480239936 | 6820 | caf2b6ccdf0d6efc2c1910cbc06725a34320181a | Postgres with GPUs f |
| vastsa/PI-Desktop | 617502359 | 6583 | 7949d6ff693646397828da3ac3f43b4d3f8a111d | Local-first AI codin |
| GoogleCloudPlatform/agent-starter-pack | 925298844 | 6572 | 659f047742457bd55e5db0edd088cf678b6f0669 | Ship AI Agents to Go |
| anus-dev/ANUS | 945579718 | 6550 | 3072a939ac00e925ebc8aba698f90206750e518c | A free coding agent  |
| crestalnetwork/intentkit | 900577388 | 6514 | afc8cc44255210db6352f7437e569ed8b88ed5e1 | IntentKit is an open |
| KunAgent/Kun | 1245699721 | 6319 | ebce7f6cd94fc2882009fcf8169d7a59f5f5c289 | Local-first AI agent |
| Eigenwise/atomic-agents | 809673506 | 6277 | 7fc2c7e24c992734e328b1028b20772050d10221 | Building AI agents,  |
| Trusted-AI/adversarial-robustness-toolbox | 125381318 | 6263 | 4da50bdc5a1393bd33a52f7012f4928dd68fb260 | Adversarial Robustne |
| netease-youdao/LobsterAI | 1156137396 | 6100 | 1c20890672581321db4c9f21c6670ccc0bf03dfd | Open-source, desktop |
| kserve/kserve | 178075572 | 6094 | 7a8b7dadf40503bbf7a37982c42631142023a202 | Standardized Distrib |
| UfoMiao/zcf | 1028832403 | 6079 | 63cb2d07a0fad3a9def37118ba056bafae780d44 | Zero-Config Code Flo |
| gorgonia/gorgonia | 68251076 | 5927 | d7a3ce27c9a1ffbee531d7850485229584db8d97 | Gorgonia is a librar |
| wiltodelta/remove-ai-watermarks | 1191930807 | 5923 | 4241a01659de4fda6980ade15ba5a1a2836db345 | Remove visible and i |
| aidlearning/AidLearning-FrameWork | 182210458 | 5814 | 84d0676baffa905c12189959480c9a1bb14619a6 | 🔥🔥🔥AidLearning is |
| Eventual-Inc/Daft | 485548415 | 5793 | d3cd974150ba93dbbe8efef8370b129538fcee4b | High-performance dat |
| BitterSecurity/Decepticon | 997390194 | 5761 | 3e689761c270284cccd432136c5158b9596f8aca | Autonomous Hacking A |
| potpie-ai/potpie | 841370602 | 5739 | 780c487a7dbe02c162ff5219cbda681885e49720 | Context Graph for AI |
| shy3130/tick-stock-panel | 1273015953 | 5734 | 469fd3157c65e9b5e7780e559081b2521a35160e | TSP自托管、零运维的 A 股「选股 + |
| apache/maka | 1251460378 | 5692 | 66da38efd33475c979233c41bf98f9b8855a3dff | Apache Maka (Incubat |
| baichuan-inc/Baichuan-7B | 653595084 | 5649 | 6f3ef4633a90c2d8a3e0763d0dec1b8dc11588f5 | A large-scale 7B pre |
| lucidrains/DALLE-pytorch | 327113050 | 5625 | 58c1e1a4fef10725a79bd45cdb5581c03e3e59e7 | Implementation / rep |
| Anil-matcha/open-dots | 645381450 | 5599 | 3d8de1cd6657c6d70583f34b89c2dc034512c1ea | Open-source, self-ho |
| aipoch/open-science | 1287804060 | 5489 | 28ed0f7524c1ea1c77677d72d2fe90d0b5244a73 | The open-source AI r |
| KnockOutEZ/wigolo | 1208642537 | 5454 | da59eee72ee5e6c6a79a290e9c0f6d3720588711 | The go-to web for yo |
| business-science/ai-data-science-team | 901950528 | 5449 | 4ffeb7f38178aa250917f29b01355f8b89ba809e | An AI-powered data s |
| TaskingAI/TaskingAI | 740338525 | 5410 | f0092d6b2dd82e98e188e0b9849fdd4c7230dd98 | The open source plat |
| ArcReel/ArcReel | 1152014383 | 5405 | 08ab3b32328bd24de9d5793296df32ed8dd6cb9f | AI Agent 驱动的开源可自部署视频 |
| rasbt/reasoning-from-scratch | 942696497 | 5376 | a788466dc85cfe8617b6c0b809ed4ab9084485de | Implement a reasonin |
| 54yyyu/zotero-mcp | 953089294 | 5297 | 0faf1b25c4b9bb95e2571bc8af60b62e9ce10e24 | Zotero MCP: Connects |
| FailproofAI/failproofai | 1202410617 | 5274 | 4fb46aa72a589f0522e5ef072e25da8b7f047bac | Observability and en |
| kodu-ai/claude-coder | 850683423 | 5216 | 60c1a717992c1a597850d1e3671dc0491eab02ed | Kodu is an autonomou |
| h2oai/h2o-llmstudio | 629142696 | 5183 | 2692c9af90b616a4ec92fa3c5eed8ffb986902b8 | H2O LLM Studio - a f |
| NVIDIAGameWorks/kaolin | 221787282 | 5182 | f7093babd992e227375c15b0ba9479a6926f6760 | A PyTorch Library fo |
| EvoScientist/EvoScientist | 1142406715 | 4974 | 2d00646d0290c4fa085a64bbe2025dc29654604b | 🔬 Harness Vibe Rese |
| aipotheosis-labs/aci | 859956307 | 4907 | 3e4a82fa5fd22f1165af2b39fa3de2b0f031242e | ACI.dev is the open  |
| chaitin/MonkeyCode | 1008177062 | 4812 | 1b4d0efc0d3655f7fdd95599f26a34c6f16fa062 | AI coding platform f |
| Integuru-AI/Integuru | 877000812 | 4775 | b063940a23deb9ac4d4ca4452731bc479b688f87 | The first AI agent t |
| JetBrains/koog | 976095156 | 4604 | 07405545c860ce76d6328c6cb5288a4d013b263c | Koog is a JVM (Java  |
| microsoft/PyRIT | 730753909 | 4600 | 4beda9c08292be50e42cd62539fa1812971bde09 | The Python Risk Iden |
| IBM/mcp-context-forge | 979886407 | 4592 | 520a7b98712f066075d6a704624fbb3dee76a69c | An AI Gateway, regis |
| kyegomez/tree-of-thoughts | 643405499 | 4592 | 28b7b6b231991e64ab36e8f48465812bac424083 | Plug in and Play Imp |
| OAID/Tengine | 115765590 | 4534 | 5ec1c383c8adb0078c025b9fec6fa3dea254034a | Tengine is a lite, h |
| CaviraOSS/LongMemory | 1079345325 | 4524 | 9ee2c8e1ed42d83eb788afb9ffc3a82b84405da5 | Local persistent mem |
| embabel/embabel-agent | 963665823 | 4501 | f34ed80826c879b03a1fc063370eedcf65767c16 | Agent framework for  |
| inkeep/open-knowledge | 1258203278 | 4465 | 5d4403ee9352a4e8620e784e8486ff8fa9e2ec6d | Beautiful, AI-native |
| crmne/ruby_llm | 924568745 | 4448 | a999ef9552125d137ee797ff54e13a6d59584ea1 | The Ruby-native AI f |
| truefoundry/cognita | 671064065 | 4415 | 8bcaae790af1effd398520338d6c623ff92b98fb | RAG (Retrieval Augme |
| arxhr007/Aliens_eye | 409072882 | 4323 | 709a4c87547ab3e4cf14c96a42772812df78ba6d | Hunt down 840+ socia |
| lucidrains/deep-daze | 330325505 | 4316 | c3c471e63c30ccabfd8dfc09ced3028a8979ebe4 | Simple command line  |
| mongodb-developer/GenAI-Showcase | 750371625 | 4264 | 70b3715a317f38f1adece7065e9ee38a76d06939 | MongoDB's Generative |
| GiovanniPasq/agentic-rag-for-dummies | 1075623145 | 4238 | f0d9a3c89adc7ebd146ffe173057fe013dd41739 | A modular Agentic RA |
| SylphAI-Inc/AdalFlow | 788791942 | 4223 | 810de99d86191b3aa0c939aa6d6d1a21977555aa | AdalFlow: The librar |
| opengeos/segment-geospatial | 629789089 | 4162 | 0d7a4ac1b3f6afe1970ee0ae5c11ba1da6bbb49e | A Python package for |
| baichuan-inc/Baichuan2 | 685444668 | 4082 | ed8b1ae415c62b65a7d41b491ebeb854c54f0653 | A series of large la |
| FedML-AI/FedML | 281519510 | 4069 | 03e11dfee69a458a9820ec4e05b531a5f935eb2b | FEDML - The unified  |
| Nixtla/nixtla | 409653223 | 4020 | d6d3d27ab799747c5663de429ac4bb138602238e | TimeGPT-2.1: product |
| matt1398/claude-devtools | 1152166697 | 3968 | 1486f2042c87bb547a4e34808ab54ab34a33f132 | The missing DevTools |
| synthetic-sciences/openscience | 1288402762 | 3961 | 56b208b372623daef4cedc78181345cc098bcaae | The open-source AI w |
| Lightning-AI/LitServe | 730728120 | 3946 | be0abf40e759e89f15b1087f3b721d9177bd883f | A minimal Python fra |
| aurelio-labs/semantic-router | 711904962 | 3942 | 88fb4dcdc1044f060da82f0b52e829e085bc1407 | Superfast AI decisio |
| LazyAGI/LazyLLM | 810121174 | 3886 | ab67c1893872fdc2895fc412d226e61a0524c985 | Easiest and laziest  |
| dromara/liteflow | 250036571 | 3879 | 54c084446c17ebd8536b0172de44b946f85562de | Lightweight, fast, s |
| ailyProject/aily-blockly | 891997126 | 3834 | 779710c6da3113a0da1d15ea5931e02828b9406a | AI IDE for hardware  |
| 1186258278/OpenClawChineseTranslation | 1145977416 | 3794 | e050b033a92bc8ddc611897f8fef1d5dc2633f77 | 🦞 OpenClaw (Clawdbo |
| askrella/whatsapp-chatgpt | 576005588 | 3788 | a5aad4f581aaff9b6cf91f994d6b61197371e5ba | ChatGPT + DALL-E + W |
| lucidrains/stylegan2-pytorch | 232876381 | 3780 | ce7f830bc10d037cddc75d6166904baf07945cf6 | Simplest working imp |
| Mouseww/anything-analyzer | 1208430144 | 3752 | 6ae7becb256428407e3297f9fa35611ef8711e01 | 全能协议分析工具：浏览器抓包 + MIT |
| olivia-ai/olivia | 136217503 | 3719 | 4143192d59eda153a929b14be52905d69036c441 | 💁‍♀️Your new best f |
| memodb-io/Acontext | 1020834440 | 3692 | 259d73bfdebeed35ec2d4211ddc060a2d4126bc6 | Agent Skills as a Me |
| twinnydotdev/twinny | 681211986 | 3665 | 0b2f81dd7b6e601bc2cbaffe4678e8d111cff973 | Open-source AI codin |
| opensumi/core | 429104828 | 3656 | 9a7057aec548b11598b8ec5f39a5538546b218e2 | A framework helps yo |
| simonlin1212/TradingAgents-astock | 1237174940 | 3654 | 7fc142e5a622a16dcfce8c2544c771fc251f5dce | A股多Agent投研框架 — 适配A股数 |
| SamurAIGPT/llm-wiki-agent | 630824392 | 3613 | 17e29b476a3a9fb71fc04ae7aed0c4b126ac4025 | A personal knowledge |

</details>

## Acceptance

- [ ] Selection and discovery ledgers are committed with immutable source evidence and exclusion reasons.
- [x] Exactly 500 new canonical GitHub IDs are scanned; pins, reports, scanner versions and completeness match.
- [x] A new complete append-only history snapshot preserves all earlier snapshots.
- [x] Generated results and analysis site are rebuilt; tests and lint pass, and the corpus evidence validator passes.
- [ ] Review and merge the analysis PR, then import the merged evidence into the Showcase through its own issue and PR.
- [ ] Public analysis and Showcase data match the merged source commits and show the complete cohort.

Tracked selection ledger: `corpus/selection-2026-10-09-ai-500.json`. Discovery snapshot: `corpus/popularity-search-2026-10-09-ai-500.json`.

Requested by Fernando Paladini.
