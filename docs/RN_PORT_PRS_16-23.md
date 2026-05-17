# RN port spec — Sehat Saathi web PRs #16–23 (May 13–14, 2026)

You are porting changes from the single-file web prototype (`index.html`) to the React Native version of Sehat Saathi.

The web code is inlined in one giant HTML file. In RN it should map to hooks (`useVoiceMode`, `useTTS`, etc.), components (`<StepAnimation/>`, `<VoiceOverlay/>`), and services (`sarvam.ts`, `voiceController.ts`). Below is what each PR did, what to KEEP, and what to SKIP because it was either superseded by a later PR or web-only.

Apply in numerical order — later PRs build on earlier ones.

---

## Summary table

| PR | Web version | Status | Why |
|---|---|---|---|
| #16 | v5.3.9 — bake CF Worker as default Sarvam proxy | **SKIP-MAYBE** | Web-only CORS workaround. RN's native `fetch` has no CORS. |
| #17 | v5.4 — 100 ghar ke nushke + per-step animations | **KEEP** | Big content + UI win. |
| #18 | v5.5 — voice: auto-launch + echo fix + noise suppress | **KEEP-PARTIAL** | Auto-launch superseded by #22/#23. Echo + noise + `_isSpeaking` are essential. |
| #19 | v5.5.1 — Devanagari detection + box-breathing | **KEEP** | Catalog + regex update. |
| #20 | v5.5.2 — diag logs + fallback chip | **KEEP-PARTIAL** | Logs yes; chip redundant after #23. |
| #21 | v5.5.3 — Sarvam speaker `bulbul:v2` allowlist | **KEEP** | Stops 400s on stored stale speaker. |
| #22 | v5.5.4 — confirmation flow + ElevenLabs latency + overlap | **KEEP** | Core voice UX. |
| #23 | v5.5.5 — fast-path for explicit skill requests | **KEEP** | Cuts ~20s of latency. |

---

## #16 — Sarvam CORS proxy (SKIP-MAYBE)

**What it did:** baked `SARVAM_PROXY_BASE_URL = 'https://sarvam-proxy.nawaneet-kumar.workers.dev'` as the default proxy for every Sarvam call. Helper `sarvamUrl(path)` prefixes the proxy URL.

**RN action:** Skip if your RN app calls Sarvam from native `fetch` (no CORS in RN). Only port if you ever proxy via a web-view.

---

## #17 — 100 nushke + per-step animations (KEEP)

### Data
- `REMEDY_KITS` object grew 15 → 100 entries. Schema per entry:
  ```ts
  { kw: string[], emoji: string, title: string, durSec: number, ingredients: string, steps: string[5] }
  ```
- Categories: digestion 12, respiratory 12, sleep 8, joint 8, skin 8, hair 6, immunity 8, headache 5, eye/ear 4, women 5, kids 4, seasonal 3, detox 2.
- Action: search `index.html` for `const REMEDY_KITS = {` — copy the whole object (ends at closing `};`). Port verbatim.

- `MOVEMENT_SKILLS` — added an `anim: string[]` field parallel to `steps: string[]`. Each entry of `anim[]` is a key into the SVG library below.
- New optional `lottie: (string|null)[]` slot per skill — when set, takes priority over the SVG.

### Animation library
`const ANIM_SVG = (() => { ... })()` — 39 inline SVGs (200×200, green stroke `#22c55e`) using SMIL `<animate>` / `<animateTransform>`. Keys:

```
breath-in, breath-out, breath-cycle, breath-hold, sharp-exhale, bee-hum,
nostril-left-in, nostril-right-out, nostril-alt, ears-blocked,
sit-spine, kneel, lie-still, squat-down, feet-wide,
neck-right, neck-left, neck-circle, shoulders-loose,
sn-pranama, sn-arms-up, sn-fold, sn-lunge, sn-plank, sn-cycle,
walk-slow, walk-brisk, shoes, water-glass, water-day,
eye-far, eye-blink, screen-timer, notebook, pen-write,
meditate-pose, mind-thoughts, still, daily
```

### RN port
`react-native-svg` does **not** support SMIL `<animate>`. Two options:

1. **Rebuild as `Animated` components.** Each SVG is ~5–15 lines of JSX with `Animated.View` or `react-native-reanimated`. Build a `<StepAnimation animKey="breath-in"/>` component that switches on the key. ~30 lines per anim × 39 = manageable.
2. **Generate Lottie JSON for each** and use `lottie-react-native`. Higher upfront cost, better fidelity.

The renderer pattern:
```ts
function StepAnimation({ animKey, lottieUrl }) {
  if (lottieUrl) return <LottieView source={{uri:lottieUrl}} autoPlay loop/>;
  return <SvgAnimation animKey={animKey}/>; // built-in switch by key
}
```

