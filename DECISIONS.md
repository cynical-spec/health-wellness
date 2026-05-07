# Architecture Decisions — Sehat Saathi

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
