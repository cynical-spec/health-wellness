# Architecture Decisions — Sehat Saathi

---

## DEC-012 — Symptoms-triage as the primary path on the hub (Tier 2/3 reframe)
**Date:** 2026-05-10 (Session 9)
**Decision:** Replace the 3-zone mood-first hub with a symptoms-triage-first layout: 8-button `tri-grid` of common takleefs as the primary CTA, the 3 mood emojis collapsed into a single-line `tri-mood` strip, and other use cases (Story, Saans, Lab, Dawai, Meal, Parivaar) demoted to a subtle horizontal `tri-rail`. The header (greeting + `tri-hero`) frames the whole screen as "Kya takleef hai?".
**Reason:** A tier-2/3 user with a sick child or back pain has a clear intent — get a remedy, fast. Asking them to first pick a mood ("Theek hoon / Kuch takleef / Bahut tension") is friction that buries the actual job-to-be-done. Direct-routing a symptom tap into the nushke chat means the very first AI turn IS the magical-moment answer.
**Trade-offs:** The mood path still exists (small strip + chat chips) but is no longer dominant. Some users who liked picking a mood may need to re-orient.
**Revisit if:** Engagement on the mood strip drops below 5% or symptom-grid taps don't dominate hub interactions.

---

## DEC-013 — In-app recipe step overlay replaces YouTube redirect for nushke
**Date:** 2026-05-10 (Session 9)
**Decision:** `injectVideoCard()` is now an alias for `injectRemedyCard()`, which opens an in-app `move-ov` overlay running the recipe steps with auto-advance + Sarvam TTS read-aloud. We keep 15 hand-crafted `REMEDY_KITS` (haldi-doodh, ajwain-bhaap, tulsi-kadha, etc.) covering every AYUSH ingredient already mentioned in our system prompt. The previous behavior — open YouTube search in a new tab — is removed from the user flow but `openVideoLink()` is kept as a back-compat function.
**Reason:** The user-stated magical moment is "the answer". The follow-up should reinforce, not eject. Sending the user to YouTube on every remedy was a context switch that broke trust. An in-app step overlay with TTS keeps the warm-voice magical-moment intact and is fully usable on a 2G connection (no video stream needed).
**Trade-offs:** New AYUSH ingredients require adding a kit; if the AI mentions one not in `REMEDY_KITS`, the user just gets the text answer (no card, no degradation).
**Revisit if:** AI starts mentioning ingredients we don't have kits for >10% of nushke replies.

---

## DEC-014 — Voice = transparent, two-way, mirrored conversation (no opaque mic state)
**Date:** 2026-05-10 (Session 9)
**Decision:** The voice overlay is rebuilt with: a state pill (`Sun rahi hoon` / `Soch rahi hoon` / `Bata rahi hoon`), live 5-bar EQ driven from the existing Web Audio analyser, and a transcript area that shows `Aap ne kaha: <user>` + `Saathi: <bot>` bubbles in-place. `addMsg('bot', ...)` mirrors bot replies into the overlay automatically whenever the overlay is open.
**Reason:** The user's exact words: "you don't know if it is listening or not... it should be high class, like how I'm talking to you on this machine via voice, and I can see my text are being written on the screen." Sarvam STT is POST-after-recording (no streaming), so we can't show interim word-by-word transcripts — but mic-level bars + transcript-on-arrival + bot-reply mirroring gives the same "I am being heard, this is a real conversation" affordance.
**Trade-offs:** No streaming partials yet. The mic bars are a proxy signal, not actual phoneme display.
**Revisit if:** Sarvam ships a streaming endpoint, or we add Bhashini for streaming partials.

---

## DEC-001 — Single HTML file architecture
**Date:** 2026-05-06  
**Decision:** All code lives in one `index.html` — CSS in `<style>`, JS in `<script>`, no build step, no npm.  
**Reason:** This is a prototype for rapid validation. Single file = easy to share, deploy, modify. No toolchain friction. GitHub Pages serves it directly.  
**Trade-offs:** File can get long (currently ~1420 lines, over the 800-line ideal). Acceptable for prototype stage.  
**Revisit if:** File exceeds 2000 lines or prototype moves to production.

---

