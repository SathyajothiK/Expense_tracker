import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { 
  X, 
  User, 
  Mail, 
  ShieldCheck, 
  Target, 
  Key, 
  CheckCircle2, 
  Sparkles,
  Award,
  Lock,
  Globe,
  Loader2
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, user, onSaveProfile }) {
  // All hooks must be declared before any early return (React rules)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('50000');
  const [currency, setCurrency] = useState('INR (₹)');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync form fields whenever modal opens or user prop changes
  useEffect(() => {
    if (isOpen) {
      let u = user || {};
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          u = { ...u, ...parsed };
        }
      } catch (_) {}

      setName(u.name || 'Satya');
      setEmail(u.email || 'satya@spendwise.io');
      setSavingsTarget(u.savingsTarget || '50000');
      setCurrency(u.currency || 'INR (₹)');
      setSavedSuccess(false);
      setIsSaving(false);
      setErrorMsg('');
    }
  }, [isOpen, user]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }
    setErrorMsg('');
    setIsSaving(true);

    const updatedUser = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      savingsTarget: savingsTarget,
      currency: currency
    };

    // Persist to localStorage immediately
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Persist to backend database via API if authenticated
    const token = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    if (token) {
      axios.put(`${API_BASE}/auth/profile`, {
        name: name.trim(),
        email: email.trim(),
        savingsTarget: parseFloat(savingsTarget) || 50000,
        currency
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.warn('Backend profile sync notice:', err.message));
    }

    // Notify parent components (Navbar + Dashboard) immediately
    if (onSaveProfile) {
      onSaveProfile(updatedUser);
    }

    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
    }, 300);
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0E0C0A] border border-[#D4AF37]/35 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] overflow-hidden transform transition-all duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#1E1B17] via-[#12100E] to-[#0A0908]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFF4D0] to-[#9A7B2C] p-[1.5px] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <div className="w-full h-full rounded-full bg-[#12100E] flex items-center justify-center text-[#E6C667] text-lg font-bold font-serif">
                {name ? name.charAt(0).toUpperCase() : 'S'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-serif tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  Account & Profile Setup
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E6C667] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#D4AF37]" /> Vault Member
                </span>
              </div>
              <p className="text-[11px] text-[#A19B91]">Personalize your Sovereign Wealth profile settings</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#A19B91] hover:text-white hover:border-[#D4AF37]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Member Card Summary */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#181410] to-[#0E0C0A] border border-[#D4AF37]/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1">
                <Award className="w-3 h-3" /> Sovereign Rank
              </span>
              <p className="text-xs font-bold text-white">Tier 1 Sovereign Vault Member</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-[#A19B91] font-medium block">Security Status</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                <Lock className="w-2.5 h-2.5" /> 256-Bit Encrypted
              </span>
            </div>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-[#D4AF37]" /> Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setSavedSuccess(false); }}
                placeholder="Your full name"
                className="w-full bg-[#080706]/90 border border-[#D4AF37]/25 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#524D46] outline-none transition-all focus:ring-1 focus:ring-[#D4AF37]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#D4AF37]" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSavedSuccess(false); }}
                placeholder="your.email@vault.com"
                className="w-full bg-[#080706]/90 border border-[#D4AF37]/25 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#524D46] outline-none transition-all focus:ring-1 focus:ring-[#D4AF37]/50"
              />
            </div>
          </div>

          {/* Savings Goal Target & Preferred Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1 flex items-center gap-1">
                <Target className="w-3 h-3 text-[#D4AF37]" /> Monthly Savings Target (₹)
              </label>
              <input
                type="number"
                value={savingsTarget}
                onChange={(e) => { setSavingsTarget(e.target.value); setSavedSuccess(false); }}
                placeholder="50000"
                className="w-full bg-[#080706]/90 border border-[#D4AF37]/25 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#524D46] outline-none transition-all focus:ring-1 focus:ring-[#D4AF37]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#D4AF37]" /> Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => { setCurrency(e.target.value); setSavedSuccess(false); }}
                className="w-full bg-[#080706]/90 border border-[#D4AF37]/25 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none appearance-none transition-all"
              >
                <option value="INR (₹)" className="bg-[#12100E]">INR (₹) - Indian Rupee</option>
                <option value="USD ($)" className="bg-[#12100E]">USD ($) - US Dollar</option>
                <option value="EUR (€)" className="bg-[#12100E]">EUR (€) - Euro</option>
                <option value="GBP (£)" className="bg-[#12100E]">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <p className="text-red-400 text-[11px] bg-red-950/40 border border-red-500/30 rounded-xl p-2.5 text-center">
              {errorMsg}
            </p>
          )}

          {/* Success message */}
          {savedSuccess && (
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/70 border border-emerald-500/60 rounded-xl p-3 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Profile saved successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl border transition-colors cursor-pointer text-xs font-semibold ${
                savedSuccess
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#E6C667] hover:bg-[#D4AF37] hover:text-[#080706]'
                  : 'border-[#D4AF37]/20 text-[#A19B91] hover:text-white'
              }`}
            >
              {savedSuccess ? 'Done / Close' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving || savedSuccess}
              className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E6C667] disabled:opacity-80 text-[#080706] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              ) : savedSuccess ? (
                <><CheckCircle2 className="w-3.5 h-3.5 text-[#080706]" /> Saved!</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Save Setup</>
              )}
            </button>
          </div>
        </form>

        {/* Security Footer */}
        <div className="p-3.5 bg-[#080706] border-t border-[#D4AF37]/15 flex items-center justify-between text-[10px] text-[#A19B91]">
          <span className="flex items-center gap-1">
            <Key className="w-3 h-3 text-[#D4AF37]" /> Password protected account
          </span>
          <span className="text-[#D4AF37] font-serif font-bold">SpendWise Enterprise</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
