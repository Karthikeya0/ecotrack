import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Car,
  UtensilsCrossed,
  Zap,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Train,
  Bike
} from 'lucide-react';

const LogToday = () => {
  const { logTodayHabit, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    travel: { mode: 'car', distance: '', passengers: '1' },
    food:   { diet: 'flexitarian', meals: '3', foodWaste: false },
    energy: { electricity: '10', heating: false, ac: false }
  });

  const [previews, setPreviews] = useState({ travel: 0, food: 0, energy: 0, total: 0 });

  // ── Live emissions preview ────────────────────────────────────────────────
  useEffect(() => {
    const dist = parseFloat(formData.travel.distance) || 0;
    const pass = Math.max(1, parseInt(formData.travel.passengers || 1));
    const factors = { car: 0.17, bus: 0.08, train: 0.04, motorbike: 0.11, flight: 0.25 };
    let travelCO2 = dist * (factors[formData.travel.mode] || 0);
    if (formData.travel.mode === 'car') travelCO2 /= pass;

    const mealFactors = { carnivore: 2.5, flexitarian: 1.5, vegetarian: 0.8, vegan: 0.4 };
    let foodCO2 = (parseInt(formData.food.meals) || 3) * (mealFactors[formData.food.diet] || 1.5);
    if (formData.food.foodWaste) foodCO2 += 0.8;

    let energyCO2 = parseFloat(formData.energy.electricity || 0) * 0.4;
    if (formData.energy.heating) energyCO2 += 3.0;
    if (formData.energy.ac)      energyCO2 += 2.0;

    setPreviews({
      travel: parseFloat(travelCO2.toFixed(1)),
      food:   parseFloat(foodCO2.toFixed(1)),
      energy: parseFloat(energyCO2.toFixed(1)),
      total:  parseFloat((travelCO2 + foodCO2 + energyCO2).toFixed(1))
    });
  }, [formData]);

  // ── Field handlers ────────────────────────────────────────────────────────
  const handleTravelChange = (name, value) => {
    setFormData(prev => ({ ...prev, travel: { ...prev.travel, [name]: value } }));
    if (errors[`travel_${name}`]) setErrors(prev => ({ ...prev, [`travel_${name}`]: '' }));
  };

  const handleFoodChange = (name, value) => {
    setFormData(prev => ({ ...prev, food: { ...prev.food, [name]: value } }));
    if (errors[`food_${name}`]) setErrors(prev => ({ ...prev, [`food_${name}`]: '' }));
  };

  const handleEnergyChange = (name, value) => {
    setFormData(prev => ({ ...prev, energy: { ...prev.energy, [name]: value } }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep = (currentStep) => {
    const stepErrors = {};
    if (currentStep === 1) {
      const dist = formData.travel.distance;
      if (dist === '') stepErrors.travel_distance = 'Distance is required';
      else if (isNaN(dist) || parseFloat(dist) < 0) stepErrors.travel_distance = 'Must be a non-negative number';
      if (formData.travel.mode === 'car') {
        const pass = formData.travel.passengers;
        if (!pass || isNaN(pass) || parseInt(pass) < 1) stepErrors.travel_passengers = 'At least 1 passenger required';
      }
    }
    if (currentStep === 2) {
      const meals = formData.food.meals;
      if (!meals || isNaN(meals) || parseInt(meals) < 0) stepErrors.food_meals = 'Number of meals is required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(prev => prev + 1); };
  const prevStep = () => setStep(prev => prev - 1);

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({});
    try {
      await logTodayHabit(formData);
      showToast('Habits logged successfully! 🌱', 'success');
      navigate('/');
    } catch (err) {
      setErrors({ api: err.message || 'Failed to submit. Please check your connection.' });
      showToast(err.message || 'Failed to log habits', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'car':      return <Car className="h-5 w-5" />;
      case 'flight':   return <Plane className="h-5 w-5" />;
      case 'bus':
      case 'train':    return <Train className="h-5 w-5" />;
      default:         return <Bike className="h-5 w-5" />;
    }
  };

  // ── Toggle component — uses only valid Tailwind classes ───────────────────
  const Toggle = ({ value, onChange, color = 'emerald' }) => {
    const colors = {
      emerald: 'bg-emerald-500',
      amber:   'bg-amber-500',
      rose:    'bg-rose-500',
    };
    return (
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-emerald-500 ${
          value ? colors[color] : 'bg-slate-700'
        }`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Log Carbon Habits</h1>
        <p className="text-slate-400 text-sm mt-1">Record your travel, food, and energy usage to track your daily impact.</p>
      </div>

      {/* Step Progress bar */}
      <div className="flex items-center justify-between mb-8 px-4 relative">
        {/* Track line */}
        <div className="absolute inset-x-14 top-5 h-0.5 bg-slate-800" />
        <div
          className="absolute top-5 left-14 h-0.5 bg-emerald-500 transition-all duration-500"
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        />

        {[
          { label: 'Travel', num: 1, icon: Car },
          { label: 'Food',   num: 2, icon: UtensilsCrossed },
          { label: 'Energy', num: 3, icon: Zap }
        ].map((s) => {
          const StepIcon = s.icon;
          const isActive = step === s.num;
          const isDone   = step > s.num;
          return (
            <div key={s.num} className="flex flex-col items-center z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isDone   ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-950/30'
                : isActive ? 'bg-slate-950 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/10'
                           : 'bg-slate-950 border-slate-700 text-slate-500'
              }`}>
                {isDone ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <StepIcon className="h-5 w-5" />}
              </div>
              <span className={`text-xs font-semibold mt-2 ${
                isActive ? 'text-emerald-400' : isDone ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="glass-panel p-6 border-slate-800/80">

        {/* API error banner */}
        {errors.api && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{errors.api}</span>
          </div>
        )}

        <form onSubmit={handleFinalSubmit}>

          {/* ──────────────────── STEP 1: TRAVEL ────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                <span className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
                  <Car className="h-5 w-5" />
                </span>
                Step 1 — Travel Habits
              </h2>

              {/* Transport mode tiles */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transport Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['car','bus','train','motorbike','flight'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleTravelChange('mode', mode)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        formData.travel.mode === mode
                          ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {getTransportIcon(mode)}
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Distance (km)</label>
                <input
                  type="number" min="0" step="any"
                  value={formData.travel.distance}
                  onChange={(e) => handleTravelChange('distance', e.target.value)}
                  placeholder="e.g. 15.5"
                  className="w-full glass-input"
                />
                {errors.travel_distance && <p className="text-rose-400 text-xs font-medium mt-1">{errors.travel_distance}</p>}
              </div>

              {/* Passengers — car only */}
              {formData.travel.mode === 'car' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Passengers (Carpooling)</label>
                  <select
                    value={formData.travel.passengers}
                    onChange={(e) => handleTravelChange('passengers', e.target.value)}
                    className="w-full glass-input"
                  >
                    <option value="1">1 — Just me</option>
                    <option value="2">2 passengers</option>
                    <option value="3">3 passengers</option>
                    <option value="4">4 or more</option>
                  </select>
                  {errors.travel_passengers && <p className="text-rose-400 text-xs font-medium mt-1">{errors.travel_passengers}</p>}
                </div>
              )}

              {/* Preview */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-sky-500/5 border border-sky-500/10">
                <span className="text-xs text-slate-400 font-medium">Estimated travel emissions:</span>
                <span className="text-lg font-bold font-outfit text-sky-400">{previews.travel} kg CO₂</span>
              </div>
            </div>
          )}

          {/* ──────────────────── STEP 2: FOOD ──────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                  <UtensilsCrossed className="h-5 w-5" />
                </span>
                Step 2 — Food Habits
              </h2>

              {/* Diet tiles */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diet Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'carnivore',   label: 'Meat Lover',   desc: 'Regular meat & poultry' },
                    { key: 'flexitarian', label: 'Flexitarian',  desc: 'Occasional meat' },
                    { key: 'vegetarian',  label: 'Vegetarian',   desc: 'No meat, dairy/eggs OK' },
                    { key: 'vegan',       label: 'Vegan',        desc: 'Strict plant-based' }
                  ].map((diet) => (
                    <button
                      key={diet.key}
                      type="button"
                      onClick={() => handleFoodChange('diet', diet.key)}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                        formData.food.diet === diet.key
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-bold">{diet.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{diet.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meals */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Number of Meals Today</label>
                <input
                  type="number" min="0" max="10"
                  value={formData.food.meals}
                  onChange={(e) => handleFoodChange('meals', e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full glass-input"
                />
                {errors.food_meals && <p className="text-rose-400 text-xs font-medium mt-1">{errors.food_meals}</p>}
              </div>

              {/* Food waste toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div>
                  <p className="text-sm font-bold text-white">Food Waste Today</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs">Enable if any significant food was wasted or thrown away today</p>
                </div>
                <Toggle
                  value={formData.food.foodWaste}
                  onChange={() => handleFoodChange('foodWaste', !formData.food.foodWaste)}
                  color="amber"
                />
              </div>

              {/* Preview */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-xs text-slate-400 font-medium">Estimated food emissions:</span>
                <span className="text-lg font-bold font-outfit text-amber-400">{previews.food} kg CO₂</span>
              </div>
            </div>
          )}

          {/* ──────────────────── STEP 3: ENERGY ────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                <span className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20">
                  <Zap className="h-5 w-5" />
                </span>
                Step 3 — Energy Habits
              </h2>

              {/* Electricity slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Electricity Usage</label>
                  <span className="text-sm font-bold font-outfit text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg">
                    {formData.energy.electricity} kWh
                  </span>
                </div>
                <input
                  type="range" min="0" max="50" step="1"
                  value={formData.energy.electricity}
                  onChange={(e) => handleEnergyChange('electricity', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer accent-rose-500 bg-slate-800"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                  <span>0 kWh</span>
                  <span>25 kWh</span>
                  <span>50 kWh</span>
                </div>
              </div>

              {/* Space Heating toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-800 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Space Heating Active</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Home boiler, heater, or radiator used today (+3.0 kg CO₂)</p>
                </div>
                <div className="shrink-0">
                  <Toggle
                    value={formData.energy.heating}
                    onChange={() => handleEnergyChange('heating', !formData.energy.heating)}
                    color="rose"
                  />
                </div>
              </div>

              {/* Air Conditioning toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-800 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Air Conditioner Active</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">AC, cooler, or fans running for multiple hours today (+2.0 kg CO₂)</p>
                </div>
                <div className="shrink-0">
                  <Toggle
                    value={formData.energy.ac}
                    onChange={() => handleEnergyChange('ac', !formData.energy.ac)}
                    color="rose"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <span className="text-xs text-slate-400 font-medium">Estimated energy emissions:</span>
                <span className="text-lg font-bold font-outfit text-rose-400">{previews.energy} kg CO₂</span>
              </div>
            </div>
          )}

          {/* ── Navigation footer ─────────────────────────────────────── */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between gap-4">

            {/* Back / Cancel */}
            {step > 1 ? (
              <button type="button" onClick={prevStep} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-semibold transition-all">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/')} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-slate-300 text-sm font-semibold transition-all">
                Cancel
              </button>
            )}

            {/* Total estimate (centre) */}
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Total Estimate</span>
              <span className="text-base font-bold font-outfit text-emerald-400">{previews.total} kg CO₂</span>
            </div>

            {/* Continue / Submit */}
            {step < 3 ? (
              <button type="button" onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-950/20">
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/20">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Save Log</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default LogToday;
