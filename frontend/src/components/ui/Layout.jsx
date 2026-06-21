import React from 'react';

export function Container({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}>
      {children}
    </div>
  );
}

export function PageLayout({ children, className = '' }) {
  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-background text-foreground py-8 animate-fade-in ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-foreground-muted mt-1">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export function Divider({ className = '' }) {
  return <hr className={`border-border my-8 ${className}`} />;
}
