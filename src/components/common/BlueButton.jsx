import React from 'react';
import { Loader2 } from 'lucide-react';

export const BlueButton = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'success', 'warning', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  loading = false,
  disabled = false,
  icon: Icon = null,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs space-x-1.5',
    md: 'px-4 py-2 text-xs space-x-2',
    lg: 'px-6 py-3 text-sm space-x-2.5 rounded-2xl',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 shadow-xs',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5',
    warning:
      'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 hover:shadow-lg hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default BlueButton;
