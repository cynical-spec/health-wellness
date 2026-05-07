# Changelog — Sehat Saathi

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