Web equivalent: `renderStepAnim(animKey, lottieUrl)` — same logic.

### Lottie player
Web uses `lottie-web@5.12.2` via CDN script tag.
RN: `npm i lottie-react-native`.

---

## #18 — Voice mode: echo + noise + half-duplex (KEEP-PARTIAL)

### SKIP from this PR
- `_autoLaunchSkillFromVoice` — replaced by the conversational flow in #22 and the fast-path in #23. Don't bother porting it.

### KEEP — mic capture constraints (the echo + noise fix)
When acquiring the mic, set all three flags:

```ts
// Web (RN port via react-native-webrtc / expo-av / react-native-audio-record):
audio: {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl:  true,
}
```

Without `echoCancellation`, the device speaker's TTS output is captured by the mic on the next listen cycle, transcribed by Sarvam STT, and fed back as the user's next turn — the AI starts talking to itself. Chrome ships WebRTC AEC3, iOS Safari has its own AEC, RN's native APIs expose the same constraints.

### KEEP — `_isSpeaking` half-duplex flag
Module-level state:
```ts
let _isSpeaking = false;
```

Set TRUE when TTS starts playing, FALSE 700ms after `audio.ended` (the 700ms covers speaker output latency + room reverb).

Web helper `_markTtsStart(audioEl)` wraps every TTS play site (ElevenLabs, OpenAI, Sarvam Bulbul, Web Speech). RN equivalent:

```ts
function markTtsStart(sound: Sound) {
  isSpeaking = true;
  sound.setOnPlaybackStatusUpdate((s) => {
    if (s.didJustFinish || s.error) setTimeout(() => { isSpeaking = false; }, 700);
  });
}
```

The mic-listener loop must check this flag and refuse to (re)open the mic while it's set. Web code:
```js
async function convListenOnce() {
  if (!_convActive) return;
  if (_isSpeaking) { _convResumeTimer = setTimeout(convListenOnce, 250); return; }
  ...
}
```

### KEEP — VAD tuning
On the recording-side energy detector:
- `SILENCE_THRESHOLD = 18` (on 0–255 RMS scale) — was 14, too sensitive to fans/traffic/AC hum
- `SPEECH_CONFIRM_FRAMES = 3` — flipping `speechSeen = true` now requires 3 consecutive frames above threshold (~300ms). Quiet frames reset the counter so single-frame spikes (door slam, cough, pot clang) don't start a recording session.

```js
if (avg > SILENCE_THRESHOLD) {
  aboveThreshFrames++;
  if (aboveThreshFrames >= SPEECH_CONFIRM_FRAMES) speechSeen = true;
  silenceMs = 0;
} else {
  aboveThreshFrames = 0; // critical: reset on every quiet frame
  if (speechSeen) { silenceMs += 100; ... }
}
```

---

## #19 — Devanagari detection + box-breathing (KEEP)

### Skill added
`box-breathing` in `MOVEMENT_SKILLS`:
- Title: `Box Breathing (4-4-4-4)`
- 5 steps: sit → inhale 4s → hold 4s → exhale 4s → hold 4s, repeat
- `anim: ['sit-spine','breath-in','breath-hold','breath-out','breath-cycle']`
- Devanagari `tts[]` per step

### Devanagari detection regexes
`detectMovement(text)`, `detectRemedy(text)`, `detectAcupressure(text)` — added Devanagari aliases for **every** existing skill alongside Roman keywords.

**Critical bug to avoid:** do not use `\b` (word boundary) in JavaScript regex when matching Devanagari characters. JS `\b` is ASCII-only and silently fails on Devanagari/Gurmukhi/Bengali/Tamil/etc. Use:
- `(\s|$|[.,!?।])` for "end of token"
- Or just bare matches without anchoring

Example fixed regex from `_isAffirmative`:
```js
/^(haan|yes|chalo|बिल्कुल|हाँ|जी|करेंगे|...)(\s|$|[.,!?।])/i
```

Search `index.html` for `function detectMovement(text)` and port the entire regex block verbatim. Same for `_isAffirmative` / `_isNegative` from #22.

---

## #20 — Diag logs + fallback chip (KEEP-PARTIAL)

### KEEP — diagnostic console logs
Add `console.info('[voice-skill] ...')` at every decision point in the voice flow:
- `[voice-skill] user explicitly asked → movement box-breathing · fast-path`
- `[voice-skill] AI suggested → acupressure li4-headache · offering confirmation`
- `[voice-skill] user confirmed → movement box-breathing`
- `[voice-skill] user declined → ...`
- `[voice-skill] no skill in this turn`
- `[TTS] lang=hi-IN speaker=manisha chars=42`

These save debugging time when the voice flow doesn't behave.

