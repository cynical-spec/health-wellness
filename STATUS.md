# Status — Sehat Saathi
*Last updated: 2026-05-07 — Session 8 (v3 — 3-zone Home + Sarvam Voice)*

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

### Sehat Hub
| Feature | Status | Notes |
|---|---|---|
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

### Voice Overlay
| Feature | Status | Notes |
|---|---|---|
| HelloJio Listening MP4 | Working | Dark theme CDN |
| Interim transcript | Working | |
| Browser compatibility | Chrome/Safari | Firefox: Speak button auto-hidden |

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
5. **File is ~3000 lines** — well past 800-line ideal (DEC-009, accepted for prototype)
6. **Lab Vision spend** — ~$0.01–0.03 per report; capped at 5 pages
7. **Nushke videos** open YouTube search in new tab — no embedded curated video IDs yet
8. **Community peers** are AI roleplay only — no real users; required disclaimer enforces honesty

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
