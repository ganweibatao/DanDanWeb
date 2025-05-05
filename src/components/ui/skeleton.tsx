import React from 'react';

/**
 * Skeleton component for loading placeholders.
 * Accepts className for sizing and styling.
 */
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    />
  );
}; 