# Sehat Saathi — JioBharatIQ Health Assistant

A voice-first vernacular health assistant for Indian families.
Speaks any Indian language. Gives Ayurvedic home remedies.
Built on JioBharatIQ design system (JDS).

## Live Demo
https://cynical-spec.github.io/health-wellness/

## Setup (GitHub Actions — recommended)

1. Fork or clone this repo (must be **public** for free GitHub Pages)
2. Go to **Settings > Secrets and variables > Actions**
3. Add these secrets:
   - `OPENAI_API_KEY` — your OpenAI API key (GPT-4o)
   - `GROQ_API_KEY` — your Groq API key (free at console.groq.com) — used as fallback
4. Go to **Settings > Pages** and confirm source is set to **GitHub Actions**
5. Push any change to `main` — the workflow injects keys and deploys automatically

The keys are injected at build time and never stored in the repo.

## What it does

User speaks a health complaint in any Indian language (Hindi, Marathi, Bengali,
Tamil, Telugu, Kannada, Punjabi, Gujarati, Malayalam).

1. Assistant asks one warm clarifying question in the same language
2. Gives an Ayurvedic home remedy using common kitchen ingredients
3. Spoken aloud via text-to-speech
4. Serious symptoms (chest pain, seizures, infant fever) — immediate doctor referral, no remedy

## Screens
- **Home** — JioBharatIQ shell with assistant cards and quick actions
- **Sehat Hub** — Persona selector (Dadi / Maa / Saathi) and feature entry points
- **Chat** — Two-turn AI conversation with skill card injection
- **Dawai Reminder** — Medicine reminders with full-screen notification overlay
- **Meal Planning** — 3-day Indian meal plan, fridge photo via GPT-4o Vision
- **Parivaar** — Family profiles with health conditions
- **Breathwork** — Box breathing, stretch guide, pressure points

## Note
This is a prototype. API keys are client-side in the deployed HTML.
For production, use a backend proxy to protect keys.
