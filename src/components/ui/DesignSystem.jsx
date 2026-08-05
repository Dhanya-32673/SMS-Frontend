/**
 * SICMS Global Design System
 * Shared reusable UI primitives used across every page.
 * DO NOT modify business logic when importing from this file.
 */
import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Upload, Ban, ShieldCheck } from 'lucide-react';

// ─── COLOR TOKENS ──────────────────────────────────────────────────────────────
export const COLORS = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
};

// ─── BANNER CARD ───────────────────────────────────────────────────────────────
export const BannerCard = ({ tag, title, description, actions, children }) => (
  <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
    {/* Decorative circles */}
    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
    <div className="space-y-2 relative z-10 text-center sm:text-left">
      {tag && (
        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
          {tag}
        </span>
      )}
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
      {description && <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">{description}</p>}
      {children}
    </div>
    {actions && <div className="relative z-10 flex items-center gap-3 shrink-0">{actions}</div>}
  </div>
);

// ─── WHITE CARD ────────────────────────────────────────────────────────────────
export const Card = ({ className = '', children }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}>
    {children}
  </div>
);

// ─── SECTION CARD (smaller radius) ─────────────────────────────────────────────
export const SectionCard = ({ className = '', children }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}>
    {children}
  </div>
);

// ─── PRIMARY BUTTON ────────────────────────────────────────────────────────────
export const PrimaryBtn = ({ onClick, children, type = 'button', disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/30 transition-all duration-150 cursor-pointer ${className}`}
  >
    {children}
  </button>
);

// ─── SECONDARY BUTTON ──────────────────────────────────────────────────────────
export const SecondaryBtn = ({ onClick, children, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all duration-150 cursor-pointer ${className}`}
  >
    {children}
  </button>
);

// ─── DANGER BUTTON ─────────────────────────────────────────────────────────────
export const DangerBtn = ({ onClick, children, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-150 cursor-pointer ${className}`}
  >
    {children}
  </button>
);

// ─── SEARCH BAR ────────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative ${className}`}>
    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
    />
  </div>
);

// ─── FORM INPUT ────────────────────────────────────────────────────────────────
export const FormInput = ({ label, id, type = 'text', required = false, ...props }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <input
      id={id}
      type={type}
      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
      {...props}
    />
  </div>
);

// ─── FORM SELECT ───────────────────────────────────────────────────────────────
export const FormSelect = ({ label, id, required = false, children, ...props }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <select
      id={id}
      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition appearance-none cursor-pointer"
      {...props}
    >
      {children}
    </select>
  </div>
);

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  VERIFIED:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ACTIVE:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  APPROVED:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  PENDING:    'bg-amber-50  text-amber-700  border border-amber-200',
  UPLOADED:   'bg-blue-50   text-blue-700   border border-blue-200',
  MISSING:    'bg-rose-50   text-rose-700   border border-rose-200',
  REJECTED:   'bg-rose-50   text-rose-700   border border-rose-200',
  INACTIVE:   'bg-slate-100 text-slate-500  border border-slate-200',
  DEFAULT:    'bg-slate-100 text-slate-600  border border-slate-200',
};

const BADGE_ICONS = {
  VERIFIED:  <CheckCircle2 className="w-3 h-3" />,
  ACTIVE:    <CheckCircle2 className="w-3 h-3" />,
  APPROVED:  <CheckCircle2 className="w-3 h-3" />,
  PENDING:   <Clock className="w-3 h-3" />,
  UPLOADED:  <Upload className="w-3 h-3" />,
  MISSING:   <AlertTriangle className="w-3 h-3" />,
  REJECTED:  <XCircle className="w-3 h-3" />,
  INACTIVE:  <Ban className="w-3 h-3" />,
};

export const StatusBadge = ({ status }) => {
  const key = (status || 'DEFAULT').toUpperCase();
  const style = BADGE_STYLES[key] || BADGE_STYLES.DEFAULT;
  const icon = BADGE_ICONS[key] || null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${style}`}>
      {icon}{key}
    </span>
  );
};

// ─── EMPTY STATE ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
      {Icon && <Icon className="w-7 h-7 text-blue-400" />}
    </div>
    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{title}</p>
    {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
  </div>
);

// ─── LOADING SPINNER ───────────────────────────────────────────────────────────
export const Spinner = ({ label = 'Loading...' }) => (
  <div className="py-16 flex flex-col items-center gap-3">
    <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    <p className="text-xs font-bold text-slate-400">{label}</p>
  </div>
);

// ─── TABLE WRAPPER ─────────────────────────────────────────────────────────────
export const TableCard = ({ children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        {children}
      </table>
    </div>
  </div>
);

export const THead = ({ children }) => (
  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
    {children}
  </thead>
);

export const TBody = ({ children }) => (
  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
    {children}
  </tbody>
);

export const TRow = ({ children, onClick, className = '' }) => (
  <tr
    onClick={onClick}
    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

// ─── MODAL WRAPPER ─────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, subtitle, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── KPI STAT CARD ─────────────────────────────────────────────────────────────
export const KpiCard = ({ icon: Icon, label, value, color = 'blue', trend }) => {
  const colorMap = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-950/40',   icon: 'text-blue-600', val: 'text-blue-600' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: 'text-emerald-600', val: 'text-emerald-600' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-950/40', icon: 'text-amber-600', val: 'text-amber-600' },
    rose:   { bg: 'bg-rose-50 dark:bg-rose-950/40',   icon: 'text-rose-600', val: 'text-rose-600' },
    purple: { bg: 'bg-violet-50 dark:bg-violet-950/40', icon: 'text-violet-600', val: 'text-violet-600' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center shrink-0`}>
        {Icon && <Icon className={`w-6 h-6 ${c.icon}`} />}
      </div>
      <div>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-black ${c.val}`}>{value ?? '—'}</p>
        {trend && <p className="text-[10px] text-slate-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
};

export default {
  BannerCard, Card, SectionCard, PrimaryBtn, SecondaryBtn, DangerBtn,
  SearchBar, FormInput, FormSelect, StatusBadge, EmptyState, Spinner,
  TableCard, THead, TBody, TRow, Modal, KpiCard,
};
