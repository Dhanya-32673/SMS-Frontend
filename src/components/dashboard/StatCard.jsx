import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtext, trend, trendUp = true }) => {
  const iconBgMap = {
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
  };

  const selectedBg = iconBgMap[color] || iconBgMap.indigo;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{title}</span>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
        {trend && (
          <div className="flex items-center space-x-1 text-[11px] font-semibold">
            {trendUp ? (
              <span className="text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> {trend}
              </span>
            ) : (
              <span className="text-rose-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> {trend}
              </span>
            )}
          </div>
        )}
        {subtext && !trend && <p className="text-[11px] text-slate-400">{subtext}</p>}
      </div>

      <div className={`w-11 h-11 rounded-xl ${selectedBg} flex items-center justify-center shrink-0 shadow-xs`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
    </div>
  );
};

export default StatCard;
