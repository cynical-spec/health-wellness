# Status — Sehat Saathi
*Last updated: 2026-05-07*

---

## Live URL
**https://cynical-spec.github.io/health-wellness/**  
Status: **LIVE** — deployed via GitHub Actions  
Last successful deploy: 2026-05-07

---

## Feature Status

### Home Screen
| Feature | Status | Notes |
|---|---|---|
| JioBharatIQ shell layout | Working | 5 assistant cards, 6 QA grid, 3 update cards |
| Sehat Saathi card (active) | Working | Blue border, taps to Hub |
| Placeholder assistants | Working | Cricket, Astro, Devotional, Career — show "Jald aa raha hai" toast |
| Quick action grid | Working | All 6 buttons navigate correctly |
| Update cards | Working | Static content, Cricket audio plays via TTS |
| JDS SVG icons | Working | All emoji replaced with ic_ CDN icons |

### Sehat Hub Screen
| Feature | Status | Notes |
|---|---|---|
| Persona selector (Dadi/Maa/Saathi) | Working | Speaks a greeting on select, changes TTS rate/pitch |
| Hub input with send/speak toggle | Working | Send button appears when text typed, hides when empty |
| Voice input from hub | Working | Opens voice overlay, sends to chat on recognition end |
| Hub pills (5 features) | Working | All navigate to correct screens |
| JDS icons on pills | Working | CDN img tags |

### Chat Screen
| Feature | Status | Notes |
|---|---|---|
| Text input + send button | Working | Enter key and button both work |
| Voice input (Speak button) | Working | Opens listening overlay |
| AI response (OpenAI) | Depends on network | May be blocked on some Indian networks |
| AI response (Groq fallback) | Working | Triggers automatically if OpenAI fails |
| Two-turn remedy flow | Working | Turn 1: clarifying question, Turn 2: remedy |
| Language detection badge | Working | Detects 8 Indian scripts, shows on first bot message |
| Skill card injection | Working | Breathwork/stretch/pressure cards injected contextually |
| Quick reply chips | Working | Shown for NUSHKE_CATS selection |
| TTS playback | Working | Uses persona rate/pitch, female voice preferred |
| Speaker icon per bubble | Working | Replays TTS for any message |
| New chat button | Working | Clears history, restarts flow for current context |
| Thinking animation | Working | 3 pulsing dots in bot bubble |

### Medicine Reminder Screen
| Feature | Status | Notes |
|---|---|---|
| 4-step conversational flow | Working | For whom → name → timing → time |
| Family-aware step 1 | Working | Shows saved family members if any |
| Multi-select timing | Working | Subah/Dopahar/Shaam/Raat |
| Time picker | Working | Native time input |
| Confirm screen | Working | Shows summary before saving |
| localStorage persistence | Working | Reminders survive page reload |
| setTimeout scheduling | Working | Fires at specified time |
| Full-screen overlay | Working | Yellow glow, pulsing animation |
| Browser notification | Working | Requests permission, fires Notification API |
| Snooze (10 min) | Working | Reschedules with setTimeout |
| Dismiss | Working | Shows toast |

### Meal Planning Screen
| Feature | Status | Notes |
|---|---|---|
| For whom selection | Working | Self or family members |
| Preference selection | Working | Veg/Jain/Diabetic/Low-sodium |
| Fridge photo upload | Working | FileReader → base64 → GPT-4o Vision |
| Text-based meal plan | Working | AI generates 3-day Indian meal plan |
| Meal plan display | Working | Day-by-day breakfast/lunch/dinner |
| GPT-4o Vision | Depends on network | Falls back to text only if Vision fails |

### Family Screen
| Feature | Status | Notes |
|---|---|---|
| Add member flow | Working | Name, age, gender, conditions, phone |
| Conditions multi-select | Working | Diabetes, BP, Heart, Thyroid, Asthma, Arthritis |
| localStorage persistence | Working | Members survive page reload |
| Initials avatar | Working | First letter of name, coloured with surface-bold |
| Delete member | Working | ic_trash_clear icon, removes from localStorage |
| Empty state | Working | ic_multiple_user icon, add prompt |

### Breathwork Screen
| Feature | Status | Notes |
|---|---|---|
| Box breathing animation | Working | 4-phase: Saans Lo, Rokho, Choddo, Rokho — 4s each |
| 4 rounds then stop | Working | Auto-stops after 4 complete rounds |
| Ring animation (scale + color) | Working | CSS transition 4s ease-in-out |
| Gentle stretch guide | Working | 5 steps with instructions |
| Pressure point guide | Working | 3 LI4 points with instructions |
| Skill card → breathwork nav | Working | From chat, skill cards navigate here |

### Voice Overlay
| Feature | Status | Notes |
|---|---|---|
| HelloJio Listening MP4 | Working | Dark theme CDN video, loops |
| Interim transcript | Working | Updates live as user speaks |
| Auto-send on recognition end | Working | Sends to chat or hub |
| Close button | Working | Stops recognition |
| Browser compatibility | Chrome/Safari | Not available on Firefox (no SpeechRecognition) |

### JDS Compliance
| Check | Status |
|---|---|
| validate_prototype | 0 errors, 0 warnings |
| Font: JioType only | Pass |
| Colors: JDS tokens + rgba overlays | Pass |
| Icons: JDS SVG CDN only (no emoji) | Pass |
| Voice: HelloJio MP4 video | Pass |
| No gradients on voice screen | Pass |

---

## Known Limitations (Prototype Stage)
1. **OpenAI may be blocked** on some Indian ISPs — Groq fallback handles this
2. **Reminder scheduling uses setTimeout** — doesn't persist across page refreshes. Full reminder will not fire if user closes the tab.
3. **Voice input Chrome/Safari only** — Firefox users see speak button but it won't work (should hide it)
4. **Icons flash on slow CDN** — no local fallback for CDN icons
5. **File is 1420+ lines** — over the 800-line ideal stated in CLAUDE.md
6. **Single file** — no separation of concerns; acceptable for prototype

---

## Secrets Required
| Secret name | Purpose | Status |
|---|---|---|
| `OPENAI_API_KEY` | GPT-4o primary AI | Set 2026-05-06 |
| `GROQ_API_KEY` | Llama 3.3 fallback AI | Set 2026-05-07 |
