import React, { createContext, useContext, useState, useCallback } from 'react';

// ── Supported currencies ─────────────────────────────────────────────────────
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee',   locale: 'en-IN' },
  { code: 'USD', symbol: '$', label: 'US Dollar',       locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro',            locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'British Pound',   locale: 'en-GB' },
];

// Approximate exchange rates relative to INR (base)
// In a production app these would come from a live FX API
const RATES_FROM_INR = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
};

// ── Context ──────────────────────────────────────────────────────────────────
const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem('spendwise_currency') || 'INR';
  });

  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const switchCurrency = useCallback((code) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (!found) return;
    setCurrencyCode(code);
    localStorage.setItem('spendwise_currency', code);
  }, []);

  /**
   * Convert a value stored in INR to the current display currency.
   * @param {number} amountInr - value in INR
   * @returns {number}
   */
  const convert = useCallback((amountInr) => {
    const rate = RATES_FROM_INR[currencyCode] ?? 1;
    return amountInr * rate;
  }, [currencyCode]);

  /**
   * Format a value (in INR) to the current currency display string.
   * @param {number} amountInr
   * @param {{ compact?: boolean }} opts
   * @returns {string}
   */
  const fmt = useCallback((amountInr, { compact = false } = {}) => {
    const converted = convert(amountInr);
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyCode,
        notation: compact ? 'compact' : 'standard',
        maximumFractionDigits: compact ? 1 : 2,
      }).format(converted);
    } catch {
      // fallback if locale unsupported
      return `${currency.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
  }, [convert, currency, currencyCode]);

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode, switchCurrency, convert, fmt, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

/** Hook — use inside any component wrapped by CurrencyProvider */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return ctx;
}

export default CurrencyContext;