## DEC-002 — GitHub Actions for API key injection
**Date:** 2026-05-06  
**Decision:** API keys stored as GitHub Secrets, injected at build time via Python `str.replace()` in a workflow step.  
**Reason:** Can't store real keys in the file (public repo). Can't use environment variables at runtime (no server). Build-time injection keeps the source file safe while making the deployed file functional.  
**Trade-offs:** Key is visible in the built HTML if someone has the Pages URL — acceptable for internal prototype, not for production.  
**Revisit if:** Moving to production. At that point, use a backend proxy.

---

## DEC-003 — Dark mode (explicit user request)
**Date:** 2026-05-06  
**Decision:** App uses dark mode despite JDS default being light mode.  
**Reason:** Explicitly requested by user. JDS supports dark mode via the same tokens — `#141414` (grey-100) as background, `rgba(255,255,255,0.06/0.10)` for surfaces.  
**Trade-offs:** JDS `validate_prototype` flags this as a warning (default is light mode) but user override is explicitly permitted per JDS rules.  
**Revisit if:** User requests light mode or a theme toggle.

---

## DEC-004 — Two-provider AI fallback (OpenAI → Groq)
**Date:** 2026-05-07  
**Decision:** `callAI()` tries OpenAI GPT-4o first. If network fails (TypeError), automatically retries with Groq llama-3.3-70b-versatile. Both use the same OpenAI-compatible chat completions API format.  
**Reason:** OpenAI's API is blocked or unreliable on some Indian ISPs. Groq is accessible and free. Groq's API is fully OpenAI-compatible, so zero code change needed for the request format.  
**Trade-offs:** Groq's Llama model is slightly different in personality vs GPT-4o — should still respect the system prompt and Hindi/vernacular instructions.  
**Revisit if:** Both APIs fail → consider hosting a simple Cloudflare Worker proxy.

---

## DEC-005 — JDS SVG icons via CDN img tags (not inline svg_path)
**Date:** 2026-05-07  
**Decision:** Icons that the JioBharatIQ MCP returns without an `svg_path` (e.g. `ic_sound_loud`, `ic_message_send`) are loaded via `<img src="CDN_URL">` with `filter:invert(1)` for dark mode. Icons with `svg_path` are inlined.  
**Reason:** The CDN SVG files exist and load in browser; the MCP just doesn't return the path data for all icons. Inline SVG is preferred but CDN img is an acceptable fallback for prototype.  
**Trade-offs:** CDN img icons may flash on slow connections. No visual fallback if CDN is down.  
**Revisit if:** All icon svg_paths become available from MCP, or moving to production.

---

## DEC-006 — Skill card injection from AI response text
**Date:** 2026-05-06  
**Decision:** After each AI response, `detectSkill(text)` runs regex on the response to surface a contextually relevant skill card (breathwork for anxiety/tension mentions, stretch for body pain, pressure points for headaches).  
**Reason:** This creates the "intelligence" moment — the app proactively offers an action the user can take right now, without requiring them to navigate. Makes the product feel proactive.  
**Trade-offs:** Regex matching is imperfect — may miss some mentions or false-positive trigger. Acceptable for prototype.  
**Revisit if:** Skill cards are triggering incorrectly too often.

---

## DEC-007 — Family avatar uses initials, not emoji
**Date:** 2026-05-07  
**Decision:** Family member avatars show the first letter of the member's name (e.g. "R" for Raju) instead of gender emoji.  
**Reason:** JDS strictly forbids emoji. Initials are cleaner, more personal, and fully JDS-compliant.  
**Trade-offs:** Less visually expressive than emoji. Acceptable per JDS rules.  
**Revisit if:** JDS adds a user/avatar component with gender variants.

---

## DEC-008 — Voice uses HelloJio MP4 from JDS CDN
**Date:** 2026-05-06  
**Decision:** Voice listening overlay uses `<video autoplay loop muted playsinline>` with `HelloJio_Listening_242.mp4` from the JDS CDN. Dark theme variant.  
**Reason:** JDS explicitly mandates this. CSS dots/divs for voice avatar are strictly forbidden by JDS rules. The MP4 is the canonical voice state visual.  
**Trade-offs:** Requires CDN to be reachable. Video may not autoplay on some browsers without user gesture — `muted` + `playsinline` handles most cases.  
**Revisit if:** CDN goes down or video doesn't play on target devices.

---

