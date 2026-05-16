import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHapticFeedback } from './use-haptic-feedback';

export function useNavigationHotkeys() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trigger } = useHapticFeedback();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Alt + ArrowLeft or Backspace to go back
      if ((event.altKey && event.key === 'ArrowLeft')) {
        event.preventDefault();
        trigger('light');
        navigate(-1);
      }

      // Alt + H to go Home
      if (event.altKey && (event.key === 'h' || event.key === 'H')) {
        event.preventDefault();
        trigger('medium');
        navigate('/');
      }

      // Alt + N to go Notifications
      if (event.altKey && (event.key === 'n' || event.key === 'N')) {
        event.preventDefault();
        trigger('light');
        navigate('/notifications');
      }
      
      // Alt + K for Command Palette (handled by its own component, but we could unify here)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location, trigger]);
}
