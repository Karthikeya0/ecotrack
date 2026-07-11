import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EmissionsGauge from '../components/EmissionsGauge';
import StatCard from '../components/StatCard';
import { 
  Car, 
  UtensilsCrossed, 
  Zap, 
  Flame, 
  Award, 
  PlusCircle, 
  ArrowUpRight,
  TrendingDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user, dashboard } = useApp();
  const navigate = useNavigate();

  const { todayEmissions, breakdown, streak, badgeCount, dailyBudget } = dashboard;

  // Generate an assessment based on today's budget usage
  const getSummaryMessage = () => {
    if (todayEmissions === 0) {
      return {
        text: "You haven't logged your carbon habits for today yet. Make a log to check your budget usage!",
        color: "text-slate-400"
      };
    }
    const percent = (todayEmissions / dailyBudget) * 100;
    if (percent < 50) {
      return {
        text: "Excellent! You are significantly below your budget. You are making a huge difference today!",
        color: "text-emerald-400"
      };
    } else if (percent <= 100) {
      return {
        text: "Good job! You are within your daily carbon limits. Try to reduce energy and travel to save more.",
        color: "text-amber-400"
      };
    } else {
      return {
        text: "Alert: You have exceeded your daily carbon budget. Check the suggestions page for customized reduction tips.",
        color: "text-rose-400"
      };
    }
  };

  const summaryAssessment = getSummaryMessage();

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">
            Hi, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{user?.name || 'Eco Warrior'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your habits, earn badges, and reduce your global carbon impact.
          </p>
        </div>
        
        {/* Quick Log Button */}
        <Link 
          to="/log-today" 
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-950/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Log Habits Today</span>
        </Link>
      </div>

      {/* Main Grid: Gauge vs Stats summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radial emissions gauge panel */}
        <div className="glass-panel lg:col-span-1 flex flex-col items-center justify-center p-6 border-slate-800/80 relative">
          <div className="absolute top-4 left-4 font-outfit text-xs font-semibold text-slate-500 tracking-widest uppercase">
            Carbon Budget
          </div>
          <EmissionsGauge emissions={todayEmissions} budget={dailyBudget} />
        </div>

        {/* Detailed breakdown category grid */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          
          {/* Top assessment message */}
          <div className="glass-panel p-5 flex items-start gap-4 border-slate-800/80">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-outfit">Today's Summary</span>
              <p className={`text-sm font-medium mt-1 leading-relaxed ${summaryAssessment.color}`}>
                {summaryAssessment.text}
              </p>
            </div>
          </div>

          {/* Quick Metrics Categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
              title="Travel"
              value={`${breakdown.travel.toFixed(1)} kg`}
              subtitle="CO₂"
              icon={Car}
              color="blue"
              progress={(breakdown.travel / Math.max(1, todayEmissions)) * 100}
            />
            <StatCard 
              title="Food"
              value={`${breakdown.food.toFixed(1)} kg`}
              subtitle="CO₂"
              icon={UtensilsCrossed}
              color="amber"
              progress={(breakdown.food / Math.max(1, todayEmissions)) * 100}
            />
            <StatCard 
              title="Energy"
              value={`${breakdown.energy.toFixed(1)} kg`}
              subtitle="CO₂"
              icon={Zap}
              color="rose"
              progress={(breakdown.energy / Math.max(1, todayEmissions)) * 100}
            />
          </div>

        </div>

      </div>

      {/* Badging and Achievements overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Streak card */}
        <div className="glass-panel glass-panel-hover p-6 border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 animate-pulse-slow">
              <Flame className="h-8 w-8 fill-orange-500/25" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-outfit">Current Streak</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-extrabold font-outfit text-white tracking-tight">{streak}</span>
                <span className="text-sm font-medium text-slate-400">days active</span>
              </div>
            </div>
          </div>
          <Link to="/history" className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Badges Count card */}
        <div className="glass-panel glass-panel-hover p-6 border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <Award className="h-8 w-8 fill-emerald-500/25" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-outfit">Achievements</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-extrabold font-outfit text-white tracking-tight">{badgeCount}</span>
                <span className="text-sm font-medium text-slate-400">badges earned</span>
              </div>
            </div>
          </div>
          <Link to="/achievements" className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

      </div>

      {/* Dynamic CTA Banner for Suggestions */}
      {todayEmissions > 0 && (
        <div className="glass-panel p-6 border border-emerald-500/20 bg-gradient-to-r from-slate-900/60 to-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 mt-1 sm:mt-0">
              <Sparkles className="h-5 w-5 fill-emerald-500/20 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-outfit font-bold text-lg text-white">AI suggestions ready</h3>
              <p className="text-sm text-slate-400 leading-normal max-w-xl">
                We have processed your logged activities for today. Tap to check your customized recommendations to reduce carbon impact.
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/suggestions')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-all tracking-wide uppercase shrink-0"
          >
            <span>View Tips</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
