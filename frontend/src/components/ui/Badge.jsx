import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-background-secondary text-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "text-foreground border border-border",
  };

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
