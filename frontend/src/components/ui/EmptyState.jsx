import React from 'react';

export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[400px] border border-dashed border-border rounded-xl bg-surface/50 ${className}`}>
      {icon && <div className="text-4xl mb-4 text-foreground-muted">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-foreground-muted max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
