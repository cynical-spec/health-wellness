# Changelog — Sehat Saathi

---

## 2026-05-10 — Session 12: v5.3 — Symptom Focus Mode (committed healing path for 4 takleef)

Navneet's followup: *"build wow experience for first 4 takleef — when user selects sir dard, the whole app experience and home screen change towards fixing that issue."* v5.2's takleef tap still suggested-and-stepped-back; v5.3 turns the hub into a committed caretaker. Dadi asks 2–3 clarifying questions, the home transforms into a 3-step Healing Path, then a per-symptom-tuned validation circle later asks *"kaisa hai ab?"* — branching to blessing + Ayurvedic upsell, alternative remedy, or doctor handoff.

### Added — `FOCUS_FLOWS` catalog
Four takleef × uniquely-authored Dadi scripts. Each entry has: `emoji`, `title`, `dadiOpener`, `qa[]` (3 questions with 3–4 options each), `quote(answers)` to personalize the focus-banner subtitle, `buildSteps(answers)` returning a 3-step plan (acupressure → remedy → rest), `altSteps(answers)` for the "Aisa hi hai" retry, optional `requiresDoctor(answers)` short-circuit, `validateAfterMin`, `ayurSku`, `ayurCopy`, `validateTitle(answers)`.

| Takleef | Validation | Default path (no answers) | Ayur upsell |
|---|---|---|---|
| `sir-dard` | 30 min | LI-4 acupressure → Tulsi kadha → Shavasana | Himalaya Brahmi 60 tab ₹153 |
| `sardi-khansi` | 4 h | LU-7 → Adrak chai → Anulom-Vilom (Mulethi if sookhi khaansi, Ajwain bhaap if balgam, Tulsi if nazla) | Baidyanath Sitopaladi ₹108 |
| `pet` | 2 h | Hydration → Ajwain bhaap → Vajrasana (Malasana + Jeera/Saunf/Nimbu-shahad routes for Gas/Acidity/Dast) | Dabur Hingwashtak ₹82 |
| `neend` | 8 h | 20-20-20 screen break → Haldi doodh → Meditation (Journaling if "bahut soochta hoon") | Patanjali Ashwagandha ₹144 |

Doctor-required short-circuits: `Bukhar zyada hai` for sardi-khansi → skip focus, open `#doctor-ov` directly. `Dast (loose motion)` + `2 din se zyada` for pet → same.

### Added — Focus Mode UI
- **`s-focus-qa` screen** — full-screen clarifying Q&A. Dadi opener line on first question, 3 progress dots, 4-option chip grid per question, auto-advance on tap. *Skip* button uses default `buildSteps({})`.
- **`#bless-ov` extension** — new `#bless-ayur-slot` div appended; populated by `showAyurUpsell(symptom)` when the validation answer is "better". Card has brand, AYUSH tag, generic, MRP/price/discount, "Ghar mangao →" + "Abhi nahi" buttons.
- **`#focus-validate-ov` overlay** — copy of `#checkin-ov` shape, 3 chunky 88px buttons (Bahut behtar / Aisa hi hai / Aur kharaab) + dynamic title from `flow.validateTitle(answers)`.
- **`.focus-home` block inside `#s-hub`** — revealed by `body.focus` class. Renders a gradient symptom banner with emoji + title + step counter + close button, a personalized Dadi quote line, the 3-step `.focus-stepper` (current step highlighted with purple ring + shadow), a "Phir bhi takleef hai? Doctor se baat" escape hatch, and a "Bahut accha kiya beta 🙏" celebratory waiting block when all 3 steps are done.
- **Stories rail extension** — when `isFocusValidationDue()` returns true, a pulsing red-orange "Kaisa hai ab?" circle prepends the rail (ahead of streak, even ahead of v5.2 check-in circle).

