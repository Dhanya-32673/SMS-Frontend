import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Enterprise Responsive Table Component
 * - Renders standard HTML Table on Desktop / Tablet (md+)
 * - Renders stacked touch-friendly Cards on Mobile (< md)
 */
export const ResponsiveTable = ({
  columns = [],
  data = [],
  keyExtractor = (item, index) => item.id || index,
  renderMobileCard,
  emptyMessage = 'No records found.',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* MOBILE STACKED CARD VIEW (< md) */}
      <div className="block md:hidden space-y-3">
        {data.map((item, index) => (
          <div
            key={keyExtractor(item, index)}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all"
          >
            {renderMobileCard ? (
              renderMobileCard(item, index)
            ) : (
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key || col.header} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{col.header}:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                      {col.render ? col.render(item, index) : item[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DESKTOP / TABLET HTML TABLE (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.header} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key || col.header} className={`py-3.5 px-4 text-slate-800 dark:text-slate-200 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(item, index) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveTable;
