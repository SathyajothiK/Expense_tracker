import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Wallet, CreditCard, TrendingUp, TrendingDown, ShieldCheck, Coins, PiggyBank,
  ArrowLeftRight, Plus, Search, Download, RefreshCw,
  ShoppingBag, Home as HomeIcon, Zap, Heart, Plane, BookOpen,
  X, ChevronDown, AlertCircle, CheckCircle2, Loader2,
  LayoutDashboard, PieChart, BarChart3, Calendar
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const api = () => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${getToken()}` } });

// Indian Rupee formatter
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const fmtFull = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const catIcon  = { Housing: HomeIcon, Food: BookIcon, Bills: Zap, Health: Heart, Travel: Plane, Shopping: ShoppingBag, Savings: PiggyBank, Others: Coins };
function BookIcon(p) { return <BookOpen {...p} />; }
const catColor = { Housing:'#6366f1', Food:'#f59e0b', Bills:'#3b82f6', Health:'#ec4899', Travel:'#8b5cf6', Shopping:'#f97316', Savings:'#10b981', Others:'#94a3b8' };
const ALL_CATEGORIES = ['Housing','Food','Bills','Health','Travel','Shopping','Savings','Others'];
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

// ─── Image 2 Style Spline Balance & Valuation Chart ──────────────────────────
function Image3ValuationChart({ data, totalBal, activeType = 'all' }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  // 12-Month Multipliers recreating the curve wave
  // July (index 6) = 1.00 → always equals exactly the current totalBal on the active/peak point
  const multipliers = [
    { m: 'Jan', top: 0.38, sec: 0.18 },
    { m: 'Feb', top: 0.44, sec: 0.16 },
    { m: 'Mar', top: 0.48, sec: 0.32 },
    { m: 'Apr', top: 0.54, sec: 0.36 },
    { m: 'May', top: 0.66, sec: 0.28 },
    { m: 'Jun', top: 0.80, sec: 0.24 },
    { m: 'Jul', top: 1.00, sec: 0.22 },
    { m: 'Aug', top: 0.86, sec: 0.14 },
    { m: 'Sep', top: 0.64, sec: 0.12 },
    { m: 'Oct', top: 0.58, sec: 0.18 },
    { m: 'Nov', top: 0.60, sec: 0.20 },
    { m: 'Dec', top: 0.62, sec: 0.20 },
  ];

  // Determine if there is real financial data to visualize
  const hasRealData = (totalBal && totalBal > 0) ||
    (data && data.length > 0 && data.some(d => Math.abs(d.balance || d.amount || 0) > 0));

  // Base scale: use actual totalBal if non-zero, else derive from timeline data
  const baseScale = totalBal && totalBal > 0
    ? totalBal
    : (data && data.length > 0)
      ? Math.max(...data.map(d => Math.abs(d.balance || d.amount || 0)))
      : 0;

  const chartData = multipliers.map(item => {
    let topVal = hasRealData ? item.top * baseScale : 0;
    let secVal = hasRealData ? item.sec * baseScale : 0;

    if (hasRealData && activeType === 'income') {
      topVal = item.top * baseScale * 1.25;
    } else if (hasRealData && activeType === 'expense') {
      topVal = item.top * baseScale * 0.45;
      secVal = item.sec * baseScale * 0.25;
    }

    return {
      month: item.m,
      val: Math.round(topVal),
      secVal: Math.round(secVal),
    };
  });

  const W = 940; 
  const H = 270;
  const paddingX = 40;
  const paddingY = 45;
  const baseY = H - paddingY;
  const chartH = baseY - 45; // 45px top headroom so tooltips are never cut off

  const maxVal = Math.max(...chartData.map(d => d.val)) * 1.12;
  const minVal = 0;
  const rng = maxVal - minVal || 1;

  const pts = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * (W - paddingX * 2);
    const y = baseY - (d.val / rng) * chartH;
    return { x, y, val: d.val, label: d.month };
  });

  const ptsSec = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * (W - paddingX * 2);
    const y = baseY - (d.secVal / rng) * chartH;
    return { x, y };
  });

  const getSmoothPath = (points) => {
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
    }, '');
  };

  const pathPrimary = getSmoothPath(pts);
  const pathSecondary = getSmoothPath(ptsSec);
  const areaPrimary = `${pathPrimary} L${pts[pts.length - 1].x},${baseY} L${pts[0].x},${baseY} Z`;

  // Default active index is July (index 6) matching Image 2
  const activeIdx = hoverIndex !== null ? hoverIndex : 6;
  const activePoint = pts[activeIdx];

  return (
    <div className="relative w-full h-[270px] bg-[#0c0a08] rounded-2xl border border-[#D4AF37]/25 select-none shadow-[inset_0_0_50px_rgba(0,0,0,0.85)]">
      
      {/* Background warm starry particle atmosphere */}
      <div className="absolute top-0 right-0 w-[450px] h-[220px] pointer-events-none opacity-45 rounded-2xl overflow-hidden"
        style={{ background: 'radial-gradient(circle at 80% 20%, rgba(234, 88, 12, 0.28) 0%, rgba(212, 175, 55, 0.12) 40%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:22px_22px] rounded-2xl overflow-hidden" />

      {/* Empty State Overlay — shown when there's no transaction data */}
      {!hasRealData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none gap-2">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <p className="text-[11px] font-bold text-[#E6C667] tracking-wide">No Valuation Data</p>
          <p className="text-[10px] text-[#A19B91] text-center px-4">Add income or expense transactions to see your consolidated wealth curve.</p>
        </div>
      )}

      <svg 
        className="w-full h-full overflow-visible" 
        viewBox={`0 0 ${W} ${H}`} 
        preserveAspectRatio="none"

      >
        <defs>
          {/* Main Area Glow Gradient */}
          <linearGradient id="areaGradImg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0c0a08" stopOpacity="0" />
          </linearGradient>

          {/* Primary Stroke Gradient */}
          <linearGradient id="lineGradImg2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="35%" stopColor="#c2410c" />
            <stop offset="60%" stopColor="#ea580c" />
            <stop offset="80%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Secondary Dim Line Gradient */}
          <linearGradient id="secLineGradImg2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#382e25" />
            <stop offset="50%" stopColor="#554433" />
            <stop offset="100%" stopColor="#2c221a" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="splineGlowImg2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Vertical grid lines */}
        {pts.map((p, i) => (
          <line
            key={`grid-${i}`}
            x1={p.x}
            y1={30}
            x2={p.x}
            y2={baseY}
            stroke="#D4AF37"
            strokeOpacity={activeIdx === i ? "0.18" : "0.06"}
            strokeWidth="1"
          />
        ))}

        {/* Bottom Baseline */}
        <line 
          x1={paddingX - 15} 
          y1={baseY} 
          x2={W - paddingX + 15} 
          y2={baseY} 
          stroke="#D4AF37" 
          strokeOpacity="0.22" 
          strokeWidth="1.2" 
        />

        {/* Secondary Dim Wave */}
        <path 
          d={pathSecondary} 
          fill="none" 
          stroke="url(#secLineGradImg2)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          opacity="0.85" 
        />

        {/* Primary Glowing Wave & Area Fill */}
        <path d={areaPrimary} fill="url(#areaGradImg2)" />
        <path 
          d={pathPrimary} 
          fill="none" 
          stroke="#ea580c" 
          strokeWidth="6" 
          opacity="0.18" 
        />
        <path 
          d={pathPrimary} 
          fill="none" 
          stroke="url(#lineGradImg2)" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          filter="url(#splineGlowImg2)" 
        />

        {/* Active Point Dashed Line & Glowing Node */}
        {activePoint && (
          <>
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.x}
              y2={baseY}
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              strokeOpacity="0.85"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r="14" fill="#ea580c" opacity="0.28">
              <animate attributeName="r" values="12;18;12" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.1;0.35" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle 
              cx={activePoint.x} 
              cy={activePoint.y} 
              r="5.5" 
              fill="#ea580c" 
              stroke="#ffffff" 
              strokeWidth="2" 
              className="drop-shadow-[0_0_8px_rgba(234,88,12,0.9)]"
            />
          </>
        )}

        {/* Interactive Hover Hitboxes */}
        {pts.map((p, i) => (
          <circle
            key={`hit-${i}`}
            cx={p.x}
            cy={p.y}
            r="24"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}

        {/* 12 Months X-Axis Labels */}
        {pts.map((p, i) => {
          const isAct = activeIdx === i;
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={H - 12}
              textAnchor="middle"
              fill={isAct ? '#ffffff' : '#736B5E'}
              fontSize={isAct ? "12" : "11"}
              fontWeight={isAct ? "700" : "500"}
              fontFamily="Inter, sans-serif"
              className="select-none transition-colors cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      {/* Floating Tooltip — only shown when real data exists */}
      {activePoint && hasRealData && (
        <div 
          className="absolute pointer-events-none transition-all duration-200 transform -translate-x-1/2 -translate-y-full -mt-3 z-20"
          style={{ 
            left: `${(activePoint.x / W) * 100}%`, 
            top: `${(activePoint.y / H) * 100}%` 
          }}
        >
          <div className="relative bg-[#181410]/95 border border-[#ea580c]/60 rounded-xl px-3.5 py-2 shadow-[0_4px_25px_rgba(234,88,12,0.35)] backdrop-blur-md flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold whitespace-nowrap">
              {activePoint.label} {new Date().getFullYear()}
            </span>
            <span className="text-xs font-bold text-[#FFF4D0] font-serif whitespace-nowrap mt-0.5" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
              {fmtFull(activePoint.val)}
            </span>
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#181410] border-b border-r border-[#ea580c]/60 transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Radar / Polygon Budget Overview Chart (Image 3 Bottom-Left) ──────────────
function RadarBudgetChart({ catTotals, totalExpenses }) {
  const [hoveredCat, setHoveredCat] = useState(null);

  const categories = [
    { key: 'Housing', label: 'Housing' },
    { key: 'Food', label: 'Food' },
    { key: 'Travel', label: 'Travel' },
    { key: 'Bills', label: 'Bills' },
    { key: 'Health', label: 'Health' },
    { key: 'Shopping', label: 'Shopping' },
    { key: 'Savings', label: 'Savings' },
    { key: 'Others', label: 'Others' },
  ];

  const total = totalExpenses > 0 ? totalExpenses : 1;
  const numAxes = categories.length;
  const size = 260;
  const center = size / 2;
  const maxRadius = 84;

  // Calculate polygon points
  const points = categories.map((cat, i) => {
    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
    const catVal = catTotals[cat.key] || 0;
    const ratio = catVal > 0 ? Math.min(1, Math.max(0.35, (catVal / total) * 2.2)) : 0.35 + (i % 3) * 0.12;
    const r = maxRadius * ratio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    
    // Label pos
    const labelR = maxRadius + 22;
    const lx = center + labelR * Math.cos(angle);
    const ly = center + labelR * Math.sin(angle);

    return { key: cat.key, x, y, lx, ly, label: cat.label, catVal };
  });

  const polygonPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} Q${cx},${prev.y} ${p.x},${p.y}`;
  }, '') + ` Q${(points[points.length-1].x + points[0].x)/2},${points[points.length-1].y} ${points[0].x},${points[0].y} Z`;

  const activeCatObj = points.find(p => p.key === hoveredCat);

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-1">
      {/* Category Hover Tooltip */}
      {activeCatObj && (
        <div className="absolute top-0 bg-[#181410]/95 border border-[#F59E0B] text-[#FFF4D0] px-3 py-1 rounded-full text-[11px] font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20 backdrop-blur-md transition-all">
          {activeCatObj.label}: <span className="font-serif text-[#E6C667]">{fmtFull(activeCatObj.catVal)}</span>
        </div>
      )}

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#080706" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric rings */}
        {[0.35, 0.65, 1].map((rFactor, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={maxRadius * rFactor}
            fill="none"
            stroke="#D4AF37"
            strokeOpacity={idx === 2 ? "0.2" : "0.08"}
            strokeDasharray={idx === 1 ? "3 3" : undefined}
          />
        ))}

        {/* Axis rays */}
        {points.map((p, idx) => (
          <line
            key={idx}
            x1={center}
            y1={center}
            x2={p.lx}
            y2={p.ly}
            stroke="#D4AF37"
            strokeOpacity={hoveredCat === p.key ? "0.4" : "0.1"}
          />
        ))}

        {/* Star Polygon Shaped Area */}
        <path
          d={polygonPath}
          fill="url(#radarFill)"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="drop-shadow(0 0 10px rgba(245,158,11,0.35))"
        />

        {/* Corner Nodes & Hover Hitboxes */}
        {points.map((p, idx) => {
          const isHov = hoveredCat === p.key;
          return (
            <g 
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCat(p.key)}
              onMouseLeave={() => setHoveredCat(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHov ? "6" : "3.5"}
                fill={isHov ? "#F59E0B" : "#FFF4D0"}
                stroke="#F59E0B"
                strokeWidth="1.5"
                className="transition-all duration-200"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
              />
            </g>
          );
        })}

        {/* Labels around perimeter */}
        {points.map((p, idx) => {
          const isHov = hoveredCat === p.key;
          return (
            <text
              key={idx}
              x={p.lx}
              y={p.ly + 3}
              textAnchor="middle"
              fill={isHov ? '#F59E0B' : '#A19B91'}
              fontSize={isHov ? "11" : "9"}
              fontWeight={isHov ? "700" : "500"}
              fontFamily="Inter, sans-serif"
              className="select-none cursor-pointer transition-all"
              onMouseEnter={() => setHoveredCat(p.key)}
              onMouseLeave={() => setHoveredCat(null)}
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Soundwave Equalizer Bars for Spending Insights (Image 3 Middle) ──────────
function SoundwaveFrequencyBar({ score = 82 }) {
  const barsCount = 38;
  const activeCenter = Math.floor((score / 100) * barsCount);

  return (
    <div className="w-full flex items-center justify-between gap-1 h-14 px-2 py-2">
      {Array.from({ length: barsCount }).map((_, i) => {
        // Height curve tapering from ends and peak in active zone
        const distFromCenter = Math.abs(i - activeCenter);
        const baseH = Math.max(12, 48 - Math.abs(i - barsCount / 2) * 1.5);
        const isActive = distFromCenter <= 1;
        const isNear = distFromCenter <= 4;

        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-300"
            style={{
              height: `${baseH}px`,
              backgroundColor: isActive 
                ? '#F59E0B' 
                : isNear 
                ? 'rgba(212,175,55,0.45)' 
                : 'rgba(212,175,55,0.15)',
              boxShadow: isActive ? '0 0 8px rgba(245,158,11,0.8)' : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Add Transaction Modal ─────────────────────────────────────────────────────
function AddTxModal({ onClose, onSuccess }) {
  const dateInputRef = useRef(null);
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
    const needMerchant = form.type === 'income';
    if (!form.title || (needMerchant && !form.merchant) || !form.amount) { setErr('Please fill all required fields.'); return; }
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
            <p className="text-[10px] text-[#A19B91] mt-0.5">Record income or expense</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#A19B91] hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3.5">
          {/* Type: Income | Expense only */}
          <div className="grid grid-cols-2 gap-2">
            {['income','expense'].map(t => (
              <button key={t} type="button" onClick={() => set('type', t)}
                className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  form.type===t
                    ? t==='income'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.2)]'
                      : 'bg-red-950/60 border-red-500/50 text-red-400 shadow-[0_0_14px_rgba(248,113,113,0.2)]'
                    : 'border-[#D4AF37]/15 text-[#A19B91] hover:border-[#D4AF37]/30'
                }`}>
                {t==='income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              type="text" placeholder="e.g. Monthly salary"
              className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white placeholder-[#524D46] outline-none transition-colors" />
          </div>

          {/* Merchant / Source — only for income */}
          {form.type === 'income' && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Merchant / Source *</label>
              <input value={form.merchant} onChange={e => set('merchant', e.target.value)}
                type="text" placeholder="e.g. Google India"
                className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white placeholder-[#524D46] outline-none transition-colors" />
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Amount (₹) *</label>
            <input value={form.amount} onChange={e => set('amount', e.target.value)}
              type="number" placeholder="0" min={0}
              className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white placeholder-[#524D46] outline-none transition-colors" />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Category</label>
              <div className="relative">
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none transition-colors">
                  {ALL_CATEGORIES.map(o => (
                    <option key={o} value={o} className="bg-[#12100E] text-white">{o}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#D4AF37] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Date (Calendar)</label>
              <div
                onClick={() => {
                  if (dateInputRef.current?.showPicker) dateInputRef.current.showPicker();
                  else dateInputRef.current?.focus();
                }}
                className="relative flex items-center bg-[#080706]/80 border border-[#D4AF37]/20 focus-within:border-[#D4AF37] hover:border-[#D4AF37]/50 rounded-xl px-3 py-2 cursor-pointer transition-colors"
              >
                <input
                  ref={dateInputRef}
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  type="date"
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-transparent text-xs text-white outline-none cursor-pointer"
                />
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37] ml-1.5 flex-shrink-0 pointer-events-none" />
              </div>
            </div>
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

// ─── Edit Transaction Modal ─────────────────────────────────────────────────────
function EditTxModal({ tx, onClose, onSuccess }) {
  const dateInputRef = useRef(null);
  const [form, setForm] = useState({
    title: tx.title || '',
    merchant: tx.merchant || '',
    amount: tx.amount || '',
    type: tx.type || 'expense',
    category: tx.category || 'Food',
    date: tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) { setErr('Title and amount are required.'); return; }
    setLoading(true); setErr('');
    try {
      await api().put(`/transactions/${tx._id}`, { ...form, amount: parseFloat(form.amount) });
      onSuccess(); onClose();
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed to update.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background:'rgba(8,7,6,0.88)', backdropFilter:'blur(10px)' }}>
      <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/30 bg-[#0e0c0a]"
        style={{ boxShadow:'0 0 60px rgba(212,175,55,0.18), inset 0 1px 0 rgba(212,175,55,0.08)' }}>
        <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/15">
          <div>
            <h2 className="text-sm font-bold text-white font-serif" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>Edit Transaction</h2>
            <p className="text-[10px] text-[#A19B91] mt-0.5">Modify existing record</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#A19B91] hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3.5">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {['income','expense'].map(t => (
              <button key={t} type="button" onClick={() => set('type', t)}
                className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  form.type===t
                    ? t==='income'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                      : 'bg-red-950/60 border-red-500/50 text-red-400'
                    : 'border-[#D4AF37]/15 text-[#A19B91] hover:border-[#D4AF37]/30'
                }`}>
                {t==='income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              type="text" placeholder="e.g. Monthly salary"
              className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white placeholder-[#524D46] outline-none transition-colors" />
          </div>

          {/* Merchant — only for income */}
          {form.type === 'income' && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Merchant / Source</label>
              <input value={form.merchant} onChange={e => set('merchant', e.target.value)}
                type="text" placeholder="e.g. Google India"
                className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white placeholder-[#524D46] outline-none transition-colors" />
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Amount (₹) *</label>
            <input value={form.amount} onChange={e => set('amount', e.target.value)}
              type="number" placeholder="0" min={0}
              className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white placeholder-[#524D46] outline-none transition-colors" />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Category</label>
              <div className="relative">
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full bg-[#080706]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none transition-colors">
                  {ALL_CATEGORIES.map(o => (
                    <option key={o} value={o} className="bg-[#12100E] text-white">{o}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#D4AF37] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-1">Date (Calendar)</label>
              <div
                onClick={() => {
                  if (dateInputRef.current?.showPicker) dateInputRef.current.showPicker();
                  else dateInputRef.current?.focus();
                }}
                className="relative flex items-center bg-[#080706]/80 border border-[#D4AF37]/20 focus-within:border-[#D4AF37] hover:border-[#D4AF37]/50 rounded-xl px-3 py-2 cursor-pointer transition-colors"
              >
                <input
                  ref={dateInputRef}
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  type="date"
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-transparent text-xs text-white outline-none cursor-pointer"
                />
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37] ml-1.5 flex-shrink-0 pointer-events-none" />
              </div>
            </div>
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
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const location       = useLocation();
  const navigate       = useNavigate();

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
  const [activeTab,    setActiveTab]    = useState('Home');
  const [timeRange,    setTimeRange]    = useState('monthly');
  const [chartMetric,  setChartMetric]  = useState('all');
  const [txFilter,     setTxFilter]     = useState('All');
  const [txSearch,     setTxSearch]     = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editingTx,    setEditingTx]    = useState(null);

  const [user, setUser] = useState(() => {
    try { 
      const s = localStorage.getItem('user'); 
      if (s) return JSON.parse(s); 
    } catch (_) {}
    return { name: 'Satya' };
  });

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
    if (!getToken()) { 
      navigate('/login', { replace: true }); 
      return; 
    }
    await Promise.all([loadAccounts(), loadInsights(), loadTimeline(timeRange), loadTransactions(txFilter, txSearch)]);
    setPageLoading(false);
  }, [loadAccounts, loadInsights, loadTimeline, loadTransactions, timeRange, txFilter, txSearch]);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadTransactions(txFilter, txSearch); }, [txFilter, txSearch]);
  useEffect(() => { loadTimeline(timeRange); }, [timeRange]);

  // ── Auto-scroll to section based on URL path when page loads/reloads ────────
  useEffect(() => {
    if (!pageLoading) {
      if (location.pathname === '/dashboard' || location.pathname === '/') {
        setActiveTab('Home');
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else {
        const pathMap = {
          '/analytics': { ref: analyticsRef, tab: 'Analytics' },
          '/budget': { ref: budgetRef, tab: 'Budget' },
          '/transactions': { ref: txRef, tab: 'Transactions' },
        };
        const match = pathMap[location.pathname];
        if (match) {
          setActiveTab(match.tab);
          setTimeout(() => {
            match.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    }
  }, [location.pathname, pageLoading]);

  // ── Scroll Spy to auto-sync Navbar activeTab and URL path with scroll ────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      const analyticsTop = analyticsRef.current?.offsetTop || 99999;
      const budgetTop = budgetRef.current?.offsetTop || 99999;
      const txTop = txRef.current?.offsetTop || 99999;

      let newTab = 'Home';
      let newPath = '/dashboard';

      if (scrollPos >= txTop - 80) {
        newTab = 'Transactions';
        newPath = '/transactions';
      } else if (scrollPos >= budgetTop - 80) {
        newTab = 'Budget';
        newPath = '/budget';
      } else if (scrollPos >= analyticsTop - 80) {
        newTab = 'Analytics';
        newPath = '/analytics';
      }

      setActiveTab(newTab);
      if (window.location.pathname !== newPath) {
        window.history.replaceState(null, '', newPath);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Smooth scroll nav ───────────────────────────────────────────────────────
  const scrollTo = (tab) => {
    setActiveTab(tab);
    const pathMap = { Home: '/dashboard', Analytics: '/analytics', Budget: '/budget', Transactions: '/transactions' };
    if (pathMap[tab] && location.pathname !== pathMap[tab]) {
      navigate(pathMap[tab]);
    }
    if (tab === 'Home') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      const map = { Analytics: analyticsRef, Budget: budgetRef, Transactions: txRef };
      map[tab]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      {editingTx && <EditTxModal tx={editingTx} onClose={() => setEditingTx(null)} onSuccess={() => { setEditingTx(null); loadAll(); }} />}

      <Navbar activeTab={activeTab} onTabChange={scrollTo} onProfileUpdate={(updated) => setUser(updated)} />

      {/* ── Scrollable page body ────────────────────────────────────────────── */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 space-y-8">

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1 ─ HOME (Personal Finance / Consolidated Valuation)
        ══════════════════════════════════════════════════════════════════════ */}
        <section ref={homeRef} id="home" className="space-y-6 scroll-mt-20">

          {/* ── Header banner (Single horizontal row with expanded stat cards & Add Transaction) ── */}
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0e0c0a]/75 backdrop-blur-xl px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-5"
            style={{ boxShadow:'0 4px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.07)' }}>
            
            {/* Left: Brand / Welcome */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#D4AF37]">Sovereign Portfolio</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]"
                  style={{ animation:'pulse 2s infinite' }} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif whitespace-nowrap"
                style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                Welcome back, <span className="gold-metallic-text">{user.name}</span>
              </h1>
            </div>

            {/* Right: Expanded Stat Cards & Add Transaction Button */}
            <div className="flex-1 flex items-center justify-end gap-3 sm:gap-3.5 flex-wrap">
              {[
                { label:'Total Income',  value: fmt(insights?.totalIncome ?? monthInc),  cls:'text-emerald-400', sub:'↑ Inflow' },
                { label:'Total Expense', value: `-${fmt(insights?.totalExpense ?? monthExp)}`, cls:'text-white', sub:'Expenses' },
                { label:'Total Savings', value: fmt(insights?.totalSavings ?? 0),        cls:'text-[#E6C667]',   sub:`★ ${saveRate}% Saved` },
                { label:'Net Worth',     value: fmt(netWorth),                           cls:'text-[#818cf8]',   sub:'Total Capital' },
              ].map(item => (
                <div key={item.label} className="flex-1 min-w-[135px] sm:min-w-[155px] bg-[#080706]/85 border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 rounded-xl px-4 sm:px-5 py-2.5 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                  <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-semibold mb-0.5">{item.label}</span>
                  <span className={`block text-sm sm:text-base font-bold font-serif leading-tight ${item.cls}`} style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                    {item.value}
                  </span>
                  <span className="block text-[9px] text-[#A19B91] mt-0.5">{item.sub}</span>
                </div>
              ))}

              {/* Add Transaction Button */}
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E6C667] text-[#080706] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_18px_rgba(212,175,55,0.3)] flex-shrink-0 cursor-pointer">
                <Plus className="w-4 h-4" /> Add Transaction
              </button>
            </div>
          </div>

          {/* ── TOP GRID: Budget Overview Radar (Left) + Expanded Consolidated Valuation (Right) ─ */}
          <div className="grid grid-cols-12 gap-5 items-stretch">

            {/* ── LEFT: Budget Overview (Radar Polygon Chart) 3 cols ── */}
            <div className="col-span-12 lg:col-span-3 flex flex-col justify-between rounded-2xl border border-[#D4AF37]/25 bg-[#0e0c0a]/80 backdrop-blur-xl p-5"
              style={{ boxShadow:'0 4px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-serif" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                    Budget Overview
                  </h3>
                  <p className="text-[9px] text-[#A19B91]">Category allocation polygon</p>
                </div>
                <span className="text-[9px] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
                  Radar
                </span>
              </div>
              
              <div className="my-auto py-2 flex items-center justify-center">
                <RadarBudgetChart catTotals={catTotals} totalExpenses={insights?.totalExpense} />
              </div>

              <div className="mt-4 pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#A19B91] font-medium block">Total Allocation</span>
                  <span className="text-xs text-[#E6C667]">{Object.keys(catTotals).length} Categories Active</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#A19B91] font-medium block">Total Expenses</span>
                  <span className="text-sm sm:text-base font-bold font-serif text-white block" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                    {fmt(insights?.totalExpense || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Expanded Consolidated Valuation (9 cols) ──────────── */}
            <div className="col-span-12 lg:col-span-9 flex flex-col rounded-2xl border border-[#D4AF37]/25 bg-[#0e0c0a]/80 backdrop-blur-xl p-5 sm:p-6"
              style={{ boxShadow:'0 4px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.06)' }}>

              {/* Header Bar with Total Balance & Filter Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[#D4AF37] font-semibold block mb-0.5">
                    Consolidated Valuation
                  </span>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-bold font-serif text-white"
                      style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                      {fmtFull(totalBal || netWorth)}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-emerald-400 bg-emerald-950/40 border border-emerald-500/30">
                      {growth >= 0 ? `▲ ${growth}%` : `▼ ${Math.abs(growth)}%`}
                    </span>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex bg-[#080706]/90 p-1 rounded-full border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'income', label: 'Income' },
                      { key: 'expense', label: 'Expense' },
                      { key: 'saving', label: 'Saving' },
                    ].map(btn => (
                      <button
                        key={btn.key}
                        onClick={() => setChartMetric(btn.key)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                          chartMetric === btn.key
                            ? 'bg-[#F59E0B] text-[#080706] shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                            : 'text-[#A19B91] hover:text-[#FFF4D0] hover:bg-[#D4AF37]/10'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Time Range Selector */}
                  <div className="flex bg-[#080706]/90 p-1 rounded-full border border-[#D4AF37]/20">
                    {[['weekly','Weekly'],['monthly','Monthly']].map(([val, label]) => (
                      <button key={val} onClick={() => setTimeRange(val)}
                        className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-all duration-200 ${
                          timeRange === val
                            ? 'bg-[#D4AF37] text-[#080706] font-bold shadow-[0_0_10px_rgba(212,175,55,0.35)]'
                            : 'text-[#A19B91] hover:text-[#E6C667]'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spline Chart */}
              <div className="flex-1 w-full mt-1">
                <Image3ValuationChart data={timeline} totalBal={totalBal || netWorth} activeType={chartMetric} />
              </div>

              {/* Bottom Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#D4AF37]/15 text-center">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-medium">Monthly Inflow</span>
                  <span className="block text-sm font-bold font-serif text-emerald-400 mt-0.5" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                    {fmt(monthInc)}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-medium">Monthly Outflow</span>
                  <span className="block text-sm font-bold font-serif text-red-400 mt-0.5" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                    {fmt(monthExp)}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-medium">Saving Rate</span>
                  <span className="block text-sm font-bold font-serif text-[#E6C667] mt-0.5" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                    {saveRate}%
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-[#A19B91] font-medium">Finance Score</span>
                  <span className="block text-sm font-bold font-serif text-white mt-0.5" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                    {score} / 100
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2 ─ ANALYTICS
        ══════════════════════════════════════════════════════════════════════ */}
        <section ref={analyticsRef} id="analytics" className="space-y-4 scroll-mt-20 pt-8 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-[#D4AF37]" />
            <h2 className="text-sm font-bold text-white font-serif" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>Analytics</h2>
            <PieChart className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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

          {/* ── Top Spending + Health Score Side-by-Side ── */}
          {(() => {
            const totalExp = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const ranked = ALL_CATEGORIES
              .map(cat => ({ cat, amount: catTotals[cat] || 0 }))
              .filter(x => x.amount > 0)
              .sort((a, b) => b.amount - a.amount);
            const maxAmt = ranked[0]?.amount || 1;
            return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {ranked.length > 0 && (
              <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0e0c0a]/80 backdrop-blur-xl px-6 py-5"
                style={{ boxShadow:'0 2px 20px rgba(0,0,0,0.5)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">Top Spending</span>
                    <p className="text-[9px] text-[#A19B91] mt-0.5">Category breakdown by actual expenses</p>
                  </div>
                  <span className="text-[9px] font-semibold text-[#A19B91] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2.5 py-1 rounded-full">
                    {ranked.length} categories
                  </span>
                </div>
                <div className="space-y-3">
                  {ranked.map((item, idx) => {
                    const Icon  = catIcon[item.cat]  || Coins;
                    const color = catColor[item.cat] || '#D4AF37';
                    const pct   = totalExp > 0 ? Math.round((item.amount / totalExp) * 100) : 0;
                    const barPct = Math.round((item.amount / maxAmt) * 100);
                    return (
                      <div key={item.cat} className="flex items-center gap-3">
                        {/* Rank */}
                        <span className="w-4 text-[9px] font-bold text-[#A19B91] flex-shrink-0 text-right">{idx + 1}</span>
                        {/* Icon */}
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        {/* Name + Bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-white">{item.cat}</span>
                            <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#1a1714] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width:`${barPct}%`, background:`linear-gradient(90deg, ${color}88, ${color})`, boxShadow:`0 0 6px ${color}55` }} />
                          </div>
                        </div>
                        {/* Amount */}
                        <span className="text-[10px] font-bold font-serif flex-shrink-0"
                          style={{ color, fontFamily:'"Playfair Display",Georgia,serif' }}>
                          {fmt(item.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Spending score bar — always shown in right column */}
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
                {/* Finance Score Visual Ring */}
                <div className="mt-6 pt-4 border-t border-[#D4AF37]/10 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-[#A19B91] font-medium">Monthly In</span>
                    <span className="block text-xs font-bold text-emerald-400 font-serif mt-0.5" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>{fmt(monthInc)}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-[#A19B91] font-medium">Monthly Out</span>
                    <span className="block text-xs font-bold text-red-400 font-serif mt-0.5" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>{fmt(monthExp)}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-[#A19B91] font-medium">Save Rate</span>
                    <span className="block text-xs font-bold text-[#D4AF37] font-serif mt-0.5" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>{saveRate}%</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}
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
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-9 gap-3">
                {ALL_CATEGORIES.map(cat => {
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
            SECTION 4 ─ TRANSACTIONS (Full Dedicated Ledger Section)
        ══════════════════════════════════════════════════════════════════════ */}
        <section ref={txRef} id="transactions" className="space-y-4 scroll-mt-20 pb-12">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-[#D4AF37]" />
              <div>
                <h2 className="text-base font-bold text-white font-serif" style={{ fontFamily:'"Playfair Display",Georgia,serif' }}>
                  Transaction Ledger
                </h2>
                <p className="text-[10px] text-[#A19B91]">Verified sovereign financial activity &amp; history</p>
              </div>
              <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full ml-2">
                {txList.length} Entries
              </span>
            </div>

            {/* Filter Tabs & Search & Add Button */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Type Filter Pills */}
              <div className="flex bg-[#080706]/90 p-1 rounded-full border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                {['All','Income','Expense'].map(f => (
                  <button 
                    key={f} 
                    onClick={() => setTxFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      txFilter === f
                        ? 'bg-[#D4AF37] text-[#080706] font-bold shadow-[0_0_10px_rgba(212,175,55,0.35)]'
                        : 'text-[#A19B91] hover:text-[#E6C667]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/70" />
                <input 
                  value={txSearch} 
                  onChange={e => setTxSearch(e.target.value)} 
                  placeholder="Search ledger..."
                  className="bg-[#080706]/80 border border-[#D4AF37]/20 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#524D46] focus:border-[#D4AF37] focus:outline-none w-36 sm:w-48 transition-all" 
                />
              </div>

              {/* Add Transaction Button */}
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D4AF37] hover:bg-[#E6C667] text-[#080706] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_14px_rgba(212,175,55,0.25)]"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Full Transaction Table */}
          <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#0e0c0a]/80 backdrop-blur-xl overflow-hidden"
            style={{ boxShadow:'0 4px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.06)' }}>
            
            {/* Table Column Headers */}
            <div className="grid grid-cols-[1.8fr_1.1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 border-b border-[#D4AF37]/15 text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold bg-[#080706]/60">
              <span>Transaction &amp; Source</span>
              <span>Category</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
              <span></span>
            </div>

            {txLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#A19B91] text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                <span>Loading ledger transactions…</span>
              </div>
            ) : txList.length === 0 ? (
              <div className="py-16 text-center">
                <ArrowLeftRight className="w-10 h-10 text-[#D4AF37]/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">No transactions found</p>
                <p className="text-xs text-[#A19B91] mt-1">Try changing your search or filter criteria.</p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#080706] text-xs font-bold uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Transaction
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#D4AF37]/10">
                {txList.map(tx => {
                  const Icon  = catIcon[tx.category] || Coins;
                  const color = catColor[tx.category] || '#D4AF37';
                  const isInc = tx.type === 'income';
                  const isSav = tx.type === 'saving';
                  return (
                    <div
                      key={tx._id}
                      className="grid grid-cols-[1.8fr_1.1fr_1fr_1fr_auto] items-center gap-4 px-6 py-4 hover:bg-[#D4AF37]/5 transition-all group"
                    >
                      {/* Description & Merchant */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center border"
                          style={{ background:`${color}15`, borderColor:`${color}35` }}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate group-hover:text-[#E6C667] transition-colors">
                            {tx.title}
                          </p>
                          <p className="text-[10px] text-[#A19B91] truncate">{tx.merchant || 'General'}</p>
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <span className="text-[10px] font-medium text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-1 rounded-full bg-[#080706]/70 whitespace-nowrap">
                          {tx.category}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="text-xs text-[#A19B91] whitespace-nowrap">
                        {formatDate(tx.date)}
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <span
                          className={`text-sm font-bold font-serif whitespace-nowrap ${
                            isInc ? 'text-emerald-400' : isSav ? 'text-[#E6C667]' : 'text-white'
                          }`}
                          style={{ fontFamily:'"Playfair Display",Georgia,serif' }}
                        >
                          {isInc ? '+' : isSav ? '⊕' : '-'}{fmtFull(tx.amount)}
                        </span>
                      </div>

                      {/* Edit button */}
                      <div className="flex items-center">
                        <button
                          onClick={() => setEditingTx(tx)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#D4AF37]/20 text-[#A19B91] hover:text-[#E6C667] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Edit transaction"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table Footer */}
            {txList.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#D4AF37]/15 bg-[#080706]/40 text-xs text-[#A19B91]">
                <span>Showing <strong>{txList.length}</strong> of <strong>{txList.length}</strong> transactions</span>
                <button 
                  onClick={() => {
                    if (txList.length === 0) return;
                    const headers = ['Title', 'Merchant', 'Category', 'Type', 'Amount (INR)', 'Date'];
                    const rows = txList.map(t => [
                      `"${t.title.replace(/"/g, '""')}"`,
                      `"${(t.merchant || '').replace(/"/g, '""')}"`,
                      `"${t.category}"`,
                      `"${t.type}"`,
                      t.amount,
                      `"${formatDate(t.date)}"`
                    ]);
                    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `SpendWise_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#FFF4D0] font-semibold group transition-colors"
                >
                  Export CSV <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>

        </section>

        {/* ── Sovereign Footer ──────────────────────────────────────────────── */}
        <footer className="pt-6 pb-10 border-t border-[#D4AF37]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#736B5E]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
            <span className="font-semibold text-[#A19B91]">SpendWise Sovereign Wealth</span>
            <span>• Encrypted Personal Finance Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#A19B91]">
            <span>© 2026 SpendWise</span>
            <span>•</span>
            <span>Privacy &amp; Security Protocol</span>
          </div>
        </footer>

      </main>
    </div>
  );
}