### Added — JS engine
- `FOCUS_DEMO` — reads `?demo_focus=1` URL param; when true, all `validateAfterMin` values collapse to 30 seconds for QA.
- `loadFocus / saveFocus / hasActiveFocus / getActiveFocus` — `ss_focus` localStorage single-row state.
- `startFocus(symptom)` — handles single-active-at-a-time with confirm dialog if another focus is mid-flow. Routes to `s-focus-qa`.
- `renderFocusQA(idx) / onFocusQATap / onFocusQASkip / cancelFocusQA / finalizeFocusStart` — Q&A flow + commits state on last tap.
- `renderFocusHome` — paints the active focus into `#focus-home`. Called from `applySunitaMode()` (which now also toggles `body.focus`).
- `openFocusStep(idx)` — taps a step → opens existing `openAcupressure / openRemedy / openMovement`. Tags `_moveSkill._focusKey` so `closeMovement` knows which focus step to mark done.
- `markFocusStepComplete(stepKey)` — invoked from extended `closeMovement`. Marks step done, promotes next to current, sets `allStepsDoneAt`, bumps score +2 per step.
- `isFocusValidationDue() / openFocusValidate / closeFocusValidate / onFocusBetter / onFocusSame / onFocusWorse` — validation loop. Same path: rotates to `altSteps`, capped at 2 retries → doctor. Worse path: `#doctor-ov`. Better path: blessing + Ayur upsell.
- `showAyurUpsell(symptom) / dismissAyurUpsell / orderAyurvedic(sku)` — slides upsell into `#bless-ov`, then jumps into existing Sehat Bazaar `s-order` flow with the SKU pre-loaded.

### Added — Ayurvedic SKUs in `MEDICINE_CATALOG`
- `ayur-bramhi` — Himalaya Brahmi 60 tab · ₹153 · Bacopa monnieri 250 mg
- `ayur-sitopaladi` — Baidyanath Sitopaladi Churan · ₹108 · 60 gm
- `ayur-hingvashtak` — Dabur Hingwashtak Churan · ₹82 · 50 gm
- `ayur-ashwagandha` — Patanjali Ashwagandha 60 cap · ₹144 · Withania somnifera 500 mg

Real brands, real prices, AYUSH-compliant. Existing Sehat Bazaar cart/address/payment/success flow handles checkout unchanged.

### Changed
- `closeMovement` now captures `_moveSkill._focusKey` before clearing state and fires `markFocusStepComplete` for the focused step. Same flow continues to work for non-focus usage (no `_focusKey` → no-op).
- `applySunitaMode()` (called from `initHubDynamic`) now also toggles `body.focus` and calls `renderFocusHome()`.
- `renderHubStories` priority order: focus-validation circle (v5.3) → 48h symptom check-in (v5.2) → streak → score → kahani → time-of-day habit → due reminder → active order → AYUSH aadat.
- The 4 priority takleef tiles in both the dense `tri-grid` and the Sunita home now route to `startFocus(symptom)` instead of `triSymptomTap(...)`. The other 4 takleef (Ghutno, Bukhar, Tension, Saans) keep the chat path until v5.4.
- `body.focus` CSS hides `.tri-hero`, `.aham-row`, `.tri-grid.dense-only`, `.tri-rail-lbl.dense-only`, `.sunita-home`, `.tri-rail-lbl[data-rail="secondary"]`, `.tri-rail` — full hub takeover.

### Broken / Known issues
- Multi-focus queue not supported — tapping a second takleef during an active focus prompts a confirm dialog and replaces. Acceptable; multi-focus UI is a follow-up.
- "Same" path rotates `buildSteps` → `altSteps` once. The catalog has alternates for all 4 symptoms but with only one alt iteration. After two "Aisa hi hai" answers, escalation to doctor is the only path.
- Validation fires by hub-reopen scan (same as v5.2 check-ins, DEC-020). If the user never returns to the hub within 24h after focus completes, no nudge fires. Add WhatsApp template when channel is provisioned.
- `confirm()` for pause/replace is browser-native (not styled). Replace with a proper modal in a follow-up if it becomes a friction.
- File grew from ~6558 → ~7290 lines.

