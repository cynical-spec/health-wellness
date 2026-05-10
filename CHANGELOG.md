# Changelog — Sehat Saathi

---

## 2026-05-10 — Session 9b: v4.1 — Wellness goals on the home (broaden audience beyond "the unwell")

User feedback after v4 shipped: "Does it feel like a page where any ill people will go and not younger audience who wants general health and wellness advice?" Correct read — the v4 hub greeted every visitor with `Kya takleef hai?` and 8 ailment buttons, which excluded the 65%-of-population, under-35, proactive-wellness audience that tier 2/3 actually skews toward. (India median age 28; 24% YoY adoption among 20-39 year olds in wellness apps.)

### Added
- **Wellness goals grid** (`tri-well-grid`) above the symptom grid — 8 buttons: Energy, Achi neend, Pachhan, Mann shanti, Skin glow, Vajan, Focus, Immunity. Each has a tailored AI prompt that produces a magical-moment first turn (no clarifying-question loop) routed through the existing `wellness` ctx (younger Hinglish persona).
- **`triWellnessTap(displayText, aiPrompt)`** — sets ctx='wellness', tracks feature, opens chat with the goal already framed.
- Section labels "Aaj behtar feel karo" (above) and "Koi takleef hai?" (below) using the existing `tri-rail-lbl` style.

### Changed
- Hero: `Kya takleef hai?` → `Namaste 🙏 / Aaj kaisi sehat banayein?`. Sub-copy: `Bolein ya niche se chunein — sehat banao ya koi takleef ho`. The home now welcomes both the well and the unwell without forcing one identity.
- Layout becomes: hero → wellness-goals grid (8) → mood pulse-strip → symptoms grid (8) → "Aur kya kar sakte ho" rail. Both audiences served on a single scroll, no tabs/toggles, no profile schema change.

### Decisions made this session
- **Skipped women's health (PCOS / Periods)** — explicitly held back by user as "another vertical worth its own product surface." Will be slotted in when that vertical lands.
- Routed wellness goals to `wellness` ctx, not `nushke`, because the existing `WELLNESS_SYSTEM_PROMPT` is already calibrated for 18–35 Hinglish, no diagnosis, ≤5 sentences, "bhai try this" tone.

### Broken / Known issues
- The mood pulse-strip + the rail are now separated by the symptoms grid; visually still coherent but worth testing on 390px.
- 16 large symptom-and-wellness buttons + a strip + a rail makes the home page noticeably longer than v4. Above-the-fold content is wellness goals, which matches the broader-audience goal.

### Next session should start with
- Live URL smoke test on a mobile (390px) — does the full hub feel coherent? Does the wellness grid get tapped or do users still scroll past to takleef?
- If wellness gets ≥30% of taps, consider promoting one wellness goal into the daily story rail (auto-suggest based on time-of-day).
- Plan the women's-health vertical surface (PCOS, periods, prenatal) as a separate entry, not mixed into the wellness grid.

---

## 2026-05-10 — Session 9: v4 — Tier 2/3 reframe (symptoms-first, recipe-steps, live voice)

This session re-anchored the home around the tier-2/3 user's actual intent ("kya takleef hai, fix it") and rebuilt three weak points raised by the user: (a) the home was mood-first instead of symptom-first; (b) ghar-ka-nushka left the user with a YouTube link instead of a magical, in-app step-by-step animation; (c) the Speak button was opaque — no transcript, no listening signal, no visible turn-taking.

