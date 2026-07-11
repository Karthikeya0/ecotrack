import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'emerald', 
  link = null, 
  progress = null 
}) => {
  
  // Custom theme configurations based on the selected color prop
  const colorThemes = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      accentBg: 'bg-emerald-500',
      shadow: 'hover:shadow-emerald-950/10'
    },
    blue: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      text: 'text-sky-400',
      accentBg: 'bg-sky-500',
      shadow: 'hover:shadow-sky-950/10'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      accentBg: 'bg-amber-500',
      shadow: 'hover:shadow-amber-950/10'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      accentBg: 'bg-rose-500',
      shadow: 'hover:shadow-rose-950/10'
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      accentBg: 'bg-indigo-500',
      shadow: 'hover:shadow-indigo-950/10'
    }
  };

  const theme = colorThemes[color] || colorThemes.emerald;
  const CardWrapper = link ? Link : 'div';

  return (
    <CardWrapper 
      to={link}
      className={`glass-panel p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] border border-slate-800/80 group ${
        link ? 'cursor-pointer hover:border-slate-700/60' : ''
      } ${theme.shadow}`}
    >
      <div>
        {/* Header containing title and icon */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-outfit">
            {title}
          </span>
          <div className={`p-2.5 rounded-xl ${theme.bg} border ${theme.border} text-slate-200 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-5 w-5 ${theme.text}`} />
          </div>
        </div>

        {/* Display Stat values */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-outfit text-white tracking-tight">
            {value}
          </span>
          {subtitle && (
            <span className="text-xs text-slate-500 font-medium">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Optional Progress Slider */}
      {progress !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
            <div 
              className={`h-full ${theme.accentBg} rounded-full transition-all duration-500`} 
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Hover action footer (only visible if linking is provided) */}
      {link && (
        <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
          <span>Manage details</span>
          <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </CardWrapper>
  );
};

export default StatCard;
