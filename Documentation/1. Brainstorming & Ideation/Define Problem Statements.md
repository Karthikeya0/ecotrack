# Define Problem Statements
## EcoTrack – AI-Powered Carbon Footprint Tracker

---

## 1. Overview

This document defines the core problem statements that EcoTrack is designed to address. Each problem statement follows the standard **"How Might We (HMW)"** format, grounded in user research insights and environmental data.

---

## 2. Root Problem

> **People are unable to make meaningful changes to their carbon footprint because they lack visibility into their daily impact, access to personalized guidance, and consistent motivation to sustain eco-friendly behaviors.**

---

## 3. Problem Breakdown

### 3.1 Lack of Personal Carbon Awareness
Most individuals have no idea what their daily carbon footprint actually is. Awareness is limited to occasional news coverage and general statistics that feel abstract and disconnected from daily life.

**Symptoms observed:**
- People underestimate the carbon cost of common activities (driving 10 km, eating a steak, leaving heating on all day)
- No mental model of what "kg CO₂" means in practical terms
- Cannot connect daily decisions to climate outcomes

**HMW Statement:**
> *How might we make personal carbon emissions visible and understandable in the context of everyday decisions?*

---

### 3.2 No Personalized, Actionable Feedback
Existing carbon calculators produce a number but offer no guidance on what to actually change. Generic tips ("use a reusable bag") fail to resonate with users who have unique lifestyles and habits.

**Symptoms observed:**
- Generic apps provide static, one-size-fits-all advice
- No connection between a user's specific logged activity and the suggestion given
- AI-powered personalization is rare in consumer sustainability tools

**HMW Statement:**
> *How might we provide personalized, AI-generated suggestions based on each individual's specific daily habits?*

---

### 3.3 No Habit Formation Mechanism
Sustainability requires long-term behavioral change. Most apps fail to create the daily habit loop necessary for lasting impact.

**Symptoms observed:**
- Users open carbon apps once or twice, then abandon them
- No reward mechanism for consistent logging
- No progress visualization to create a sense of achievement

**HMW Statement:**
> *How might we create a motivating daily habit loop that rewards consistent engagement and celebrates progress?*

---

### 3.4 Barriers to Entry (Technical Friction)
Many sustainability tools require account creation, complex setup, or payment before providing any value — creating high abandonment at the onboarding stage.

**Symptoms observed:**
- Requiring email verification before first use discourages casual exploration
- Users with no cloud credentials are excluded
- Complex setup reduces willingness to try

**HMW Statement:**
> *How might we remove all barriers to entry so any user can experience the full value of EcoTrack immediately — without an account?*

---

### 3.5 Inaccurate Emission Estimates
Many apps use outdated or overly simplified emission factors. This reduces trust and fails to reflect the complexity of real-world emissions (grid mix, food supply chains, vehicle efficiency).

**Symptoms observed:**
- Static multipliers per km ignore fuel type, occupancy, and grid carbon intensity
- Dietary emission estimates ignore food origin, preparation, and waste
- Users lose confidence when numbers seem implausible

**HMW Statement:**
> *How might we use authoritative, real-world data sources to produce trustworthy and accurate emission calculations?*

---

## 4. Problem-Solution Map

| Problem Statement | EcoTrack Solution |
|---|---|
| No carbon visibility in daily life | Real-time emissions gauge on Dashboard; 3-category breakdown |
| No personalized feedback | Groq LLM generates custom tips from today's logged activity |
| No habit formation loop | Daily streak counter + 6-badge achievement system |
| High entry barriers | Demo Mode — fully functional with no login required |
| Inaccurate estimates | Carbon Interface API via Flask; client-side fallback mirrors API logic |

---

## 5. User Problem Personas

### Persona A – "The Curious Newcomer"
- Does not know their carbon footprint
- Wants to explore without commitment
- **Barrier:** Does not want to create yet another account
- **EcoTrack Answer:** Demo Mode with seeded 30-day history on first launch

### Persona B – "The Committed Eco-Tracker"
- Wants accurate daily tracking and trend analysis
- Needs cloud sync across devices
- **Barrier:** Existing tools lack depth and customization
- **EcoTrack Answer:** Firebase-backed profile, budget settings, and historical charts

### Persona C – "The Habit Seeker"
- Wants external motivation to maintain eco-habits
- Loses interest without visible progress
- **Barrier:** No reward system in current tools
- **EcoTrack Answer:** Streak tracking, badge unlocks, and achievement progress bars

---

*Document version: 1.0 | Created: July 2026 | EcoTrack Project*
