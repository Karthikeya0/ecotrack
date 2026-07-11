import React, { useEffect, useState } from 'react';

const EmissionsGauge = ({ emissions = 0, budget = 20 }) => {
  const [offset, setOffset] = useState(283);
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // Approx 282.74

  // Limit emissions value to prevent negative or broken layouts
  const safeEmissions = Math.max(0, parseFloat(emissions));
  const safeBudget = Math.max(1, parseFloat(budget));
  const percentage = Math.min(100, Math.round((safeEmissions / safeBudget) * 100));
  
  useEffect(() => {
    // Delayed animation to trigger transition on mount
    const timer = setTimeout(() => {
      const progressOffset = circumference - (percentage / 100) * circumference;
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  // Color mapping based on percentage of budget consumed
  let strokeColor = 'stroke-emerald-500';
  let glowColor = 'shadow-emerald-500/20';
  let textColor = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/5';
  let borderColor = 'border-emerald-500/20';

  if (percentage >= 100) {
    strokeColor = 'stroke-rose-500';
    glowColor = 'shadow-rose-500/20';
    textColor = 'text-rose-400';
    bgColor = 'bg-rose-500/5';
    borderColor = 'border-rose-500/20';
  } else if (percentage >= 80) {
    strokeColor = 'stroke-amber-500';
    glowColor = 'shadow-amber-500/20';
    textColor = 'text-amber-400';
    bgColor = 'bg-amber-500/5';
    borderColor = 'border-amber-500/20';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer subtle glow ring */}
        <div className={`absolute w-48 h-48 rounded-full ${bgColor} border ${borderColor} blur-sm transition-all duration-500`} />

        {/* SVG Progress Gauge */}
        <svg className="w-full h-full transform -rotate-90 select-none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          
          {/* Background Track Circle */}
          <circle
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />

          {/* Foreground Progress Circle */}
          <circle
            className={`gauge-circle-progress transition-all duration-700 ease-out`}
            stroke={percentage >= 100 ? "url(#dangerGradient)" : percentage >= 80 ? "url(#warningGradient)" : "url(#gaugeGradient)"}
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
            style={{ strokeDashoffset: offset }}
          />
        </svg>

        {/* Floating Text Metrics inside circular progress */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Today</span>
          <span className="text-4xl font-extrabold font-outfit text-white leading-tight my-0.5">
            {emissions.toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-slate-400 font-outfit">
            / {budget.toFixed(0)} kg CO₂
          </span>
        </div>
      </div>

      {/* Percentage details */}
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 ${textColor}`}>
          <span className={`w-2 h-2 rounded-full ${percentage >= 100 ? 'bg-rose-500 animate-ping' : percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          {percentage}% Budget Used
        </span>
        
        {percentage >= 100 && (
          <p className="text-xs text-rose-400 font-medium mt-2 animate-bounce">
            Over daily limit! Check your suggestions.
          </p>
        )}
      </div>
    </div>
  );
};

export default EmissionsGauge;
