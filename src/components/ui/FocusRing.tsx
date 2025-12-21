import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FocusRingProps {
  children: ReactNode;
  className?: string;
  offset?: number;
  color?: string;
}

export function FocusRing({ children, className, offset = 2, color = 'ring-primary' }: FocusRingProps) {
  return (
    <div className={cn('focus-within:ring-2 focus-within:ring-offset-2 rounded-md', color, `ring-offset-${offset}`, className)}>
      {children}
    </div>
  );
}
