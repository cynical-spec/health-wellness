# CLAUDE.md — Sehat Saathi Project Rules
These rules apply to every session. Read this file before doing anything else.

## 1. Memory and Context Management

### Always read before you write
At the start of every session, before touching any code:
1. Read `CHANGELOG.md` — understand what was built last session
2. Read `MISTAKES.md` — understand what went wrong and why
3. Read `DECISIONS.md` — understand why things are built the way they are
4. Read `STATUS.md` — understand exactly where the project stands right now

If any of these files don't exist yet, create them before starting work.

### Never assume — always verify
- Never assume the current state of a file. Read it first.
- Never assume a feature is working. Check it first.
- Never assume a previous decision still holds. Check `DECISIONS.md` first.
- If context feels incomplete, say so explicitly before proceeding.

### End every session with a full update
Before ending any session, update all four files:
- `CHANGELOG.md` — what was built or changed this session
- `MISTAKES.md` — what broke, what was tried, what was learned
- `DECISIONS.md` — any new architectural or product decisions made
- `STATUS.md` — current working state of every feature

This is non-negotiable. A session that ends without updating these files degrades the next session.

---

## 2. Learning from Mistakes

### MISTAKES.md format
```
## [Date] — [Short description]
**What happened:** What broke or went wrong
**Why it happened:** Root cause
**What was tried:** Everything attempted before the fix
**What fixed it:** The actual solution
**Rule going forward:** What to do differently next time
```

### Categories of mistakes to always log
- API failures — wrong endpoint, wrong headers, rate limits, CORS
- Voice API issues — browser compatibility, permission denied, language codes
- UI breakage — mobile layout issues, overflow, z-index, touch targets
- Language handling — wrong script detection, wrong response language
- OpenAI prompt failures — unexpected model behaviour, wrong tone, wrong language
- GitHub Pages issues — file path errors, caching, deployment failures

### Before trying the same fix twice
If something has been tried and failed, check `MISTAKES.md` before trying it again. Do not repeat failed approaches.

---

## 3. MCP Tool Usage

### Always check available MCP tools first
At the start of every session run a mental check — which MCP tools are available and which are relevant to today's work.

### Tools to use for this project

**GitHub MCP**
- Use for all file reads, writes, commits, and push operations
- Never manually instruct file creation — use the GitHub MCP to commit directly
- Every meaningful change gets its own commit with a clear message
- Commit message format: `[feature/fix/refactor] Short description — context`

**Browser/Fetch tools**
- Use to test the live GitHub Pages URL after every deployment
- Verify mobile rendering after every CSS change

**JioBharatIQ MCP (available tools)**
- `find_icon` — search 1281 JDS icons, get svg_path for inline SVG
- `get_assets` — CDN URLs for fonts, HelloJio MP4s, icons
- `get_figma_reference` — Figma node IDs for homepage, chat_page, menu etc.
- `lookup_component` — JDS component specs (Button, Card, ChatInput, Toast etc.)
- `resolve_token` — JDS design tokens (colors, typography, spacing, border_radius)
- `validate_prototype` — JDS compliance check, run before every push

### MCP compliance checklist before every commit
- [ ] CHANGELOG.md updated
- [ ] MISTAKES.md updated if anything broke
- [ ] DECISIONS.md updated if any decision was made
- [ ] STATUS.md updated
- [ ] Commit message follows the format
- [ ] `validate_prototype` run — 0 errors required
- [ ] GitHub Pages URL tested after deployment

---

## 4. GitHub Changelog Discipline

### CHANGELOG.md format
```
# Changelog — Sehat Saathi

## [Session date] — [Session focus]

### Added
### Changed
### Fixed
### Broken / Known issues
### Next session should start with
```

### Commit every meaningful change — not just at the end

---

## 5. Product Rules — Non-Negotiable

### Never diagnose
The product gives home remedies and refers to doctors. It does not tell the user what condition they have. Ever.

### Always escalate serious symptoms
Immediate doctor referral for: chest pain, difficulty breathing, infant fever under 3 months, seizures, sudden severe headache, vomiting blood, loss of consciousness, sudden face drooping or arm weakness.

### Never generate remedies from the model
Remedies come from system prompt Ayurvedic knowledge. Ingredients: ajwain, haldi, adrak, tulsi, neem, amla, mulethi, saunf, methi, jeera, coconut water, warm milk, honey, rock salt.

### Always respond in the user's language
Detect and respond in the exact language the user wrote in. Never switch to English unless the user wrote in English.

### Safety gate always at the end
Every remedy response ends with a warm, specific "when to see a doctor" sentence.

---

## 6. Code Quality Rules

### Single file discipline
Everything lives in `index.html`. No external files except OpenAI API calls. Flag if file exceeds 800 lines.

### Mobile-first always
Test at 390px width. Touch targets minimum 44px. No hover-only interactions.

### API key handling
```javascript
const OPENAI_API_KEY = "REPLACE_WITH_YOUR_KEY";
const GROQ_API_KEY   = "REPLACE_WITH_GROQ_KEY";
```
Never commit a real key. Keys are injected by GitHub Actions from repository secrets.

### Error states must be warm
Every error shown to the user must be in Hindi and warm in tone. No technical messages.

### Voice API fallback
Always check for SpeechRecognition support. Show text input only if unavailable.

---

## 7. Session Start Checklist
```
SESSION START — [Date]
[ ] Read CHANGELOG.md
[ ] Read MISTAKES.md
[ ] Read DECISIONS.md
[ ] Read STATUS.md
[ ] GitHub Pages URL tested
[ ] Today's goal defined: _______________
[ ] MCP tools checked — JioBharatIQ MCP: Y/N
```

## 8. Session End Checklist
```
SESSION END — [Date]
[ ] CHANGELOG.md updated
[ ] MISTAKES.md updated
[ ] DECISIONS.md updated
[ ] STATUS.md updated
[ ] All changes committed with proper messages
[ ] validate_prototype run — 0 errors
[ ] GitHub Pages URL confirmed working
[ ] "Next session should start with" written
[ ] README.md updated if setup changed
```

---

## 9. Definition of Done
1. Opens on mobile from GitHub Pages URL
2. Looks like a JioBharatIQ assistant — dark theme, Jio purple
3. Voice input captures "pet dukhtay" in Marathi
4. Assistant asks one clarifying question in Marathi
5. Remedy given in Marathi, spoken aloud via TTS
6. Language badge appears — "मराठी ✓"
7. Works in Tamil, Bengali, Punjabi without config change
8. Chest pain → immediate escalation, no remedy
9. New chat resets conversation cleanly
10. All four tracking files up to date
11. README has clear setup instructions

---

## 10. What This Product Is and Is Not

**It is:** A warm vernacular Ayurvedic home remedy guide. Two-turn conversation. Every Indian language natively. A prototype to validate the magic moment.

**It is not:** A medical diagnosis tool. A telemedicine platform. A replacement for a doctor. A generative remedy engine. A production-ready product.

> When in doubt: "Does this make the user feel heard and helped, in their language, right now?" If yes, it belongs.
