import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  User,
  MessageSquare,
  ChevronDown,
  Send,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

// ─── Change this to YOUR Gmail address ───────────────────────────────────────
const SITE_EMAIL = 'spendwise.support@gmail.com';

const SERVICES = [
  'Account & Billing Support',
  'Bug Report',
  'Feature Request',
  'General Enquiry',
  'Data Export / Privacy',
  'Partnership',
  'Other',
];

export default function Contact() {
  const navigate = useNavigate();

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent]       = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())    e.name    = 'Please enter your name.';
    if (!email.trim())   e.email   = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                         e.email   = 'Please enter a valid email address.';
    if (!service)        e.service = 'Please select a topic.';
    if (!message.trim()) e.message = 'Please describe your query.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const subject = encodeURIComponent([SpendWise]  - from );
    const body    = encodeURIComponent(
      Hi SpendWise Team,\n\nName   : \nEmail  : \nTopic  : \n\nMessage:\n\n\n--\nSent via SpendWise Contact Form
    );

    window.open(
      https://mail.google.com/mail/?view=cm&to=&su=&body=,
      '_blank'
    );

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName(''); setEmail(''); setService(''); setMessage('');
      setErrors({});
    }, 4000);
  };

  const inputCls = (field) =>
    w-full bg-[#0C0B09]/80 border  rounded-xl px-4 py-3 text-sm text-white placeholder-[#5A5650] focus:outline-none focus:border-[#D4AF37]/60 focus:shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all duration-200;

  return (
    <div
      className="min-h-screen w-full bg-[#080706] text-white flex items-center justify-center relative overflow-hidden p-4 sm:p-6 selection:bg-[#D4AF37]/30"
      style={{ background: 'radial-gradient(ellipse at center, #14110F 0%, #080706 100%)' }}
    >
      <div className="bg-[#D4AF37]/10 blur-3xl absolute rounded-full w-[550px] h-[550px] -top-32 -left-32 pointer-events-none animate-pulse" />
      <div className="bg-[#D4AF37]/10 blur-3xl absolute rounded-full w-[650px] h-[650px] -bottom-40 -right-40 pointer-events-none animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="border border-[#D4AF37]/20 rounded-full blur-sm absolute w-[980px] h-[980px] opacity-40 animate-pulse" />
        <div className="border border-[#D4AF37]/25 rounded-full blur-[1px] absolute w-[720px] h-[720px] opacity-50" />
        <div className="border border-[#D4AF37]/30 rounded-full absolute w-[520px] h-[520px] opacity-60" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px),
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-[480px] w-full my-auto bg-[#12100E]/85 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative z-10 transition-all duration-500 hover:border-[#D4AF37]/45">
        <div className="absolute top-3.5 left-3.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#D4AF37]/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#D4AF37]/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3.5 left-3.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#D4AF37]/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#D4AF37]/40 rounded-br-sm pointer-events-none" />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#A19B91] hover:text-[#E6C667] text-xs uppercase tracking-wider mb-5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex justify-center mb-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E1B17] via-[#12100E] to-[#0A0908] border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)] transform rotate-45 group transition-transform duration-500 hover:rotate-[225deg]">
              <div className="transform -rotate-45 group-hover:-rotate-[225deg] transition-transform duration-500">
                <Sparkles className="w-5 h-5 text-[#E6C667]" />
              </div>
            </div>
            <div className="absolute inset-0 bg-[#D4AF37]/20 blur-lg rounded-full -z-10" />
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.28em] font-semibold text-[#D4AF37] uppercase mb-1">
            SpendWise - Support
          </p>
          <h1
            className="text-3xl font-serif tracking-tight text-white mb-1"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Contact <span className="text-[#E6C667]">Us</span>
          </h1>
          <p className="text-[#A19B91] text-xs">
            Fill the form - it opens Gmail pre-filled and ready to send.
          </p>
        </div>

        {sent && (
          <div className="mb-5 p-3 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E6C667] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
            Gmail opened! Complete and send the email there.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#A19B91] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3 h-3 text-[#D4AF37]" /> Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors(v => ({ ...v, name: '' })); }}
              placeholder="e.g., Alexander Mercer"
              className={inputCls('name')}
            />
            {errors.name && <p className="text-rose-400 text-[10px] mt-0.5">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#A19B91] uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[#D4AF37]" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })); }}
              placeholder="e.g., alexander@domain.com"
              className={inputCls('email')}
            />
            {errors.email && <p className="text-rose-400 text-[10px] mt-0.5">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#A19B91] uppercase tracking-wider flex items-center gap-1.5">
              <ChevronDown className="w-3 h-3 text-[#D4AF37]" /> What can we help with?
            </label>
            <div className="relative">
              <select
                value={service}
                onChange={(e) => { setService(e.target.value); setErrors(v => ({ ...v, service: '' })); }}
                className={inputCls('service') + ' appearance-none pr-10 cursor-pointer'}
              >
                <option value="" disabled>Select a topic...</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s} className="bg-[#12100E]">{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/60 pointer-events-none" />
            </div>
            {errors.service && <p className="text-rose-400 text-[10px] mt-0.5">{errors.service}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#A19B91] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-[#D4AF37]" /> Your Message
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setErrors(v => ({ ...v, message: '' })); }}
              placeholder="Describe your query, issue, or idea..."
              className={inputCls('message') + ' resize-y min-h-[100px]'}
            />
            {errors.message && <p className="text-rose-400 text-[10px] mt-0.5">{errors.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#C9A227] via-[#E6C667] to-[#C9A227] text-[#080706] text-sm font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
            </svg>
            Open in Gmail and Send
            <Send className="w-3.5 h-3.5" />
          </button>

          <p className="text-center text-[10px] text-[#5A5650] leading-snug pt-1">
            Clicking the button opens Gmail in a new tab with your message pre-filled.
            We typically reply within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
