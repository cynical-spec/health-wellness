# Mistakes Log — Sehat Saathi

---

## 2026-05-14 — Voice mode echoed its own TTS through the device speaker

**What happened:** In voice conversation mode, the assistant's TTS reply (Sarvam Bulbul) playing through the phone speaker was being re-captured by the mic on the next listen cycle, transcribed, and fed back as the user's next turn. The AI started "talking to itself."

**Why it happened:** Two root causes compounded:
  1. `getUserMedia({ audio: true })` requested raw mic input — no AEC, no noise suppression, no AGC. Browsers don't enable these by default on the bare `true` shorthand.
  2. After TTS `audio.ended` fired, `convListenOnce` re-opened the mic just 350ms later. The speaker output has audio-output latency + room reverb that extends well past `ended` — easily 500-1000ms of audible tail that the freshly-opened mic captured.

**What was tried:** Considered bumping only the resume timer (350ms → 1500ms). Would help but wouldn't fully kill the loop on iOS Safari where AEC was minimal. The real fix had to be multi-layered.

**What fixed it:** Three-layer defense:
  1. Enabled browser AEC explicitly: `audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }`.
  2. Added an application-level `_isSpeaking` flag wrapped around every TTS play() site (`_markTtsStart` helper) that stays true for 700ms after `audio.ended`. `convListenOnce` polls this flag and refuses to acquire the mic while it's set.
  3. Bonus: skill auto-launch when the AI suggests a movement/remedy/acupressure — hands the user off to the step overlay (which speaks each step without listening), sidestepping the echo path entirely.

**Rule going forward:** For any voice-in / voice-out flow, ALWAYS request AEC + noise suppression + AGC on `getUserMedia` constraints AND maintain an application-level half-duplex flag. Browser AEC alone is incomplete on Safari. Don't trust `audio.ended` as the "speaker is silent" signal — add ~700ms grace for output latency + reverb.

---

## 2026-05-13 — Sarvam CORS "fix" only worked on the device that pasted the console helper

**What happened:** v5.3.8 shipped `setSarvamProxy(url)` plus a CF Worker template in comments, intended as the permanent Sarvam CORS fix. The deployed Worker (`sarvam-proxy.nawaneet-kumar.workers.dev`) was confirmed working in the live console: `[TTS] manisha ~800ms · 42 chars ← Sarvam Bulbul Manisha via your Worker`. We thought we were done. The next day the user reported voice still broken with CORS errors — "since 1 hour".

**Why it happened:** The Worker URL was stored in `localStorage.ss_sarvam_proxy`, which is per-origin **and per-device/browser**. The constant default at `index.html:5986` was still `'https://corsproxy.io/?url='`, which fails Sarvam's OPTIONS preflight when custom `api-subscription-key` headers are sent (corsproxy.io returns non-2xx on preflight for header-bearing requests, Chrome blocks the POST). So every "fresh" user — incognito tab, different browser, different machine, cleared storage — hit corsproxy.io, got CORS-blocked, and silently fell through to Web Speech / ElevenLabs. The Worker was deployed correctly but only ~one device was using it.

**What was tried:**
- v5.3.1: Sarvam STT codec fix (Chrome webm/opus rejection) — not the CORS problem
- v5.3.2: ElevenLabs as primary TTS — different voice, doesn't fix Sarvam
- v5.3.3: Web Speech fallback when ElevenLabs quota / Sarvam CORS fail — symptom hiding, not root cause
- v5.3.4: OpenAI TTS as 2nd fallback — OpenAI TTS has no browser CORS either, removed in v5.3.6
- v5.3.5: route all Sarvam through corsproxy.io — works for some calls but breaks on preflight with custom headers
- v5.3.6: disable OpenAI TTS — cleanup
- v5.3.7: restore Sarvam path that was bypassed when ElevenLabs blocked — bug fix
- v5.3.8: localStorage override + CF Worker template — works on one device, not for any other visitor

**What fixed it:** Changed the compile-time `SARVAM_PROXY` constant directly to `'https://sarvam-proxy.nawaneet-kumar.workers.dev/'`. The localStorage override path still exists for swapping proxies during testing, but the default is now the real Worker. No per-device paste required.

**Rule going forward:**
1. When the fix lives in localStorage, it's not "shipped" — it's "shipped to one device". Either bake the value into source, or write a `<script>` snippet that auto-injects it on first load. Console helpers are dev-only affordances, not production state.
2. For any CORS workaround, verify it from a **fresh incognito tab on a different machine** before declaring success. localStorage state from a previous test poisons the verification.
3. The OPTIONS preflight is where most "free CORS proxy" services fall over when custom headers are involved. Test the preflight specifically (`curl -X OPTIONS -H 'Access-Control-Request-Headers: api-subscription-key' -i $URL`) before trusting a proxy in production.

---

## 2026-05-10 — Symptom triage was a menu, not a committed caretaker

**What happened:** Through v5.0 → v5.2, every takleef tap routed to AI chat with a generic prompt ("Sir dard kaise kam karein?"). The AI suggested a nuska, sometimes injected a recipe card, then stepped back. v5.2 added a 48h *kaisa hai ab?* check-in which was a big improvement but still felt detached — between tap and follow-up, the app showed the user the *same* full feature menu (wellness goals, all 8 symptoms, lab, dawai parchi) as if the original problem didn't exist. Navneet's review: *"when user selects sir dard, the whole app experience and home screen change towards fixing that issue. It tries to feel the problem and solve for you."* The product was treating symptoms like menu items, not like commitments.

**Why it happened:** The menu model is the default for every consumer app — we inherited it without questioning whether it served *this* product's promise. Sehat Saathi's tagline is "your Dadi who heals you" — but Dadi doesn't hand you a menu of remedies when you say "sir dard". She asks you 2 questions, then she *commits* her attention until you feel better.

