import React from 'react';

export const EnterpriseCard = ({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
  bodyClassName = '',
  accent = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || Icon || action) && (
        <div className="p-5 px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0 shadow-xs">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default EnterpriseCard;
