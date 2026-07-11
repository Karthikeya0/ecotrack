import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import SkeletonCard from '../components/SkeletonCard';
import { 
  Sparkles, 
  Car, 
  UtensilsCrossed, 
  Zap, 
  Leaf, 
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Suggestions = () => {
  const { suggestions, suggestionsLoading, getAISuggestions } = useApp();

  // Load recommendations on mount
  useEffect(() => {
    getAISuggestions();
  }, []);

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'travel':
        return <Car className="h-6 w-6 text-sky-400" />;
      case 'food':
        return <UtensilsCrossed className="h-6 w-6 text-amber-400" />;
      case 'energy':
        return <Zap className="h-6 w-6 text-rose-400" />;
      default:
        return <Leaf className="h-6 w-6 text-emerald-400" />;
    }
  };

  const getCategoryStyles = (category) => {
    switch (category?.toLowerCase()) {
      case 'travel':
        return {
          badge: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
          cardBorder: 'hover:border-sky-500/20',
          glow: 'bg-sky-500/5'
        };
      case 'food':
        return {
          badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          cardBorder: 'hover:border-amber-500/20',
          glow: 'bg-amber-500/5'
        };
      case 'energy':
        return {
          badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          cardBorder: 'hover:border-rose-500/20',
          glow: 'bg-rose-500/5'
        };
      default:
        return {
          badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          cardBorder: 'hover:border-emerald-500/20',
          glow: 'bg-emerald-500/5'
        };
    }
  };

  // Check if session has today's log to determine if tips are AI customized or static fallbacks
  const hasLoggedToday = sessionStorage.getItem('last_logged_today') !== null;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-emerald-400 fill-emerald-400/10 animate-pulse-slow" />
            <span>AI Eco-Suggestions</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Custom recommendations to lower your carbon output based on today's logged data.
          </p>
        </div>
        
        {/* Customized indicator */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 shrink-0">
          <Info className="h-4.5 w-4.5 text-emerald-400" />
          <span>{hasLoggedToday ? 'Tailored to today\'s log' : 'General saving tips'}</span>
        </div>
      </div>

      {/* CTA to log today if no details logged yet */}
      {!hasLoggedToday && (
        <div className="glass-panel p-5 border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-outfit font-bold text-sm text-white">Log your habits for tailored AI suggestions</h4>
            <p className="text-xs text-slate-400 mt-1 leading-normal max-w-xl">
              We are currently showing general energy-saving tips. Log today's travel, food, and electricity habits to receive custom AI advice.
            </p>
          </div>
          <Link 
            to="/log-today" 
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shrink-0"
          >
            <span>Log Today</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Grid containing Recommendation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestionsLoading ? (
          // Render skeleton loads while waiting
          Array(3).fill(0).map((_, idx) => <SkeletonCard key={idx} />)
        ) : suggestions.length > 0 ? (
          suggestions.map((tip, index) => {
            const styles = getCategoryStyles(tip.category);
            return (
              <div 
                key={index} 
                className={`glass-panel p-6 border-slate-800/80 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between relative overflow-hidden group ${styles.cardBorder}`}
              >
                {/* Micro glow badge background */}
                <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full blur-xl transition-opacity duration-300 opacity-60 group-hover:opacity-100 ${styles.glow}`} />

                <div>
                  {/* Card category header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}>
                      {tip.category}
                    </span>
                    <div className="p-2 bg-slate-950 border border-slate-800/80 rounded-xl group-hover:scale-110 transition-transform">
                      {getCategoryIcon(tip.category)}
                    </div>
                  </div>

                  {/* Title and descriptions */}
                  <h3 className="font-outfit font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                    {tip.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">
                    {tip.description}
                  </p>
                </div>

                {/* Savings Pill */}
                <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Est. Impact</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 font-outfit">
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                    <span>-{tip.co2_saving} kg CO₂</span>
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-slate-500">
            <Leaf className="h-10 w-10 text-slate-700 stroke-1 mb-2 animate-bounce" />
            <p className="text-sm">No tips available. Please try logging your habits first.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Suggestions;