**What was tried:** v5.2 partially addressed this with the 48h check-in (the long arc of the loop). But the short arc — what happens in the *first 30 minutes after the user taps* — was untouched until v5.3.

**What fixed it:** v5.3 introduces Focus Mode. A takleef tap opens a 2–3 question Dadi clarifying screen, then the hub takes over (body.focus class hides every non-focus surface) and renders a 3-step Healing Path (acupressure → ghar ka nuska → rest) personalized to the user's answers. Steps complete via taps into the existing #move-ov player. Per-symptom timing (30 min / 2 h / 4 h / 8 h) fires the validation. Better → Ayurvedic upsell for long-term. Worse → doctor handoff. The app *commits.*

**Rule going forward:** For a "warmth-promising" product like this one, every primary entry point needs to act like the warm relationship it's promising. A menu is the wrong metaphor for symptom triage. When a feature's emotional promise is *"I'll take care of you"*, the UX must commit visibly — block out the menu, show the work, circle back. Match the feeling to the promise.

---

## 2026-05-10 — Symptoms triage had no closing-loop — every nuska was a one-shot guess

**What happened:** Akshay's 45-min review with Navneet called out that the entire takleef path (tap symptom → AI nuska → bye) had no follow-up. The app never asked "did the remedy work?", so: (a) we have zero signal on which nuskas land for which symptoms, (b) the user has no reason to come back to *this* specific symptom, and (c) if the nuska *didn't* work, the JTBD dead-ends — no path to a doctor, no graceful escalation. Akshay: *"How will the app know if the user is feeling better? We need a way to track the journey and get user input."*

**Why it happened:** Sessions 7–10 focused on optimizing the *first* interaction (symptom tap → AI reply → recipe card → step animation). Every iteration added more shine to that single touchpoint. Nobody designed the second touchpoint because the metric we were tracking (engagement on first-tap) didn't surface the gap.

**What was tried:** N/A — surfaced from external review.

**What fixed it:** v5.2 ships an explicit 48h check-in loop. `triSymptomTap` writes a `pending` row to `ss_checkins`. On every hub re-open, `getDueCheckin()` scans for any ≥48h-old pending row and surfaces it as a pulsing rail circle. Tapping opens a Dadi-tone modal with 3 outcomes that each branch the JTBD: "better" → blessing + score bump, "same" → alternative nuska + soft doctor nudge, "worse" → full-screen doctor handoff with `tel:` + Practo + 1mg CTAs.

**Rule going forward:** Every entry-point flow must be designed with its closing-loop touchpoint at the same time. If a feature ends in "AI replies, end of journey", that's a half-built feature. Closing the loop is the difference between an episodic tool and a daily-use product — and tier-2/3 users in particular only return when something *invites* them back.

---

## 2026-05-10 — Hub had 30 surfaces — Sunita archetype couldn't focus

**What happened:** v5.1 ship to live URL → Akshay reviewed for the Sunita archetype lens (43yo Marathi housewife, low digital literacy) and flagged Miller's Law violation. Count: 7 stories circles + 2 aham cards + 8 wellness grid buttons + 8 takleef grid buttons + 5 tri-rail cards = 30 tappable surfaces on the hub alone. For a younger digitally-literate user this density felt thorough; for Sunita it felt overwhelming and forced her into Google-like search behavior (scan-everything-then-pick), which is the antithesis of the "Dadi-Ma talks to you" magical moment.

**Why it happened:** We optimized for *first-visit clarity* across the broadest possible audience and stacked features as they were built. Each session added without subtracting. The result: a hub that's a feature-completeness exhibit rather than a calm Dadi-Ma surface.

**What was tried:** v5.1 had de-cluttered by removing the mood pulse strip and compacting the hero — incremental help, but didn't address the core grid count.

**What fixed it:** Profile-driven layout split. `isSunitaMode()` reads `profile.age >= 40 OR scope === 'household'`. When true, `body.sunita` class hides the dense grids + aham-row via `.dense-only`, and reveals a parallel `.sunita-home` block: 4 primary tiles (Dawai parchi · Lab samjho · Dadi ki kahani · Doctor se baat) + 4 most-common takleefs (Sir dard · Sardi-khansi · Pet · Neend), with everything else tucked behind a `<details>` "Aur dekho" expand. Touch targets bumped to 96px primary / 80px secondary, body contrast lifted from #b5b5b5 → #c8c8c8 (WCAG 4.4:1 → 5.6:1).

**Rule going forward:** When you have two distinct user archetypes with conflicting needs (Sunita: fewer choices, larger targets; young pro: more choices, density), don't compromise on one shared layout. Auto-detect and serve different surfaces. The profile already exists — use it. Manual toggles are a last resort because the user who needs them most won't find them.

---

## 2026-05-10 — RX step 0 crashed because `m.conditions` is a string, not an array

**What happened:** v5.1's defensive try/catch around `renderRxStep` finally surfaced the *real* root cause of the empty-body bug from earlier today: the family member-card render in step 0 was calling `(m.conditions||[]).join(', ')` — but `m.conditions` is stored as a comma-joined **string** (e.g., `"Diabetes, BP"`), not an array. So `(m.conditions||[]).join` was `undefined`, which threw a TypeError. Without the try/catch, the whole `renderRxStep(0)` would silently abort midway through building the html string, leaving `el.innerHTML = html` never called → blank body.

**Why it happened:** I copied the family-member iteration pattern from elsewhere (lab interpreter step 0 has the same shape) and assumed `conditions` would be the same shape as the multi-select Set in the chip flow. But `saveFamilyMember()` (line 4911) explicitly does `[...ST.condSelected].filter(...).join(', ')` to flatten the Set into a string before storing — so what's on disk is `"Diabetes, BP"` not `["Diabetes", "BP"]`.

