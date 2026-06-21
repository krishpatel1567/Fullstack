import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-background-secondary text-foreground hover:bg-surface-hover border border-border",
    ghost: "bg-transparent text-foreground hover:bg-surface-hover",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-sm",
    md: "h-10 px-4 py-2 text-sm rounded-md",
    lg: "h-12 px-8 text-base rounded-lg",
    icon: "h-10 w-10 rounded-md",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
