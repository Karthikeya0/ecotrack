# Brainstorming & Idea Prioritization
## EcoTrack – AI-Powered Carbon Footprint Tracker

---

## 1. Problem Space Exploration

Climate change is one of the most pressing global challenges of our time. While industrial emissions dominate headlines, individual lifestyle choices collectively account for a substantial portion of global CO₂ output. The average person generates approximately **4–8 tonnes of CO₂** per year through travel, food, and energy consumption.

Despite growing awareness, most people lack:
- A **simple, daily habit** of tracking personal emissions
- **Actionable, personalized** feedback on how to reduce their footprint
- **Motivational mechanics** (streaks, badges) to sustain behavioral change
- A tool that works **offline/without cloud** when credentials are unavailable

---

## 2. Brainstorming Session – Initial Idea Pool

The following ideas were generated in an open brainstorming session:

| # | Idea | Category |
|---|------|----------|
| 1 | Daily habit logging for travel, food & energy | Core Feature |
| 2 | AI-powered suggestions using LLM (Groq / GPT) | AI Feature |
| 3 | Real-time CO₂ calculation via Carbon Interface API | Data Accuracy |
| 4 | Streak tracking to reward daily engagement | Gamification |
| 5 | Badge / achievement system for milestones | Gamification |
| 6 | Emissions radial gauge for instant visual feedback | UX / Design |
| 7 | Historical trends via line + bar charts | Analytics |
| 8 | Demo Mode – fully offline, no login needed | Accessibility |
| 9 | Firebase Auth for secure cloud-synced profiles | Auth |
| 10 | Carbon budget / daily goal customization per user | Personalization |
| 11 | Social leaderboard / friend comparison | Social |
| 12 | Smart appliance API integrations (IoT) | Integration |
| 13 | Carbon offset marketplace / purchase links | Monetization |
| 14 | Progressive Web App (PWA) for mobile usage | Deployment |
| 15 | Weekly email digest of carbon report | Communication |

---

## 3. Idea Prioritization Matrix

Each idea was scored on **Impact** (1–5) and **Feasibility** (1–5). A combined **Priority Score** was computed.

| Idea | Impact | Feasibility | Priority Score | Decision |
|------|--------|-------------|----------------|----------|
| Daily habit logging (travel, food, energy) | 5 | 5 | 25 | ✅ Build (v1) |
| AI suggestions via Groq LLM | 5 | 4 | 20 | ✅ Build (v1) |
| Carbon Interface API for calculation | 5 | 4 | 20 | ✅ Build (v1) |
| Streak tracking | 4 | 5 | 20 | ✅ Build (v1) |
| Badge / achievement system | 4 | 5 | 20 | ✅ Build (v1) |
| Emissions gauge (radial) | 4 | 5 | 20 | ✅ Build (v1) |
| Historical charts (Chart.js) | 4 | 5 | 20 | ✅ Build (v1) |
| Demo Mode (offline / local) | 5 | 5 | 25 | ✅ Build (v1) |
| Firebase Auth + Firestore | 5 | 4 | 20 | ✅ Build (v1) |
| Daily carbon budget customization | 4 | 5 | 20 | ✅ Build (v1) |
| Social leaderboard | 3 | 2 | 6 | 🔜 Future (v2) |
| IoT smart appliance integration | 4 | 1 | 4 | 🔜 Future (v3) |
| Carbon offset marketplace | 3 | 2 | 6 | 🔜 Future (v2) |
| PWA (mobile install) | 3 | 3 | 9 | 🔜 Future (v2) |
| Weekly email digest | 2 | 3 | 6 | 🔜 Future (v2) |

---

## 4. Core Value Proposition (After Prioritization)

> **EcoTrack helps individuals understand, track, and reduce their personal carbon footprint through daily habit logging, real-time AI suggestions, and gamified milestone rewards — with a seamless offline-first Demo Mode for instant accessibility.**

---

## 5. MVP Feature Set (v1.0)

Based on the prioritization matrix, the Minimum Viable Product includes:

1. **Authentication** – Firebase email/password login + registration
2. **Demo Mode** – Full app functionality without credentials (localStorage)
3. **Log Today** – 3-step wizard: Travel → Food → Energy
4. **Carbon Calculation** – Client-side fallback + Carbon Interface API via Flask
5. **Dashboard** – Emissions gauge, daily breakdown, streak counter, badge count
6. **AI Suggestions** – Groq llama-3.3-70b-versatile via Flask backend
7. **History** – Line chart + bar chart + analytics cards (7-day avg, best/worst day)
8. **Achievements** – 6 badge system with progress tracking
9. **Profile** – User settings, daily budget, weekly goal

---

## 6. Technology Stack Decision

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + Vite | Fast HMR, component model, ecosystem |
| Styling | Tailwind CSS | Utility-first, rapid design iteration |
| Auth | Firebase Authentication | Managed, secure, free tier generous |
| Database | Cloud Firestore | Real-time NoSQL, scales easily |
| AI Layer | Groq API (llama-3.3-70b) | Ultra-fast inference, free tier available |
| Emissions Data | Carbon Interface API | Standardized real-world emission factors |
| Backend Bridge | Flask (Python) | Lightweight REST API for secure key proxy |
| Charting | Chart.js + react-chartjs-2 | Flexible, well-maintained |

---

*Document version: 1.0 | Created: July 2026 | EcoTrack Project*