**What was tried:** v5.1 added the empty-body CSS fix and the try/catch wrapper. The try/catch was the *actual* fix — it surfaced `(m.conditions||[]).join is not a function` to the user. The CSS min-height bandaid was unnecessary but harmless.

**What fixed it:** Changed the line to `Array.isArray(m.conditions) ? m.conditions.join(', ') : (m.conditions || '')` — handles both shapes, future-proof if someone re-shapes conditions later.

**Rule going forward:** When iterating saved data shapes (especially multi-select fields), don't assume the in-memory shape matches the on-disk shape. Multi-select chips often live as Sets in flight and as joined strings on disk. Always code defensively at the read boundary: `Array.isArray(x) ? x.join(...) : x`. And: try/catch wrappers around render functions are not optional — they're the difference between a useful error message and a screen the user can't recover from.

---

## 2026-05-10 — RX flow step 0 rendered an empty body (no member buttons visible)

**What happened:** User tapped the new "Dawai parchi" hero card on the live URL right after v5 merged. The s-rx screen transitioned in correctly — header rendered with "Yeh dawai kiske liye? / Member chunein", progress bar showed step 0 active. But the body below was completely blank. The buttons (Aap / family / + Naya member) were nowhere visible.

**Why it happened:** The screen layout was hdr → progress-wrap → body. `.body{flex:1;overflow-y:auto}` was supposed to fill remaining height, and `renderRxStep(0)` did set `el.innerHTML` correctly (verified by reproducing in a stubbed-DOM Node test — the HTML string with all the buttons was being assigned). The most likely culprit: on certain viewports, the inner `<div class="rx-body">` had only `padding:14px 16px 28px` with no explicit height or display rule, and combined with the flex parent + new `<div id="rx-progress-wrap">` sibling, it could collapse to zero visible height despite having content. Hard to repro in a Node test.

**What was tried:** Reproduced rendering in a Node + stubbed DOM — html was correctly being assigned to `el.innerHTML` (verified). Static analysis of CSS — `.body` was `flex:1` and the inner had only padding. Confirmed deployed file matched committed code.

**What fixed it:** Two layers:
1. **CSS fix** — Added `#rx-body,#order-body,#track-body,#bazaar-body{flex:1 1 auto;min-height:0;display:block}` and `.rx-body{display:block;padding:14px 16px 28px;min-height:60vh}`. The `min-height:60vh` on the inner ensures content has visible height regardless of how flex sizing resolves.
2. **JS belt-and-braces** — Wrapped `renderRxStep()` in a try/catch wrapper that catches any rendering error and renders a visible error message + "Wapas jao" button into the body, rather than leaving a blank screen. Renamed the implementation to `_renderRxStepInner()`.

**Rule going forward:** When a flow has a multi-element header (hdr + progress-wrap + body in our case), don't rely on cascading flex defaults to size the body. Either set explicit `flex:1 1 0;min-height:0` on the body, OR set `min-height: <reasonable value>` on the inner content wrapper. And: any non-trivial render function that sets innerHTML should be wrapped in try/catch with a visible fallback — silent blank screens are the worst class of bug because users have no signal that anything went wrong.

---

## 2026-05-10 — Home lost the "today's activity / story" lure that brought users back

**What happened:** User feedback right after v5 ship: "the landing screen right lost its today's activities or story that lure people to come back — something like story of instagram or today's task, way to make screen less cluttered and more warming?" Sessions 8→9c had progressively replaced the v3 3-zone home (greeting / mood / story+score) with a denser symptoms-first + wellness-first layout. The score, streak, story card, and aaj-ki-aadat content all got pushed out — the home was full of action grids but felt cold and one-shot.

**Why it happened:** Each session optimized for a single intent (symptom triage, wellness goals, lab/dawai promotion) without holding space for the daily-return content. Each session's home felt right for first-visit, but boring on repeat visits — there was no "what's new today" surface.

**What was tried:** N/A — surfaced from direct user feedback after v5.

**What fixed it:** Added an Instagram-stories-style `hub-stories` rail right under the header, before the hero. 5–7 gradient-bordered circles surface what's "alive" today: streak (with badge count), Sehat Score, Aaj ki kahani (Dadi's daily story), time-of-day habit (morning/afternoon/evening/night auto-switches), due reminder (pulses if any), active order (if any), AYUSH aadat. Tapping a circle either opens a flow (story, breathe, tracking) or marks a daily dot done with score bump. Also de-cluttered: dropped the mood pulse strip (redundant with wellness grid + symptom grid) and shrunk the hero from 26px → 22px font / 14px → 6px top padding so the rail and aham-row fit above the fold on a 390px viewport.

**Rule going forward:** A home screen for a daily-use app needs at least one surface that visibly changes day-to-day. Action grids alone don't lure users back. The "stories rail" pattern (Instagram, WhatsApp, Slack) works because each circle is a small daily promise — minimal cognitive load, high signal that the app has something new for them. When optimizing for first-visit clarity, set aside vertical space for daily-return content.

---

## 2026-05-10 — Lab & Dawai were buried in the rail — second/third magical moments never landed

**What happened:** Through Sessions 7→9c, every UX change anchored on "make symptom triage feel magical". Lab Report and Dawai Reminder existed as tools, but they were stuffed into the bottom `tri-rail` (a 6-card horizontal scroller below the symptoms grid). User feedback for v5 planning: *"Right now symptoms triage has overtaken the entire experience and I understand that's the entry point but we should be able to add and tie other experiences neatly too."* The product was claiming three magical moments — symptoms triage, lab interpretation, prescription-to-doorstep — but only one was being designed for.

