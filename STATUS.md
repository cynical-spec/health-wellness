# Status — Sehat Saathi
*Last updated: 2026-05-14 — Session 14 (v5.4 — 100 ghar ke nushke + per-step animations for every movement)*

## Session 14 highlights (v5.4)
- **REMEDY_KITS grown from 15 → 100** — 85 new Ayurvedic remedies across digestion (12), respiratory (12), sleep & stress (8), joint pain (8), skin (8), hair (6), fever & immunity (8), headache (5), eye/ear (4), women's wellness (5), kids (4), seasonal (3), detox/extras (2). Each follows the existing `kw / emoji / title / durSec / ingredients / steps[]` schema. Verified parsing.
- **Per-step animation library shipped** — `ANIM_SVG` map of 39 inline-SVG animations using SMIL. All 13 MOVEMENT_SKILLS now have an `anim: [...]` array parallel to `steps[]`. Animations cover breathing primitives (in/out/cycle/hold/sharp-exhale/bee-hum), nostril positions, sitting/kneeling/lying/squat poses, neck rotations, Surya Namaskar 6-pose sequence, walk-cycle (slow/brisk), water glass + 8-glass day, eye + screen-break, notebook + pen-writing, meditation poses.
- **Lottie infrastructure ready** — `lottie-web@5.12.2` deferred from CDN; each skill has an optional `lottie: ['<url>', ...]` slot that, when populated, takes priority over the SVG fallback. One-line upgrade per step. DEC-025 captures the hybrid trade-off.
- **`renderStepAnim(animKey, lottieUrl)`** — single renderer used by `showMoveStep`; preserves emoji-fallback for REMEDY_KITS (cooking, not movement) and acupressure (own SVG silhouette path).

