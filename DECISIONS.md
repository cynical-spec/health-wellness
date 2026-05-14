# Architecture Decisions — Sehat Saathi

---

## DEC-025 — Movement step animations: Lottie infrastructure with inline SVG fallback (hybrid)
**Date:** 2026-05-14 (Session 14 / v5.4)
**Decision:** Every MOVEMENT_SKILLS step animates via a two-layer renderer:
1. **Lottie layer (primary, when URL supplied)** — `lottie-web@5.12.2` loaded via deferred CDN script. Each skill can declare a parallel `lottie: ['<url>', ...]` array. When a step has a URL, `renderStepAnim` calls `window.lottie.loadAnimation` to play it.
2. **Inline SVG layer (active fallback)** — 39 hand-authored SVGs in `ANIM_SVG` using SMIL `<animate>` / `<animateTransform>`. Each MOVEMENT_SKILLS step declares an `anim: ['<key>', ...]` array; renderer looks up the SVG by key and sets `innerHTML`.
3. **Emoji fallback (legacy)** — for skills without `anim` or `lottie` (e.g. REMEDY_KITS which don't need movement animation), the existing pulsing-emoji circle is preserved.

The user explicitly chose Lottie when offered the architectural choice. The hybrid honors that choice while shipping a working animation today on every step.

**Reason:** Sourcing 65+ production Lottie JSONs in a single session is impractical from this environment — LottieFiles.com URLs change/expire and hand-authoring bezier-keyframe JSON is ~150-300 lines per animation. Inline SVG can be hand-authored cleanly (~1 line per animation, parameter-tunable), works offline, and keeps the single-file discipline (CLAUDE.md §6) for the visual layer. The Lottie player itself is a one-time ~110 KB CDN dependency — accepted as breaking strict single-file discipline because the value (drop-in upgrade per step) is high and the player is loaded with `defer`.

**Trade-offs:**
- SMIL animation has degraded support in Firefox (static last frame). Already known limitation — voice (Sarvam/Web Speech) requires Chrome/Safari (DEC-007), so the existing browser matrix is unchanged.
- Lottie player loaded even when no `lottie[]` slots are populated — ~110 KB of wasted bytes until at least one URL is set. Defer-loaded so doesn't block FCP. Accepted because slot-and-fill upgrade pattern is more valuable than the bytes.
- ANIM_SVG library is ~40 hand-authored SVG strings inside `index.html` (~600 lines of JS template literals). Keeps single-file but adds bulk. Each SVG is 200×200 SMIL with `#22c55e` accent; visual style is "stylized geometric figure with motion" not "realistic illustration".
- Real Lottie animations require manual URL sourcing per step. Acceptable: the SVG fallback is always there, and Lottie upgrade is a one-line edit per step when the user finds a good URL.

**Revisit if:** (a) the user supplies a curated Lottie library, then we drop the SVG layer for those skills; (b) Lottie player CDN goes down — SVG layer keeps working; (c) we move to a backend that can serve pre-rendered video clips per step (then both Lottie and SVG become legacy).

---

## DEC-024 — Sarvam calls go through our own Cloudflare Worker, baked into source
**Date:** 2026-05-13 (Session 13 / v5.3.9)
**Decision:** The compile-time default proxy for every Sarvam call (`/text-to-speech`, `/speech-to-text`, `/transliterate`) is `https://sarvam-proxy.nawaneet-kumar.workers.dev/`. The Worker is a ~15-line pass-through that forwards to `api.sarvam.ai`, answers OPTIONS preflight with `204 + Access-Control-Allow-*`, and strips `host`/`origin` headers. `localStorage.ss_sarvam_proxy` still overrides if set — useful for testing alt proxies. `window.SARVAM_PROXY` is a secondary runtime override.
**Reason:** Sarvam's own API returns HTTP 400 on the OPTIONS preflight from `github.io` origins when custom `api-subscription-key` headers are sent, even though it returns `Access-Control-Allow-*`. Chrome blocks the POST. Third-party proxies (`corsproxy.io`) fail the same preflight when custom headers are present. The Worker is the only durable fix that (a) handles preflight cleanly, (b) doesn't require Sarvam to change their CORS config, (c) doesn't depend on a third party's free-tier uptime, (d) doesn't require every user to paste a console command.
**Trade-offs:** New hard dependency on `sarvam-proxy.nawaneet-kumar.workers.dev`. If the CF account is suspended or the Worker is deleted, all Sarvam voice breaks until users paste a new proxy via `setSarvamProxy()`. Worker is currently on CF free tier (100k req/day, more than enough for prototype). API key is still sent client-side — the Worker does not store it. Worker URL embeds the deployer's CF account name (`nawaneet-kumar`); already public via DNS, no additional leak.
**Revisit if:** (a) Sarvam fixes their CORS preflight to return 2xx on github.io origin (then we can drop the proxy and hit `api.sarvam.ai` directly), or (b) we move to a real backend where the API key lives server-side (then the Worker becomes the auth point too, not just CORS). Either path makes this decision moot.

---

## DEC-023 — Symptom Focus Mode is a full hub takeover, single-active-at-a-time
**Date:** 2026-05-10 (Session 12 / v5.3)
**Decision:** When a user starts a takleef Focus Mode (Sir dard / Sardi-khansi / Pet / Neend), a `body.focus` class hides every non-focus surface (`.tri-hero`, `.aham-row`, dense grids, Sunita home, secondary rail) and reveals a `.focus-home` block: gradient symptom banner + Dadi quote + 3-step Healing Path stepper + escape-hatch doctor link. Only one focus is active at any time; starting a new takleef while one is active prompts a confirm dialog to replace it.
**Reason:** Navneet's explicit ask: *"when user selects sir dard, the whole app experience and home screen change towards fixing that issue — it tries to feel the problem and solve for you."* A pinned banner with normal hub still visible would split attention and dilute the "the app is committed to fixing this" signal. Single-active-at-a-time keeps the model simple — users have one problem in mind when they tap a takleef.
**Trade-offs:** Other entry points (Lab, Dawai parchi, daily habit) are temporarily hidden when focus is active. The stories rail stays visible so users can still see streak/score/reminders, and the Sehat Tools bottom sheet (3-dot menu) reaches every feature. Pause/X escape is one tap away on the banner.
**Revisit if:** Multi-symptom users complain they can't access other tools mid-focus, OR if data shows users frequently abandon a focus to reach another feature.

---

## DEC-024 — Per-symptom validation timing tuned to remedy timeline
**Date:** 2026-05-10 (Session 12 / v5.3)
**Decision:** Validation circle ("Kaisa hai ab?") fires after a per-symptom delay: Sir dard 30 min, Pet 2 h, Sardi-khansi 4 h, Neend 8 h (next-morning). Each delay matches how quickly the corresponding ghar ka nuska actually works in practice. `?demo_focus=1` URL param lowers all delays to 30 seconds for QA.
**Reason:** A uniform 1-hour delay misfires for Sir dard (too late — most people would've already known if Tulsi kadha worked in 30 min) and Neend (too early — sleep needs a full night to validate). Tuned delays make the *kaisa hai ab?* moment land with the right honesty.
**Trade-offs:** Four magic numbers to maintain. Mitigated by sourcing them from `FOCUS_FLOWS[symptom].validateAfterMin` (single source of truth) and exposing the demo flag for fast QA. Could be tuned per-user in the future based on profile (age, condition) if data warrants.
**Revisit if:** L0 SIT data shows materially different "remedy actually worked" timing than the assumed buckets.

---

## DEC-025 — Ayurvedic upsell is inline-only, piggybacks on existing MEDICINE_CATALOG + Sehat Bazaar
**Date:** 2026-05-10 (Session 12 / v5.3)
**Decision:** When a Focus Mode validation answer is "Bahut behtar", a long-term Ayurvedic supplement card slides into `#bless-ov`. Tap → existing Sehat Bazaar (`s-order`) opens with the SKU pre-loaded. No standalone Ayurvedic Store screen. 4 SKUs added to `MEDICINE_CATALOG`: `ayur-bramhi`, `ayur-sitopaladi`, `ayur-hingvashtak`, `ayur-ashwagandha` — real Indian brands, real MRP/discount, AYUSH-compliant.
**Reason:** The upsell makes sense only after the user has just experienced acute relief — that's the exact moment they're open to the idea of long-term prevention. A standalone store would surface the same SKUs to a user without context, which feels like push-marketing. Piggybacking on existing Sehat Bazaar means zero new checkout code — the v5 cart/address/payment/success flow handles fulfillment unchanged.
**Trade-offs:** Users who never reach a "better" validation never see the Ayurvedic SKUs. Acceptable for v5.3 — if engagement data shows demand for a standalone surface, we add it in a follow-up (planned as `s-ayur` per the explored option).
**Revisit if:** ≥20% of users tap "Abhi nahi" on the upsell card AND open the Sehat Bazaar tab within the same week, indicating they want to revisit the offer without re-triggering a focus.

---

## DEC-026 — Focus state persists in `ss_focus`, single row, survives tab close
**Date:** 2026-05-10 (Session 12 / v5.3)
**Decision:** Active focus lives in `localStorage.ss_focus` as a single JSON object: `{symptom, startedAt, qaAnswers, steps[], retryCount, validations[], resolved, resolvedAt, allStepsDoneAt}`. Closing the tab and reopening picks up exactly where the user left off — step statuses, score, validation timing all restored. Resolved focuses stay in the row briefly (until next focus starts) so the blessing/doctor flow can complete cleanly; then `endFocus()` removes the key.
**Reason:** Mirrors the v5.2 `ss_checkins` pattern (DEC-020) — hub-reopen scan, no service worker, no setTimeout. Survives reload, which is critical because users juggle apps. Single-row model avoids the complexity of a queue while the multi-focus use case is unvalidated.
**Trade-offs:** Single-row means we can only remember one in-flight problem at a time. If a user has both Sir dard and Pet dikkat simultaneously, they have to resolve/pause one before the other gets focus. Acceptable until L0 data shows this is real.
**Revisit if:** Multi-focus emerges as a real need from user testing.

---

## DEC-020 — 48h symptom check-in fires by hub-reopen scan, not service worker
**Date:** 2026-05-10 (Session 11 / v5.2)
**Decision:** When a user taps a symptom (`triSymptomTap`), we log it in `ss_checkins` with `status:'pending'`. On every hub re-render (`renderHubStories` called from `initHubDynamic`), we scan for any pending row ≥48h old and surface it as a pulsing red-orange "Kaisa hai?" circle, first position. No service worker, no client-side `setTimeout` (would die on tab close).
**Reason:** A static-html prototype on GitHub Pages can't reliably push notifications without a Service Worker + VAPID keys + a backend. The hub-reopen pattern works on any device, doesn't require permissions beyond what's already in place for browser notifications (which still fire as a secondary surface when permitted), and naturally aligns with the user's intent — they only know about a check-in *because* they came back to the app. URL param `?demo_checkin=1` lowers the threshold to 10 seconds for QA so reviewers can validate the full loop in one sitting.
**Trade-offs:** A user who never returns within 48h gets no nudge — but they also weren't a daily user. For the L0 SIT cohort we care about return cadence, not absent-user recovery. When we wire WhatsApp templates (already planned for dawai reminders), the check-in template piggybacks for the absent-user case.
**Revisit if:** L0 SIT cohort shows >40% of check-ins go stale because users don't return within a week.

---

## DEC-021 — Sunita mode auto-toggled by `profile.age >= 40 OR scope === 'household'`
**Date:** 2026-05-10 (Session 11 / v5.2)
**Decision:** A `body.sunita` class is applied automatically when the user's profile indicates Sunita archetype (40+, or anyone with a `household` caregiver scope). The class hides the dense v5.1 wellness + symptoms grids + `aham-row` via `.dense-only` markers, and reveals a parallel `.sunita-home` block (4 primary tiles + 4 takleef + collapsible "Aur dekho" expand). No toggle UI — the user shouldn't have to know about it.
**Reason:** Sunita-archetype users explicitly told us (via Navneet's research) they want fewer choices, larger targets, and a clear path to care. Younger digitally-literate users want the dense, multi-modal grid because they're optimizing across wellness and symptoms simultaneously. One size doesn't fit both; profile-driven inference does. Manual toggle would require Sunita to discover and use a setting — she won't. Always-on simplification would strip the younger audience of surface area they want.
**Trade-offs:** A 39-year-old caregiver (scope: 'family' but not 'household') gets the dense view. The threshold is a heuristic; the right answer is feature-flag with cohort split-test in production. For prototype, age + scope are good enough proxies.
**Revisit if:** Engagement on Sunita home is materially different from dense home (better or worse), OR if profile data shows the 35–42 band is bimodal in preference.

---

## DEC-022 — Doctor handoff = in-app card with `tel:` + external placeholder links
**Date:** 2026-05-10 (Session 11 / v5.2)
**Decision:** When the check-in answer is "worse", or when Sunita-home's "Doctor se baat" tile is tapped, we open a full-screen `#doctor-ov` with three 88px CTAs: (1) `tel:18001801104` (NDHM Helpline placeholder — real free Govt of India number), (2) Practo.com `target=_blank`, (3) 1mg.com `target=_blank`. No real Practo / 1mg API integration — this is intentionally stubbed.
**Reason:** Akshay's review called out that the JTBD breaks if "remedy didn't work" leads nowhere. We need *something* to put in front of the user that says "we hear you, here are real next steps." A `tel:` link is universally honored by mobile OSes and dials a real free helpline. The Practo and 1mg external links are honest placeholders — they leave the app, but they leave it to a credible destination, not a generic search page. Real Practo API requires a partnership and OAuth flow we can't ship in prototype.
**Trade-offs:** External links break the warm-conversation magical moment (just like the YouTube card did in v3 — see DEC-013). Acceptable for this case because: (a) the user has explicitly said "I want a doctor" — they're already exiting the conversational mode; (b) we keep the in-app `tel:` option as a no-context-switch primary; (c) when partnerships are signed, swap the external links for in-app booking flows.
**Revisit if:** A Practo / 1mg / Pristyn Care partnership is signed and an in-app booking surface is feasible.

---

## DEC-015 — Three magical moments get equal primary real estate (Symptoms / Lab / Dawai)
**Date:** 2026-05-10 (Session 10 / v5)
**Decision:** The home now treats Symptoms triage, Lab Report, and Dawai parchi as three peer entry points. Symptoms keeps its 8-button `tri-grid`, but a new 2-card `aham-row` (gradient, full-width tiles) sits directly under the hero promoting Lab and Dawai. Wellness goals stay where they are. The `tri-rail` keeps secondary use cases but loses Lab and Dawai (now promoted) and gains "Mera Sehat" (unified Reminders + Orders + Reports list).
**Reason:** Earlier sessions iterated on whichever flow we tested last — this kept demoting Lab/Dawai because nobody was tapping them, but they weren't being tapped *because* their flows ended in dead-end summaries. Promoting before completion would have been a UX lie; completing all three flows simultaneously and giving them peer real estate is the right time to commit.
**Trade-offs:** Above-the-fold height grew. On a 390×844 frame the `aham-row` pushes the wellness grid below the fold by ~120px. Acceptable — Lab and Dawai are higher-intent surfaces than wellness for tier-2/3 users with a real takleef in hand.
**Revisit if:** Tap-rate analytics show the `aham-row` underperforming the symptoms grid by >5x, OR the home becomes too long to scan on a 390px screen.

---

## DEC-016 — Template-based OCR fallback for every AI-Vision feature
**Date:** 2026-05-10 (Session 10 / v5)
**Decision:** Every AI-Vision-dependent feature (Lab Interpreter photo+PDF, RX prescription photo+PDF) ships with a hand-written template fallback that runs through the same UI animation and returns a realistic, on-tone sample result. `LAB_PHOTO_TEMPLATES` (3 reports — Anaemia, High-Cholesterol, Diabetes) and `RX_TEMPLATES` (3 prescriptions — Diabetes-BP, Pediatric-Fever, Cold-Cough) are cycled randomly per scan. Sample summaries are tagged `[Sample analysis — prototype mode bina Vision API ke]` so the user knows the source. Real Vision (when keys land) replaces the template return — call sites stay identical.
**Reason:** Vision-only paths break for: (a) new dev environments without `OPENAI_API_KEY`, (b) Indian ISPs that block OpenAI (DEC-004), (c) demo settings where keys can't be exposed, (d) CI/preview deploys. The user explicitly said "for prototype the lab report interpreter and medicine prescription upload and fulfilment should be some template as we will need proper API key for vision which we will do later" — this is the architectural codification of that.
**Trade-offs:** Templates have to be maintained alongside the real AI prompt. Worth it — they double as regression tests, demo content, and ISP-resilience.
**Revisit if:** Vision becomes universally reliable AND template content becomes a maintenance burden.

---

## DEC-017 — Reliance Netmeds as the (templated) fulfilment partner
**Date:** 2026-05-10 (Session 10 / v5)
**Decision:** "Sehat Bazaar" branding throughout the order flow names Reliance Netmeds as the fulfilment partner ("Reliance Netmeds — Tier 2 + 3 delivery · COD available · 100% original"). Order IDs use the `NM<base36>` prefix. Tier 2/3 ready: COD highlighted, free delivery above ₹199, Hindi WhatsApp tracking, addresses pre-seeded with Lucknow + Varanasi.
**Reason:** User direction: "medicine reminder then gets tied up with medicine fulfillment, netmeds is acquired by reliance and they do serve tier 2 and tier 3 cities." Netmeds-Reliance is the most credible tier-2/3 medicine fulfilment in India today, and a Jio family product naturally co-brands with the rest of the Reliance health stack. The flow currently uses templates — when real Netmeds API access is provisioned (B2B partnership), wire `orderPlace()` to their `/api/orders` and they'll handle fulfilment from their warehouse network.
**Trade-offs:** Hard dependency on a single provider's API surface eventually. Mitigated by keeping the cart shape generic — the order object has `items[].sku` mapped via `MEDICINE_CATALOG`, and the Netmeds adapter is one function away.
**Revisit if:** A different pharmacy partnership offers better tier-2/3 coverage, or Netmeds API becomes restrictive.

---

## DEC-018 — Three reminder delivery channels: App / WhatsApp / Voice call
**Date:** 2026-05-10 (Session 10 / v5)
**Decision:** Every saved reminder picks one of three delivery channels: (a) JBIQ App full-screen overlay (existing path, real), (b) WhatsApp Hindi message to a phone number (placeholder — toast warns "prototype hai"), (c) Voice call where Saathi reads the reminder aloud (placeholder, same toast). The channel is part of the reminder model on `ss_rems`. WhatsApp/Voice paths require a phone number; the input is conditional.
**Reason:** User direction: "the reminder can happen two ways via JBIQ app as full screen reminder to the user and or whatsapp, alternatively voice recording can also happen for your family to receive call where digital literacy is a problem." For tier-2/3 users, the most loving caregiving move is setting a reminder on *their own* phone for *their dadi/papa* who can't read English on a glass screen. Voice call is the killer feature for that segment.
**Trade-offs:** WhatsApp requires Gupshup/Twilio business API (~₹0.30 per message in India). Voice call requires Twilio Voice or Exotel (~₹0.50 per call). Both have small monthly minimums. Templates of the message text are baked into the prototype so the integration is one function call away.
**Revisit if:** WhatsApp Business API pricing changes materially, OR users prefer SMS over WhatsApp in field testing.

---

## DEC-019 — PR preview via raw.githack + workflow artifact (no Pages source change)
**Date:** 2026-05-10 (Session 10 / v5)
**Decision:** `pr-preview.yml` posts a PR comment with two preview URLs (raw.githack.com and jsDelivr) plus a downloadable artifact link. The artifact has API keys injected so reviewers can run the full chat/voice experience locally. The existing `deploy.yml` and Pages source (Actions → main) are unchanged.
**Reason:** The user asked "figure out way of putting this in preview before we merge". The cleanest options were: (a) switch Pages source to a `gh-pages` branch and serve `/preview/<branch>/` subpaths — but that's a one-time settings change and we'd lose the existing `deploy.yml`; (b) use Netlify/Vercel — adds a new external dependency; (c) use raw.githack.com which serves any GitHub branch's index.html with proper Content-Type and JS execution support — zero setup, zero new dependencies. Option (c) wins for a single-file static prototype. The artifact path covers reviewers who need full-feature preview with API keys.
**Trade-offs:** raw.githack.com is a third-party CDN — it could go down (rare; backed by jsDelivr-class infra). Worst case the artifact path always works. PR previews only show changes from `main`; doesn't show inline diffs vs. a baseline.
**Revisit if:** Multiple PRs need to co-exist as previews on the canonical `cynical-spec.github.io/health-wellness` domain (then switch to gh-pages branch + subpath layout).

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