## DEC-009 — Accept file size growth past 800-line ideal
**Date:** 2026-05-07 (Session 7)
**Decision:** index.html grew from ~1560 → ~3000 lines during Session 7's v2 expansion (Onboarding + Lab + Community + Wellness + Videos + Voice v2 + Polish). We are NOT splitting the file at this point.
**Reason:** The single-file architecture (DEC-001) gives outsized prototype velocity — every change is one diff, one commit, one deploy. Splitting would force a build step, lose GitHub Pages simplicity, and add toolchain friction. Each new feature added 100–400 lines but each is contained in clearly-marked sections (`// ── v2: Lab Interpreter ──` etc.). Search-by-section remains fast.
**Trade-offs:** Editor scrolling is annoying; cold-reading is harder; grep is essential. Acceptable for a prototype that prioritizes feedback loops over engineering aesthetics.
**Revisit if:** File exceeds 5000 lines, or this product moves from prototype → production pilot. At that point, refactor into ES modules with a Vite build, deploy as a static SPA.

---

## DEC-010 — TTS pluggable backend shim (`TTS_BACKEND` constant)
**Date:** 2026-05-07 (Session 7)
**Decision:** `speak(text)` is now a thin dispatcher that delegates to `speakWebSpeech()` based on `const TTS_BACKEND = 'webspeech'`. Future swaps to Bhashini (free, Govt of India) or Google Cloud TTS only require adding a sibling implementation and changing the constant.
**Reason:** Web Speech API quality on Indian languages varies severely across devices/browsers — iOS Safari has limited voices, Chrome on low-end Android has decent Hindi but weak Tamil/Bengali. Production needs Bhashini's 22-language coverage. Designing the shim now (zero cost) avoids a refactor later.
**Trade-offs:** None — the shim is a one-line dispatcher, costs nothing to maintain. Slightly more indirection in the call site.
**Revisit if:** Moving to production → swap to `'bhashini'` and add `speakBhashini(text)` that POSTs to https://bhashini.gov.in/api endpoint.

---

## DEC-011 — Soft skippable onboarding (vs hard gate)
**Date:** 2026-05-07 (Session 7)
**Decision:** First-time hub entry shows onboarding but user can tap "Baad mein" to skip. Skip count tracked in `ss_profile.skipCount`; after 3 skips, never auto-prompts again — only via explicit Profile tile.
**Reason:** Hard onboarding gates have well-documented drop-off rates. For a vernacular health app where users may be exploring out of curiosity, mandatory profile capture would lose users at the door. Three soft prompts give multiple touch-points to convert without ever blocking access.
**Trade-offs:** Some users may never complete onboarding → personalization (Community matching, BMI guidance) won't apply. Acceptable: those users still get full Sehat Saathi value, just without the proactive matching.
**Revisit if:** Drop-off analytics show users exploring deep features without profile — at that point, prompt at the deeper-engagement moment (e.g., when they save a 3rd item).

---

## DEC-012 — Community is AI-simulated peer roleplay (not real users)
**Date:** 2026-05-07 (Session 7)
**Decision:** Sehat Charcha shows 5 curated peer personas (Sunita/Ramesh/Priya/Asha/Arjun); each is a system-prompted GPT-4o roleplay. NOT real users. A disclaimer banner is shown on every peer chat: "Yeh ek AI peer roleplay hai — asli user nahi".
**Reason:** A real-user community requires moderation, abuse prevention, content policies, identity verification, and a backend. None of those exist in a static-Pages prototype. AI peers deliver the *emotional* experience of "logo se milo jo apke jaise hain" today. Disclaimer keeps the product honest — never claims to be something it's not.
**Trade-offs:** Cannot demonstrate real peer support. Mitigated by carefully tuned `sysPrompt` per peer that enforces lived-experience first-person framing.
**Revisit if:** Project moves to production with backend + user auth + moderation infrastructure. Then peer cards become real user profiles + curated stories from real users (with consent).

---

## DEC-013 — Lab Interpreter uses GPT-4o Vision via existing `OPENAI_API_KEY` (no Groq fallback)
**Date:** 2026-05-07 (Session 7)
**Decision:** `interpretLabPDF()` sends pdf.js-converted page images to GPT-4o Vision with a structured-JSON prompt (`response_format: { type: 'json_object' }`). Groq's models do not support image input as of May 2026, so the dual-provider fallback (DEC-004) does NOT apply to Lab Interpreter — Vision calls fail hard if OpenAI is unreachable.
**Reason:** No alternative free Vision API exists for Indian-network users. Anthropic Claude has Vision but introduces a third API key. For a prototype, accepting the failure mode (with a clear error toast) is simpler than adding another provider.
**Trade-offs:** Lab Interpreter is unusable when OpenAI is blocked. ~$0.01–0.03 per report — capped at 5 pages per upload to limit spend. Document this in CHANGELOG so users know.
**Revisit if:** OpenAI Vision blocking becomes routine on target ISPs → integrate Anthropic Claude Vision (`claude-haiku-4-5`) as a third provider.