**Why it happened:** Each session optimized the moment we were testing in isolation. Symptoms got the hero, then wellness got a grid above symptoms, and Lab/Dawai stayed where they were because nobody was tapping them in flow tests. Visibility decisions shouldn't be set by current tap rate when the underlying flow is incomplete — Lab Report had no Photo OCR, no follow-up to "now what dawai do you have?", no fulfilment surface. People weren't tapping it because the flow ended in a dead-end summary.

**What was tried:** N/A — surfaced from explicit user direction for v5.

**What fixed it:** v5 introduces three connected interventions:
1. Promoted Lab + Dawai to a 2-card `aham-row` directly under the hero, gradient-styled, with a live "N active" pill on Dawai. Symptom triage stays where it is — neither dominates.
2. Built the **second moment** end-to-end: Lab → photo/PDF/manual → AI summary → "Doctor ne dawai likhi hai? Reminder lagao →" warm-gradient CTA that pre-seeds the prescription flow with the same member.
3. Built the **third moment** end-to-end: Prescription → OCR (template) → reminder set → "Sehat Bazaar (Reliance Netmeds) se ghar mangao" → cart → address → COD/UPI → tracking timeline → delivered. Each step has its own animation/affordance so the path *feels* magical even though OCR is template-driven in prototype.

**Rule going forward:** A magical moment isn't one screen — it's a path with no dead ends. When promising "X is one of our three magical moments", every step from intent to outcome must have a tested affordance. Don't promote a feature on the home until its full flow is shippable. And conversely: when a flow is complete, give it primary real estate, even if the current home is already full.

---

## 2026-05-10 — Tied OCR-dependent flows to a Vision API that isn't reliably available

**What happened:** Session 7 built Lab Interpreter assuming OpenAI GPT-4o Vision was available. v5 was about to repeat the same mistake by building prescription scan against the same path. In prototype the Vision key is often blocked on Indian ISPs (DEC-004), or simply not provisioned for new dev environments. Without a fallback, the entire RX/Lab flow becomes a dead error toast.

**Why it happened:** "Vision is the cool way to do this" is a tempting framing, but a prototype's first user-facing job is *to demo the experience*, not to validate the AI integration. The Vision integration is the second job.

**What was tried:** N/A — designed the v5 build to avoid this from day one.

**What fixed it:** Both Lab and Rx flows have **template fallbacks** that look identical to real OCR output. Photo capture + PDF upload both run through a 2.5s scan animation and then return one of 3 hand-written sample prescriptions or 3 hand-written sample lab reports. Templates are explicitly tagged `[Sample analysis — prototype mode bina Vision API ke]` in the summary so the user knows. When the real Vision key is wired up, swap the template return with the real `interpretLabPDF()` / new `interpretRx()` — call sites stay identical.

**Rule going forward:** For every AI-dependent feature, ship a template fallback at the same time as the AI path. Templates aren't placeholder content — they're a permanent feature for ISP-blocked users, demo environments, and CI. The template should be hand-written, on-tone, and clearly labeled — not lorem ipsum.

---

## 2026-05-10 — Wellness mode said "Bhai" — broke the Maa/Dadi magical-voice promise

**What happened:** v4.1 shipped a wellness-goals grid on the hub. Tapping ⚖ Vajan → AI opened with `Bhai, sustainable healthy weight ke liye...`. User feedback: "the wellness speaks as bhai — can't do that — it should have that mom or dadi warmness always". The Mom-Dadi voice IS the magical moment of this product; using a buddy register breaks the trust the rest of the app earns.

**Why it happened:** The original `WELLNESS_SYSTEM_PROMPT` (Session 7) was written with the line `TONE: ... Like "bhai try this" not "you should consider".` That was an explicit instruction to the model to use buddy register. Made sense in isolation for a 18–35 audience, but conflicted with the global Maa/Dadi warmth the rest of the product (and the TTS persona — Manisha-Dadi / Anushka-Maa / Pavithra) is built around.

**What was tried:** N/A — direct user feedback after live deploy.

**What fixed it:** Rewrote `WELLNESS_SYSTEM_PROMPT` with strict tone rules: required words ("beta", "bachha", "suno beta", "haan beta"); explicitly forbidden words ("bhai", "yaar", "buddy", "guys", "dude", "mate", "bro"); enforced Female-voiced. Modern context (gym, hostel, WFH, screen, lab, exam) is preserved but spoken in the warm-elder register.

**Rule going forward:** Tone consistency is product policy, not a per-context decision. Every system prompt — nushke, wellness, tension, community peers, story — must be auditable for tone-conformance with the Maa/Dadi/female-elder register. The TTS speaker is female; the persona toggle is Saathi → Dadi → Maa; the magical moment is warm voice. Any prompt that drifts toward buddy/peer is a regression.

---

## 2026-05-10 — Roman-Hindi "choddo" was read as a vulgar word by TTS

