import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose }) {
  const [filter, setFilter] = useState('all');

  // Dynamically generate notifications based on user transactions in localStorage/state
  const [notifications, setNotifications] = useState(() => {
    const list = [
      {
        id: 'sec-1',
        title: 'Vault Security Active',
        message: 'Encrypted end-to-end multi-factor session verified.',
        time: 'Just now',
        type: 'security',
        read: false,
        icon: ShieldCheck,
        color: 'text-[#D4AF37]',
        bg: 'bg-[#D4AF37]/10 border-[#D4AF37]/30'
      }
    ];

    try {
      const storedTx = localStorage.getItem('transactions');
      if (storedTx) {
        const txs = JSON.parse(storedTx);
        txs.slice(0, 4).forEach((tx, idx) => {
          if (tx.type === 'income') {
            list.unshift({
              id: `tx-${idx}`,
              title: 'Income Credited',
              message: `Inflow of ₹${tx.amount?.toLocaleString('en-IN') || tx.amount} credited for ${tx.title || 'Income'}.`,
              time: tx.date ? new Date(tx.date).toLocaleDateString() : 'Recent',
              type: 'income',
              read: false,
              icon: ArrowDownLeft,
              color: 'text-emerald-400',
              bg: 'bg-emerald-950/40 border-emerald-500/30'
            });
          } else {
            list.unshift({
              id: `tx-${idx}`,
              title: 'Expense Alert',
              message: `Outflow of ₹${tx.amount?.toLocaleString('en-IN') || tx.amount} logged in ${tx.category || 'Expenses'}.`,
              time: tx.date ? new Date(tx.date).toLocaleDateString() : 'Recent',
              type: 'warning',
              read: false,
              icon: AlertTriangle,
              color: 'text-amber-400',
              bg: 'bg-amber-950/40 border-amber-500/30'
            });
          }
        });
      }
    } catch (_) {}

    return list;
  });

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-end pt-16 pr-4 sm:pr-8 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0E0C0A] border border-[#D4AF37]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(212,175,55,0.15)] overflow-hidden flex flex-col max-h-[85vh] transform transition-all duration-300"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#1E1B17] to-[#0A0908]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E6C667]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-serif tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  Notifications & Alerts
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#080706]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#A19B91]">Real-time financial activity & updates</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#A19B91] hover:text-white hover:border-[#D4AF37]/50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Pills & Actions */}
        <div className="px-4 py-2.5 border-b border-[#D4AF37]/15 bg-[#080706]/80 flex items-center justify-between text-xs">
          <div className="flex gap-1.5 bg-[#12100E] p-1 rounded-lg border border-[#D4AF37]/20">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                filter === 'all' 
                  ? 'bg-[#D4AF37] text-[#080706]' 
                  : 'text-[#A19B91] hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                filter === 'unread' 
                  ? 'bg-[#D4AF37] text-[#080706]' 
                  : 'text-[#A19B91] hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                title="Mark all as read"
                className="text-[10px] text-[#E6C667] hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3 h-3" /> Mark read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                title="Clear all"
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-[#D4AF37]/10">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#A19B91] flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-[#D4AF37]/40 mb-1" />
              <p className="text-xs font-semibold text-white">All caught up!</p>
              <p className="text-[10px]">No notifications to display at this time.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  onClick={() => toggleRead(item.id)}
                  className={`pt-2 flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group border ${
                    item.read 
                      ? 'bg-[#080706]/50 border-transparent opacity-75 hover:opacity-100 hover:bg-[#12100E]' 
                      : 'bg-[#181410] border-[#D4AF37]/25 shadow-[0_2px_10px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${item.bg}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-[#E6C667] transition-colors truncate">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-[#A19B91] flex-shrink-0 font-medium">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A19B91] mt-0.5 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[#A19B91] hover:text-red-400 p-1 rounded-md transition-all"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080706] border-t border-[#D4AF37]/15 text-center">
          <p className="text-[9px] text-[#A19B91]">
            SpendWise Autonomous Wealth Monitoring • Alerts updated live
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
