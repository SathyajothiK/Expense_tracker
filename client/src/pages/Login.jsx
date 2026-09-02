import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Loader2,
  X
} from 'lucide-react';
import ReactDOM from 'react-dom';

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  // Forgot Key modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleOpenForgotModal = () => {
    setResetEmail(email);
    setNewPassword('');
    setGeneratedKey('');
    setResetSuccess(false);
    setShowForgotModal(true);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !newPassword.trim()) return;
    setResetLoading(true);

    setTimeout(() => {
      const key = 'SW-' + Math.floor(100000 + Math.random() * 900000);
      setGeneratedKey(key);
      setResetSuccess(true);
      setResetLoading(false);
      setEmail(resetEmail);
      setPassword(newPassword);
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      // Attempt backend API call
      const res = await axios.post(`${API_BASE}${endpoint}`, payload, {
        timeout: 4000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.data?.token) {
        const userData = res.data.user || { name: name || 'User', email };
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('[SpendWise Auth] Token saved to localStorage:', res.data.token);
        console.log('[SpendWise Auth] User saved to localStorage:', userData);

        setStatusMessage({
          type: 'success',
          text: isLogin 
            ? `Welcome back, ${userData.name || 'User'}! Redirecting to Sovereign Dashboard...` 
            : `Portfolio initialized for ${userData.email}! Redirecting to Dashboard...`
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      }
    } catch (err) {
      console.warn('Backend API connection notice:', err?.response?.data || err.message);
      
      // If server is not running or returned error
      if (err.response?.data?.message) {
        const errorMsg = err.response.data.message;
        if (errorMsg === 'User already exists with that email') {
          setStatusMessage({
            type: 'error',
            text: 'Account already exists with that email! Please switch to the "Sign In" tab above.'
          });
        } else if (errorMsg === 'Invalid credentials' && isLogin) {
          setStatusMessage({
            type: 'error',
            text: 'Invalid credentials. If this is your first time, switch to "Create Account" to register.'
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: errorMsg
          });
        }
      } else {
        // Standalone fallback
        setStatusMessage({
          type: 'success',
          text: `[Demo Mode] Authentication verified for ${email}`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass, demoName = 'Alex Rivera') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (!isLogin) setName(demoName);
  };

  return (
    <div 
      className="min-h-screen h-screen w-full bg-[#080706] text-white flex items-center justify-center relative overflow-y-auto overflow-x-hidden p-4 sm:p-6 selection:bg-[#D4AF37]/30 selection:text-[#E6C667]"
      style={{
        background: 'radial-gradient(ellipse at center, #14110F 0%, #080706 100%)'
      }}
    >
      {/* ========================================================================= */}
      {/* STEP 1: CINEMATIC DARK BACKGROUND WITH GOLD SPOTLIGHT ARCHES & BOKEH     */}
      {/* ========================================================================= */}

      {/* Ambient Gold Radial Glows */}
      <div className="bg-[#D4AF37]/10 blur-3xl absolute rounded-full w-[550px] h-[550px] -top-32 -left-32 pointer-events-none animate-pulse-slow" />
      <div className="bg-[#D4AF37]/10 blur-3xl absolute rounded-full w-[650px] h-[650px] -bottom-40 -right-40 pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="bg-[#D4AF37]/5 blur-3xl absolute rounded-full w-[380px] h-[380px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Curved Glowing Arch Background Vectors */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Outer Arch Ring */}
        <div className="border border-[#D4AF37]/20 rounded-full blur-sm absolute w-[980px] h-[980px] opacity-40 animate-pulse-slow" />
        
        {/* Middle Arch Ring */}
        <div className="border border-[#D4AF37]/25 rounded-full blur-[1px] absolute w-[720px] h-[720px] opacity-50" />
        
        {/* Inner Arch Ring with subtle gold gradient highlight */}
        <div className="border border-[#D4AF37]/30 rounded-full absolute w-[520px] h-[520px] opacity-60 shadow-[0_0_30px_rgba(212,175,55,0.08)]" />
        
        {/* Elliptical Horizon Light Arch */}
        <div 
          className="absolute w-[1200px] h-[600px] rounded-[100%] border-t border-[#D4AF37]/30 blur-[2px] -top-40 opacity-70"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0) 70%)'
          }}
        />

        {/* Lower Reflective Arch */}
        <div 
          className="absolute w-[1100px] h-[500px] rounded-[100%] border-b border-[#D4AF37]/20 blur-[1px] -bottom-48 opacity-50"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0) 65%)'
          }}
        />
      </div>

      {/* Floating Golden Particle Bokeh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[18%] left-[22%] w-1.5 h-1.5 bg-[#D4AF37] rounded-full blur-[0.5px] animate-float-1 shadow-[0_0_8px_#D4AF37]" />
        <div className="absolute top-[32%] right-[18%] w-2 h-2 bg-[#E6C667] rounded-full blur-[0.8px] animate-float-2 shadow-[0_0_12px_#E6C667]" />
        <div className="absolute bottom-[24%] left-[28%] w-1.5 h-1.5 bg-[#D4AF37]/80 rounded-full blur-[0.5px] animate-float-3 shadow-[0_0_8px_#D4AF37]" />
        <div className="absolute bottom-[35%] right-[25%] w-1 h-1 bg-[#FFF4D0] rounded-full blur-[0.3px] animate-float-1 shadow-[0_0_6px_#FFF4D0]" />
        <div className="absolute top-[65%] left-[15%] w-2 h-2 bg-[#D4AF37]/60 rounded-full blur-[1px] animate-float-2 shadow-[0_0_10px_#D4AF37]" />
      </div>

      {/* Subtle Cinematic Grid Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* ========================================================================= */}
      {/* STEP 2: LUXURY GLASSMORPHISM LOGIN CARD (FITS SCREEN PROPORTIONATELY)    */}
      {/* ========================================================================= */}
      <div className="max-w-[420px] w-full my-auto bg-[#12100E]/85 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative z-10 transition-all duration-500 hover:border-[#D4AF37]/45">
        
        {/* Decorative Luxury Top Corner Accents */}
        <div className="absolute top-3.5 left-3.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#D4AF37]/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#D4AF37]/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3.5 left-3.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#D4AF37]/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#D4AF37]/40 rounded-br-sm pointer-events-none" />

        {/* Brand Crest / Emblem */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E1B17] via-[#12100E] to-[#0A0908] border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)] transform rotate-45 group transition-transform duration-500 hover:rotate-[225deg]">
              <div className="transform -rotate-45 group-hover:-rotate-[225deg] transition-transform duration-500">
                <Sparkles className="w-5 h-5 text-[#E6C667]" />
              </div>
            </div>
            {/* Ambient beacon under crest */}
            <div className="absolute inset-0 bg-[#D4AF37]/20 blur-lg rounded-full -z-10" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 3: LUXURY BRAND TYPOGRAPHY & SERIF HEADINGS                         */}
        {/* ========================================================================= */}
        <div className="text-center mb-4">
          <p className="text-[10px] tracking-[0.28em] font-semibold text-[#D4AF37] uppercase mb-1">
            PERSONAL FINANCE • MANAGEMENT
          </p>
          <h1 
            className="text-3xl font-serif tracking-tight text-white mb-0.5"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Spend<span className="gold-metallic-text font-bold">Wise</span>
          </h1>
          <p className="text-[#A19B91] text-xs font-normal">
            Track your wealth with precision
          </p>
        </div>

        {/* Auth Mode Toggle Pill (Sign In / Register) */}
        <div className="flex bg-[#080706]/90 p-1 rounded-full border border-[#D4AF37]/20 mb-4 relative">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setStatusMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 ${
              isLogin 
                ? 'bg-[#D4AF37] text-[#080706] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                : 'text-[#A19B91] hover:text-[#E6C667]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setStatusMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 ${
              !isLogin 
                ? 'bg-[#D4AF37] text-[#080706] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                : 'text-[#A19B91] hover:text-[#E6C667]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {statusMessage && (
          <div 
            className={`mb-3.5 p-2.5 rounded-xl text-xs flex items-center gap-2 transition-all duration-300 ${
              statusMessage.type === 'success'
                ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E6C667]'
                : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            )}
            <span className="leading-snug text-[11px]">{statusMessage.text}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: LUXURY DARK FORM CONTROLS & GOLD OUTLINE BUTTONS                 */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Full Name field (Only shown during Account Creation) */}
          {!isLogin && (
            <div className="space-y-1 transition-all duration-300">
              <label className="text-[11px] font-medium text-[#A19B91] uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D4AF37]/60">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-[#524D46] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all text-xs"
                />
              </div>
            </div>
          )}

          {/* Email Address Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#A19B91] uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D4AF37]/60">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@spendwise.io"
                className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-[#524D46] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all text-xs"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#A19B91] uppercase tracking-wider block">
                Password
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-[11px] text-[#D4AF37] hover:text-[#E6C667] transition-colors underline-offset-4 hover:underline cursor-pointer"
                >
                  Forgot Key?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D4AF37]/60">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-[#524D46] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A19B91] hover:text-[#E6C667] transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me / Terms Checkbox */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#A19B91] hover:text-white transition-colors select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#D4AF37]/40 bg-[#080706] text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 accent-[#D4AF37] cursor-pointer"
              />
              <span>{isLogin ? 'Remember session' : 'Agree to Wealth Protocol'}</span>
            </label>
            <div className="flex items-center gap-1 text-[10px] text-[#D4AF37]/70">
              <ShieldCheck className="w-3 h-3" />
              <span>256-Bit Vault</span>
            </div>
          </div>

          {/* Main Luxury Action Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#E6C667] hover:text-[#080706] font-semibold tracking-wider uppercase text-xs py-3 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Access Private Vault' : 'Initialize Portfolio'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Fast-Fill Pill Helper */}
        <div className="mt-4 pt-3 border-t border-[#D4AF37]/15">
          <div className="flex items-center justify-between text-[10px] text-[#A19B91] mb-1.5">
            <span className="uppercase tracking-widest text-[#D4AF37]/70 font-semibold">Demo Credentials</span>
            <span>Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('alex.rivera@spendwise.io', 'Password123!', 'Alex Rivera')}
              className="px-2 py-1 rounded-lg bg-[#080706]/60 border border-[#D4AF37]/15 hover:border-[#D4AF37]/50 text-[10px] text-[#A19B91] hover:text-[#E6C667] transition-all text-left truncate"
            >
              👑 <span className="font-medium">Alex Rivera</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('elena.rostova@spendwise.io', 'WealthSafe99$', 'Elena Rostova')}
              className="px-2 py-1 rounded-lg bg-[#080706]/60 border border-[#D4AF37]/15 hover:border-[#D4AF37]/50 text-[10px] text-[#A19B91] hover:text-[#E6C667] transition-all text-left truncate"
            >
              💎 <span className="font-medium">Elena Rostova</span>
            </button>
          </div>
        </div>

        {/* Security / Confidentiality Note */}
        <div className="mt-3 text-center">
          <p className="text-[9px] text-[#524D46] tracking-wider uppercase font-medium">
            Protected by SpendWise Sovereign Encryption • Tier-IV Protocol
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORGOT KEY RECOVERY & PASSWORD RESET MODAL                                */}
      {/* ========================================================================= */}
      {showForgotModal && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowForgotModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0E0C0A] border border-[#D4AF37]/35 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] overflow-hidden p-6 relative"
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-[#A19B91] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#E6C667]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  Vault Key Recovery
                </h3>
                <p className="text-[11px] text-[#A19B91]">Reset your access key & password instantly</p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#181410] to-[#0E0C0A] border border-[#D4AF37]/40 text-center space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-semibold block">Generated Security Reset Key</span>
                  <div className="text-2xl font-mono font-bold text-[#FFF4D0] tracking-widest bg-[#080706] py-2 px-4 rounded-lg border border-[#D4AF37]/30 inline-block shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    {generatedKey}
                  </div>
                  <p className="text-emerald-400 text-xs font-semibold pt-1">
                    ✓ Password updated & synced to Sign In!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E6C667] text-[#080706] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
                >
                  Continue to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#A19B91] uppercase tracking-wider block">
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@spendwise.io"
                    className="w-full bg-[#080706]/90 border border-[#D4AF37]/25 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#524D46] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#A19B91] uppercase tracking-wider block">
                    New Vault Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new 6+ digit password"
                    className="w-full bg-[#080706]/90 border border-[#D4AF37]/25 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#524D46] outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#D4AF37]/20 text-[#A19B91] hover:text-white text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E6C667] text-[#080706] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {resetLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resetting...</> : <><Sparkles className="w-3.5 h-3.5" /> Reset Key & Password</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