### Next session should start with
- **Live URL QA** on a 390px viewport with `?demo_focus=1`. End-to-end path for Sir dard happy: tap → 3 questions → focus home → tap each step → validate "Bahut behtar" → blessing + ayur upsell → tap "Ghar mangao" → Bazaar cart with Bramhi → success.
- **Other 3 takleef**: confirm each has unique opener line, unique buildSteps mapping (esp. Pet's first-step-is-hydration-not-acupressure), unique Ayur SKU.
- **Doctor short-circuit**: tap Sardi-khansi → Q3 "Bukhar zyada hai" → confirm focus is NOT created, doctor overlay opens directly.
- **Same retry cap**: complete 2 Aisa hi hai loops in demo mode → confirm graceful doctor handoff.
- **Persistence**: complete 1 step, close tab, reopen → focus home renders with step 1 done.
- **Per-symptom Dadi copy** beyond Q&A — quote variants by answer combo, validateTitle variants.

---

## 2026-05-10 — Session 11: v5.2 — Recovery Feedback Loop + Sunita-archetype JTBD

Akshay reviewed v5.1 with Navneet and called out three product gaps blocking L0 validation: (1) no recovery loop after a symptom tap — the app never asks "did the nuska work?", (2) cognitive overload for Sunita-archetype (43yo Marathi housewife, low digital literacy) — the v5.1 hub stacks ~30 surfaces (16 grid buttons + 7 stories circles + 2 aham cards + 5 rail cards), violating Miller's Law, (3) JTBD breaks at "remedy didn't work" — no graceful path to a doctor. This session ships the closure to that loop.

### Added — `v5.2` Recovery Feedback Loop
- **`ss_checkins` localStorage** — new array of `{id, displayText, aiPrompt, symptomEmoji, member, ts, status: 'pending'|'answered', answer?, answeredAt?}`. Single-row dedupe: same symptom within 12h skips a re-push.
- **`pushCheckin()`** — fired inside `triSymptomTap()` (the takleef grid handler). Logs the symptom + timestamp before routing to chat. `triWellnessTap()` is intentionally NOT instrumented — wellness goals aren't symptomatic.
- **`CHECKIN_WAIT_MS`** — 48 hours in production, lowered to 10 seconds when the URL has `?demo_checkin=1` (for live demos and QA).
- **`getDueCheckin()`** — scans `ss_checkins`, returns the first row that's pending and ≥48h old. Called on every hub re-render via `renderHubStories`.
- **Stories rail check-in circle** — when a check-in is due, prepended ahead of Streak as the highest-priority circle. Uses `.hs-ring.due` (red→orange gradient + `reminderPulse` animation already in the stylesheet). Label: "Kaisa hai?".
- **`#checkin-ov` modal** — Dadi-tone full-screen overlay, 3 chunky 88px buttons:
  - 💚 **Bahut behtar** → `onCheckinBetter()` — marks `answered/better`, `bumpScore(+5)`, fires blessing overlay
  - 🤔 **Aisa hi hai** → `onCheckinSame()` — marks `answered/same`, opens an alternative `REMEDY_KIT` based on symptom-keyword match, toast "phir bhi aaram nahi mile toh doctor se baat karein"
  - 😔 **Aur kharaab** → `onCheckinWorse()` — marks `answered/worse`, opens doctor handoff overlay
- **`#bless-ov` overlay** — reuses `@keyframes tickPop` (already shipped for order-success). 🌸 emoji + "Bahut accha beta 🙏 / Saathi proud hai tum par" + "+5 Sehat Score" pill. Auto-dismisses in 3.5s, tap-anywhere also dismisses.
- **`#doctor-ov` overlay** — full-screen handoff with 3 stacked 88px CTAs:
  - 📞 **Doctor ko call karo** — `tel:18001801104` (NDHM Helpline placeholder)
  - 🩺 **Practo se appointment** — `https://www.practo.com` placeholder (`target=_blank`)
  - 💊 **Tata 1mg se baat** — `https://www.1mg.com` placeholder
  - Also reachable directly from the Sunita-home "Doctor se baat" tile, not only via check-in.

### Added — `v5.2` Sunita-archetype simplified home
- **`isSunitaMode()`** — returns `true` if `profile.age >= 40` OR `profile.scope === 'household'`. Auto-detected from existing `ss_profile`; no new toggle UI.
- **`applySunitaMode()`** — called inside `initHubDynamic()`. Toggles `body.sunita` class. CSS:
  - `body.sunita .tri-grid.dense-only, body.sunita .tri-rail-lbl.dense-only, body.sunita .aham-row { display:none }` — hides the v5.1 dense layout entirely.
  - `body:not(.sunita) .sunita-home { display:none }` — hides the simplified layout for younger users.
- **`.sunita-home` block** — parallel render with 2 sections:
  - **Aham kaam** 2×2 grid: Dawai parchi · Lab samjho · Dadi ki kahani · Doctor se baat (96px tall, font 16px, high-contrast gradient tiles)
  - **Aaj kya takleef hai?** 2×2 grid: Sir dard · Sardi-khansi · Pet ki dikkat · Neend nahi (80px tall)
  - **`<details class="sun-more">`** — collapsed-by-default expand with the full wellness (Energy, Mann shanti, Pachhan, Immunity) + remaining 4 takleefs (Ghutno, Bukhar, Tension, Saans). Zero-JS; native HTML element.

### Changed
- **Contrast bump for 40+ eyes** — `--text2` from `#b5b5b5` (~4.4:1 on dark bg) to `#c8c8c8` (~5.6:1). `--text3` from `rgba(255,255,255,.38)` to `.46`. WCAG AA comfortably for all body text. No palette redesign — single-token change.
- **`triSymptomTap()`** — added one-line `pushCheckin(displayText, aiPrompt)` call before the `goTo('s-chat')` route. Behavior for users who don't return is unaffected; the check-in just stays pending until they do.
- **`renderHubStories()`** — first circle is now conditional: if `getDueCheckin()` returns a row, the check-in circle takes priority over Streak.

### Broken / Known issues
- **`tel:` link UX on desktop** — clicking opens "Open this in your default phone app?" prompt; only fully natural on mobile. Acceptable for prototype since target device is mobile.
- **External placeholder links** (practo.com, 1mg.com) leave the app — single biggest break in the "warm conversation" flow. Real partnerships needed; flagged in DEC-022.
- **Check-in dedupe is conservative** — same symptom within 12h doesn't re-push, but if the user taps "Sir dard" today and again tomorrow, the second tap won't get its own check-in. Acceptable: users with chronic complaints get one consolidated follow-up, not five.
- File grew from ~6172 → ~6470 lines. Past DEC-009's 5000-line ideal but contained in clearly-marked `// ══ v5.2 ══` blocks.

### Next session should start with
- **Live URL QA (mobile, 390px)** — set profile `age:45` → confirm Sunita home renders (no dense grid). Tap "Sir dard" with `?demo_checkin=1` → wait 10s → return to hub → confirm pulsing check-in circle appears first in the stories rail → tap → confirm Dadi modal with 3 colored buttons → tap each outcome in 3 separate sessions:
  - **Better:** blessing overlay slides up with 🌸 + tickPop, +5 score, auto-dismisses
  - **Same:** appropriate `REMEDY_KIT` opens (Sir dard → Tulsi kadha)
  - **Worse:** doctor handoff overlay, tap call CTA → device dial prompt
- **`age:28` profile** — confirm dense v5.1 layout returns unchanged.
- **Per-symptom Dadi copy** — first cut interpolates `displayText`. Hand-write 8 specific scripts for the 8 symptoms (Sir dard ke liye haldi-doodh diya tha — abhi sir kaisa hai?) for the next iteration.

---

## 2026-05-10 — Session 10b: v5.1 — Aaj ki Sehat stories rail + de-clutter + RX render fix

User feedback after v5 shipped: (a) tapped "Dawai parchi" hero card → header rendered ("Yeh dawai kiske liye? / Member chunein") and the progress bar showed step 0 done, but the body below was completely blank — no member buttons. (b) "the landing screen right lost its today's activities or story that lure people to come back — something like story of instagram or today's task, way to make screen less cluttered and more warming?"

### Fixed
- **RX flow step 0 empty body** — added explicit `min-height:60vh` and `display:block` to `.rx-body`, plus `flex:1 1 auto;min-height:0` on the `#rx-body` / `#order-body` / `#track-body` / `#bazaar-body` outer containers. The screen `.body` was relying on cascading flex sizing alone, which can collapse under unusual viewport conditions (large viewport, no explicit minimum). Belt-and-braces: wrapped `renderRxStep()` in a try/catch that surfaces any rendering error visibly to the user instead of leaving a blank screen — `_renderRxStepInner()` is the renamed implementation.

### Added — `v5.1` warm home
- **`hub-stories` rail** — Instagram-stories-style horizontal pills directly under the header, gradient-bordered circles 60×60px:
  - 🔥 **Streak** (with day count badge in lower-right corner; muted state if streak = 0)
  - 💚 **Sehat Score**
  - 📖 **Aaj ki kahani** (Dadi's daily story — taps `playStory('general')`)
  - 🌅 / 💧 / 🌬 / 🌙 **Time-of-day habit** — auto-switches by clock: morning ritual → "Paani peeyo" (with done-state when tapped) → "Saans karo" → "Raat ki dua"
  - ⏰ **Due reminder** (only shows if next reminder exists; pulses red-orange to grab attention)
  - 🛒 **Active order** (only shows if any order is mid-flight; tap → tracking timeline)
  - 🪴 **AYUSH aadat** — always-on entry to breathwork

  Six gradient styles wired (`green`, `purple`, `warm`, `streak`, `muted`, `done`, `due` with pulse animation). Re-renders on `initHubDynamic` so it always reflects current state when the user returns to the hub.

- **`storiesTapDot(type)`** — tapping the paani circle in the rail marks the daily dot done, bumps Sehat Score by 2, refreshes the rail, and toasts a "+2 score" confirmation. Reuses the existing `daily_<type>_<date>` localStorage keys.

### Changed
- **Compact hero** — hero font dropped from 26px → 22px, padding 14px 16px 10px → 6px 16px 8px, sub-copy reduced from 2 lines to 1. The greeting still says "Namaste 🙏 / Aaj kaisi sehat banayein?" but takes ~40% less vertical space.
- **Removed mood pulse strip** (`.tri-mood`) — the wellness goals grid (Energy / Mann shanti / Skin glow / Vajan / Focus / Immunity) and symptoms triage grid already cover the "how do I feel today" intent. The strip was a vestige from the v3 mood-first home and added clutter.

### Broken / Known issues
- The streak/score circles in the rail tap-toast info; they don't yet open a dedicated detail screen. Worth building if engagement on the rail is high.
- Time-of-day habit slot is heuristic (4 windows). For diabetics or shift-workers we could read profile's `tods` array if the user sets it.

### Next session should start with
- Live URL test on a 390px viewport: confirm the stories rail renders, the rx-body issue is gone (tap "Dawai parchi" → see member buttons immediately).
- Add a subtle dot-pulse on the rail when a circle has unread/new content (e.g., "new story for today").

---

## 2026-05-10 — Session 10: v5 — End-to-end Dawai parchi: scan → reminder → Sehat Bazaar order → tracking

User feedback after v4.2: "Right now symptoms triage has overtaken the entire experience" — Lab Report and Dawai Reminder were buried in a small `tri-rail` underneath the wellness + symptoms grids. The product had three magical moments queued (symptoms triage, lab interpretation, prescription-to-doorstep) but only one had been built into a real surface. The user explicitly asked for the second and third experiences (lab + prescription→reminder→fulfilment) to be nailed end-to-end, with Reliance Netmeds (acquired by Reliance, serves tier 2/3) as the fulfilment partner. Vision API is unavailable in the prototype, so OCR is template-driven for now.

### Added — `v5` end-to-end experience
- **Hub: `aham-row` action cards** — two prominent gradient tiles right under the hero ("Dawai parchi" + "Lab report"), elevating both flows to first-class entry points. The pill on Dawai parchi shows a live "N active" count when the user has reminders. Symptoms grid and wellness grid keep their place below.
- **New screen `s-rx`: Prescription → Reminder flow (5 steps)**:
  1. **Member triage** — Self / family member / "Add new" (mirrors Lab member step for consistency).
  2. **Method picker** — Photo (camera capture, `accept="image/*" capture="environment"`) / PDF / Manually likhein. Manual path opens an inline editor immediately.
  3. **Scanning animation** — paper card with a green sweeping scan-line + 3 progressing status messages (`Doctor ka likha padh raha hoon → Dawaiyaan dhoondh raha hoon → Dose aur timing nikaal raha hoon`). 2.5s total. Feels like real OCR.
  4. **Extracted medicines review** — auto-populated cards with name, strength, dose, timing chips, duration, doctor's notes. Each card has an inline edit pencil that swaps to a 5-field editor (name / strength / dose / duration / notes). Add-medicine button for manual additions. Confidence pill (`94% confidence`) on the header.
  5. **Reminder timing + delivery channel** — per-medicine timing chips (Subah/Dopahar/Shaam/Raat) + first-reminder time picker. Three-way delivery channel picker:
     - 📱 **JBIQ App full-screen reminder** (default — uses existing `setTimeout` + `Notification` path).
     - 💬 **WhatsApp message** — Hindi text to family member's phone.
     - 📞 **Voice call** — Saathi awaaz padhke sunayegi, ideal for dadi/papa with low literacy.
     - Phone-number input appears conditionally for WhatsApp/Voice. WhatsApp/Voice are placeholder (toast: `prototype hai, real send nahi hoga`) until Twilio/Gupshup integrated.
  6. **Confirmation + cross-sell** — celebration tick + summary, then a warm gradient banner: "Yeh dawaiyaan ghar mangao? Sehat Bazaar (Reliance Netmeds) — tier 2/3 mein bhi delivery, COD available."

- **3 sample prescriptions** in `RX_TEMPLATES` (cycled randomly per scan): Dr. Sharma diabetes-BP combo (Metformin + Telma + Becosules), Dr. Patel pediatric fever (Crocin + Azithral + ORS-L), Dr. Khan cold-cough (Cetzine + Benadryl + Vicks). Each has doctor name, clinic, confidence, and 3 medicines with realistic Indian dosing/timing.

- **`MEDICINE_CATALOG`** — 9 medicines with brand name, generic salt, manufacturer (USV / Glenmark / Pfizer / GSK / Alembic / Cipla / Dr. Reddy's / J&J / P&G), MRP, discounted price, pack size, emoji. SKUs match prescription templates 1:1.

- **New screen `s-order`: Sehat Bazaar order flow (4 steps)**:
  1. **Cart** — Reliance Netmeds banner ("Tier 2 + 3 delivery · COD available · 100% original"), per-item card with brand, generic, manufacturer, pack, MRP/price/discount %, quantity stepper, and a "Generic available" cross-sell row where applicable. Bill block with subtotal, savings, free-delivery threshold (₹199), total.
  2. **Address picker** — 2 default addresses (Ghar Lucknow / Maa-Papa Varanasi); "Naya address jodein" via `prompt()` (5 fields). Tag pill (Ghar / Maa-Papa / Naya), name, full address, phone.
  3. **Payment** — UPI / COD / Jio Wallet (with 5% cashback teaser). COD highlighted as tier 2/3-friendly default.
  4. **Success** — animated tick (cubic-bezier pop), order ID (`NM<base36>`), delivery summary, ETA "Kal shaam tak", payment label, WhatsApp tracking-link confirmation banner ("`+91...` pe order updates milte rahenge — Hindi mein").

- **New screen `s-track`: Order tracking timeline** — 5-stage vertical timeline (Order placed → Confirmed by pharmacy → Packed → Out for delivery → Delivered) with live re-render every 3s. Each stage has a colored dot (done = green, active = orange pulse, pending = grey), connecting line, name, sub-label, and timestamp. For prototype demo, `scheduleOrderProgress()` auto-advances the order through stages every 12s so users can watch it move. Shows order summary card with ID, ETA, address, phone, payment, plus item list.

- **New screen `s-bazaar`: Mera Sehat (unified hub)** — three sections:
  - **Active reminders** — list with name+strength, who/timing/time, delivery-channel pill (App/WhatsApp/Voice color-coded), per-row delete button. Empty-state CTA to scan.
  - **Mere orders** — order cards with item count, total, member, date, status pill (Placed/Packing/Out for Delivery/Delivered). Tap → opens tracking.
  - **Lab reports** — flat list across all members; tap → re-renders past lab result.
  - Replaces the orphan "Sehat Charcha · Jald aa raha hai" disabled row in tools sheet.

- **Lab Interpreter upgrades**:
  - Step 1 now offers **Photo + PDF + Manual** entry side-by-side (`lab-method-row`). Photo path uses `LAB_PHOTO_TEMPLATES` (3 sample reports — Anaemia CBC, High-cholesterol Lipid, Diabetes HbA1c) since Vision API key isn't available in prototype. Each sample is realistic with correct ranges, mixed Normal/High/Low/Critical statuses, doctor advice, and tier 2/3-appropriate Hindi summaries.
  - Step 3 (result) gets a new warm-gradient CTA: **"Doctor ne dawai likhi hai? Reminder lagao →"** which calls `saveLabAndStartRx()` — saves the lab report and pre-seeds the RX flow with the same member, jumping straight to the method picker. Closes the lab → prescription loop.
  - PDF Vision-fail fallback now also returns a sample analysis (instead of just an error message) tagged `[Sample analysis — prototype mode bina Vision API ke]`.

- **PR Preview workflow** (`.github/workflows/pr-preview.yml`) — auto-comments on every PR with three preview surfaces:
  - **raw.githack.com URL** — instant, no setup, works for symptoms+RX+Lab+Bazaar (chat/voice locked since no keys).
  - **jsDelivr CDN mirror** — cached secondary URL.
  - **Full-feature artifact** — index.html with API keys injected (uses GH Secrets), downloadable from the workflow run, runnable via `python3 -m http.server`. The comment is updated in-place on each push, not appended.

- **localStorage keys**:
  - `ss_orders` — order history with full snapshot (items, address, payment, status index, timestamps).
  - `ss_addresses` — saved addresses (defaults seeded).
  - **Extended `ss_rems`** — added fields: `rxId`, `strength`, `member`, `dose`, `duration_days`, `channel` (`app`/`whatsapp`/`voice`), `phone`, `notes`. Backward-compatible — legacy reminders still display.

### Changed
- **Hub layout** — `aham-row` inserted between `tri-hero` and `tri-well-grid` (wellness goals). Symptoms grid stays where it was (below wellness). The `tri-rail` had Lab + Dawai cards removed (those are promoted) and a new "Mera Sehat" tile added (replaces them, shows live `N reminder · M order` count).
- **`startFeature('medicine')`** is now an alias for `startFeature('rx')` — old call sites continue to work but route to the new RX flow. The legacy `s-medicine` screen is unchanged but is no longer reachable from the hub.
- **Tools bottom sheet** — "Dawai Reminder" row replaced with "Dawai parchi · reminder · order" (routes to `rx`); the disabled "Sehat Charcha — Jald aa raha hai" row replaced with "Mera Sehat" (routes to `bazaar`).

### Broken / Known issues
- **OCR is template-driven** — `rxOnPhoto`, `rxOnPdf`, `handleLabPhoto` all return random `RX_TEMPLATES` / `LAB_PHOTO_TEMPLATES` results instead of actual OCR. Real Vision API integration (OpenAI GPT-4o or Sarvam OCR or Bhashini) is the next priority. Templates are clearly marked `[Sample analysis — prototype mode]` in summaries.
- **WhatsApp + Voice channels are placeholders** — saving a reminder with channel `whatsapp`/`voice` shows a toast ("prototype hai, real send nahi hoga") and still schedules an in-app reminder under the hood. Real Twilio/Gupshup integration is straightforward but needs paid API keys.
- **Order timeline auto-advances on the client** via `setTimeout` (12s per stage). If the user closes the tab, progress resumes from `statusIdx` but timestamps regenerate from `placedAt + i*12s` — they're representative, not real.
- **Address `prompt()`-based add** is functional but ugly. Polished modal is a small follow-up — kept simple to avoid CSS bloat in this session.
- File grew from 4803 → 6051 lines. Past the DEC-009 threshold (5000) but the new code is clearly sectioned with `// ══ v5: ... ══` markers; revisit DEC-009 next session.
- The promoted `aham-row` makes the home longer above-the-fold. Acceptable since this is the user's stated priority — but worth measuring tap-rate post-deploy.

### Next session should start with
- **Live preview QA**: open the PR's raw.githack URL on a 390px viewport. Tap "Dawai parchi" → photo (it will trigger the camera on a real phone, picker on desktop) → confirm scanning anim → confirm 3 medicines render → edit one → set timing chips → pick WhatsApp channel + enter a number → confirm → tap "Sehat Bazaar se ghar mangao" → cart → address → COD → success → tap "track" → watch the timeline animate. End-to-end happy path should take ~90 seconds.
- **Real OCR**: wire `rxOnPhoto` / `rxOnPdf` to the existing `interpretLabPDF` Vision call (or a separate `interpretRx()` Vision call) once an OpenAI key with Vision is reliably available. Keep `RX_TEMPLATES` as fallback for ISP-blocked users.
- **Real WhatsApp/Voice**: pick provider (Gupshup if hi-IN focus, Twilio if global). Build a thin Cloudflare Worker proxy so we don't expose provider keys client-side.
- **Address-picker modal** — replace `prompt()` with a real form sheet.
- **Sehat Score wiring** — `bumpScore(2)` for setting a reminder, `bumpScore(3)` for placing an order. Already in code; verify on the live URL that the score chip updates.

---

## 2026-05-10 — Session 9c: v4.2 — Maa/Dadi tone for wellness, habit-cards, TTS pronunciation fix

User feedback after v4.1 shipped, with screenshots: (a) Wellness mode opened with `Bhai, sustainable healthy weight ke liye...` — wrong register; the magical-moment is the Maa/Dadi warm voice and "bhai/yaar/buddy" breaks it; (b) Wellness-mode replies showed only follow-up chips (`Aur tips / Saans karein / Plan banao`) — no recipe/animation card for the practical "30-min walk + pani peena" advice the AI was giving; (c) Acupressure step 4/5 read "Choddo. Doosre haath par bhi karo." — Roman "choddo" gets read by Sarvam Bulbul TTS with the wrong Hindi stress and **sounds vulgar** to the listener.

### Fixed
- **TONE — wellness now speaks as Maa/Dadi, not bhai.** `WELLNESS_SYSTEM_PROMPT` rewritten to require strict Maa/Dadi warmth: words like "beta", "bachha", "suno beta", "haan beta" are mandatory; "bhai", "yaar", "buddy", "guys", "dude", "mate", "bro" are explicitly forbidden. Female-voiced. The new prompt keeps the modern context (gym, hostel, WFH, screen, lab, exam) but in the warm-elder register.
- **TTS pronunciation — every "choddo / chhoddo / Choddo" replaced**:
  - Acupressure release step (LI-4, PC-6): `Choddo. Doosre haath par bhi karo.` → `Haath hata lo. Doosre haath par bhi karo.`
  - Anulom-Vilom & Surya Namaskar: `saans choddo` → `saans bahar nikalo`
  - Bhramari: `Saans choddte hue "Mmm..."` → `Saans bahar nikalte hue "Mmm..."`
  - Box-breathing phase name `Choddo` → `Saans Bahar`
- **Devanagari `tts[]` per step.** Every acupressure point + breath/yoga skill + new wellness habit now has a hand-written Devanagari `tts[]` array parallel to `steps[]`. `showMoveStep()` prefers `_moveSkill.tts[idx]` (passed via `speak(..., { ttsText })`) so Sarvam Bulbul reads natural, unambiguous Hindi with female Maa-voice register, instead of transliterating Roman input where ambiguous spellings can land on vulgar phonemes.
- **`openAcupressure()` passes `p.tts` through** to the `move-ov` player so the same TTS-quality fix applies to acupressure overlay reads.

### Added
- **`HABIT_KITS` (5 wellness habits) added inline into `MOVEMENT_SKILLS`** — same overlay player, lifestyle steps:
  - 🚶 `daily-walk` — 30-min brisk walk routine (5 steps)
  - 💧 `hydration` — pani-peene-ka-routine (5 steps)
  - 👁 `screen-break` — 20-20-20 aankho ka aaram (5 steps)
  - 📔 `journaling` — 5-min raat ki diary (5 steps)
  - 🧘‍♀️ `meditation` — 5-min mindful saans (5 steps)

  Each kit has a Devanagari `tts[]` for clean read-aloud. Triggers on AI keywords like `brisk walk / chalna / 30 minute walk / metabolism / hydration / pani peena / 2-3 glass / 20-20-20 / screen break / journal / diary / dhyan / meditation`.
- **`detectMovement()` extended** with regex matchers for the 5 new habit kits.

### Changed
- **`addMsg()` card-injection** — `injectRemedyCard` and `injectAcupressureCard` now fire in **`nushke` AND `wellness` ctxs** (previously nushke-only). Wellness AI replies that mention haldi-doodh, ajwain, tulsi, etc. or sir-dard / nausea / stress points now also surface their respective in-app step cards.

### Broken / Known issues
- Other Roman-Hindi step strings (recipe kits) don't yet have `tts[]` arrays; Sarvam transliteration handles them and they don't contain ambiguous-vulgar words. We'll add Devanagari `tts[]` to recipe kits in the next pass.
- Habit detection is regex-based on the AI's reply text; if the AI uses synonyms outside the keyword list (e.g. "sair karna" instead of "walk"), the card won't appear. Easy to extend.

### Next session should start with
- Live URL test: tap a wellness goal (e.g. ⚖ Vajan) → confirm the AI now opens with "Suno beta..." not "Bhai..."; confirm the reply triggers the `daily-walk` and/or `hydration` step card; tap → step overlay reads each step in clean female Maa-voice Devanagari.
- Tap acupressure card from a `Sir dard` symptom answer → confirm step 4/5 reads "हाथ हटा लो" (haath hata lo) and the Hindi stress/pronunciation is natural.

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

