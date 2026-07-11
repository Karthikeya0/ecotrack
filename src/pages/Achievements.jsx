import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  Flame, 
  Bike, 
  Compass, 
  ZapOff, 
  Scale, 
  Award,
  Sparkles,
  LockKeyhole
} from 'lucide-react';

const Achievements = () => {
  const { dashboard, history } = useApp();
  const { streak, dailyBudget } = dashboard;
  const totalLogs = history.length;

  // List of achievements with conditions, descriptions, and visual styles
  const badgeSystem = [
    {
      id: 'first_log',
      name: 'First Green Step',
      condition: 'Log 1 daily habit entry',
      description: 'Your journey to understand and lower your environmental impact has begun.',
      icon: Compass,
      color: 'from-sky-500 to-blue-500',
      unlocked: totalLogs >= 1
    },
    {
      id: 'budget_keeper',
      name: 'Budget Keeper',
      condition: 'Stay under your daily carbon limit',
      description: 'Logged a daily carbon footprint that did not exceed your daily budget.',
      icon: Scale,
      color: 'from-emerald-500 to-teal-500',
      unlocked: history.some(log => log.emissions.total <= dailyBudget)
    },
    {
      id: 'clean_transit',
      name: 'Eco Commuter',
      condition: 'Zero travel emissions logged',
      description: 'Logged a travel footprint of 0 kg CO₂, meaning you walked, cycled, or stayed local.',
      icon: Bike,
      color: 'from-teal-500 to-emerald-400',
      unlocked: history.some(log => log.emissions.breakdown.travel === 0)
    },
    {
      id: 'streak_3',
      name: 'Consistency Champion',
      condition: 'Maintain a 3-day active streak',
      description: 'Tracked your footprint for three consecutive days.',
      icon: Flame,
      color: 'from-orange-500 to-amber-500',
      unlocked: streak >= 3
    },
    {
      id: 'streak_7',
      name: 'Climate Guardian',
      condition: 'Maintain a 7-day active streak',
      description: 'Tracked your footprint for seven consecutive days. An exceptional routine!',
      icon: Trophy,
      color: 'from-purple-500 to-indigo-500',
      unlocked: streak >= 7
    },
    {
      id: 'expert_10',
      name: 'Sustainability Guru',
      condition: 'Log 10 carbon entries in history',
      description: 'Accumulated ten habits logs, demonstrating long-term environmental awareness.',
      icon: Award,
      color: 'from-rose-500 to-pink-500',
      unlocked: totalLogs >= 10
    }
  ];

  const unlockedCount = badgeSystem.filter(b => b.unlocked).length;
  const percentUnlocked = Math.round((unlockedCount / badgeSystem.length) * 100);

  // Next streak goal helper
  const getNextStreakGoal = () => {
    if (streak < 3) return { current: streak, target: 3, percent: (streak / 3) * 100 };
    if (streak < 7) return { current: streak, target: 7, percent: (streak / 7) * 100 };
    return { current: streak, target: 14, percent: Math.min(100, (streak / 14) * 100) };
  };

  const streakGoal = getNextStreakGoal();

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Eco Badges & Trophies</h1>
        <p className="text-slate-400 text-sm mt-1">Unlock badges by logging consistently and reducing your daily carbon emissions.</p>
      </div>

      {/* Overview Dashboard panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Unlocked stats radial/bar summary */}
        <div className="glass-panel p-6 border-slate-800/80 flex flex-col justify-between md:col-span-1">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Progress</span>
            <h2 className="text-2xl font-bold text-white mt-1">Achievements</h2>
          </div>
          <div className="my-6">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Unlocked Badges</span>
              <span>{unlockedCount} / {badgeSystem.length}</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" 
                style={{ width: `${percentUnlocked}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            You have unlocked <span className="text-emerald-400 font-bold">{percentUnlocked}%</span> of your climate achievement badges.
          </div>
        </div>

        {/* Streak tracker details */}
        <div className="glass-panel p-6 border-slate-800/80 flex flex-col justify-between md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20"><Flame className="h-5 w-5 fill-orange-500/20" /></div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Streak Goal</span>
              <h2 className="text-lg font-bold text-white">Daily Logging consistency</h2>
            </div>
          </div>
          
          <div className="my-4">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Next Reward Target</span>
              <span>{streakGoal.current} / {streakGoal.target} Days</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" 
                style={{ width: `${streakGoal.percent}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium leading-relaxed">
            {streakGoal.current >= streakGoal.target 
              ? "Incredible habit! You've achieved your active logging streak goal." 
              : `Maintain your daily tracking. Log habits for ${streakGoal.target - streakGoal.current} more consecutive days to secure your next badge.`
            }
          </div>
        </div>

      </div>

      {/* Grid of badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badgeSystem.map((badge) => {
          const BadgeIcon = badge.icon;
          return (
            <div 
              key={badge.id}
              className={`glass-panel p-5 border relative overflow-hidden transition-all duration-300 group flex items-start gap-4 ${
                badge.unlocked 
                  ? 'border-slate-800/80 hover:border-emerald-500/25 hover:shadow-emerald-950/5 hover:-translate-y-0.5' 
                  : 'border-slate-900/60 opacity-60'
              }`}
            >
              {/* Badge visual icon */}
              <div className={`p-3.5 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                badge.unlocked 
                  ? `bg-gradient-to-br ${badge.color} text-white shadow-lg` 
                  : 'bg-slate-950 border border-slate-900 text-slate-600'
              }`}>
                {badge.unlocked ? <BadgeIcon className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6 stroke-1.5" />}
              </div>

              {/* Text content details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className={`font-outfit font-bold text-sm leading-none ${badge.unlocked ? 'text-white' : 'text-slate-500'}`}>
                    {badge.name}
                  </h3>
                  {badge.unlocked && (
                    <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400/20 animate-pulse" />
                  )}
                </div>
                
                <p className={`text-[10px] font-semibold leading-normal ${badge.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {badge.condition}
                </p>
                
                <p className="text-slate-400 text-xs leading-normal pt-1">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Achievements;