### Added
- **Symptoms-first hub layout** (`tri-hero` + `tri-grid`) — 8 large symptom buttons (Sir dard, Sardi-khansi, Pet ki dikkat, Neend nahi, Ghutno/jodon dard, Bukhar, Tension, Saans/galay) replace the 3-zone mood layout as the primary path. Each button has emoji + Hindi name + English subtitle for discoverability.
- **`triSymptomTap(displayText, aiPrompt)`** — routes a symptom tap directly to `s-chat` in `nushke` ctx with the user's intent already framed as a remedy ask, so the first AI turn IS the magical-moment answer.
- **`tri-mood` strip** — collapsed pulse-check (single line, three small mood emoji buttons) that preserves the mood path without dominating the screen.
- **`tri-rail`** — subtle horizontal "Aur kya kar sakte ho" rail with secondary use cases (Dadi ki kahani, Saans karein, Lab report, Dawai yaad, Meal plan, Parivaar) for low-cognitive-load discoverability.
- **`REMEDY_KITS`** (15 in-app recipes) — Haldi doodh, Ajwain bhaap, Tulsi kadha, Adrak chai, Jeera paani, Mulethi kadha, Saunf paani, Methi paani, Namak gargle, Nimbu-shahad, Anjeer doodh, Arandi tel, Amla, Palak juice, Neem paani. Each has `kw[]`, `emoji`, `title`, `ingredients`, `durSec`, `steps[]`.
- **`injectRemedyCard()`** + **`openRemedy(key)`** — when the AI mentions an AYUSH ingredient in nushke ctx, an in-app recipe card appears with thumbnail + ingredients + step count. Tap → opens the existing `move-ov` overlay running the recipe steps with auto-advance + Sarvam TTS read-aloud + per-step progress dots. No more YouTube redirects for the magical moment.
- **`ACUPRESSURE_POINTS`** (6 points) — LI-4 (sir dard), GB-20 (gardan), PC-6 (jee michlana), Yintang (chinta), ST-36 (thakaan), LU-7 (khansi). Each has `kw[]`, location text, and an SVG silhouette (hand / wrist / forehead / leg / head_back) drawn inline.
- **`injectAcupressureCard()`** + **`openAcupressure(key)`** — keyword-triggered card with an animated pulsing dot. Opens the step overlay with the SVG silhouette + an `acu-pin` marker (CSS pulse animation) overlaid on the body part.
- **Voice overlay v4** — full live-conversation UI:
  - State pill (`Sun rahi hoon` / `Soch rahi hoon` / `Bata rahi hoon`) with color tinting.
  - **Live mic-level bars** (5-bar EQ) driven from the existing Web Audio analyser data via `_setBarsFromLevel()`.
  - **Live transcript area** (`#voice-transcript-area`) showing `Aap ne kaha:` (user transcript) and `Saathi:` (bot reply) bubbles, plus an italic `Soch rahi hoon...` thinking line that's removed when the bot replies.
  - **Hint text** that updates with state + `Band karein` stop button at the bottom.
  - `addMsg()` now mirrors bot replies into the overlay automatically whenever the overlay is open — works for both hub-target and chat-target voice paths.

### Changed
- Hub greeting/CTA copy: `Namaste 🙏 / Aaj kaisa raha?` → `Kya takleef hai? / Bolein ya niche tap karein — Dadi ke ghar ke nushke milenge`. Direct intent over mood-checking.
- `injectVideoCard()` is now an alias for `injectRemedyCard()` (back-compat, same call sites).
- `setVoiceState()` rewritten to drive the new state pill + bars + hint instead of the legacy `voice-txt`/`voice-lbl` paragraphs (those are kept hidden for back-compat).
- `convHandleTranscript()` now appends the user's transcript to the overlay before sending to AI, and inserts a thinking line that the bot reply replaces.

### Fixed
- Voice overlay no longer feels like a black box — the user can now read what was heard before the AI responds, see the bot's reply text in the overlay, and watch the mic level confirm that the mic is live.

### Broken / Known issues
- Sarvam STT is still POST-after-recording (no streaming partials). The "live" feel comes from the mic-level bars + transcript-on-arrival, not interim word-by-word. If/when Sarvam ships a streaming endpoint, swap in `convListenOnce()`.
- The orphan CSS for `.hub3-mood`/`.hub3-carousel`/`.hub3-qb` is left in the file (no DOM uses it) — slated for removal next session.
- `move-ov` is reused for both movement skills and recipes/acupressure. The auto-advance timer is fixed at 9s/step which is fine for short recipes but a bit fast for the 5-min anjeer-doodh soak step; user can tap "Aage badho" to skip.
- File grew to ~4569 lines.

### Next session should start with
- **Live URL smoke test** — symptom button → AI remedy → recipe card → overlay step animation; voice overlay → bars animate → transcript appears → bot reply mirrors in overlay → TTS plays.
- Validate the SVG acupressure silhouettes look right on actual mobile (390px) — they were sized at 180×180 inside a 200×200 circle; may need a touch-up.
- Consider promoting the `tri-rail` story card to auto-play its preview when the user lands on the hub (warming-voice magical moment).
- Remove the now-orphan `.hub3-mood*`/`.hub3-carousel*`/`.hub3-qb*` CSS.

---

## 2026-05-07 — Session 8: v3 — 3-zone Home, Sarvam Voice, Dynamic Story

