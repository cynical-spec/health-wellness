# Mistakes Log — Sehat Saathi

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
