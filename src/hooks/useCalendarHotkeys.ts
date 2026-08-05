import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, subDays, addWeeks, subWeeks } from 'date-fns';

interface CalendarHotkeysOptions {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  onFocusSearch?: () => void;
  onOpenFilters?: () => void;
  onNewJob?: () => void;
  onEscape?: () => void;
  scope?: 'daily' | 'weekly' | 'monthly';
  enabled?: boolean;
}

/**
 * Global calendar keyboard shortcuts (E5).
 * ←/→ day, Shift+←/→ week, T today, N new, F filters, / search, 1/2/3 views.
 */
export function useCalendarHotkeys({
  selectedDate,
  onDateChange,
  onFocusSearch,
  onOpenFilters,
  onNewJob,
  onEscape,
  scope = 'daily',
  enabled = true,
}: CalendarHotkeysOptions) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      const isTyping =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable;

      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      // Allow "/" focus even when not typing
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        onFocusSearch?.();
        return;
      }

      if (isTyping) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onDateChange(e.shiftKey ? subWeeks(selectedDate, 1) : subDays(selectedDate, 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onDateChange(e.shiftKey ? addWeeks(selectedDate, 1) : addDays(selectedDate, 1));
          break;
        case 't':
        case 'T':
          e.preventDefault();
          onDateChange(new Date());
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          onOpenFilters?.();
          break;
        case 'n':
        case 'N':
          if (onNewJob) {
            e.preventDefault();
            onNewJob();
          } else {
            e.preventDefault();
            navigate('/new-job');
          }
          break;
        case '1':
          e.preventDefault();
          if (scope !== 'daily') navigate('/calendar/daily');
          break;
        case '2':
          e.preventDefault();
          if (scope !== 'weekly') navigate('/calendar/weekly');
          break;
        case '3':
          e.preventDefault();
          if (scope !== 'monthly') navigate('/calendar/monthly');
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, selectedDate, onDateChange, onFocusSearch, onOpenFilters, onNewJob, onEscape, scope, navigate]);
}
