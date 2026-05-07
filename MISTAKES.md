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