This session was a major UX rewire — the Sehat hub was reimagined as a clean 3-zone home (greeting / mood / story+score) instead of a tool list. Voice fully migrated from Web Speech API to Sarvam (Saarika STT + Bulbul TTS). The story card now generates fresh content per persona + season + language. Tools moved to a bottom-sheet behind a 3-dot menu.

### Phase 1 — Sarvam Voice + new SYSTEM_PROMPT + v3 visual tokens (commit `fb16b89`)
- **STT replacement**: `toggleVoice()` now uses MediaRecorder → Sarvam Saarika (`saarika:v1`) instead of Web Speech `SpeechRecognition`. Audio recorded as webm/opus → POST to `api.sarvam.ai/speech-to-text`.
- **TTS replacement**: `speak(text)` now POSTs to `api.sarvam.ai/text-to-speech` with `bulbul:v1` model. Speakers: `pavithra` (Dadi), `meera` (Maa), `amol` (Saathi). All Indian languages (hi/mr/bn/ta/te/kn/ml/gu/pa) with Roman + script support via `SARVAM_LANG_MAP`.
- **Web Speech removed completely**: deleted `speakWebSpeech`, `pickVoice`, `TTS_BACKEND`, `SpeechRecognition` detection — replaced with Sarvam pipeline.
- **New `SARVAM_KEY` constant** + GitHub Actions workflow now injects it from `secrets.SARVAM_KEY`.
- **New SYSTEM_PROMPT**: explicit two-turn flow, `LANG:<code>` prefix on every reply, max 4 sentences. `callAI()` parser strips the prefix and updates `ST.currentLanguage` for downstream Sarvam TTS routing.
- **v3 color tokens**: `--bg:#0a0a0a` (was `#141414`), `--primary:#6B21A8` (was `#3535f3`), `--surface:#1a1a1a`, `--bold:#2d1b69`, `--success:#22c55e`, `--error:#dc2626`, `--warn:#fb923c` (was `#f7ab20`).
- **All drop shadows removed** (per v3 visual rules: no gradients on backgrounds, no shadows).

### Phase 2 — 3-zone Hub + Bottom-Sheet Tools + Mood Chips (commit `e7dc57c`)
- **Sehat hub rebuilt** with three zones only:
  - **Zone 1** — Greeting: "Namaste 🙏 / Aaj kaisa raha?" + small "Saathi mode" persona label + "🔥 7 din" amber streak pill (top-right) + 3-dot menu button.
  - **Zone 2** — Three mood buttons (😌 Theek hoon, 🤒 Kuch takleef, 😰 Bahut tension) — the only decision on the home screen.
  - **Zone 3** — One story card ("Aaj ki kahani" with title + quoted preview + meta + Suno button) + compact score strip (Sehat Score number + delta + thin progress bar + level meta + 3 daily dots 💧 🌬 🌙).
- **Bottom input bar** locked: "Kuch bhi batao..." placeholder + purple Speak primary CTA (red "Ruko..." while recording).
- **Mood tap → chat with contextual chips**:
  - Theek hoon → [Aaj ka nushka, Swas karo, Dadi ki kahani]
  - Kuch takleef → [Ghar ka nushka, Lab report, Dawai]
  - Bahut tension → [Swas exercise, Baat karo, Sukoon ki kahani]
- **3-dot menu bottom sheet**: Sehat Tools list moved here (Ghar ke Nushke, Lab Report, Dawai Reminder, Meal Planning, Parivaar, Profile). Sehat Charcha shows "Jald aa raha hai" tag (downgraded from Session 7 implementation per spec).
- **Sehat Score system** with localStorage persistence:
  - 4 levels: Sehat Shishya (0–40), Sehat Rakshak (41–70), Sehat Mitra (71–90), Sehat Guru (91–100).
  - Daily dots: paani (+5), swas (+10), khana (+5) — one tap per day per dot.
  - Streak auto-bumps on first +ve action of a new day; resets if more than 1.5 days idle.
  - Ritucharya unlock toast at score ≥91 OR streak ≥10.
