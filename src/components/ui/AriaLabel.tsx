import React, { ReactNode } from 'react';

interface AriaLabelProps {
  label: string;
  children: ReactNode;
  describedBy?: string;
  labelledBy?: string;
}

export function AriaLabel({ label, children, describedBy, labelledBy }: AriaLabelProps) {
  return (
    <div 
      aria-label={label}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy}
      role="region"
    >
      {children}
    </div>
  );
}

interface AriaLiveProps {
  children: ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

export function AriaLive({ children, politeness = 'polite', atomic = true, relevant = 'additions' }: AriaLiveProps) {
  return (
    <div aria-live={politeness} aria-atomic={atomic} aria-relevant={relevant}>
      {children}
    </div>
  );
}
