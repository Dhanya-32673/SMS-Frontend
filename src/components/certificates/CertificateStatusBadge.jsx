import React from 'react';
import {
  CheckCircle2,
  Clock,
  Upload,
  AlertTriangle,
  XCircle,
  Archive,
  AlertCircle
} from 'lucide-react';

export const CertificateStatusBadge = ({ status }) => {
  const normalizedStatus = (status || 'UPLOADED').toUpperCase();

  const statusConfig = {
    VERIFIED: {
      label: 'VERIFIED',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
      icon: CheckCircle2,
    },
    UPLOADED: {
      label: 'UPLOADED',
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
      icon: Upload,
    },
    PENDING: {
      label: 'PENDING',
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
      icon: Clock,
    },
    MISSING: {
      label: 'MISSING',
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
      icon: AlertCircle,
    },
    REJECTED: {
      label: 'REJECTED',
      bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
      icon: XCircle,
    },
    EXPIRED: {
      label: 'EXPIRED',
      bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      icon: AlertTriangle,
    },
    ARCHIVED: {
      label: 'ARCHIVED',
      bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900',
      icon: Archive,
    },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.UPLOADED;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase ${config.bg}`}
    >
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export default CertificateStatusBadge;