- **Removed Wellness Baat tile** (per spec — not in user's tool list).
- **Removed `AYUSH_SLOTS` time-based content** + obsolete `toggleHabit` / old `toggleStoryAudio` (replaced by Phase 3 dynamic story).
- **`.bs-overlay` + `.bs-sheet` CSS** for bottom-sheet animation (translateY transform + backdrop blur).

### Phase 3 — Dynamic Story + Meal Planning Chronic-Condition Context (commit `95cf75c`)
- **`generateAndPlayStory(theme)`** — calls OpenAI (`response_format: { type: 'json_object' }`) with persona-voice system prompt (Dadi/Maa/Saathi) + current season (monsoon/winter/summer) + detected language. Returns `{title, preview, fullText}`. Cached for 30 min per (persona, season, theme).
- **Sarvam TTS playback chunked** — `chunkText(text, 480)` splits at sentence boundaries (Hindi `।` supported); plays chunks sequentially via `audio.onended` chain.
- **Story card live-updates** with generated title/preview/meta/duration; "Suno" button toggles play/pause/Roko.
- **+3 Sehat Score** awarded after a story finishes playing.
- **Meal Planning chronic-condition aware**: `mealGenerate()` and `handleFridgePhoto()` now build an `IMPORTANT — household chronic conditions to respect` block from `loadProfile().conditions` + each family member's `conditions`. The system prompt instructs the model to avoid contraindicated foods (e.g., low-glycaemic for Diabetes, low-sodium for BP, no spicy/fried for acidity).
- **Story text dialog fallback** — if Sarvam TTS fails or browser blocks autoplay, story is shown as `alert()` text (minimal MVP fallback).

### Visual rules enforced (v3)
- `#0a0a0a` background, `#6B21A8` primary, `#fb923c` amber, `#22c55e` success, `#dc2626` error
- User bubble `#1a1a1a`, assistant bubble `#2d1b69`
- Done dot tint `rgba(34,197,94,0.12)`, pending dot `#1a1a1a`
- All tap targets ≥44px (mood buttons + dots are 38px+ in compact zones, but all nav/Speak ≥44px)
- Border radius 16–18px on cards
- No gradients on backgrounds, no drop shadows
- System sans-serif (JioType still loaded for compatibility but not enforced)

### Required secret
- **`SARVAM_KEY`** must be added to GitHub repo secrets — workflow `deploy.yml` now injects it (Phase 1). User confirmed they would add this.

### New ST keys (Session 8)
- `currentLanguage` — last detected language code (`hi-IN` etc.) used by Sarvam TTS

### New localStorage keys (Session 8)
| Key | Purpose |
|---|---|
| `sehatScore` | Persistent Sehat Score (0–100) |
| `sehatStreak` | Consecutive-day streak count |
| `sehatLastActiveDay` | toDateString of last active day |
| `sehatTodayDelta_<dateStr>` | Per-day score delta for "+X aaj" display |
| `daily_<paani\|swas\|khana>_<dateStr>` | Daily dot completion flags |
| `ritucharyaUnlocked` | Set when score≥91 or streak≥10 |

### Removed / deprecated
- `AYUSH_SLOTS` constant (Session 7 time-of-day rotation)
- `toggleHabit()` (Session 7 score chip system)
- Old `toggleStoryAudio()` mock countdown (Session 7)
- `speakWebSpeech()`, `pickVoice()`, `TTS_BACKEND` (Session 7 voice v2)
- `SpeechRecognition` / `webkitSpeechRecognition` detection (Session 1)
- Wellness Baat tile (Session 7)
- Sehat Charcha peer chat — downgraded to "Jald aa raha hai" stub (kept `PEER_PROFILES` constant + `renderCommunityList()` for future revival)

### Broken / Known issues (Session 8)
- **`SARVAM_KEY` must be set in GitHub Secrets** before voice works. Without it, both STT and TTS show graceful "Voice abhi ready nahi" toasts.
- Story TTS chunking is sentence-boundary based — Indian-script sentences may exceed 480 char in rare cases; OK for prototype.
- Sarvam STT does not auto-detect language; we send `ST.currentLanguage` (defaults `hi-IN`). User may need to start in Hindi before speaking other languages — language switches via OpenAI `LANG:` parsing on subsequent turns.
- Mobile autoplay restrictions may prevent the first Audio() from playing without user gesture; the play button click acts as gesture.
- File grew to ~170KB / ~3700 lines.

### Next session should start with
- **Add `SARVAM_KEY` to GitHub repo secrets** (`gh secret set SARVAM_KEY`).
- Smoke-test on mobile: home loads → mood tap → chat opens with chips → Speak transcribes via Sarvam → response in detected language → spoken via Bulbul.
- Test story: Suno → OpenAI generates fresh story → Sarvam plays → +3 score → reload page → score persists.
- Verify Lab Report (still uses GPT-4o Vision, unchanged).
- Consider: cache last 3 stories per (persona, season) for offline-friendly retry.

---

## 2026-05-07 — Session 7: v2 Expansion (Onboarding, Personalization, Lab, Community, Voice, Videos)

This was a 9-phase expansion that landed across 9 commits on `main`. Each phase pushed independently and the live URL was kept working between commits.

### Added — Phase 1: Soft Onboarding (commit `7a1fa93`)
- New `s-onboard` screen — 3-step flow: Scope (self/family/household) → Basic info (age, sex, weight, optional height) → Family invite (optional)
- BMI auto-calc + warm category messages (Kam vajan / Sahi vajan / Thoda zyada / Adhik vajan) shown after step 2
- New `localStorage` key `ss_profile` — `{age, sex, weight, height?, bmi, scope, completed, onboardedAt, skipCount, partialData}`
- Skippable up to 3 times — after 3 skips never auto-prompts; only via explicit "Profile" tile
- Soft-prompt gate added to `enterHub()` and `goToFeature()` — first hub entry triggers onboarding then resumes pending feature
- New ST keys: `userProfile`, `onboardStep`, `onboardData`, `onboardReturnTo`, `pendingFeature`

### Added — Phase 2: Personalized Quick Actions (commit `2f08050`)
- `FEATURE_REGISTRY` constant — 6 health features + 3 cross-assistant placeholders (cricket, astro, bhajan) future-proofed
- LRU recent-feature tracker (`ss_recent` localStorage key, max 6)
- `trackFeature()` hooked into both `goToFeature()` and `startFeature()` so any entry path counts
- Static QA grid replaced with `<div id="qa-grid">` + `renderQuickActions()` JS render
- New users see default health-feature set; returning users see MRU first

### Added — Phase 3: Voice Personas v2 (commit `9732cc9`)
- `detectLang(text)` — returns `{code, name, script}` for 9 scripts (Devanagari, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Gurmukhi, Sinhala) + Roman fallback
- `pickVoice(lang, persona)` — 3-tier voice match (exact lang → hi-IN → en-IN) with persona `voiceHint` keyword preference
- `speak()` rewritten via `speakWebSpeech()` shim under `TTS_BACKEND = 'webspeech'` constant — drop-in swap for Bhashini (free, Govt of India) or Google Cloud TTS later
- `PERSONAS` upgraded with `emoji` + `voiceHint` arrays
- Default persona changed: `dadi` → `saathi` (soft, neutral default for new users)

### Added — Phase 4+5: Sehat Tools + Wellness Talk (commit `6509c69`)
- 4 new Sehat Tools list items: **Lab Report Padho**, **Sehat Charcha**, **Wellness Baat**, **Profile**
- New `WELLNESS_SYSTEM_PROMPT` — younger Bharat audience (18–35), Hinglish tone, hard rule against diagnosis, iCall helpline (9152987821) for crises
- `getSystemPromptFor(ctx)` — per-context system prompt selector; `chatSend()` now uses it
- New `s-wellness`-style chat reuses `s-chat` markup with chat context `'wellness'`
- New `s-community` and `s-lab` screen scaffolds (functional implementations land in Phases 6+7)

### Added — Phase 6: Community / Sehat Charcha (commit `1b211df`)
- `PEER_PROFILES` — 5 AI peer roleplays:
  - Sunita (42, Indore, BP, homemaker)
  - Ramesh (38, Pune, Diabetes, IT)
  - Priya (28, Bengaluru, anxiety, techie)
  - Asha (55, Lucknow, joint-pain, retired teacher)
  - Arjun (24, Mumbai, fitness, MBA student)
- Profile-based matching — peers within ±10 years of user's age OR matching condition tags float to top with "match" badge
- Each peer has a unique `sysPrompt` enforcing first-person roleplay, no clinical advice, redirect to doctor for symptoms
- `COMMUNITY_BASE_PROMPT` wrapper enforcing peer-not-doctor framing
- Required disclaimer banner shown atop every peer chat: "Yeh ek AI peer roleplay hai — asli user nahi"
- Header avatar swap to peer emoji on chat entry

### Added — Phase 7: Lab Interpreter (commit `ed20292`)
- pdf.js (3.11.174) loaded from cdnjs CDN for in-browser PDF page → image conversion
- `pdfToImages()` — converts up to 5 pages to base64 JPEG dataURLs + extracts text via `getTextContent()`
- `isPrescription()` — regex guard: rejects PDFs containing prescription markers (Rx, TDS, BD, sig:, dosage) but lacking lab markers (reference range, mg/dL, lab, pathology)
- `interpretLabPDF()` — sends page images to GPT-4o Vision with structured JSON prompt; returns `{reportType, reportDate, markers[], summary, doctorAdvice}`
- 4-step UI flow: Triage member → Upload PDF → Processing → Result card
- Color-coded marker tiles (Normal=green, Low/High=amber, Critical=red)
- Per-member memory: `ss_lab_reports` localStorage key, `{<memberKey>: [reports]}`, capped 10/member
- Past reports list shown above upload zone for chosen member
- Prescription-rejected case shows friendly message + "Try another" CTA (no dead end)

### Added — Phase 8: Nushke Video Cards (commit `3e3134c`)
- `NUSHKE_VIDEOS` — 15 ingredient/procedure mappings (ajwain, haldi, tulsi, adrak, jeera, mulethi, saunf, methi, neem, amla, nimbu+shahad, anulom-vilom, yoga, malasana, namak)
- `detectVideo(text)` — keyword matcher on bot reply
- `injectVideoCard()` — appends a `.video-card` row to chat after each nushke bot reply (gated on `ST.chatCtx === 'nushke'`)
- Card design: gradient thumbnail (purple→teal) with emoji + small play overlay, title, "AYUSH · duration" meta line
- Click opens YouTube search query in new tab — durable, no broken video IDs

### Added — Phase 9: Polish + No Dead Ends (commit `f41068c`)
- Symptoms flow now has 8 starter chips (Sardi-Khansi, Pet ki takleef, Sir dard, Bukhar, Neend, Stress, Badan dard, Skin) — routes through nushke for richer Dadi response + video card
- Breathwork stop screen now appends 3 follow-up buttons (Community, Wellness, Wapas Hub) so user never lands on a blank end-state
- Family member add success → custom "🎉 jud gaye!" screen with 4 next-step CTAs (Lab report, Dawai reminder, Family list, Wapas hub) instead of silent return
- Visual polish: depth shadows on `.hub-cards`, `.sc-card`, `.peer-card`, `.lab-marker`, `.bubble.bot`; hover/active microinteractions on `.qa-btn`, `.assistant-card`, `.hub-list-item`

### Changed
- Hub header avatar: persona photo → SS initials circle (purple)
- Hub persona toggle pill cycles `🤝 Saathi` → `🧓 Dadi` → `🤱 Maa` (Saathi default for new users)
- Sehat Tools list expanded from 4 → 8 items with restored emoji-in-tinted-square icons
- Hub bar placeholder: "Sehat Saathi se poochho..." (locked at bottom — `min-height:0` on `.body` flex child)

### Fixed
- TTS now sets `utterance.lang` from response language (was hardcoded `hi-IN` for all output)
- Static QA grid that didn't reflect user behavior — now LRU-driven
- Hub feature pills had stripped icons after earlier refactor — restored emoji-in-tint pattern in v2
- Symptoms flow no longer dead-ends on a single bot greeting

### Broken / Known issues
- Lab Interpreter requires real `OPENAI_API_KEY` (Vision-capable) — Groq fallback does NOT support image input, so Vision calls bypass the dual-provider pattern
- Vision API spend: ~$0.01–0.03 per lab report (1–3 pages); capped at 5 pages per upload to limit cost
- File grew from ~1560 → ~3000 lines (per `wc -l index.html`) — well past 800-line ideal, accepted for prototype scope (see DEC-009)
- Web Speech voices vary wildly across devices — Indian language voices on iOS Safari are limited; voice picking gracefully falls back but quality differs by OS
- Nushke video cards open YouTube search in new tab (no embedded curated video IDs yet)

### New localStorage keys (Session 7)
| Key | Purpose | Shape |
|---|---|---|
| `ss_profile` | User profile + onboarding state | `{age, sex, weight, height?, bmi, scope, completed, skipCount, partialData}` |
| `ss_recent` | Recent feature LRU (max 6) | `string[]` of featureIds |
| `ss_lab_reports` | Per-member lab report memory | `{<memberKey>: [{date, fileName, reportType, summary, markers, doctorAdvice}]}` |

### New ST keys (Session 7)
- `userProfile` (hydrated from ss_profile on load)
- `onboardStep`, `onboardData`, `onboardReturnTo`, `pendingFeature`
- `recentFeatures` (hydrated from ss_recent)
- `labStep`, `labData`
- `communityPeer`

### Next session should start with
- Run `mcp__JioBharatIQ__validate_prototype` — should remain at 0 errors
- Test Lab Interpreter with a real lab PDF on mobile
- Test Community peer chats — verify each persona stays in character across multi-turn conversation
- Consider: swap `TTS_BACKEND = 'webspeech'` → `'bhashini'` for production-quality Indian language voices
- Consider: curate real YouTube video IDs for top 5 most-asked nushke procedures (replace search-query approach with embedded videos)
- Consider: progressive memory — Lab Interpreter could pre-load past markers in the Vision prompt for trending detection (e.g., "HbA1c rising over last 3 reports")

---

## 2026-05-07 — Session 6: Icon Fix + Hub Gamification

### Added
- **Sehat Score Card** — Daily anchor number (74), 3 interactive daily taps (Paani piya ✓, Swas kiya ✓, Raat ka khana ○), score auto-updates on tap. Score starts at 37 + increments per completed tap.
- **Streak pill** — "🔥 7 din" amber pill in score card top-right
- **Level bar** — "Sehat Rakshak · Level 2", progress bar 68/100, "32 points to Level 3" footer line
- **"Aaj ki kahani" story card** — Dadi photo, teaser text, visual audio player with 2:00 countdown (prototype, visual only). Sits above feature list.
- **Unlock card** — "Ritucharya — Monsoon Shield unlocks in 3 more days", amber "3" badge
- **Feature list reorder** — Ghar ke Nushke + Swas aur Sukoon prominent (purple, top); Dawai Reminder + Meal Planning + Parivaar muted (surface, below)
- **Persona photos** — All 5 assistant avatars now use persona photos from blueprint CDN (`persona-*.png`) with purple ring border
- **Inline JDS SVGs** — All Quick Action icons, hub pill icons, header avatar icons replaced with inline SVGs fetched via GitHub API (no filter:invert hacks)

### Changed
- Hub body rebuilt: greeting removed, replaced with Score Card at top
- Hub pill order: Nushke → Swas (prominent), Medicine → Meal → Parivaar (muted)
- `.assistant-avatar` CSS updated to 3px `#6D17CE` ring with box-shadow
- `.hub-pill-muted` class added for de-emphasized features

### Fixed
- Quick Actions icons no longer show orange "?" broken image (was `filter:invert(1)` on failed `<img>`)
- Assistant avatars no longer cartoon geometric SVGs

### Broken / Known issues
- Story audio is visual-only (prototype) — no real audio attached
- Streak and score are hardcoded (no persistence layer yet)

### Next session should start with
- Review gamified hub on mobile at https://cynical-spec.github.io/health-wellness/
- Consider: save tap state to localStorage so score persists across sessions
- Consider: wire real audio to the "Aaj ki kahani" story card

---

## 2026-05-06 — Session 1: Initial Build

### Added
- Single `index.html` file with full JioBharatIQ shell
- 7 screens: Home, Sehat Hub, Chat, Medicine, Meal Planning, Family, Breathwork
- OpenAI GPT-4o integration with two-turn remedy conversation flow
- SpeechRecognition voice input (lang: hi-IN, accepts all Indian languages)
- SpeechSynthesis TTS with 3 voice personas: Dadi, Maa, Saathi
- Language detection badge (Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi)
- Skill card injection: breathwork for anxiety, stretch for body pain, pressure points for headaches
- Medicine reminder flow: 4-step conversational UI, localStorage persistence, full-screen notification overlay
- Meal planning screen: fridge photo (GPT-4o Vision) + text input, 3-day Indian meal plan
- Family profiles: add/delete members, conditions, localStorage persistence
- Box breathing animation: 4-phase state machine (Saans Lo, Rokho, Choddo, Rokho)
- Gentle stretch guide and pressure point guide in breathwork screen
- JioBharatIQ home shell with 5 assistant cards (Cricket, Astro, Devotional, Career as placeholders)
- Voice overlay using HelloJio_Listening_242.mp4 from JDS CDN (dark theme)
- GitHub Actions workflow to inject OpenAI API key from repository secret
- GitHub Pages deployment via Actions

### Changed
- N/A — first build

### Fixed
- N/A — first build

### Broken / Known issues
- None known at end of session

### Next session should start with
- Test live URL on mobile
- Verify voice input works

---

## 2026-05-06 — Session 2: Bug Fixes

### Added
- N/A

### Changed
- API key injection switched from `sed` to Python `str.replace()` (sed broke on special chars in key)
- API key check changed from string comparison to `.length < 20` (string comparison was also replaced by Python injection, making it always true)
- Error message string no longer contains `REPLACE_WITH_YOUR_KEY` (was accidentally being replaced, exposing key in UI)

### Fixed
- **sed injection failure** — special characters in API key broke sed. Fixed with Python replace.
- **API key always showing error** — check `=== 'REPLACE_WITH_YOUR_KEY'` was itself replaced. Fixed with length check.
- **API key exposed in UI** — error message contained the placeholder string. Fixed by rewriting message.
- **GitHub Pages blocked** — repo was private. User made it public.

### Broken / Known issues
- None at end of session

### Next session should start with
- User confirmed "okay working" — proceed with feedback implementation

---

## 2026-05-06 — Session 3: Full Redesign (7 screens)

### Added
- Full JioBharatIQ home shell with assistant cards row (horizontal scroll)
- 6 quick action grid buttons with coloured icon backgrounds
- 3 update cards (Cricket IPL, Summer heat alert, Buddha Purnima)
- Sehat Hub screen with persona selector (Dadi/Maa/Saathi) and 5 hub pills
- Full-screen medicine reminder overlay (yellow glow, pulsing animation)
- Navigation history stack (`ST.history`) for proper back navigation
- Context label in chat header (updates per feature)
- Quick reply chips in chat
- Skill card injection from AI response text (regex-based detection)
- `showComingSoon()` toast for placeholder assistants/features

### Changed
- Complete rewrite of index.html (~1400 lines)
- Screen navigation uses slide transition (translateX) with history stack
- Error messages now specific: 401 → key invalid, 429 → rate limit, network → connectivity

### Fixed
- Hub input had no send button — added send button that appears when text is typed, hides when empty
- `clearChat()` now respects current chat context (Nushke vs Symptoms)

### Broken / Known issues
- None known

### Next session should start with
- User to confirm new build looks and works as expected

---

## 2026-05-07 — Session 4: Groq Fallback + JDS Compliance

### Added
- **Groq API fallback** — app tries OpenAI first, falls back to Groq (llama-3.3-70b-versatile) automatically
- `GROQ_API_KEY` secret injection in GitHub Actions workflow
- Specific network error messages (Load failed → actionable Hindi advice)
- **CLAUDE.md** project rules file
- **CHANGELOG.md** (this file)
- **MISTAKES.md** error log
- **DECISIONS.md** architecture decisions
- **STATUS.md** current feature state

### Changed
- `callAI()` now iterates providers array: OpenAI → Groq, first success wins
- Failed user messages are popped from history on error (enables clean retry)
- All emoji-as-icons replaced with JDS SVG CDN img tags
- Non-JDS surface colors (`#1e1e1e`, `#282828`) replaced with `rgba(255,255,255,0.06/0.10)`
- Family avatar uses initials letter instead of emoji
- All emoji stripped from button labels, NUSHKE_CATS, MED_STEPS, hub pills, screen titles

### Fixed
- JDS validation: 19 errors → 0 errors, 0 warnings (compliant)
- `ic_trash_clear` JDS icon used for family member delete button
- `ic_multiple_user` for family empty state

### Broken / Known issues
- Icons loaded via CDN `<img>` — if CDN is slow, icons flash. Acceptable for prototype.
- `ic_message_send` and `ic_sound_loud` don't have inline svg_path in MCP (CDN img used)

### Next session should start with
- Verify Groq key is working (user added GROQ_API_KEY secret)
- Test full conversation flow end-to-end on mobile
- Check voice input works with new build

---

## 2026-05-07 — Session 5: CLAUDE.md Compliance Verification

### Added
- CLAUDE.md added to repo with full project rules
- Firefox voice check — Speak buttons hidden when SpeechRecognition not supported

### Changed
- README.md rewritten with correct GitHub Actions setup (Secrets-based, not manual key replacement)
- Last emoji removed from showComingSoon() toast

### Fixed
- Gap vs CLAUDE.md Rule 6: voice API fallback now correctly hides Speak button on unsupported browsers
- README was describing outdated manual key injection — updated to Secrets + Actions workflow

### Broken / Known issues
- File is 1,430+ lines (over 800-line ideal in CLAUDE.md — flagged, acceptable for prototype)
- Icons load via CDN img (may flash on slow connections)
- setTimeout reminders don't persist across page reloads

### Next session should start with
- Full end-to-end test on physical mobile device
- Verify: speak "pet dukhtay" -> Marathi reply -> badge -> TTS
- Verify: "chest pain" -> escalation (no remedy)
- Verify: Groq fallback fires correctly when OpenAI unreachable

