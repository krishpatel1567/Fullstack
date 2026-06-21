import React, { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