### SKIP — fallback chip
A green tappable "▶ &lt;Skill Title&gt;" chip rendered under bot replies in the voice overlay as an escape hatch when auto-launch missed. Was a defensive band-aid when we thought CDN cache was an issue. After PR #23's fast-path it's redundant. If you want a manual override in RN, build a proper UI button.

---

## #21 — Sarvam speaker allowlist (KEEP)

Sarvam dropped legacy speakers (`kavitha`, `meera`, `pavithra`, `maitreyi`) when `bulbul:v2` shipped. Any stored old preference returns HTTP 400.

```ts
const BULBUL_V2_SPEAKERS = ['anushka','abhilash','manisha','vidya','arya','karun','hitesh'];

function validSarvamSpeaker(): string {
  const stored = await AsyncStorage.getItem('ss_voice_pref');
  if (stored && BULBUL_V2_SPEAKERS.includes(stored)) return stored;
  if (stored) {
    console.info('[Sarvam TTS] stored speaker "'+stored+'" not in bulbul:v2 allowlist — clearing');
    await AsyncStorage.removeItem('ss_voice_pref');
  }
  return SARVAM_SPEAKERS[currentPersona] ?? 'manisha';
}
```

Voice picker UI list (`VOICE_OPTIONS`) should only contain the 7 v2 speakers. Default fallback is `manisha`.

---

## #22 — Confirmation flow + ElevenLabs latency + 2-voice overlap (KEEP)

### 1. Confirmation flow (for AI-suggested skills only)
Note: explicit user requests use the fast-path in #23 — skip this section for them.

Module-level state:
```ts
let _pendingVoiceSkill: { kind:'movement'|'remedy'|'acupressure', key:string, title:string } | null = null;
```

Helpers `_isAffirmative(text)` / `_isNegative(text)` — Roman + Devanagari yes/no detection. See web code for the full regex (test set: haan/हाँ/जी/chalo/karenge/ठीक/sure/ok vs nahi/नहीं/skip/baad mein/रहने दो).

`_offerVoiceSkillConfirmation(skill)`:
1. Set `_pendingVoiceSkill = skill`
2. Pause any in-flight `_currentAudio` (overlap defense)
3. Append bot line to voice overlay
4. Speak a prompt per skill kind:
   - movement: `'{Title} aapko mere saath karwaaun? Step-by-step bataati hoon. Haan ya nahi?'`
   - remedy: `'{Title} banane mein mere saath chalein? Step-by-step bataati hoon. Haan ya nahi?'`
   - acupressure: `'{Title} ka point bataati hoon, mere saath dabaaiyega? Haan ya nahi?'`
5. Wait for TTS to finish (uses `_isSpeaking` transition true → false), then resume listening for the user's yes/no

At the top of `convHandleTranscript`, before the AI call: if `_pendingVoiceSkill` is set, handle yes/no first.
- yes → `stopVoice()` then `openSkillByKind(pending)`
- no → warm ack ("Theek hai. Aur kuch poochna ho to bolein.") then continue listening
- ambiguous → clear pending, treat as fresh AI turn

