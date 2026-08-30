import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Wallet, CreditCard, TrendingUp, ShieldCheck, Coins, PiggyBank,
  ArrowLeftRight, Plus, Search, Download, RefreshCw,
  ShoppingBag, Home as HomeIcon, Zap, Heart, Plane, BookOpen,
  X, ChevronDown, AlertCircle, CheckCircle2, Loader2,
  LayoutDashboard, PieChart, BarChart3
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const api = () => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${getToken()}` } });

// Indian Rupee formatter
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const fmtFull = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const catIcon  = { Housing: HomeIcon, Food: BookIcon, Bills: Zap, Health: Heart, Travel: Plane, Shopping: ShoppingBag, Savings: PiggyBank };
function BookIcon(p) { return <BookOpen {...p} />; }
const catColor = { Housing:'#6366f1', Food:'#f59e0b', Bills:'#3b82f6', Health:'#ec4899', Travel:'#8b5cf6', Shopping:'#f97316', Savings:'#10b981' };
const acctMeta = {
  checking:  { label:'Current Account',     badge:'CURRENT',   icon: CreditCard, color:'#D4AF37' },
  saving:    { label:'Savings Account',      badge:'SAVINGS',   icon: ShieldCheck,color:'#4ade80' },
  investing: { label:'Investment Portfolio', badge:'PORTFOLIO', icon: TrendingUp, color:'#818cf8' },
  cash:      { label:'Cash Reserve',         badge:'CASH',      icon: Coins,      color:'#fb923c' },
};

function formatDate(d) {
  const date = new Date(d);
  const today = new Date();
  const yest  = new Date(); yest.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yest.toDateString())  return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────
const sparkPaths = {
  checking:  'M0,22 C8,20,16,24,26,16 S42,8,52,4',
  saving:    'M0,24 C10,22,20,16,32,12 S46,6,52,3',
  investing: 'M0,26 C10,22,22,14,32,8  S44,3,52,1',
  cash:      'M0,20 C10,20,22,22,32,20 S46,20,52,18',
};
function Sparkline({ id, positive = true }) {
  return (
    <svg viewBox="0 0 52 28" className="w-14 h-7">
      <path d={sparkPaths[id] || sparkPaths.checking} fill="none"
        stroke={positive ? '#4ade80' : '#f87171'} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Full-width Balance Chart (SVG) ───────────────────────────────────────────
function BalanceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#A19B91]">
        <TrendingUp className="w-8 h-8 text-[#D4AF37]/30" />
        <span className="text-xs">No timeline data yet. Add transactions to see your chart.</span>
      </div>
    );
  }
  const W = 900; const H = 160;
  const vals = data.map(d => d.balance);
  const min = Math.min(...vals); const max = Math.max(...vals);
  const rng = max - min || 1;
  const pts = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * W,
    y: H - ((d.balance - min) / rng) * (H - 24) - 12,
  }));
  const pathD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, '');
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8C6B10" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#FFF4D0" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d={areaD} fill="url(#ag)" />
      <path d={pathD} fill="none" stroke="#D4AF37" strokeWidth="8" opacity="0.18" />
      <path d={pathD} fill="none" stroke="url(#lg)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />
      {last && (
        <>
          <circle cx={last.x} cy={last.y} r="5" fill="#FFF4D0" stroke="#D4AF37" strokeWidth="2" />
          <circle cx={last.x} cy={last.y} r="10" fill="#D4AF37" opacity="0.22">
            <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.22;0;0.22" dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

// ─── Add Transaction Modal ─────────────────────────────────────────────────────
function AddTxModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title:'', merchant:'', amount:'', type:'expense',
    category:'Food', accountType:'checking',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.merchant || !form.amount) { setErr('Please fill all required fields.'); return; }
    setLoading(true); setErr('');
    try {
      await api().post('/transactions', { ...form, amount: parseFloat(form.amount) });
      onSuccess(); onClose();
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to add.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background:'rgba(8,7,6,0.88)', backdropFilter:'blur(10px)' }}>
      <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/30 bg-[#0e0c0a]"
        style={{ boxShadow:'0 0 60px rgba(212,175,55,0.15), inset 0 1px 0 rgba(212,175,55,0.08)' }}>
        <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/15">
          <div>
            <h2 className="text-sm font-bold text-white font-serif" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>Add Transaction</h2>
            <p className="text-[10px] text-[#A19B91] mt-0.5">Record income, expense, or savings</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#A19B91] hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3.5">
          {/* Type */}
          <div className="grid grid-cols-3 gap-2">
            {['income','expense','saving'].map(t => (
              <button key={t} type="button" onClick={() => set('type', t)}
                className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  form.type===t
                    ? t==='income'  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                    : t==='expense' ? 'bg-red-950/60 border-red-500/50 text-red-400'
                    :                 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#E6C667]'
                    : 'border-[#D4AF37]/15 text-[#A19B91] hover:border-[#D4AF37]/30'
                }`}>
                {t==='income' ? '↑ Income' : t==='expense' ? '↓ Expense' : '⊕ Saving'}
              </button>
            ))}
          </div>
          {[
            { label:'Title *',          key:'title',    type:'text',   placeholder:'e.g. Monthly salary' },
            { label:'Merchant / Source *', key:'merchant', type:'text',placeholder:'e.g. Google India' },
            { label:'Amount (₹) *',     key:'amount',   type:'number', placeholder:'0' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">{f.label}</label>
              <input value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                type={f.type} placeholder={f.placeholder} min={f.type==='number' ? 0 : undefined}
                className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white placeholder-[#524D46] outline-none transition-colors" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Category', key:'category', opts:['Housing','Food','Bills','Health','Travel','Shopping','Savings'] },
              { label:'Account',  key:'accountType', opts:['checking','saving','investing','cash'], display:{ checking:'Current', saving:'Savings', investing:'Investment', cash:'Cash' } },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">{f.label}</label>
                <div className="relative">
                  <select value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                    className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none transition-colors">
                    {f.opts.map(o => <option key={o} value={o}>{f.display ? f.display[o] : o}</option>)}
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#D4AF37] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Date</label>
            <input value={form.date} onChange={e => set('date', e.target.value)} type="date"
              className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors" />
          </div>
          {err && (
            <div className="flex items-center gap-2 text-red-400 text-[10px] bg-red-950/30 border border-red-500/25 rounded-xl px-3 py-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0" /> {err}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-[#D4AF37]/20 text-[#A19B91] hover:text-white text-xs font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E6C667] text-[#080706] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] disabled:opacity-60 flex items-center justify-center gap-1.5">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {loading ? 'Saving…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const homeRef        = useRef(null);
  const analyticsRef   = useRef(null);
  const budgetRef      = useRef(null);
  const txRef          = useRef(null);

  // API data
  const [accounts,  setAccounts]  = useState(null);
  const [insights,  setInsights]  = useState(null);
  const [timeline,  setTimeline]  = useState([]);
  const [txList,    setTxList]    = useState([]);

  // Loading / error
  const [pageLoading, setPageLoading] = useState(true);
  const [txLoading,   setTxLoading]   = useState(false);
  const [pageError,   setPageError]   = useState('');

  // UI state
  const [activeTab,  setActiveTab]  = useState('Home');
  const [timeRange,  setTimeRange]  = useState('monthly');
  const [txFilter,   setTxFilter]   = useState('All');
  const [txSearch,   setTxSearch]   = useState('');
  const [showModal,  setShowModal]  = useState(false);

  let user = { name:'User' };
  try { const s = localStorage.getItem('user'); if (s) user = JSON.parse(s); } catch (_) {}

  // ── API fetchers ────────────────────────────────────────────────────────────
  const loadAccounts = useCallback(async () => {
    try { const r = await api().get('/analytics/accounts'); setAccounts(r.data); } catch (_) {}
  }, []);

  const loadInsights = useCallback(async () => {
    try { const r = await api().get('/analytics/insights'); setInsights(r.data); } catch (_) {}
  }, []);

  const loadTimeline = useCallback(async (period) => {
    try { const r = await api().get(`/analytics/timeline?period=${period}`); setTimeline(r.data.timelineData || []); } catch (_) {}
  }, []);

  const loadTransactions = useCallback(async (filter, search) => {
    setTxLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const r = await api().get('/transactions', { params });
      let data = r.data.transactions || [];
      if (filter === 'Income')  data = data.filter(t => t.type === 'income');
      if (filter === 'Expense') data = data.filter(t => t.type === 'expense');
      if (filter === 'Saving')  data = data.filter(t => t.type === 'saving');
      setTxList(data);
    } catch (_) {}
    finally { setTxLoading(false); }
  }, []);

  const loadAll = useCallback(async () => {
    setPageLoading(true); setPageError('');
    if (!getToken()) { setPageError('Please sign in to continue.'); setPageLoading(false); return; }
    await Promise.all([loadAccounts(), loadInsights(), loadTimeline(timeRange), loadTransactions(txFilter, txSearch)]);
    setPageLoading(false);
  }, [loadAccounts, loadInsights, loadTimeline, loadTransactions, timeRange, txFilter, txSearch]);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadTransactions(txFilter, txSearch); }, [txFilter, txSearch]);
  useEffect(() => { loadTimeline(timeRange); }, [timeRange]);

  // ── Smooth scroll nav ───────────────────────────────────────────────────────
  const scrollTo = (tab) => {
    const map = { Home: homeRef, Analytics: analyticsRef, Budget: budgetRef, Transactions: txRef };
    map[tab]?.current?.scrollIntoView({ behavior:'smooth', block:'start' });
    setActiveTab(tab);
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const balances   = accounts?.accountBalances ?? { checking:0, saving:0, investing:0, cash:0 };
  const totalBal   = accounts?.totalBalance    ?? 0;
  const growth     = accounts?.percentageGrowth ?? 0;
  const monthInc   = insights?.currentMonthIncome  ?? 0;
  const monthExp   = insights?.currentMonthExpense ?? 0;
  const saveRate   = insights?.savingRate ?? 0;
  const score      = insights?.spendingScore ?? 0;
  const netWorth   = insights?.netWorth ?? 0;

  const acctOrder  = ['checking','saving','investing','cash'];

  // Category totals from loaded transactions
  const catTotals = {};
  txList.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  // ── Loading state ───────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="h-screen w-full flex flex-col" style={{ background:'radial-gradient(ellipse at 65% 0%, #1c1507 0%, #080706 60%)' }}>
        <Navbar activeTab={activeTab} onTabChange={scrollTo} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
          <p className="text-[#A19B91] text-sm">Loading your financial data…</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="h-screen w-full flex flex-col" style={{ background:'#080706' }}>
        <Navbar activeTab={activeTab} onTabChange={scrollTo} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-red-400 font-semibold text-sm">{pageError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col text-white"
      style={{ background:'radial-gradient(ellipse at 65% 0%, #1c1507 0%, #080706 60%)' }}>

      {/* Ambient glow */}
      <div className="fixed w-[600px] h-[600px] -top-60 -right-40 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
      <div className="fixed w-[400px] h-[400px] bottom-0 -left-20 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />

      {showModal && <AddTxModal onClose={() => setShowModal(false)} onSuccess={() => loadAll()} />}

      <Navbar activeTab={activeTab} onTabChange={scrollTo} />

      {/* ── Scrollable page body ────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-5 lg:px-8 py-5 space-y-8">

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1 ─ HOME (header banner + 2-col grid)
        ══════════════════════════════════════════════════════════════════════ */}
        <section ref={homeRef} id="home" className="space-y-4 scroll-mt-20">

          {/* ── Header banner ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0e0c0a]/70 backdrop-blur-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ boxShadow:'0 4px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.07)' }}>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#D4AF37]">Sovereign Portfolio</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]"
                  style={{ animation:'pulse 2s infinite' }} />
              </div>
              <h1 className="text-xl font-bold tracking-tight font-serif"
                style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                Welcome back, <span className="gold-metallic-text">{user.name}</span>
              </h1>
              <p className="text-[11px] text-[#A19B91] mt-0.5">
                {growth >= 0
                  ? <>Portfolio up <span className="text-[#E6C667] font-semibold">+{fmt(Math.abs(growth))} ({Math.abs(growth)}%)</span> this month</>
                  : <>Portfolio down <span className="text-red-400 font-semibold">-{fmt(Math.abs(growth))} ({Math.abs(growth)}%)</span> this month</>
                }
              </p>
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-[#080706]/70 border border-[#D4AF37]/15 rounded-xl px-4 py-2.5 min-w-[110px]">
                <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-medium mb-0.5">Monthly Inflow</span>
                <span className="block text-sm font-bold text-emerald-400 font-serif">{fmt(monthInc)}</span>
                <span className="block text-[9px] text-emerald-400">↑ This month</span>
              </div>
              <div className="bg-[#080706]/70 border border-[#D4AF37]/15 rounded-xl px-4 py-2.5 min-w-[110px]">
                <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-medium mb-0.5">Monthly Outflow</span>
                <span className="block text-sm font-bold text-white font-serif">-{fmt(monthExp)}</span>
                <span className="block text-[9px] text-[#A19B91]">Expenses</span>
              </div>
              <div className="bg-[#080706]/70 border border-[#D4AF37]/15 rounded-xl px-4 py-2.5 min-w-[110px]">
                <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-medium mb-0.5">Vault Health</span>
                <span className="block text-sm font-bold text-white font-serif">{score} / 100</span>
                <span className="block text-[9px] text-emerald-400">★ Saving {saveRate}%</span>
              </div>

              <div className="flex items-center gap-2 pl-2">
                <button onClick={() => loadAll()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10px] font-semibold transition-all">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E6C667] text-[#080706] text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(212,175,55,0.25)]">
                  <Plus className="w-3.5 h-3.5" /> Add Transaction
                </button>
              </div>
            </div>
          </div>

          {/* ── 2-column grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-5">

            {/* ── LEFT col: Accounts sidebar (4 cols) ─────────────────────── */}
            <aside className="col-span-4 flex flex-col gap-3">

              {/* Section header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Accounts &amp; Vaults</span>
                </div>
                <span className="text-[9px] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-2 py-0.5 rounded-full">
                  {acctOrder.length} Active
                </span>
              </div>

              {/* Total net worth card */}
              <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-br from-[#1a1608]/90 to-[#0a0908]/90 px-5 py-4 relative overflow-hidden"
                style={{ boxShadow:'0 0 28px rgba(212,175,55,0.12), inset 0 1px 0 rgba(212,175,55,0.1)' }}>
                <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full opacity-20"
                  style={{ background:'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold block mb-0.5">Total Net Worth</span>
                <span className="text-2xl font-bold font-serif text-white block"
                  style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                  {fmtFull(netWorth)}
                </span>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    growth >= 0
                      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                      : 'text-red-400 bg-red-950/40 border-red-500/30'
                  }`}>
                    {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}% this month
                  </span>
                </div>
              </div>

              {/* 4 account type cards */}
              {acctOrder.map(id => {
                const meta = acctMeta[id];
                const Icon = meta.icon;
                const bal  = balances[id] ?? 0;
                const pos  = bal >= 0;
                return (
                  <div key={id}
                    className="group rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 bg-[#0e0c0a]/80 backdrop-blur-xl px-4 py-3.5 cursor-pointer transition-all duration-300 hover:scale-[1.015] relative overflow-hidden"
                    style={{ boxShadow:'0 2px 16px rgba(0,0,0,0.5)' }}>
                    <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background:'radial-gradient(circle at top right, rgba(212,175,55,0.1) 0%, transparent 70%)' }} />

                    {/* Top row */}
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#080706] border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 flex items-center justify-center transition-colors flex-shrink-0">
                          <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-white leading-tight">{meta.label}</p>
                          <p className="text-[9px] text-[#A19B91]">All transactions</p>
                        </div>
                      </div>
                      <span className="text-[8px] uppercase tracking-wider font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">
                        {meta.badge}
                      </span>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-lg font-bold text-white font-serif block"
                          style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                          {fmtFull(bal)}
                        </span>
                        <p className="text-[9px] text-[#A19B91]">Based on your transactions</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <Sparkline id={id} positive={pos} />
                        <span className={`text-[10px] font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos ? '▲' : '▼'} Live
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Link account button */}
              <button onClick={() => setShowModal(true)}
                className="w-full py-2.5 rounded-2xl border border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 group">
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                Add Transaction
              </button>
            </aside>

            {/* ── RIGHT col: chart + ledger (8 cols) ────────────────────── */}
            <section className="col-span-8 flex flex-col gap-5">

              {/* ── Balance chart widget ─────────────────────────────────── */}
              <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#0e0c0a]/80 backdrop-blur-xl p-5"
                style={{ boxShadow:'0 4px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.06)' }}>

                {/* chart header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.22em] text-[#D4AF37] font-semibold block mb-0.5">Consolidated Valuation</span>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl font-bold font-serif text-white"
                        style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                        {fmtFull(totalBal)}
                      </span>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        growth >= 0
                          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                          : 'text-red-400 bg-red-950/40 border-red-500/30'
                      }`}>
                        {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}%
                      </span>
                    </div>
                  </div>

                  {/* time range pills */}
                  <div className="flex bg-[#080706]/90 p-0.5 rounded-full border border-[#D4AF37]/20 self-start sm:self-auto flex-shrink-0">
                    {[['weekly','1W'],['monthly','1M']].map(([val, label]) => (
                      <button key={val} onClick={() => setTimeRange(val)}
                        className={`px-3.5 py-1.5 text-[10px] font-semibold rounded-full transition-all duration-200 ${
                          timeRange === val
                            ? 'bg-[#D4AF37] text-[#080706] font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                            : 'text-[#A19B91] hover:text-[#E6C667]'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* chart */}
                <div className="w-full rounded-xl overflow-hidden border border-[#D4AF37]/10 bg-[#080706]/40"
                  style={{ height:'170px' }}>
                  <BalanceChart data={timeline} />
                </div>

                {/* x-axis labels */}
                {timeline.length > 0 && (
                  <div className="flex justify-between text-[9px] text-[#524D46] font-mono mt-2 px-1">
                    {timeline.map((d, i) => (
                      <span key={i}>{timeRange === 'monthly' ? d.month : d.week}</span>
                    ))}
                  </div>
                )}

                {/* metric footer */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#D4AF37]/10 text-center">
                  {[
                    { label:'Monthly Income',  value: fmt(monthInc),  cls:'text-emerald-400' },
                    { label:'Monthly Expense', value: fmt(monthExp),  cls:'text-red-400'     },
                    { label:'Saving Rate',     value:`${saveRate}%`,  cls:'text-[#E6C667]'  },
                  ].map(m => (
                    <div key={m.label}>
                      <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-medium">{m.label}</span>
                      <span className={`block text-xs font-bold font-serif mt-0.5 ${m.cls}`}
                        style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Transaction Ledger widget ────────────────────────────── */}
              <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#0e0c0a]/80 backdrop-blur-xl p-5 flex flex-col"
                style={{ boxShadow:'0 4px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.06)' }}>

                {/* ledger header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Transaction Ledger
                    </h3>
                    <p className="text-[9px] text-[#A19B91] mt-0.5">Verified sovereign financial activity</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* filter */}
                    <div className="flex bg-[#080706]/90 p-0.5 rounded-full border border-[#D4AF37]/20">
                      {['All','Income','Expense','Saving'].map(f => (
                        <button key={f} onClick={() => setTxFilter(f)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                            txFilter === f
                              ? 'bg-[#D4AF37] text-[#080706] font-bold shadow-[0_0_8px_rgba(212,175,55,0.25)]'
                              : 'text-[#A19B91] hover:text-[#E6C667]'
                          }`}>
                          {f}
                        </button>
                      ))}
                    </div>
                    {/* search */}
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60" />
                      <input value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Search..."
                        className="bg-[#080706]/80 border border-[#D4AF37]/20 rounded-full pl-7 pr-3 py-1 text-[10px] text-white placeholder-[#524D46] focus:border-[#D4AF37] focus:outline-none w-28 transition-all" />
                    </div>
                  </div>
                </div>

                {/* column headers */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5 rounded-lg bg-[#080706]/60 border border-[#D4AF37]/10 mb-1 text-[9px] uppercase tracking-widest text-[#524D46] font-bold">
                  <span>Description</span>
                  <span className="text-center pr-2">Category</span>
                  <span className="text-right">Amount</span>
                </div>

                {/* rows */}
                <div className="divide-y divide-[#D4AF37]/8">
                  {txLoading ? (
                    <div className="py-8 flex items-center justify-center gap-2 text-[#A19B91] text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </div>
                  ) : txList.length === 0 ? (
                    <div className="py-8 text-center">
                      <ArrowLeftRight className="w-7 h-7 text-[#D4AF37]/25 mx-auto mb-2" />
                      <p className="text-xs text-[#A19B91]">No transactions yet.</p>
                      <button onClick={() => setShowModal(true)}
                        className="mt-2 text-[#D4AF37] text-xs font-semibold hover:underline">
                        + Add your first transaction
                      </button>
                    </div>
                  ) : (
                    txList.map(tx => {
                      const Icon  = catIcon[tx.category] || Coins;
                      const color = catColor[tx.category] || '#D4AF37';
                      const isInc = tx.type === 'income';
                      const isSav = tx.type === 'saving';
                      return (
                        <div key={tx._id}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[#D4AF37]/5 transition-all cursor-pointer group">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center border"
                              style={{ background:`${color}15`, borderColor:`${color}30` }}>
                              <Icon className="w-3 h-3" style={{ color }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-white truncate group-hover:text-[#E6C667] transition-colors">{tx.title}</p>
                              <p className="text-[9px] text-[#A19B91]">{formatDate(tx.date)} <span className="text-[#D4AF37]/60">• {tx.accountType}</span></p>
                            </div>
                          </div>
                          <span className="text-[9px] text-[#A19B91] border border-[#D4AF37]/15 px-2 py-0.5 rounded bg-[#080706]/60 whitespace-nowrap">
                            {tx.category}
                          </span>
                          <span className={`text-xs font-bold font-serif whitespace-nowrap text-right ${
                            isInc ? 'text-emerald-400' : isSav ? 'text-[#E6C667]' : 'text-white'
                          }`} style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                            {isInc ? '+' : isSav ? '⊕' : '-'}{fmtFull(tx.amount)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* footer */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#D4AF37]/10 text-[10px] text-[#A19B91]">
                  <span>Showing {txList.length} of {txList.length} entries</span>
                  <button className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#E6C667] transition-colors font-semibold group">
                    Export <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2 ─ ANALYTICS
        ══════════════════════════════════════════════════════════════════════ */}
        <section ref={analyticsRef} id="analytics" className="space-y-4 scroll-mt-20 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-[#D4AF37]" />
            <h2 className="text-sm font-bold text-white font-serif" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>Analytics</h2>
            <PieChart className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'Total Income',  value: insights?.totalIncome  ?? 0, color:'#4ade80', icon: TrendingUp   },
              { label:'Total Expense', value: insights?.totalExpense ?? 0, color:'#f87171', icon: TrendingDown  },
              { label:'Total Savings', value: insights?.totalSavings ?? 0, color:'#D4AF37', icon: PiggyBank    },
              { label:'Net Worth',     value: netWorth,                     color:'#818cf8', icon: Wallet       },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-[#D4AF37]/20 bg-[#0e0c0a]/80 backdrop-blur-xl px-5 py-4"
                  style={{ boxShadow:'0 2px 20px rgba(0,0,0,0.5)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                    <div className="w-7 h-7 rounded-full" style={{ background:`${item.color}18`, border:`1px solid ${item.color}30` }} />
                  </div>
                  <p className="text-[9px] text-[#A19B91] uppercase tracking-wider font-medium">{item.label}</p>
                  <p className="text-lg font-bold font-serif mt-0.5" style={{ color: item.color, fontFamily:'"Playfair Display",Georgia,serif' }}>
                    {fmt(item.value)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Spending score */}
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0e0c0a]/80 backdrop-blur-xl px-6 py-5"
            style={{ boxShadow:'0 2px 20px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#A19B91] font-semibold">Spending Health Score</span>
                <p className="text-[9px] text-[#A19B91] mt-0.5">Based on your income vs expense ratio</p>
              </div>
              <span className="text-3xl font-bold text-[#E6C667] font-serif"
                style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                {score}<span className="text-base text-[#A19B91] font-normal">/100</span>
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#080706] border border-[#D4AF37]/15 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width:`${score}%`,
                  background: score > 70 ? 'linear-gradient(90deg, #065f46, #4ade80)'
                            : score > 40 ? 'linear-gradient(90deg, #78350f, #D4AF37)'
                            : 'linear-gradient(90deg, #7f1d1d, #f87171)',
                }} />
            </div>
            {insights?.adviceChips?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#D4AF37]/10">
                {insights.adviceChips.map((chip, i) => (
                  <span key={i} className="text-[10px] text-[#E6C667] bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-3 py-1">
                    💡 {chip}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 3 ─ BUDGET
        ══════════════════════════════════════════════════════════════════════ */}
        <section ref={budgetRef} id="budget" className="space-y-4 scroll-mt-20 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-[#D4AF37]" />
            <h2 className="text-sm font-bold text-white font-serif" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>Budget by Category</h2>
            <BarChart3 className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0e0c0a]/80 backdrop-blur-xl p-5"
            style={{ boxShadow:'0 2px 20px rgba(0,0,0,0.5)' }}>
            {txList.filter(t => t.type === 'expense').length === 0 ? (
              <p className="text-center text-xs text-[#A19B91] py-6">
                No expense transactions yet. Add some to see your budget breakdown.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {['Housing','Food','Bills','Health','Travel','Shopping','Savings'].map(cat => {
                  const Icon  = catIcon[cat] || Coins;
                  const color = catColor[cat] || '#D4AF37';
                  const total = catTotals[cat] || 0;
                  const allExp = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                  const pct = allExp > 0 ? Math.round((total / allExp) * 100) : 0;
                  return (
                    <div key={cat} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#D4AF37]/15 bg-[#080706]/40 hover:border-[#D4AF37]/35 transition-colors">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <span className="text-[9px] text-[#A19B91] font-medium text-center uppercase tracking-wider">{cat}</span>
                      <span className="text-[10px] font-bold text-center" style={{ color }}>{fmt(total)}</span>
                      {total > 0 && (
                        <span className="text-[8px] text-[#A19B91]">{pct}% of expenses</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 4 ─ TRANSACTIONS (full-width table)
        ══════════════════════════════════════════════════════════════════════ */}
        <section ref={txRef} id="transactions" className="space-y-4 scroll-mt-20 pb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-[#D4AF37]" />
              <h2 className="text-sm font-bold text-white font-serif" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>All Transactions</h2>
              <span className="text-[9px] text-[#A19B91] border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">{txList.length} records</span>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-semibold transition-all">
              <Plus className="w-3 h-3" /> New
            </button>
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0e0c0a]/80 backdrop-blur-xl overflow-hidden"
            style={{ boxShadow:'0 4px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.06)' }}>
            {/* headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#D4AF37]/10 text-[9px] uppercase tracking-widest text-[#524D46] font-bold">
              <span>Description</span>
              <span>Category</span>
              <span>Account</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
            </div>
            {txList.length === 0 ? (
              <div className="py-10 text-center">
                <ArrowLeftRight className="w-8 h-8 text-[#D4AF37]/25 mx-auto mb-2" />
                <p className="text-xs text-[#A19B91]">No transactions yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#D4AF37]/8">
                {txList.map(tx => {
                  const Icon  = catIcon[tx.category] || Coins;
                  const color = catColor[tx.category] || '#D4AF37';
                  const isInc = tx.type === 'income';
                  const isSav = tx.type === 'saving';
                  return (
                    <div key={tx._id}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3 hover:bg-[#D4AF37]/4 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border"
                          style={{ background:`${color}15`, borderColor:`${color}30` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate group-hover:text-[#E6C667] transition-colors">{tx.title}</p>
                          <p className="text-[9px] text-[#A19B91] truncate">{tx.merchant}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-[#A19B91] border border-[#D4AF37]/15 px-2 py-0.5 rounded bg-[#080706]/60 whitespace-nowrap">{tx.category}</span>
                      <span className="text-[9px] text-[#A19B91] border border-[#D4AF37]/15 px-2 py-0.5 rounded bg-[#080706]/60 whitespace-nowrap capitalize">{tx.accountType}</span>
                      <span className="text-[10px] text-[#A19B91] whitespace-nowrap">{formatDate(tx.date)}</span>
                      <span className={`text-sm font-bold font-serif whitespace-nowrap text-right ${
                        isInc ? 'text-emerald-400' : isSav ? 'text-[#E6C667]' : 'text-white'
                      }`} style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                        {isInc ? '+' : isSav ? '⊕' : '-'}{fmtFull(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {txList.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#D4AF37]/10 text-[10px] text-[#A19B91]">
                <span>{txList.length} transaction{txList.length !== 1 ? 's' : ''} shown</span>
                <button className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#E6C667] font-semibold group transition-colors">
                  Export CSV <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

// Need TrendingDown for analytics section
function TrendingDown(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
