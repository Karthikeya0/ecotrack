/**
 * AppContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Central state management for EcoTrack.
 *
 * Responsibilities:
 *  • Firebase Authentication (login / register / logout)
 *  • Firebase Firestore persistence (habits, profile)
 *  • Dual-endpoint habit submission:
 *      1. POST /api/calculate/footprint  → Carbon Interface API via Flask
 *      2. POST /api/habits/log           → Firestore via Flask
 *  • AI suggestions via POST /api/suggestions (Groq llama-3.3-70b-versatile)
 *  • GET /api/dashboard  and  GET /api/history  for live metrics
 *  • Demo Mode: 100 % local when Firebase / Flask is unavailable
 *
 * For backend developers
 * ──────────────────────
 * All API calls are in the labelled sections below.
 * The Vite dev proxy forwards /api → http://localhost:5000 (Flask).
 * Production: set VITE_API_BASE_URL in your .env.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, isFirebaseAvailable } from '../firebase';

// ─── Demo / seed data ─────────────────────────────────────────────────────────

const seedMockHistory = () => {
  const history = [];
  const now = new Date();
  for (let i = 30; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const travel = parseFloat((Math.random() * 8 + 2).toFixed(1));
    const food   = parseFloat((Math.random() * 4 + 1.5).toFixed(1));
    const energy = parseFloat((Math.random() * 12 + 4).toFixed(1));
    history.push({
      date: dateStr,
      travel: { mode: 'car', distance: Math.round(travel * 5), passengers: 1 },
      food:   { diet: 'flexitarian', meals: 3, foodWaste: false },
      energy: { electricity: Math.round(energy * 2), heating: false, ac: false },
      emissions: {
        total: parseFloat((travel + food + energy).toFixed(1)),
        breakdown: { travel, food, energy }
      }
    });
  }
  return history;
};

/** Static fallback tips shown when Groq / Flask is unreachable */
const STATIC_ECO_TIPS = [
  {
    category: 'travel',
    title: 'Switch to Carpooling',
    description: 'Carpooling with one other person halves your per-km travel emissions.',
    co2_saving: 2.1
  },
  {
    category: 'energy',
    title: 'Unplug Standby Devices',
    description: 'Vampire power accounts for up to 10 % of home electricity use.',
    co2_saving: 0.8
  },
  {
    category: 'food',
    title: 'Try Meatless Mondays',
    description: 'Skipping meat one day per week meaningfully lowers dietary emissions.',
    co2_saving: 1.5
  },
  {
    category: 'energy',
    title: 'Raise Your AC Setpoint by 2 °C',
    description: 'Every degree of cooling reduction cuts energy consumption by ≈ 6 %.',
    co2_saving: 1.2
  },
  {
    category: 'travel',
    title: 'Keep Tyres at Optimal Pressure',
    description: 'Properly inflated tyres improve fuel efficiency by up to 3 %.',
    co2_saving: 0.5
  }
];

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ── Auth & mode ─────────────────────────────────────────────────────────────
  const [user,        setUser]        = useState(null);
  const [isDemoMode,  setIsDemoMode]  = useState(!isFirebaseAvailable);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Data ────────────────────────────────────────────────────────────────────
  const [history,    setHistory]    = useState([]);
  const [dashboard,  setDashboard]  = useState({
    todayEmissions: 0,
    breakdown:     { travel: 0, food: 0, energy: 0 },
    streak:        0,
    badgeCount:    0,
    dailyBudget:   22.0,
    weeklyGoal:    120.0
  });

  // ── Suggestions ─────────────────────────────────────────────────────────────
  const [suggestions,        setSuggestions]        = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') =>
    setToast({ message, type, visible: true });

  const hideToast = () =>
    setToast(prev => ({ ...prev, visible: false }));

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTH STATE LISTENER
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isFirebaseAvailable && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setIsDemoMode(false);
          // Try to pull extended profile from Firestore
          let profileData = {};
          try {
            const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (snap.exists()) profileData = snap.data();
          } catch (_) { /* Firestore unreachable – use defaults */ }

          setUser({
            uid:         firebaseUser.uid,
            email:       firebaseUser.email,
            name:        profileData.name        || firebaseUser.email.split('@')[0],
            country:     profileData.country     || 'Global',
            dailyBudget: profileData.dailyBudget || 22.0,
            weeklyGoal:  profileData.weeklyGoal  || 120.0
          });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo Mode bootstrap
      setIsDemoMode(true);
      setAuthLoading(false);
      const demo = JSON.parse(localStorage.getItem('demo_profile')) || {
        uid: 'demo-user-123', email: 'demo@ecotrack.ai',
        name: 'Eco Warrior', country: 'United Kingdom',
        dailyBudget: 20.0, weeklyGoal: 100.0
      };
      setUser(demo);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * fetchUserData
   * Called whenever a user session is established.
   * Route (non-demo): GET /api/history?userId={uid}
   * The Flask handler queries Firestore and returns the habits array.
   */
  const fetchUserData = async (userId) => {
    if (isDemoMode) {
      let stored = JSON.parse(localStorage.getItem(`history_${userId}`));
      if (!stored || stored.length === 0) {
        stored = seedMockHistory();
        localStorage.setItem(`history_${userId}`, JSON.stringify(stored));
      }
      setHistory(stored);
      calculateDashboardMetrics(stored, user?.dailyBudget || 20.0);
    } else {
      try {
        // ── BACKEND INTEGRATION POINT ──────────────────────────────────────
        // GET /api/history?userId={userId}
        // Flask queries Firestore collection: users/{userId}/habits
        // Expected response: { logs: [...], summary: { streak, badge_count, ... } }
        // ──────────────────────────────────────────────────────────────────
        const res = await axios.get(`/api/history?userId=${userId}`);
        const logs = res.data?.logs || [];
        setHistory(logs);
        if (res.data?.summary) {
          const s = res.data.summary;
          setDashboard(prev => ({
            ...prev,
            streak:         s.streak         || 0,
            badgeCount:     s.badge_count     || 0,
            todayEmissions: s.today_emissions || 0,
            breakdown:      s.today_breakdown || { travel: 0, food: 0, energy: 0 }
          }));
        } else {
          calculateDashboardMetrics(logs, user?.dailyBudget || 22.0);
        }
      } catch (err) {
        console.warn('[EcoTrack] /api/history unreachable. Using local cache.', err);
        // Graceful degradation: read from Firestore directly if Flask is down
        try {
          const habitsRef = collection(db, 'users', userId, 'habits');
          const q         = query(habitsRef, orderBy('date', 'asc'));
          const snap      = await getDocs(q);
          const logs      = snap.docs.map(d => d.data());
          setHistory(logs);
          calculateDashboardMetrics(logs, user?.dailyBudget || 22.0);
        } catch (fsErr) {
          console.warn('[EcoTrack] Firestore also unreachable. Using localStorage.', fsErr);
          const cached = JSON.parse(localStorage.getItem(`history_${userId}`)) || [];
          setHistory(cached);
          calculateDashboardMetrics(cached, user?.dailyBudget || 22.0);
        }
      }
    }
  };

  useEffect(() => {
    if (user?.uid) fetchUserData(user.uid);
  }, [user?.uid, isDemoMode]);

  // ─────────────────────────────────────────────────────────────────────────────
  // DASHBOARD METRIC CALCULATION (CLIENT-SIDE FALLBACK)
  // ─────────────────────────────────────────────────────────────────────────────

  const calculateDashboardMetrics = (logsList, budget) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logsList.find(l => l.date === todayStr);
    const sorted   = [...logsList].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Streak calculation
    let streak = 0;
    if (sorted.length > 0) {
      const latestDiff =
        Math.ceil(Math.abs(new Date(todayStr) - new Date(sorted[0].date)) / 86400000);
      if (latestDiff <= 1) {
        let lastDate = null;
        for (const log of sorted) {
          const d = new Date(log.date);
          if (!lastDate) { streak = 1; lastDate = d; continue; }
          const diff = Math.round((lastDate - d) / 86400000);
          if (diff === 1) { streak++; lastDate = d; }
          else break;
        }
      }
    }

    // Badge count
    let badgeCount = 0;
    if (streak >= 3)  badgeCount++;
    if (streak >= 7)  badgeCount++;
    if (logsList.length >= 10) badgeCount++;
    if (logsList.some(l => l.emissions?.total < budget)) badgeCount++;
    if (logsList.some(l => l.emissions?.breakdown?.travel === 0)) badgeCount++;

    setDashboard({
      todayEmissions: todayLog ? todayLog.emissions.total : 0,
      breakdown:      todayLog ? todayLog.emissions.breakdown : { travel: 0, food: 0, energy: 0 },
      streak,
      badgeCount,
      dailyBudget:  budget || 22.0,
      weeklyGoal:   user?.weeklyGoal || 120.0
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTH METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    if (!isFirebaseAvailable || !auth)
      throw new Error('Firebase Authentication is not configured. Use Demo Mode.');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, name, password) => {
    if (!isFirebaseAvailable || !auth)
      throw new Error('Firebase Authentication is not configured. Use Demo Mode.');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Create Firestore user document
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        name, email, country: 'Global', dailyBudget: 22.0, weeklyGoal: 120.0,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('[EcoTrack] Could not write user doc to Firestore.', err);
    }
    return cred;
  };

  const logout = async () => {
    if (isFirebaseAvailable && auth) {
      await signOut(auth);
    }
    setIsDemoMode(true);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    const demo = {
      uid: 'demo-user-123', email: 'demo@ecotrack.ai',
      name: 'Eco Warrior', country: 'United Kingdom',
      dailyBudget: 20.0, weeklyGoal: 100.0
    };
    setUser(demo);
    showToast('Running in Demo Mode – data is stored locally', 'success');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HABIT LOGGING  (Dual-endpoint flow)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * logTodayHabit
   *
   * Step 1 → POST /api/calculate/footprint
   *   Flask calls Carbon Interface API with travel / food / energy data
   *   and returns precise emission values.
   *
   * Step 2 → POST /api/habits/log
   *   Flask writes the habit + calculated emissions to Firestore:
   *   users/{userId}/habits/{date}
   *
   * Demo Mode: both steps are computed client-side and saved to localStorage.
   */
  const logTodayHabit = async (formData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const uid      = user?.uid || 'demo-user-123';
    let calculationResult;

    // ── STEP 1: Calculate Footprint ──────────────────────────────────────────
    if (isDemoMode) {
      calculationResult = computeEmissionsLocally(formData);
    } else {
      try {
        // ── BACKEND INTEGRATION POINT ────────────────────────────────────────
        // POST /api/calculate/footprint
        // Flask uses Carbon Interface API to convert activity data → kg CO₂e
        //
        // Request body:
        //   { travel: { mode, distance, passengers },
        //     food:   { diet, meals, foodWaste },
        //     energy: { electricity, heating, ac } }
        //
        // Expected response:
        //   { total: number, breakdown: { travel, food, energy } }
        // ────────────────────────────────────────────────────────────────────
        const calcRes = await axios.post('/api/calculate/footprint', formData);
        calculationResult = calcRes.data;
      } catch (err) {
        console.warn('[EcoTrack] /api/calculate/footprint unreachable. Using local calc.', err);
        calculationResult = computeEmissionsLocally(formData);
      }
    }

    const habitRecord = {
      date:   todayStr,
      userId: uid,
      travel: formData.travel,
      food:   formData.food,
      energy: formData.energy,
      emissions: calculationResult
    };

    // ── STEP 2: Log to Backend / Firestore ──────────────────────────────────
    if (isDemoMode) {
      const stored  = JSON.parse(localStorage.getItem(`history_${uid}`)) || [];
      const updated = [...stored.filter(h => h.date !== todayStr), habitRecord];
      localStorage.setItem(`history_${uid}`, JSON.stringify(updated));
      setHistory(updated);
      calculateDashboardMetrics(updated, user.dailyBudget);
    } else {
      try {
        // ── BACKEND INTEGRATION POINT ────────────────────────────────────────
        // POST /api/habits/log
        // Flask writes to Firestore: users/{userId}/habits/{date}
        // Recalculates streak + badge count and returns them.
        //
        // Request body:  { userId, date, travel, food, energy, emissions }
        // Expected response: { success: true, streak, badgesAwarded: [] }
        // ────────────────────────────────────────────────────────────────────
        await axios.post('/api/habits/log', habitRecord);
        await fetchUserData(uid);         // refresh metrics from server
      } catch (err) {
        console.warn('[EcoTrack] /api/habits/log unreachable. Writing direct to Firestore.', err);
        // Graceful degradation: write to Firestore directly
        try {
          await setDoc(
            doc(db, 'users', uid, 'habits', todayStr),
            { ...habitRecord, timestamp: serverTimestamp() }
          );
          await fetchUserData(uid);
        } catch (fsErr) {
          // Last resort: local cache
          const stored  = JSON.parse(localStorage.getItem(`history_${uid}`)) || [];
          const updated = [...stored.filter(h => h.date !== todayStr), habitRecord];
          localStorage.setItem(`history_${uid}`, JSON.stringify(updated));
          setHistory(updated);
          calculateDashboardMetrics(updated, user.dailyBudget);
        }
      }
    }

    // Store in sessionStorage so Suggestions page can read it without re-fetching
    sessionStorage.setItem('last_logged_today', JSON.stringify(habitRecord));
    return habitRecord;
  };

  /** Client-side emission estimation (mirrors Flask / Carbon Interface logic) */
  const computeEmissionsLocally = (formData) => {
    const dist = parseFloat(formData.travel.distance) || 0;
    const pass = Math.max(1, parseInt(formData.travel.passengers || 1));
    const factors = { car: 0.17, bus: 0.08, train: 0.04, motorbike: 0.11, flight: 0.25, bicycle: 0, walk: 0 };
    let travelCO2 = (dist * (factors[formData.travel.mode] || 0)) / (formData.travel.mode === 'car' ? pass : 1);

    const mealFactors = { carnivore: 2.5, flexitarian: 1.5, vegetarian: 0.8, vegan: 0.4 };
    let foodCO2 = (parseInt(formData.food.meals) || 3) * (mealFactors[formData.food.diet] || 1.5);
    if (formData.food.foodWaste) foodCO2 += 0.8;

    let energyCO2 = parseFloat(formData.energy.electricity || 0) * 0.4;
    if (formData.energy.heating) energyCO2 += 3.0;
    if (formData.energy.ac)      energyCO2 += 2.0;

    return {
      total: parseFloat((travelCO2 + foodCO2 + energyCO2).toFixed(1)),
      breakdown: {
        travel: parseFloat(travelCO2.toFixed(1)),
        food:   parseFloat(foodCO2.toFixed(1)),
        energy: parseFloat(energyCO2.toFixed(1))
      }
    };
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // AI SUGGESTIONS  (Groq llama-3.3-70b-versatile via Flask)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * getAISuggestions
   *
   * Route (non-demo): POST /api/suggestions
   * Flask builds a prompt from today's habit data and sends it to the
   * Groq API (model: llama-3.3-70b-versatile).
   * Returns an array of { category, title, description, co2_saving } objects.
   */
  const getAISuggestions = async () => {
    setSuggestionsLoading(true);
    const todayLog = JSON.parse(sessionStorage.getItem('last_logged_today'));

    if (isDemoMode || !todayLog) {
      await new Promise(r => setTimeout(r, 1500));   // simulate network delay
      setSuggestions(todayLog ? generateLocalSuggestions(todayLog) : STATIC_ECO_TIPS.slice(0, 3));
      setSuggestionsLoading(false);
      return;
    }

    try {
      // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────
      // POST /api/suggestions
      // Flask sends a structured prompt to Groq API and parses JSON response.
      //
      // Request body: { log: { date, travel, food, energy, emissions } }
      // Expected response: { suggestions: [{ category, title, description, co2_saving }] }
      // ──────────────────────────────────────────────────────────────────────
      const res = await axios.post('/api/suggestions', { log: todayLog });
      const tips = res.data?.suggestions || res.data;
      setSuggestions(Array.isArray(tips) ? tips : STATIC_ECO_TIPS);
    } catch (err) {
      console.warn('[EcoTrack] /api/suggestions unreachable. Serving local tips.', err);
      setSuggestions(generateLocalSuggestions(todayLog));
    } finally {
      setSuggestionsLoading(false);
    }
  };

  /** Deterministic suggestion generator used in Demo Mode */
  const generateLocalSuggestions = (log) => {
    const tips = [];
    if (log.emissions.breakdown.travel > 3)
      tips.push({ category: 'travel', title: 'Shift to Low-Carbon Transport',
        description: `Your travel contributed ${log.emissions.breakdown.travel} kg CO₂ today. Switching to public transport or cycling could reduce this by 70 %.`,
        co2_saving: parseFloat((log.emissions.breakdown.travel * 0.7).toFixed(1)) });
    if (['carnivore','flexitarian'].includes(log.food.diet))
      tips.push({ category: 'food', title: 'Introduce More Plant-Based Meals',
        description: 'Replacing one meat-based meal daily with a plant-based option lowers dietary emissions significantly.',
        co2_saving: 1.8 });
    if (log.food.foodWaste)
      tips.push({ category: 'food', title: 'Zero-Waste Food Challenge',
        description: 'Organic waste in landfill produces methane. Compost scraps or plan meals to buy only what you need.',
        co2_saving: 0.8 });
    if (log.emissions.breakdown.energy > 5)
      tips.push({ category: 'energy', title: 'Optimise Heating & Cooling Schedules',
        description: 'Smart thermostat programming and window insulation can reduce HVAC energy use by 15–20 %.',
        co2_saving: 2.2 });
    while (tips.length < 3) {
      const fb = STATIC_ECO_TIPS[tips.length % STATIC_ECO_TIPS.length];
      if (!tips.find(t => t.title === fb.title)) tips.push(fb);
    }
    return tips.slice(0, 5);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PROFILE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * updateProfile
   * Non-demo: Flask writes profile fields to Firestore: users/{userId}
   * Demo:     Saves to localStorage and refreshes dashboard metrics.
   */
  const updateProfile = async (profileData) => {
    const uid        = user?.uid || 'demo-user-123';
    const updatedUser = {
      ...user, ...profileData,
      dailyBudget: parseFloat(profileData.dailyBudget),
      weeklyGoal:  parseFloat(profileData.weeklyGoal)
    };
    setUser(updatedUser);

    if (isDemoMode) {
      localStorage.setItem('demo_profile', JSON.stringify(updatedUser));
    } else {
      try {
        // ── BACKEND INTEGRATION POINT ────────────────────────────────────────
        // POST /api/profile/update
        // Flask merges fields into Firestore: users/{userId}
        //
        // Request body: { userId, name, country, dailyBudget, weeklyGoal }
        // Expected response: { success: true }
        // ────────────────────────────────────────────────────────────────────
        await axios.post('/api/profile/update', { userId: uid, ...profileData });
      } catch (err) {
        console.warn('[EcoTrack] /api/profile/update unreachable. Writing direct to Firestore.', err);
        try {
          await setDoc(doc(db, 'users', uid), {
            name:        profileData.name,
            country:     profileData.country,
            dailyBudget: parseFloat(profileData.dailyBudget),
            weeklyGoal:  parseFloat(profileData.weeklyGoal)
          }, { merge: true });
        } catch (_) { /* silently fail – values are in local state */ }
      }
    }

    calculateDashboardMetrics(history, parseFloat(profileData.dailyBudget));
    showToast('Profile settings saved successfully ✓', 'success');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider value={{
      // State
      user, isDemoMode, authLoading,
      history, dashboard,
      suggestions, suggestionsLoading,
      toast,
      // Auth
      login, register, logout, enableDemoMode,
      // Features
      logTodayHabit,
      getAISuggestions,
      updateProfile,
      // UI helpers
      showToast, hideToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
