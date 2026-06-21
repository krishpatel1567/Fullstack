import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex justify-center items-center py-8 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-solid border-border border-t-primary ${sizes[size]}`} 
      />
    </div>
  );
}