### 2. ElevenLabs opt-in (latency fix)
```ts
let _elevenLabsBlocked = (await AsyncStorage.getItem('ss_eleven_blocked')) === '1'
                       || !((await AsyncStorage.getItem('ss_elevenlabs_key')) || '').match(/.{20,}/);
```
- Default blocked unless user explicitly pasted a key
- Persist `ss_eleven_blocked = '1'` on 401/402/429/quota_exceeded — survives reload (key with exhausted quota doesn't waste a round-trip every cold start)
- `setElevenLabsKey()` clears the persisted block on new key paste

### 3. No 2-voice overlap
At top of `openMovement` / `openRemedy` / `openAcupressure`:
```ts
if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
window.speechSynthesis?.cancel(); // web-only; RN equivalent: stop any TTS player
```

`stopVoice` clears `_pendingVoiceSkill` too — future sessions don't open with stale offers.

The wait-for-bot-TTS Promise in `convHandleTranscript` was using `_currentAudio.ended` polling — false-resolved on stale ended state from previous turn. Replaced with `_isSpeaking` transition tracking (set started=true when flag flips true, resolve when started && !flag).

### 4. Multi-language TTS routing
For Sarvam Bulbul v2:
```ts
const enablePreprocessing = targetLangCode.startsWith('hi') || targetLangCode.startsWith('en');
```
Disable preprocessing for non-Hindi targets — reduces Hindi-bias text normalization on Gurmukhi/Bengali/Tamil/etc.

Add a `[TTS] lang=... speaker=... chars=...` console log so routing is verifiable.

**Documented limitation (don't try to fix):** Sarvam Bulbul v2's 7 speakers are all Hindi-primary multilingual. They render Punjabi/Bengali/Tamil with a Hindi accent. The only alternatives are Web Speech (sounds robotic per user feedback) or a different TTS provider. Skip Web Speech fallback for non-Hindi.

---

## #23 — Fast-path for explicit skill requests (KEEP)

The most important UX change. If the user's transcript directly names a skill, skip the AI call entirely. Just say a short ack and open the skill within ~3 seconds.

The confirmation flow from #22 runs only when the user asked a general question and the AI's reply mentioned a skill keyword (AI-suggested, not user-asked).

### Decision tree in `convHandleTranscript`
```ts
async function convHandleTranscript(transcript: string) {
  appendUserLine(transcript);

  // 1. Pending confirmation? handle yes/no
  if (_pendingVoiceSkill) {
    if (isAffirmative(transcript)) { stopVoice(); openSkillByKind(_pendingVoiceSkill); _pendingVoiceSkill = null; return; }
    if (isNegative(transcript)) { _pendingVoiceSkill = null; speak('Theek hai. Aur kuch poochna ho to bolein.'); return; }
    _pendingVoiceSkill = null; // ambiguous → fall through
  }

  // 2. FAST-PATH — user explicitly named a skill
  const userSkill = detectSkillForVoice(transcript);
  if (userSkill) {
    appendUserLine(transcript);
    const ack = 'Chaliye, ' + userSkill.title + ' karte hain mere saath.';
    appendBotLine(ack);
    speak(ack);
    stopVoice();
    setTimeout(() => openSkillByKind(userSkill), 2500); // ack ~ 2.5s
    return;
  }

  // 3. Normal AI conversation
  appendUserLine(transcript);
  setVoiceState('thinking');
  let lastBotText = '';
  await waitForBotReplyAndTtsEnd((botText) => { lastBotText = botText; });

  // 4. AI's reply mentioned a skill? → offer confirmation
  const botSkill = detectSkillForVoice(lastBotText);
  if (botSkill) { await offerVoiceSkillConfirmation(botSkill); return; }
  // 5. Otherwise: no skill this turn, return to listening
}
```

### `_detectSkillForVoice(text)` helper
Collapses the three separate detectors into one normalized result:
```ts
function detectSkillForVoice(text: string) {
  const mv = detectMovement(text);
  if (mv) return { kind:'movement',    key:mv[0], title:mv[1].title };
  const rm = detectRemedy(text);
  if (rm) return { kind:'remedy',      key:rm[0], title:rm[1].title };
  const ap = detectAcupressure(text);
  if (ap) return { kind:'acupressure', key:ap[0], title:ap[1].title };
  return null;
}
```

### Also fixed in #23
Removed the 14-second force-resolve in the bot-TTS-wait Promise — was cutting long replies off mid-sentence when the suggestion path triggered. Now waits for `_isSpeaking` to transition `true → false` with a 60-second safety net only for hung-state recovery.

---

## Suggested apply order in RN

1. **#17 content** — copy `REMEDY_KITS` (100 entries) + `MOVEMENT_SKILLS` schema (`anim[]` field). Build the `<StepAnimation/>` component.
2. **#19 detection** — port `detectMovement` Devanagari regexes + box-breathing entry. Unit-test against Devanagari inputs.
3. **#21 speaker allowlist** — `BULBUL_V2_SPEAKERS` constant + `validSarvamSpeaker()` reader.
4. **#18 mic + flag** — set echo/noise/AGC constraints on mic capture, add `isSpeaking` flag, wrap every TTS play site to set/clear it. Apply VAD tuning. **Do not** port `_autoLaunchSkillFromVoice`.
5. **#22 voice flow** — `_pendingVoiceSkill` state, `_isAffirmative`/`_isNegative`, `_offerVoiceSkillConfirmation`, ElevenLabs opt-in persistence, audio cleanup in skill openers, `enable_preprocessing` toggle.
6. **#23 fast-path** — `_detectSkillForVoice` helper, decision tree in `convHandleTranscript`, remove the 14s force-resolve.
7. **#20 logs** — sprinkle `[voice-skill]` console logs at decision points. Skip the chip.
8. **#16** — skip unless your RN setup needs the CORS proxy.

---

## Tracking files in this repo (web)

The web repo keeps four docs that capture rationale + history:
- `CHANGELOG.md` — chronological session log
- `MISTAKES.md` — bugs and root-causes (look here for "Voice mode echoed its own TTS" entry — explains why the three-layer defense exists)
- `DECISIONS.md` — DEC-025 (Lottie hybrid), DEC-026 (half-duplex policy + skill hand-off)
- `STATUS.md` — current state per feature

If you want full context on **why** a design choice was made (not just what the code does), grep these for keywords like "echo", "Punjabi", "Lottie", "confirmation".
