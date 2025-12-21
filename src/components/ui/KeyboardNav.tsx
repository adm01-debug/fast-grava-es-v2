import React, { ReactNode, useCallback, KeyboardEvent } from 'react';

interface KeyboardNavProps {
  children: ReactNode;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  className?: string;
}

export function KeyboardNav({ children, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onHome, onEnd, className }: KeyboardNavProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': onArrowUp?.(); e.preventDefault(); break;
      case 'ArrowDown': onArrowDown?.(); e.preventDefault(); break;
      case 'ArrowLeft': onArrowLeft?.(); e.preventDefault(); break;
      case 'ArrowRight': onArrowRight?.(); e.preventDefault(); break;
      case 'Enter': onEnter?.(); break;
      case 'Escape': onEscape?.(); break;
      case 'Home': onHome?.(); e.preventDefault(); break;
      case 'End': onEnd?.(); e.preventDefault(); break;
    }
  }, [onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onHome, onEnd]);

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} className={className} role="navigation">
      {children}
    </div>
  );
}
