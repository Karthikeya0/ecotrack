import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Globe, Target, Scale, Save, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    dailyBudget: '',
    weeklyGoal: ''
  });

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Sync state with user profile metadata
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        country: user.country || 'Global',
        dailyBudget: user.dailyBudget ? user.dailyBudget.toString() : '20',
        weeklyGoal: user.weeklyGoal ? user.weeklyGoal.toString() : '100'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Inputs validations
    if (!formData.name.trim()) {
      setValidationError('Name cannot be left blank');
      return;
    }
    const db = parseFloat(formData.dailyBudget);
    if (isNaN(db) || db <= 0) {
      setValidationError('Daily budget must be a positive number');
      return;
    }
    const wg = parseFloat(formData.weeklyGoal);
    if (isNaN(wg) || wg <= 0) {
      setValidationError('Weekly target goal must be a positive number');
      return;
    }

    setSaving(true);
    setValidationError('');

    try {
      // Sync to backend / local cache
      await updateProfile({
        name: formData.name,
        country: formData.country,
        dailyBudget: db,
        weeklyGoal: wg
      });
    } catch (err) {
      console.error(err);
      setValidationError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 animate-fade-in">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your personal daily carbon budget and weekly goals.</p>
      </div>

      {/* Editor Panel Card */}
      <div className="glass-panel p-6 border-slate-800/80 relative">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* Validation errors */}
          {validationError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-450 text-xs font-semibold text-center">
              {validationError}
            </div>
          )}

          {/* User Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Eco Warrior"
                className="w-full pl-10 glass-input"
                disabled={saving}
              />
            </div>
          </div>

          {/* Country location */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Country / Region</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="United Kingdom"
                className="w-full pl-10 glass-input"
                disabled={saving}
              />
            </div>
          </div>

          {/* Daily limit budget */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Daily Budget (kg CO₂)</label>
            <div className="relative">
              <Scale className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="number"
                name="dailyBudget"
                step="any"
                min="1"
                value={formData.dailyBudget}
                onChange={handleInputChange}
                placeholder="20.0"
                className="w-full pl-10 glass-input"
                disabled={saving}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-normal pl-1 pt-1">
              Your carbon budget is the maximum carbon dioxide equivalent emissions you target daily.
            </p>
          </div>

          {/* Weekly goal target */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Weekly Goal (kg CO₂)</label>
            <div className="relative">
              <Target className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="number"
                name="weeklyGoal"
                step="any"
                min="1"
                value={formData.weeklyGoal}
                onChange={handleInputChange}
                placeholder="100.0"
                className="w-full pl-10 glass-input"
                disabled={saving}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-normal pl-1 pt-1">
              The aggregate emissions limit you challenge yourself to stay under weekly.
            </p>
          </div>

          {/* Submit action buttons */}
          <div className="pt-4 border-t border-slate-900/60">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/20"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default Profile;
