import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toast, hideToast } = useApp();
  const { message, type, visible } = toast;

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, message]);

  if (!visible) return null;

  const config = {
    success: {
      bg: 'bg-emerald-950/95 border-emerald-500/30 text-emerald-300',
      icon: CheckCircle,
      iconColor: 'text-emerald-400'
    },
    error: {
      bg: 'bg-rose-950/95 border-rose-500/30 text-rose-300',
      icon: AlertTriangle,
      iconColor: 'text-rose-400'
    },
    info: {
      bg: 'bg-blue-950/95 border-blue-500/30 text-blue-300',
      icon: Info,
      iconColor: 'text-blue-400'
    },
    warning: {
      bg: 'bg-amber-950/95 border-amber-500/30 text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-400'
    }
  };

  const toastStyle = config[type] || config.success;
  const Icon = toastStyle.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm w-full">
      <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${toastStyle.bg}`}>
        <div className={`p-1.5 rounded-lg bg-white/5 ${toastStyle.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm font-medium tracking-wide">
          {message}
        </div>
        <button 
          onClick={hideToast}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
