import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  PieChart, 
  Wallet, 
  ArrowLeftRight, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Bell,
  ChevronDown
} from 'lucide-react';
import NotificationsModal from './NotificationsModal';
import ProfileModal from './ProfileModal';
import { useCurrency } from '../context/CurrencyContext';

export default function Navbar({ activeTab = 'Home', onTabChange, onProfileUpdate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const currencyMenuRef = useRef(null);
  const { currency, switchCurrency, CURRENCIES } = useCurrency();

  // Close currency menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(e.target)) {
        setShowCurrencyMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Retrieve user from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    let u = { name: 'Satya', email: 'satya@spendwise.io' };
    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name || parsed.email) u = parsed;
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
    return u;
  });

  const handleProfileSave = (updatedUser) => {
    setUser(updatedUser);
    if (onProfileUpdate) {
      onProfileUpdate(updatedUser);
    }
  };

  const navItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Analytics', icon: PieChart, path: '/analytics' },
    { name: 'Budget', icon: Wallet, path: '/budget' },
    { name: 'Transactions', icon: ArrowLeftRight, path: '/transactions' },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavClick = (item) => {
    navigate(item.path);
    if (onTabChange) {
      onTabChange(item.name);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#12100E]/90 backdrop-blur-2xl border-b border-[#D4AF37]/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          
          {/* ========================================================================= */}
          {/* LEFT: BRAND LOGO WITH GOLD CREST                                         */}
          {/* ========================================================================= */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1E1B17] via-[#12100E] to-[#0A0908] border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.25)] transform rotate-45 transition-transform duration-500 group-hover:rotate-[225deg]">
                <div className="transform -rotate-45 group-hover:-rotate-[225deg] transition-transform duration-500">
                  <Sparkles className="w-4 h-4 text-[#E6C667]" />
                </div>
              </div>
              {/* Ambient gold beacon */}
              <div className="absolute inset-0 bg-[#D4AF37]/20 blur-md rounded-full -z-10" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span 
                  className="text-xl font-serif tracking-tight text-white font-medium"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Spend<span className="gold-metallic-text font-bold">Wise</span>
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#A19B91] font-medium hidden sm:block">
                Sovereign Wealth
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER: HORIZONTAL NAVIGATION PILLS                                      */}
          {/* ========================================================================= */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#080706]/90 p-1 rounded-full border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#080706] shadow-[0_0_15px_rgba(212,175,55,0.35)] font-semibold'
                      : 'text-[#A19B91] hover:text-[#E6C667] hover:bg-[#D4AF37]/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#080706]' : 'text-[#D4AF37]'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* ========================================================================= */}
          {/* RIGHT: USER PROFILE INDICATOR & SIGN OUT BUTTON                          */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-3">
            
            {/* Functional Notifications Alert Button */}
            <button 
              onClick={() => setShowNotifications(true)}
              title="Notifications & Alerts"
              className="w-8 h-8 rounded-full bg-[#080706]/80 border border-[#D4AF37]/20 flex items-center justify-center text-[#A19B91] hover:text-[#E6C667] hover:border-[#D4AF37]/60 hover:shadow-[0_0_12px_rgba(212,175,55,0.3)] transition-all cursor-pointer relative"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_6px_#D4AF37]" />
            </button>

            {/* Currency Switcher */}
            <div className="relative" ref={currencyMenuRef}>
              <button
                onClick={() => setShowCurrencyMenu(v => !v)}
                title="Switch Currency"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#080706]/80 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:shadow-[0_0_12px_rgba(212,175,55,0.3)] transition-all cursor-pointer text-[#E6C667] text-xs font-bold"
              >
                <span>{currency.symbol}</span>
                <span className="hidden sm:inline text-[10px] tracking-wider">{currency.code}</span>
                <ChevronDown className={`w-3 h-3 text-[#A19B91] transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} />
              </button>
              {showCurrencyMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-[#12100E] border border-[#D4AF37]/30 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-[9999] overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#D4AF37]/15">
                    <span className="text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold">Display Currency</span>
                  </div>
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { switchCurrency(c.code); setShowCurrencyMenu(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-all cursor-pointer ${
                        currency.code === c.code
                          ? 'bg-[#D4AF37]/15 text-[#E6C667] font-semibold'
                          : 'text-[#A19B91] hover:bg-[#D4AF37]/08 hover:text-[#E6C667]'
                      }`}
                    >
                      <span className="text-base w-5 text-center">{c.symbol}</span>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-[10px]">{c.code}</span>
                        <span className="text-[9px] text-[#A19B91]">{c.label}</span>
                      </div>
                      {currency.code === c.code && (
                        <span className="ml-auto text-[#D4AF37] text-[10px]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive User Profile Chip */}
            <div 
              onClick={() => setShowProfile(true)}
              title="Click to view & edit Profile Setup"
              className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-full bg-[#080706]/70 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-[#181410] transition-all cursor-pointer group shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF4D0] p-[1px] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.2)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#12100E] flex items-center justify-center text-[#E6C667] text-xs font-bold font-serif">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white tracking-tight leading-tight capitalize truncate max-w-[110px] group-hover:text-[#E6C667] transition-colors">
                  {user.name || 'Member'}
                </span>
                <span className="text-[9px] text-[#D4AF37] font-medium tracking-wider flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 inline" /> Vault Member
                </span>
              </div>
            </div>

            {/* Sign Out Action Button */}
            <button
              onClick={handleSignOut}
              className="border border-[#D4AF37]/30 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#E6C667] hover:text-[#080706] text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center gap-1.5 cursor-pointer group"
            >
              <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer/Modal */}
      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* Profile Setup Modal */}
      <ProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)}
        user={user}
        onSaveProfile={handleProfileSave}
      />
    </>
  );
}

