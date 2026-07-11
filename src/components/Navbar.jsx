import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Leaf, 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Lightbulb, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  Zap
} from 'lucide-react';

const Navbar = () => {
  const { user, isDemoMode, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Log Today', path: '/log-today', icon: ClipboardList },
    { name: 'History', path: '/history', icon: BarChart3 },
    { name: 'Suggestions', path: '/suggestions', icon: Lightbulb },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="glass-panel rounded-t-none border-t-0 border-x-0 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-outfit font-bold text-xl tracking-tight text-emerald-400 hover:text-emerald-300 transition-colors" onClick={closeMenu}>
          <Leaf className="h-6 w-6 text-emerald-500 fill-emerald-500/20 animate-pulse-slow" />
          <span>Eco<span className="text-white">Track</span></span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </div>

        {/* Badges & Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Demo Mode Badge */}
          {isDemoMode ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              <Zap className="h-3 w-3 fill-amber-500/20" />
              <span>Demo Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3 fill-emerald-500/20" />
              <span>Cloud Connected</span>
            </div>
          )}

          {/* User Name Pill */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="text-xs text-slate-400 font-medium font-outfit max-w-[120px] truncate">
              {user?.name}
            </span>
            <button 
              onClick={logout} 
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          {isDemoMode && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="h-2.5 w-2.5" />
              <span>Demo</span>
            </div>
          )}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors focus:outline-none"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-900/60 pb-4 pt-2 animate-fade-in">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-900/80 px-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Logged in as</span>
              <span className="text-sm text-slate-300 font-medium truncate max-w-[180px]">{user?.name}</span>
            </div>
            <button
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-sm font-medium transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