---

## DEC-014 — Nushke video cards use YouTube search query (not curated video IDs)
**Date:** 2026-05-07 (Session 7)
**Decision:** `NUSHKE_VIDEOS` map stores `{kw, emoji, title, dur, q}` where `q` is a search query string. Tapping the video card opens `https://www.youtube.com/results?search_query=<q>` in a new tab.
**Reason:** Curating specific video IDs requires verifying each ID exists and stays online, plus copyright/embed-permission considerations. A YouTube search query is durable, evergreen, and lets the user pick from current relevant videos. The card UI itself is in our app and stays consistent.
**Trade-offs:** Less polished than a controlled embed. Opens external tab. No autoplay or in-app playback.
**Revisit if:** Project moves to production — at that point partner with Ministry of AYUSH or licensed Ayurveda channels for embedded curated videos with explicit reuse permission.

---

## DEC-016 — Replace Web Speech API with Sarvam (Saarika STT + Bulbul TTS)
**Date:** 2026-05-07 (Session 8)
**Decision:** Removed all `window.speechSynthesis` and `window.SpeechRecognition` code. Voice in/out now goes through Sarvam AI: STT via `api.sarvam.ai/speech-to-text` (model `saarika:v1`), TTS via `api.sarvam.ai/text-to-speech` (model `bulbul:v1`). Personas mapped to specific Sarvam speakers: Dadi → pavithra, Maa → meera, Saathi → amol. New `SARVAM_KEY` secret + workflow injection.
**Reason:** Web Speech API quality on Indian languages is severely device-dependent and broken on Firefox/Edge entirely. Production needs consistent Indian-language voice. Sarvam is built specifically for Indian languages, has decent free tier for prototyping, and gives us per-persona speaker control we couldn't reliably get from browser TTS. The TTS_BACKEND shim from DEC-010 was the migration path; this commit collapses it.
**Trade-offs:** Now dependent on Sarvam uptime + network reachability + a paid (or rate-limited) API. Without `SARVAM_KEY` set, voice silently disables (text still works). Bulbul has ~500 char input cap — story playback chunks at sentence boundaries.
**Revisit if:** Sarvam pricing changes substantially, OR Bhashini (Govt of India free TTS) reaches production parity, OR the prototype needs offline voice.

---

## DEC-017 — `LANG:<code>` prefix on every assistant reply, parsed and stripped client-side
**Date:** 2026-05-07 (Session 8)
**Decision:** Updated SYSTEM_PROMPT to require the model to prepend `LANG:hi` (or `mr`/`bn`/`ta`/`te`/`kn`/`ml`/`gu`/`pa`/`en`) on the first line of every response. `callAI()` parses this prefix, sets `ST.currentLanguage`, then strips it before rendering.
**Reason:** Sarvam TTS needs an explicit `target_language_code` — the script-detection regex from DEC-003 worked for Devanagari/Bengali/etc. but failed for Roman-Hindi (Hinglish), Marathi-in-Devanagari (looks like Hindi), and code-switched replies. Letting the model declare the language eliminates ambiguity.
**Trade-offs:** Costs ~2 tokens per reply (negligible). If the model omits the prefix, we fall back to `detectLang()` script regex. If both fail, defaults to `hi-IN`.
**Revisit if:** Models start ignoring the prefix instruction reliably, OR we move to a structured `response_format: json_object` flow throughout (currently used only for stories + lab reports).

---

## DEC-018 — Sehat hub becomes a 3-zone "home", tools move to bottom sheet
**Date:** 2026-05-07 (Session 8)
**Decision:** The Sehat hub no longer shows a feature list as the default view. Three zones only — greeting, 3 mood buttons, story card + score strip. All tools (Nushke / Lab / Dawai / Meal / Family / Profile) are accessible via a 3-dot menu in the header that opens a bottom sheet. Mood taps lead to a chat with contextual chips that route to features.
**Reason:** The earlier list-style hub presented every tool with equal weight, which made the "what should I do" decision overwhelming. The 3-zone design forces a single primary decision (mood) and lets the AI guide users to the right tool through chips. Story card surfaces proactive content. Score strip rewards engagement without dominating real-estate.
**Trade-offs:** Tools are one tap deeper now. Heavy users who knew the previous layout will need to discover the menu. Mitigated by mood chips routing to the most likely tool for each emotional state.
**Revisit if:** Analytics show users not finding tools they need, OR a tool sees a sharp engagement drop after this change.

