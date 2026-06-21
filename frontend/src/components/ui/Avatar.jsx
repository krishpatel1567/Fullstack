import React from 'react';

export function Avatar({ src, alt, fallback, size = 'md', className = '' }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  return (
    <div className={`relative flex shrink-0 overflow-hidden rounded-full border border-border bg-surface text-foreground ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="aspect-square h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-background-secondary font-medium">
          {fallback || alt?.[0]?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}