**What happened:** User tested the LI-4 acupressure overlay (`Sir dard` → tap card → step 4/5). The on-screen text read `Choddo. Doosre haath par bhi karo.` and Sarvam Bulbul TTS read it aloud with stress/pronunciation that **sounded vulgar in Hindi** ("छोड़ो" — release/leave — and a phonetically near vulgar word differ by stress; the auto-transliteration didn't disambiguate). User reported: "she choddoo with dot ( sounds funny for what i means in hindi )".

**Why it happened:** Roman-script Hindi is fundamentally ambiguous for several common words; "chhoddo / choddo / chodo" all render to overlapping IPA approximations and the model picks whichever matches its training prior. The Sehat Saathi pipeline (Session v3.3) auto-transliterates Roman → Devanagari before TTS, but for ambiguous spellings the disambiguation isn't perfect. We had `choddo` in 6 step strings (acupressure release × 2, breathwork × 4) and a breath-phase name.

**What was tried:** N/A — user-reported on first listen.

**What fixed it:** Two changes, layered:
1. **Replaced the ambiguous Roman word** in every step string. Acupressure release: `Choddo` → `Haath hata lo` (remove your hand). Breathwork release: `saans choddo` → `saans bahar nikalo`. Bhramari: `Saans choddte hue` → `Saans bahar nikalte hue`. Box-breathing phase name: `Choddo` → `Saans Bahar`. The new phrasings are unambiguous in both Roman and Devanagari.
2. **Added per-step Devanagari `tts[]` arrays** to all acupressure points, breathwork/yoga kits, and the new habit kits. `showMoveStep()` now passes `tts[idx]` via `speak(..., { ttsText })`, which the existing speak path uses verbatim (skipping the auto-transliteration step that introduced the ambiguity).

**Rule going forward:** Anywhere step-by-step text is read aloud by TTS, ship a hand-written Devanagari `tts[]` alongside the on-screen Roman `steps[]`. Don't trust auto-transliteration for the Hindi words that are phonetically close to vulgar/colloquial words: `choddo`, `khoodd`, `lund`, `gandh*`, `chuth*`, etc. — when in doubt, rephrase OR provide explicit Devanagari.

---

## 2026-05-10 — Wellness AI gave practical advice but no animation card to act on it

**What happened:** User tapped ⚖ Vajan → AI replied with two excellent practical tips: "pani peene ka routine" and "daily 30-minute brisk walking" — but **no card** appeared under the bubble. Compare with the `Sir dard` flow where AYUSH-ingredient mention triggers a recipe card with a step animation. User noted: "health and wellness cards don't have animation cards for whatever recommendation she gave." The wellness magical-moment was the answer; the **second magical moment should be a tappable, animated step guide** — and it was missing.

**Why it happened:** v4 added `injectRemedyCard` + `injectAcupressureCard` only to the `nushke` ctx, on the assumption that wellness advice would be "soft" lifestyle text without specific actionables. Wrong — the wellness AI does name concrete habits (walking, hydration, screen breaks, journaling, meditation), and those deserve the same step-animation surface as a haldi-doodh recipe.

**What was tried:** N/A — user-reported.

**What fixed it:**
1. Card injection in `addMsg()` now fires for **both `nushke` and `wellness` ctxs** (recipe + acupressure cards). Wellness replies that mention haldi-doodh, tulsi, jeera-paani, sir-dard pressure points, etc. now also surface the in-app step card.
2. Added 5 `HABIT_KITS` to `MOVEMENT_SKILLS` (same overlay player): `daily-walk`, `hydration`, `screen-break`, `journaling`, `meditation`. Each has 5 steps with Devanagari `tts[]`. `detectMovement()` extended with keyword regexes (`brisk walk`, `pani peena`, `20-20-20`, `journal`, `dhyan`, etc.) so the wellness AI's natural phrasing triggers the right card.

**Rule going forward:** Every advice-giving ctx (nushke, wellness, tension de-escalation, community) needs a corresponding bank of step-animation kits. Whenever the AI is allowed to recommend a concrete actionable, that actionable should have an in-app overlay it can be linked to via keyword detection. No more "just a chat reply" for things that are genuinely doable.

---

## 2026-05-10 — YouTube-link "video card" was a context switch, not a magical moment

**What happened:** Session 7's `injectVideoCard()` opened `youtube.com/results?search_query=…` in a new tab whenever the AI mentioned an AYUSH ingredient. User feedback: "It's a video. It's a small animation that tells you press here for acupuncture. That are not laid out pretty well. It needs to be wired really well." Sending the user out of the app on every nushke reply broke the warming-voice magical moment that the rest of the product was built around.

**Why it happened:** During Session 7 the goal was "no flow ends in a dead screen" and the YouTube link was the cheapest way to satisfy that. We treated the card as a placeholder for content we didn't yet have (curated YouTube IDs), but we shipped it as the actual product surface.

**What was tried:** N/A — the issue surfaced from direct user testing, not internal review.

**What fixed it:** Built `REMEDY_KITS` (15 in-app step-by-step recipes — haldi doodh, ajwain bhaap, tulsi kadha, etc.) and reused the existing `move-ov` overlay (already had auto-advance + Sarvam TTS + progress dots) to render them. `injectVideoCard()` is now an alias for `injectRemedyCard()`. Same call sites, in-app experience.

**Rule going forward:** When wiring a "what to try" card, default to in-app step content. External-link cards are for cases where in-app isn't possible (e.g. doctor referral phone numbers), not to fill content gaps. The magical-moment question is "does this keep the user inside the warm conversation?" — if not, find another way.

---

## 2026-05-10 — Mood-first home buried the symptom-triage intent for tier 2/3

**What happened:** Session 8's 3-zone hub put 3 large mood buttons (Theek/Takleef/Tension) as the primary CTA. User feedback: "I'm trying to solve it for tier two and tier three Bharat audience first… I want to start from symptoms triage." A user with a sick child wants to tap "Pet ki dikkat" and get a remedy, not pick an emoji to describe their feelings.

**Why it happened:** The mood-first design was a Western-app-influenced pattern (gratitude/mood-tracking apps). For a tier-2/3 first-time user with a clear health complaint, that pattern adds a layer of self-categorization friction before the product can help.

**What was tried:** N/A — surfaced from direct user feedback.

**What fixed it:** Replaced the 3-mood grid with an 8-button symptom triage grid (`tri-grid`). Each button routes directly to nushke chat with the symptom pre-framed as a remedy ask, so the first AI turn IS the answer. Mood is collapsed into a single-line `tri-mood` strip — preserved but not dominant. Other features (Story, Saans, Lab, Dawai, Meal, Parivaar) live in a subtle `tri-rail` for low-cognitive-load discoverability.

**Rule going forward:** For tier-2/3 health, lead with the user's verb ("I have X, fix it"), not their state ("I feel X"). When a feature wants to ask "how are you?", prove that mood adds value over directly asking what they want help with.

---

## 2026-05-10 — Voice overlay was opaque — user couldn't tell if it was listening

**What happened:** User feedback: "The speak button does not give me a speech-to-transcript word that I can see. It is not a two-way conversation. If you press that, something happens. You don't know if it is listening or not. It should be high class — I can see my text are being written on the screen."

**Why it happened:** Session 8's voice overlay had only a static `Sun rahi hoon... 🎤` text and the HelloJio looping MP4. No mic-level signal, no transcript display, no bot-reply mirror. The user had no proof the mic was working until the AI replied, several seconds later.

**What was tried:** N/A — direct user feedback.

**What fixed it:** Rebuilt the overlay with (a) a state pill that changes color/text per phase, (b) a 5-bar EQ driven from the existing Web Audio analyser RMS data via `_setBarsFromLevel()` — gives instant proof the mic is hearing voice, (c) a transcript area that shows `Aap ne kaha: <transcript>` as soon as Sarvam STT returns, then a `Soch rahi hoon...` thinking line, then `Saathi: <reply>` (mirrored from `addMsg('bot', ...)` automatically whenever the overlay is open). Sarvam STT doesn't stream so we can't show partial words during recording — but mic bars + transcript-on-arrival closes the trust gap.

**Rule going forward:** A voice UI must show *something* that proves the mic is hot, the moment the user starts speaking. Text-only state ("Sun rahi hoon...") is not enough — it's a label, not a signal. Use analyser data even when the STT itself isn't streaming.

---

## 2026-05-06 — sed injection failed on API key

**What happened:** GitHub Actions workflow used `sed -i 's|REPLACE_WITH_YOUR_KEY|...|g'` to inject the OpenAI key, but the workflow failed silently — the key was not injected and the app showed the config error.

**Why it happened:** The OpenAI API key contains characters (`+`, `/`, `=`) that break sed's delimiter-based substitution even when using `|` as the delimiter.

**What was tried:** Tried different sed delimiters (`|`, `#`, `@`). All failed.

**What fixed it:** Replaced `sed` with a Python `str.replace()` script that treats the key as a plain string, no delimiter issues.

**Rule going forward:** Never use sed for injecting secrets. Always use Python `str.replace()` for reliable secret injection in GitHub Actions.

---

## 2026-05-06 — API key check always triggered (app always showed error)

**What happened:** After Python injection was working, the app still showed "API key configure karo" error even though the key was correctly injected.

**Why it happened:** The key validity check was `OPENAI_API_KEY === 'REPLACE_WITH_YOUR_KEY'`. When Python replaced the placeholder, this string comparison became `sk-actual-key === 'sk-actual-key'` — always `true`, always showing the error.

**What was tried:** Thought the injection wasn't working. Checked workflow logs — injection was fine. Compared values — both the check string AND the key were being replaced.

**What fixed it:** Changed check to `OPENAI_API_KEY.length < 20`. A real key is always 50+ chars; the placeholder is 22 chars but this version doesn't matter since Python replaces it.

**Rule going forward:** Never use string-equality checks against the placeholder string. Use a length check or a prefix check (`startsWith('sk-')`) instead. The placeholder itself will be replaced by injection.

---

## 2026-05-06 — API key exposed in UI chat bubble

**What happened:** After key injection was working, user saw their real OpenAI API key displayed as text inside a chat bubble.

**Why it happened:** The error message string contained the literal text `REPLACE_WITH_YOUR_KEY`: `"File mein REPLACE_WITH_YOUR_KEY ki jagah apni key daalo"`. Python's `str.replace()` replaced this occurrence too, injecting the real key into the visible error message.

**What was tried:** N/A — identified immediately from user screenshot.

**What fixed it:** Rewrote the error message to not contain the placeholder string: `"API key configure karo — iske baad sab kaam karega."` 

**Rule going forward:** The placeholder string `REPLACE_WITH_YOUR_KEY` must appear ONLY in the JavaScript constant definition line. Never use it in any other string in the file. Any other string that describes the key should use different wording.

---

## 2026-05-06 — GitHub Pages not activating (repo was private)

**What happened:** GitHub Pages deployment appeared to work via API but the URL `https://cynical-spec.github.io/health-wellness/` returned 404.

**Why it happened:** GitHub Pages requires either a public repository or a GitHub Pro/Team plan. The repo was private.

**What was tried:** Checked Pages settings, re-triggered deployment via API.

**What fixed it:** User made the repository public.

**Rule going forward:** Before setting up GitHub Pages for a new project, confirm the repo is public or the account has a paid plan.

---

## 2026-05-07 — "Load failed" network error — OpenAI unreachable

**What happened:** App deployed and working, but every chat message returned "Thoda network issue aa gaya" (the generic catch block message). User's device could not reach `api.openai.com`.

**Why it happened:** The fetch() call threw a TypeError ("Load failed") — not an HTTP error but a network-level connection failure. OpenAI's API endpoint appears to be blocked or rate-limited on the user's network/ISP in India.

**What was tried:** 
1. Improved error messages to distinguish 401/429/network errors
2. Confirmed GitHub Secret `OPENAI_API_KEY` was set (created 2026-05-06)

**What fixed it:** Added Groq as a fallback provider. `callAI()` now tries OpenAI first; if it throws (network error), automatically retries with Groq's API (`api.groq.com`) which uses the same OpenAI-compatible format with model `llama-3.3-70b-versatile`. User added `GROQ_API_KEY` to GitHub Secrets.

**Rule going forward:** Never rely on a single API provider for a demo. Always have Groq as fallback — it's OpenAI-compatible, free tier available, and generally accessible from Indian networks. Provider array pattern: `[{openai}, {groq}]` — iterate until one succeeds.

---

## 2026-05-07 — JDS validation: 19 errors (emoji and non-JDS colors)

**What happened:** Running `validate_prototype` on the app returned 19 errors and 5 warnings.

**Why it happened:** 
1. Surface colors `#1e1e1e` and `#282828` are not in the JDS token system
2. All icon-position elements used emoji (💊, 🌿, 🥗, 🫁, 👨‍👩‍👧, 🩺, etc.) — JDS strictly forbids emoji, requires JDS SVG icons
3. Some hardcoded hex values were repeated outside `:root` variables

**What was tried:** N/A — fixed systematically.

**What fixed it:**
- Replaced `#1e1e1e` → `rgba(255,255,255,0.06)` and `#282828` → `rgba(255,255,255,0.10)` (dark surface overlays)
- Replaced all emoji in HTML and JS with JDS SVG CDN `<img>` tags: `ic_nature`, `ic_alarm`, `ic_food_drink`, `ic_yoga_meditation`, `ic_multiple_user`, `ic_health_conditions`, `ic_yoga`, `ic_trash_clear`
- Stripped emoji from text labels (button text, screen titles, NUSHKE_CATS array, MED_STEPS options)
- Family avatar changed from emoji to initials letter

**Rule going forward:** 
- Always run `validate_prototype` before pushing. Zero errors is the bar.
- JDS dark mode surfaces must use rgba overlays on `#141414`, not arbitrary dark hex values.
- No emoji anywhere — not in icons, not in labels, not in JS strings that render to UI.

---

## 2026-05-07 — Session 7: Python script "succeeded" but never wrote the file (CSS lost)

**What happened:** First attempt at the hub gamification redesign reported `"CSS inserted: True"` from a Python script. But on the live page, the score card and unlock card had no styling — text was running together, the persona photo rendered enormous because the wrapper's `overflow:hidden` wasn't applying.

**Why it happened:** The Python script had two stages. Stage A read the file into `content`, did `content = content.replace('.divider...', '.divider' + new_css)` and printed "CSS inserted: True". Stage B did `lines = content.split('\n')` BEFORE Stage A ran, so `lines` held the original (pre-CSS) content. Then `new_lines = lines[:N] + [new_body] + lines[M:]` rebuilt content from `lines` (no CSS) and wrote it. The Stage A modification was discarded.

**What was tried:** Inspected the live page; dropped to DevTools and confirmed `.score-card` had no rules. Then ran a `grep -c '.score-card{' index.html` — returned 0. CSS was simply not in the file.

**What fixed it:** Rebuilt the script as a single-pass: read content once, do all string replacements on `content` directly (never via `lines = content.split` followed by writing `'\n'.join(lines)`).

**Rule going forward:** When mutating a file via Python, NEVER mix `content = ...` (string ops) with `lines = content.split('\n'); ... ; '\n'.join(lines)` (line ops) in the same script. Pick ONE strategy. Always write back the variable that has all your edits. Verify post-write with `grep` on the file before committing.

---

## 2026-05-07 — Session 7: Greedy regex stripped wrong `</div>` from QA grid

**What happened:** Replaced the static QA grid HTML with a dynamic `<div id="qa-grid">` container via Python regex. Result: the dynamic container appeared, BUT five orphan `<button class="qa-btn">` blocks remained immediately after, plus a stray `<span class="qa-label">Ghar ke Nushke</span>` inside the container.

**Why it happened:** Used `re.compile(r'<div class="qa-grid">.*?</div>\s*\n', re.DOTALL)` — non-greedy `.*?` matches the FIRST `</div>` it finds, which was the closing tag of the very first `<div class="qa-icon">` inside the first `qa-btn`, not the closing tag of the outer `qa-grid`. Replacement deleted only the first inner div, leaving the rest of the buttons orphaned.

**What was tried:** Re-checked output and saw the leftover `<button class="qa-btn">` lines via `grep`. Realized regex matched too narrow.

**What fixed it:** Second pass with a more specific regex anchoring on the next section marker (`<!-- Updates -->`): `r'(<div class="qa-grid" id="qa-grid"><!-- JS renders --></div>)\s*\n.*?</div>\s*\n\s*\n\s*(<!-- Updates -->)'`. Matched everything from the dynamic container through the next section comment.

**Rule going forward:** When using regex to delete an HTML block ending in `</div>`, anchor the END on a UNIQUE marker that appears AFTER the block (a unique id, a comment marker, the next section's heading) — NOT just `</div>`. HTML has too many closing divs for non-greedy matching to be reliable.

---

## 2026-05-07 — Session 7: Python f-string broke on backslash escape inside `'...'`

**What happened:** Verification block `print(" Profile tile:", 'startOnboarding(\\'s-hub\\')' in content)` raised `SyntaxError: invalid syntax`. The whole script aborted before writing the file. Verification said all checks failed because no edits landed.

**Why it happened:** Python doesn't allow escaped single quotes inside a regular `'...'` string literal — `\\'` inside `'...'` parses as backslash + closing quote. The verification line was meant to test for `startOnboarding('s-hub')` but the escape was syntactically invalid.

**What was tried:** Re-ran with the rest of the script intact — still failed because the syntax error blocked execution before any `f.write()`.

**What fixed it:** Rewrote the verification using a separate `python3 -c` invocation that re-reads the saved file and uses simpler string checks (no nested quotes). Decoupled "do edits" from "verify edits".

**Rule going forward:** In Python heredoc scripts, never write nested-quote string literals like `'text with \'inner\' quotes'`. Use either: (a) double quotes outside `"text with 'inner'"`, or (b) a separate verification step run after the file has been saved. Catch syntax errors early — `python3 -c "import sys; print('ok')"` is cheaper than a failed multi-stage edit.

---

## 2026-05-07 — Session 7: Stub function defined twice (real one shadowed)

**What happened:** When implementing Phase 6 (Community), wrote a real `renderCommunityList()` function but the stub from Phase 4 was still in the file. JavaScript took the SECOND definition (the stub) as authoritative, so clicking "Sehat Charcha" showed "Coming soon" instead of the peer list.

**Why it happened:** Intentionally added stubs in Phase 4+5 so clicking Lab/Community wouldn't error before their phases shipped. But when Phase 6 added the real function, didn't remove the stub. JS hoisting + redefinition meant the last-declared `function renderCommunityList()` won.

**What was tried:** Live page showed stub message. Searched for `function renderCommunityList` and found 2 occurrences.

**What fixed it:** Added `content.replace(<stub_text>, '')` to the Phase 6 script to remove the stub before inserting the real one. Added an `assert content.count('function renderCommunityList') == 1` post-check to catch this class of bug.

**Rule going forward:** When replacing a stub with a real implementation, EXPLICITLY delete the stub. Don't rely on "last definition wins" — assert that the file has exactly ONE definition of any given function. Run `grep -c "function <name>"` before commit.

---

## 2026-05-07 — Session 8: Verification ran but no edits landed (file size unchanged)

**What happened:** Phase 4+5 of Session 7 was implemented via a Python heredoc. The script ran without raising, the success messages printed, but on inspection the file size hadn't changed and `grep` showed none of the new functions or constants were present.

**Why it happened:** The script had a SyntaxError later in its body (`'startOnboarding(\\'s-hub\\')'` — escaped single quote inside a single-quoted string literal). Python parses the entire heredoc before executing any of it, so the syntax error aborted the whole script *before* `f.write()` ran. Earlier in the script, the messages `print("CSS inserted: True")` and friends were string literals from an earlier successful test run that I'd carried into the new script, so they printed as if everything had succeeded — but they were stale.

**What was tried:** Wasted ~10 min thinking the regex match was failing. Re-ran the script with verbose output. Eventually saw the `SyntaxError: invalid syntax` line at the end of the previous Bash output and realised the entire script had aborted.

**What fixed it:** Removed the broken nested-quote line, reran. Edits landed. Added a separate post-check via `python3 -c "..."` so verification reads the actual saved file rather than relying on the same in-memory variable.

**Rule going forward:** After a Python heredoc edit, ALWAYS re-read the saved file in a separate `python3 -c` and verify needles. Don't trust in-script `print(... in content)` assertions — if the script crashed before the write, you'd never know. Two-step pattern: edit, then verify-from-disk.

---

## 2026-05-07 — Session 8: Sarvam TTS chunking ate the last sentence

**What happened:** Story playback worked for the first 3 chunks but the final sentence was missing. The story ended abruptly mid-thought.

**Why it happened:** First version of `chunkText()` used `text.match(/[^.!?।]+[.!?।]+/g)` — the regex requires both content AND a terminator. The last "sentence" of the story didn't end with `.` `!` `?` or `।` (the LLM occasionally ends with a quote mark or word). Without a terminator, regex returned `null` for that fragment, so the leftover text was silently dropped.

**What was tried:** Played the story twice, noticed it cut off at the same place. Re-checked — yes, no terminator on the final fragment.

**What fixed it:** Switched to a fallback: split by terminator-greedy match, then if any leftover text remains after the loop, append it as a final chunk. Updated to `text.match(/[^.!?।]+[.!?।]+\\s*/g) || [text]` plus a residual-text capture in the loop. Also defaulted to `[text]` if no matches at all (super-short stories).

**Rule going forward:** When chunking text on a delimiter, ALWAYS handle the terminator-less remainder explicitly. Don't assume the LLM will always end with punctuation. Verify by playing a story end-to-end and counting that all sentences came through.

---

## 2026-05-07 — Session 8: Hub rebuild ate s-chat and s-onboard screens (mood tap appeared to "go home")

**What happened:** After v3 Phase 2 deployed, tapping any mood button or pressing Enter in the input bar appeared to bounce the user back to the JioBharatIQ home screen (s-home). Both `moodTap` and `hubSend` route to `goTo('s-chat')`, so the bug was somewhere in between.

**Why it happened:** Phase 2 used a marker-bracketed range to replace the hub HTML:
```py
hub_start = content.find('<!-- ══════════════ SEHAT HUB ══════════════ -->')
hub_end = content.find('<!-- ══════════════ COMMUNITY SCREEN', hub_start)
content = content[:hub_start] + new_hub + content[hub_end:]
```
Between those two markers — in source order — sat **two unrelated screens**: `<div class="screen" id="s-chat">` and `<div class="screen" id="s-onboard">`. The replacement deleted them along with the hub. `goTo('s-chat')` then found `getElementById('s-chat') === null`, the if-block didn't run, and the user was left looking at s-home (z-index 1, below everything else).

**What was tried:** First suspected `goTo` logic, then a JS error in `moodTap` swallowing the navigation. Looking at `grep -E '<div class="screen' index.html` finally surfaced the missing screens — only 8 screens in the live file vs 10 in Session 7's last commit.

**What fixed it:** Recovered s-chat + s-onboard from `git show fb16b89:index.html` (the pre-Phase-2 commit), inserted them right before the COMMUNITY SCREEN marker.

**Rule going forward:** When using start/end markers to replace a block in HTML, ALWAYS verify what sits between them BEFORE running the replacement. Run `grep -nE '<div class="screen' file` (or equivalent for whatever entities matter) on both sides of the replacement and diff the lists. If a marker-pair spans more than the intended block, switch to a more specific anchor (the closing `</div>` at the right indentation, or a comment immediately after the intended block). Pair this with a post-replacement count assertion: `assert content.count('<div class="screen') == EXPECTED`.