## Session 13 highlights (v5.3.9)
- **CORS root-cause fix shipped** — `SARVAM_PROXY` default constant now points at our own `sarvam-proxy.nawaneet-kumar.workers.dev` Cloudflare Worker (was `corsproxy.io/?url=` which fails Sarvam's preflight when custom `api-subscription-key` headers are sent). Every Sarvam TTS / STT / transliterate call hits the Worker → `api.sarvam.ai`, no browser CORS error.
- **No per-device paste required** — previous v5.3.8 fix lived in `localStorage.ss_sarvam_proxy`, so only the one device where the console helper had been pasted actually used the Worker. Every other visitor silently fell back to Web Speech / ElevenLabs. v5.3.9 bakes it into source so it works on first load for every visitor on every device.
- **Override paths preserved** — `setSarvamProxy(url)` console helper still works for swapping proxies during testing; `window.SARVAM_PROXY` runtime override still works; passing `null` resets to the Worker default.

## Session 12 highlights (v5.3)
- **Symptom Focus Mode** — tapping Sir dard / Sardi-khansi / Pet / Neend opens a clarifying Q&A (3 questions, Dadi tone, hand-authored per symptom), then the hub *takes over* (body.focus class) and renders a 3-step Healing Path (acupressure → ghar ka nuska → rest) personalized to answers.
- **Per-symptom validation cycle** — 30 min (Sir dard), 2 h (Pet), 4 h (Sardi-khansi), 8 h (Neend). `?demo_focus=1` URL param collapses all to 30s for QA. Validation circle appears in stories rail (priority above v5.2 check-in).
- **JTBD branching**: Bahut behtar → blessing + inline Ayurvedic upsell (Bramhi / Sitopaladi / Hingvashtak / Ashwagandha — real Indian brands at real MRP/discount, AYUSH-compliant) → Sehat Bazaar checkout. Aisa hi hai → rotate to alternative remedy (1 retry → escalate to doctor). Aur kharaab → `#doctor-ov` immediately.
- **Doctor short-circuit** during Q&A — Sardi-khansi + "Bukhar zyada hai" OR Pet + "Dast 2 din se zyada" skips focus and opens doctor handoff directly.
- **Step completion hook** — `closeMovement()` now invokes `markFocusStepComplete(stepKey)` when the closed skill belongs to the active focus step. Score bumps +2 per step.
- **Persistence** — `ss_focus` localStorage survives tab close. Focus state, step progress, validation timing all restored.

## Session 11 highlights (v5.2)

## Session 11 highlights (v5.2)
- **48h symptom check-in loop** — `pushCheckin` fires in `triSymptomTap`, `getDueCheckin` scans on every hub re-open, pulsing red-orange "Kaisa hai?" circle prepended to the stories rail. `?demo_checkin=1` URL param drops the wait to 10s for QA.
- **Dadi-tone check-in modal** (`#checkin-ov`) — 3 chunky 88px buttons: Bahut behtar / Aisa hi hai / Aur kharaab.
- **JTBD branching** — Better → 🌸 blessing overlay (`tickPop` anim) + `bumpScore(+5)`; Same → keyword-matched alternative REMEDY_KIT + soft doctor nudge; Worse → full-screen doctor handoff with `tel:18001801104` + Practo + 1mg.
- **Sunita-archetype home** — auto-detected via `profile.age >= 40 OR scope === 'household'`. `body.sunita` class hides the dense grids + aham-row; reveals parallel 4-primary-tile + 4-takleef-tile + `<details>` "Aur dekho" expand.
- **Accessibility contrast bump** — `--text2` #b5b5b5 → #c8c8c8 (WCAG 4.4:1 → 5.6:1 on dark bg), `--text3` .38 → .46. Single-token change, no palette redesign.
- **`#doctor-ov`** also reachable from Sunita-home "Doctor se baat" tile directly, not just via check-in.

## Session 10 highlights (v5)

## Session 10 highlights (v5)
- **Hub re-balanced** — `aham-row` (2-card gradient row) under hero promotes Dawai parchi + Lab report to first-class entry points alongside symptoms triage. Live "N active" pill on Dawai when reminders exist.
- **End-to-end prescription flow** (`s-rx`, 5 steps) — Member → Photo/PDF/Manual → Scan animation → Editable extracted medicines → Reminder timing + delivery channel (App/WhatsApp/Voice) → Confirmation with cross-sell.
- **Sehat Bazaar order flow** (`s-order`, 4 steps) — Cart with brand+generic+MRP+discount → Address picker (Lucknow/Varanasi seeds) → UPI/COD/Jio Wallet → Animated success with WhatsApp tracking confirmation. Order IDs `NM<base36>`. Reliance Netmeds branded.
- **Order tracking** (`s-track`) — 5-stage vertical timeline (Placed → Confirmed → Packed → Out for delivery → Delivered) with auto-progress every 12s for prototype demo. Live re-render every 3s while screen is open.
- **Mera Sehat unified hub** (`s-bazaar`) — Active reminders + Mere orders + Lab reports. Channel pills (App/WhatsApp/Voice color-coded). Replaces disabled Sehat Charcha row in tools sheet.
- **Lab Interpreter upgrades** — Added Photo capture path (camera on mobile), template-based fallback for both Photo and PDF when Vision API unavailable, new "Doctor ne dawai likhi hai? Reminder lagao →" CTA on result that pre-seeds the RX flow with the same member.
- **Template OCR (DEC-016)** — `RX_TEMPLATES` (3 prescriptions), `LAB_PHOTO_TEMPLATES` (3 reports), `MEDICINE_CATALOG` (9 medicines with brand/generic/MRP). Tagged `[Sample analysis — prototype mode]` so users know.
- **PR Preview workflow** (`.github/workflows/pr-preview.yml`) — auto-comments preview URLs (raw.githack.com + jsDelivr) and a key-injected artifact link on every PR. Updates the comment in-place on push.

## Session 9c highlights
- **Wellness mode now speaks as Maa/Dadi** — `WELLNESS_SYSTEM_PROMPT` rewritten with strict tone rules: "beta/bachha" required; "bhai/yaar/buddy/guys/dude/mate/bro" forbidden. Female-voiced. Modern context preserved (gym, hostel, WFH, screen) in warm-elder register.
- **TTS pronunciation fixed** — every "choddo / Choddo" replaced with safer phrasing (`Haath hata lo`, `saans bahar nikalo`, `Saans Bahar`). Hand-written Devanagari `tts[]` arrays added for all acupressure points + breathwork/yoga + new habit kits. `showMoveStep` passes `tts[idx]` via `speak(..., { ttsText })` so Sarvam Bulbul reads natural unambiguous Hindi.
- **5 wellness habit kits** added inline into `MOVEMENT_SKILLS`: 🚶 daily-walk, 💧 hydration, 👁 screen-break (20-20-20), 📔 journaling, 🧘‍♀️ meditation. Each has 5 steps + Devanagari `tts[]`.
- **Recipe + acupressure card injection** now fires in **both `nushke` and `wellness` ctxs** (was nushke-only). Wellness replies that mention haldi-doodh, tulsi, jeera-paani, brisk walk, pani peene, dhyan etc. now surface their step-animation cards.

## Session 9b highlights
- **Wellness goals grid** added above the symptom grid (`tri-well-grid`, 8 buttons: Energy, Achi neend, Pachhan, Mann shanti, Skin glow, Vajan, Focus, Immunity). Each routes via new `triWellnessTap()` to `wellness` ctx with a magical-moment first-turn prompt.
- **Hero re-framed** from `Kya takleef hai?` to `Namaste 🙏 / Aaj kaisi sehat banayein?`. Welcomes both the well and the unwell.
- Section labels: "Aaj behtar feel karo" (wellness) above, "Koi takleef hai?" (symptoms) below. Both grids on one scroll, no tabs.
- **Held off women's health** (PCOS, periods, prenatal) — explicitly slated for its own vertical, not mixed into the wellness grid.

## Session 9 highlights
- **Hub re-anchored on symptoms triage** — 8-button `tri-grid` (Sir dard, Sardi-khansi, Pet, Neend, Ghutno, Bukhar, Tension, Saans/galay) is now the primary path. Mood is collapsed into a single-line pulse-check strip. Other use cases (Story, Saans, Lab, Dawai, Meal, Parivaar) live in a subtle `tri-rail`.
- **Ghar-ka-nushka now ends in an animation, not a YouTube link** — `REMEDY_KITS` (15 recipes) + `injectRemedyCard()` produce an in-app step overlay (reuses `move-ov`) with ingredients, step-by-step, auto-advance, Sarvam TTS read-aloud, progress dots.
- **Acupressure cards** — `ACUPRESSURE_POINTS` (6 points) with SVG body silhouettes + pulsing pin marker; keyword-triggered from AI replies.
- **Voice = real conversation** — live mic-level bars (driven from analyser RMS), state pill, live transcript area (`Aap ne kaha:` + `Saathi:`), thinking line, mirrored bot replies. Works on both hub-target and chat-target Speak.

## Session 8 highlights
- **Sehat hub fully redesigned** as 3-zone home (greeting / 3 moods / story+score). Tools moved to bottom-sheet behind 3-dot menu.
- **Voice migrated to Sarvam** — Saarika STT + Bulbul TTS, all Indian languages, persona-mapped speakers (pavithra/meera/amol).
- **Dynamic story generation** per persona+season+language via OpenAI → played through Sarvam TTS.
- **Sehat Score persisted** with 4 levels (Shishya→Rakshak→Mitra→Guru), daily dots (paani/swas/khana), streak tracking, Ritucharya unlock at 91+.
- **Meal Planning** now respects household chronic conditions in the system prompt.
- **Visual tokens v3**: `#0a0a0a` bg, `#6B21A8` purple, `#fb923c` amber, no gradients, no drop shadows.

⚠️ **Required secret**: `SARVAM_KEY` must be set in GitHub Secrets before voice works.



---

## Live URL
**https://cynical-spec.github.io/health-wellness/**
Status: **LIVE** — deployed via GitHub Actions
Last successful deploy: 2026-05-07 Session 7 (commit `f41068c`)

---

## Definition of Done — Verification

| # | Requirement | Status |
|---|---|---|
| 1 | Opens on mobile from GitHub Pages | DONE |
| 2 | JioBharatIQ look — dark, Jio purple, no clinical imagery | DONE |
| 3 | "Pet dukhtay" voice → Marathi captured | DONE (Chrome/Safari) |
| 4 | One clarifying question in Marathi | DONE — two-turn system prompt |
| 5 | Remedy in Marathi | DONE — Groq fallback ensures availability |
| 6 | Remedy spoken via TTS in detected language | DONE — `detectLang()` + `pickVoice()` (Session 7) |
| 7 | Language badge shows | DONE — 9 scripts detected (Sinhala added Session 7) |
| 8 | Tamil/Bengali/Punjabi same flow | DONE |
| 9 | Chest pain → escalation, no remedy | DONE — system prompt emergency gate |
| 10 | New chat resets cleanly | DONE |
| 11 | All four tracking files up to date | DONE — Session 7 |
| 12 | README has clear setup instructions | Needs review post-Session 7 |

**v2 (Session 7) additional Definition of Done:**

| # | Requirement | Status |
|---|---|---|
| 13 | Soft onboarding shows on first hub visit | DONE |
| 14 | BMI calculated and stored if height given | DONE |
| 15 | Onboarding skippable up to 3 times | DONE |
| 16 | Quick Actions reflect last 6 visited features | DONE |
| 17 | Lab Interpreter accepts PDF and rejects prescriptions | DONE — pdf.js + regex guard |
| 18 | Lab reports persist per family member | DONE — `ss_lab_reports` |
| 19 | Community shows 5 AI peers with profile-based matching | DONE |
| 20 | Wellness Talk refuses diagnosis | DONE — system prompt enforces |
| 21 | Nushke video card injects on AYUSH ingredient mention | DONE — 15 mappings |
| 22 | No flow ends in dead screen | DONE — Symptoms/Breathwork/Family-add all have follow-up CTAs |

**Overall: 22/22 Definition of Done items complete.**

---

## Feature Status

### Home Screen
| Feature | Status | Notes |
|---|---|---|
| JioBharatIQ shell | Working | 5 assistant cards (persona photos), dynamic QA grid |
| Quick Actions grid | Working — **personalized** | LRU from `ss_recent`, default health set for new users (Session 7) |
| Sehat Saathi card | Working | Active border, taps `enterHub()` (gates onboarding) |
| Placeholder assistants | Working | Show toast on tap |
| Update cards | Working | Static content |

### Onboarding (`s-onboard`) — NEW Session 7
| Feature | Status | Notes |
|---|---|---|
| Step 0 — Scope | Working | Self / Family / Household selection |
| Step 1 — Basic info | Working | Age + sex + weight required, height optional |
| Step 2 — BMI + family invite | Working | Auto BMI calc, category copy, optional family add |
| Skip flow | Working | "Baad mein" button, skipCount cap at 3 |
| Profile tile re-edit | Working | Sehat Tools → Profile reopens onboarding |
| localStorage | Working | `ss_profile` persists across sessions |

### Sehat Hub (v4.1 — wellness + takleef on one screen)
| Feature | Status | Notes |
|---|---|---|
| `tri-hero` "Aaj kaisi sehat banayein?" | Working — Session 9b | Open hero, neither sick-only nor wellness-only |
| `tri-well-grid` 8 wellness goals | Working — Session 9b | Energy, Achi neend, Pachhan, Mann shanti, Skin glow, Vajan, Focus, Immunity → `triWellnessTap()` → wellness ctx |
| `tri-grid` 8 symptom buttons | Working | Direct route to nushke chat with magical-moment first turn |
| `tri-mood` pulse-check strip | Working | Single-line, three small mood emoji buttons (collapsed mood path) |
| `tri-rail` subtle "Aur kya kar sakte ho" | Working | 6 secondary use-case chips — Story, Saans, Lab, Dawai, Meal, Parivaar |
| Header SS initials | Working | Replaces persona photo (Session 7) |
| Persona toggle pill | Working | Cycles Saathi → Dadi → Maa with TTS greeting |
| Score card | Working | Score, streak, level bar (Session 6) |
| Daily taps | Working | Time-of-day AYUSH habits (Session 6 dynamic) |
| Aaj ki AYUSH practice | Working | Slot-based content, links to breathwork |
| Story card | Visual only | Mock audio countdown |
| Unlock card | Working | Static "Ritucharya — 3 din aur" |
| Sehat Tools list | Working | 8 tools — Nushke, Lab, Wellness, Charcha, Dawai, Meal, Family, Profile |
| Locked input bar | Working | "Sehat Saathi se poochho..." + Speak (Session 6 fix) |

### Chat (`s-chat`) — Multi-context
| Feature | Status | Notes |
|---|---|---|
| Text + voice input | Working | Both paths functional |
| OpenAI GPT-4o | Network-dependent | May be blocked on some ISPs |
| Groq fallback | Working | Auto-triggers on OpenAI failure |
| Per-context system prompt | Working — Session 7 | `getSystemPromptFor(ctx)` routes nushke/wellness/community/general |
| Language badge | Working | 9 Indian scripts |
| Skill card injection | Working | Context-aware (breathe/pressure/stretch) |
| Nushke video card | Working — Session 7 | Injects on AYUSH keyword detection in nushke ctx |
| TTS playback | Working — Session 7 | Detects response language, picks matching voice |

### Lab Interpreter (`s-lab`) — NEW Session 7
| Feature | Status | Notes |
|---|---|---|
| Member triage | Working | Self + family + "Add new" |
| PDF upload | Working | pdf.js extracts up to 5 pages → JPEG dataURLs |
| Prescription guard | Working | Regex check rejects Rx-style PDFs lacking lab markers |
| GPT-4o Vision interpretation | Working | Structured JSON: `{markers, summary, doctorAdvice}` |
| Color-coded markers | Working | Normal=green, Low/High=amber, Critical=red |
| Per-member memory | Working | `ss_lab_reports` capped at 10/member |
| Past report list | Working | Shown on upload step for chosen member |
| View past report | Working | Re-renders result card from saved data |

### Community / Sehat Charcha (`s-community`) — NEW Session 7
| Feature | Status | Notes |
|---|---|---|
| 5 AI peers | Working | Sunita, Ramesh, Priya, Asha, Arjun |
| Profile-based matching | Working | ±10y age band OR matching condition tags |
| Peer chat | Working | Reuses `s-chat`, peer emoji + persona-specific system prompt |
| Disclaimer banner | Working | Required at top of every peer chat |

### Wellness Talk (`s-wellness` via s-chat) — NEW Session 7
| Feature | Status | Notes |
|---|---|---|
| Younger-audience system prompt | Working | Hinglish, no diagnosis, iCall helpline for crises |
| Starter chips | Working | 5 lifestyle topic chips |

### Medicine Reminder
| Feature | Status | Notes |
|---|---|---|
| 4-step flow | Working | Family-aware step 1 |
| localStorage `ss_rems` | Working | Survives page reload |
| Full-screen overlay | Working | Yellow pulse |
| Browser notification | Working | Requests permission |
| Snooze/dismiss | Working | |

### Meal Planning
| Feature | Status | Notes |
|---|---|---|
| For whom + preferences | Working | |
| Fridge photo (GPT-4o Vision) | Network-dependent | |
| 3-day meal plan | Working | |

### Family
| Feature | Status | Notes |
|---|---|---|
| Add/delete members | Working | |
| Conditions multi-select | Working | |
| Initials avatar | Working | |
| localStorage `ss_family` | Working | |
| Add success follow-ups | Working — Session 7 | Lab/Dawai/List/Hub CTAs after save |

### Breathwork
| Feature | Status | Notes |
|---|---|---|
| Box breathing 4-phase | Working | 4 rounds auto-stop |
| End follow-ups | Working — Session 7 | Community / Wellness / Hub CTAs after stop |
| Stretch guide | Working | 5 steps |
| Pressure point guide | Working | 3 points |

### Symptoms (formerly dead-end)
| Feature | Status | Notes |
|---|---|---|
| Starter chips | Working — Session 7 | 8 common symptoms route through nushke ctx |

### Voice Overlay (v4 — live conversation)
| Feature | Status | Notes |
|---|---|---|
| HelloJio Listening MP4 | Working | Dark theme CDN, sized down to 140px so transcript area has room |
| State pill | Working — Session 9 | `Sun rahi hoon` / `Soch rahi hoon` / `Bata rahi hoon` with color tint |
| Live mic-level bars | Working — Session 9 | 5-bar EQ driven from existing analyser RMS via `_setBarsFromLevel()` |
| Live transcript area | Working — Session 9 | `Aap ne kaha:` + `Saathi:` bubbles; thinking line removed when reply arrives |
| Bot reply auto-mirror | Working — Session 9 | `addMsg('bot', ...)` mirrors into overlay whenever overlay is on |
| Stop button | Working — Session 9 | Fixed bottom red `Band karein` |
| Browser compatibility | Chrome/Safari | Firefox: Speak button works if mic permitted |

### Wellness habit kits (v4.2 — same overlay player)
| Habit | Trigger keywords | Notes |
|---|---|---|
| 🚶 daily-walk | `brisk walk` / `chalna` / `30 minute walk` / `metabolism` | 5 steps, Devanagari `tts[]` |
| 💧 hydration | `pani peena` / `2-3 glass pani` / `hydration` / `glasses water` | 5 steps, Devanagari `tts[]` |
| 👁 screen-break | `20-20-20` / `screen break` / `aankho ka aaram` / `eye strain` | 5 steps, Devanagari `tts[]` |
| 📔 journaling | `journal` / `diary` / `likh lo` / `gratitude` | 5 steps, Devanagari `tts[]` |
| 🧘‍♀️ meditation | `meditation` / `dhyan` / `mindful` / `5 minute shanti` | 5 steps, Devanagari `tts[]` |

### Ghar-ke-Nushke recipe overlay (v4)
| Feature | Status | Notes |
|---|---|---|
| `REMEDY_KITS` (15 recipes) | Working — Session 9 | Haldi/Ajwain/Tulsi/Adrak/Jeera/Mulethi/Saunf/Methi/Namak/Nimbu/Anjeer/Arandi/Amla/Palak/Neem |
| `injectRemedyCard()` | Working — Session 9 | Injected on AYUSH-keyword AI replies in nushke ctx |
| In-app step overlay | Working — Session 9 | Reuses `move-ov` — auto-advance + Sarvam TTS + progress dots |

### Acupressure overlay (v4)
| Feature | Status | Notes |
|---|---|---|
| `ACUPRESSURE_POINTS` (6 points) | Working — Session 9 | LI-4, GB-20, PC-6, Yintang, ST-36, LU-7 |
| SVG silhouettes (hand/wrist/forehead/leg/head_back) | Working — Session 9 | Inline, dark-theme tinted, 180×180 |
| Pulsing `acu-pin` marker | Working — Session 9 | CSS keyframe pulse on the LI-4 hand point |
| `injectAcupressureCard()` | Working — Session 9 | Keyword-triggered after AI replies in nushke ctx |

### Voice Personas (Session 7 v2)
| Persona | Default | Voice tuning | Indian language support |
|---|---|---|---|
| Saathi 🤝 | **Default** | rate 0.95, pitch 1.0 | All 9 scripts via `pickVoice()` |
| Dadi 🧓 | Optional | rate 0.72, pitch 0.78 | Female-Hindi heuristic |
| Maa 🤱 | Optional | rate 0.88, pitch 1.05 | Female-Hindi heuristic |

---

## Known Limitations
1. **OpenAI may be blocked** on some Indian ISPs — Groq handles non-Vision calls; **Lab Interpreter has no Groq fallback** (Vision-only)
2. **setTimeout reminders** don't fire if tab is closed
3. **Voice: Chrome/Safari only** — Firefox hides Speak button
4. **Web Speech voice quality varies** — iOS Safari has limited Indian language voices; Bhashini swap recommended for production (DEC-009)
5. **File is ~4569 lines** — well past 800-line ideal (DEC-009, accepted for prototype)
6. **Lab Vision spend** — ~$0.01–0.03 per report; capped at 5 pages
7. **Nushke recipes are now in-app** (Session 9) — old YouTube fallback removed in favor of step overlays. AYUSH ingredients without a kit (rare) get no card.
8. **Sarvam STT is post-recording**, not streaming — voice overlay's "live" feel comes from mic-level bars + transcript-on-arrival, not partial words. If/when Sarvam ships streaming, swap in `convListenOnce()`.
9. **Community peers** are AI roleplay only — no real users; required disclaimer enforces honesty
10. **Orphan CSS** — `.hub3-mood*`/`.hub3-carousel*`/`.hub3-qb*` rules remain (no DOM uses them); slated for cleanup next session.

---

## Secrets Required
| Secret | Purpose | Status |
|---|---|---|
| `OPENAI_API_KEY` | GPT-4o (chat + Vision for Meal + Lab) | Set 2026-05-06 |
| `GROQ_API_KEY` | Llama 3.3 fallback (chat only, no Vision) | Set 2026-05-07 |

---

## localStorage keys
| Key | Added | Purpose |
|---|---|---|
| `ss_rems` | Session 1 | Medicine reminders |
| `ss_family` | Session 1 | Family members |
| `ss_profile` | Session 7 | User profile + onboarding state |
| `ss_recent` | Session 7 | Recent feature LRU (max 6) |
| `ss_lab_reports` | Session 7 | Per-member lab report memory |
| `ss_orders` | Session 10 | Sehat Bazaar order history (full snapshot incl. address, payment, status) |
| `ss_addresses` | Session 10 | Saved delivery addresses (Ghar/Maa-Papa seeded) |
| `ss_rems` (extended) | Session 10 | Now stores `channel`, `phone`, `dose`, `duration_days`, `rxId`, `member`, `strength`, `notes` |
| `ss_checkins` | Session 11 | 48h symptom check-in queue. Each row: `{id, displayText, aiPrompt, symptomEmoji, member, ts, status: 'pending'|'answered', answer?, answeredAt?}`. |
| `ss_focus` | Session 12 | Active Symptom Focus Mode (single-row). Stores `{symptom, startedAt, qaAnswers, steps[], retryCount, validations[], resolved, resolvedAt, allStepsDoneAt}`. Removed when focus is resolved. |