---

## DEC-019 — Story content generated dynamically per persona + season + language
**Date:** 2026-05-07 (Session 8)
**Decision:** "Aaj ki kahani" no longer ships pre-written stories. On Suno-tap, OpenAI generates a fresh 130-word first-person Ayurvedic story with the persona's voice (Dadi grandmother / Maa kitchen-wisdom / Saathi peer), seasonally appropriate (monsoon/winter/summer), in the user's detected language. JSON-mode response gives `{title, preview, fullText}`. Cached for 30 minutes per (persona, season, theme) to avoid regenerating on every tap.
**Reason:** Static stories don't scale across 9 languages × 3 personas × 3 seasons × multiple themes (general/calm) = 162+ variants. Generating on demand keeps content fresh, language-appropriate, and lets us ship one feature for 9+ languages at once. The 30-min cache amortises API cost.
**Trade-offs:** ~$0.005 per story generation. Cold-start latency (~3–5s) before audio plays. If OpenAI is unreachable, falls back to a default Dadi-ajwain story.
**Revisit if:** Story quality varies too much across personas/languages, OR API spend grows past budget — at which point pre-generate top 30 (persona × season × language) combos and cache permanently.

---

## DEC-020 — Sehat Charcha downgraded to "Jald aa raha hai" stub
**Date:** 2026-05-07 (Session 8)
**Decision:** The 5 AI-peer roleplay system built in Session 7 (DEC-012) is hidden behind a disabled tile in the new bottom sheet labelled "Jald aa raha hai". `PEER_PROFILES`, `renderCommunityList`, and `openPeerChat` remain in the codebase as dormant code.
**Reason:** User explicitly requested this in the Session 8 spec — Charcha was the one tool not deemed ready alongside the v3 redesign. Keeping the code dormant lets us re-enable later without rebuilding from scratch. Disabling cleanly is preferable to silently shipping a feature that doesn't meet the new bar.
**Trade-offs:** Dead code carries some maintenance cost. Will need explicit decision to re-enable or delete.
**Revisit if:** Community is ready to ship (real peers backed by real users + moderation), or after 3 months of dormancy → consider removing.

---

## DEC-021 — Meal Planning prompt explicitly enumerates household chronic conditions
**Date:** 2026-05-07 (Session 8)
**Decision:** Meal Planning system prompt now reads household chronic conditions from `ss_profile` (user) + `ss_family` (each member's `conditions` field) and prepends "IMPORTANT — household chronic conditions to respect" to the user message. The model is instructed to avoid contraindicated foods (low-glycaemic for Diabetes, low-sodium for BP, no spicy/fried for acidity, etc.).
**Reason:** A meal plan that ignores BP or Diabetes is worse than no meal plan — could actually harm. Pulling conditions from existing storage means no new UI, just smarter prompting.
**Trade-offs:** Prompt grows by ~50–150 tokens per request. The model still relies on its general knowledge of contraindications — not a replacement for a registered dietician. Disclaimer should remain visible (not yet enforced — TODO).
**Revisit if:** Users report inappropriate meal suggestions for known conditions → switch to a structured rule-based filter on top of the AI output.

---

## DEC-015 — `FEATURE_REGISTRY` includes cross-assistant placeholders
**Date:** 2026-05-07 (Session 7)
**Decision:** `FEATURE_REGISTRY` includes `cricket`, `astro`, `bhajan` entries with `external: true` flag, even though those assistants are not yet built. They route to `showComingSoon()`.
**Reason:** When the home QA grid renders the user's recent features, future visits to other assistants (Cricket Dost, Astro Companion, etc.) should track too. Pre-registering them means we don't need to refactor `renderQuickActions()` later — just remove the `external` flag and add a real `action`.
**Trade-offs:** Three rows of registry that don't do anything useful today. Trivial cost.
**Revisit if:** Other assistants get implemented — flip `external: false` and wire up.
