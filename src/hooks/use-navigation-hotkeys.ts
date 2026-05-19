import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHapticFeedback } from './use-haptic-feedback';
import { SoundFeedback } from '@/lib/soundFeedback';

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
        SoundFeedback.navBack();
        navigate(-1);
      }

      // Alt + H to go Home
      if (event.altKey && (event.key === 'h' || event.key === 'H')) {
        event.preventDefault();
        trigger('medium');
        SoundFeedback.navForward();
        navigate('/');
      }

      // Alt + N to go Notifications
      if (event.altKey && (event.key === 'n' || event.key === 'N')) {
        event.preventDefault();
        trigger('light');
        navigate('/notifications');
      }

      // Alt + S to open Global Search (simulates Cmd+K)
      if (event.altKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault();
        trigger('light');
        SoundFeedback.click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
      }
      
      // Alt + R for Refresh data
      if (event.altKey && (event.key === 'r' || event.key === 'R')) {
        event.preventDefault();
        trigger('medium');
        SoundFeedback.click();
        window.location.reload();
      }

      // Alt + B for Back (additional shortcut)
      if (event.altKey && (event.key === 'b' || event.key === 'B')) {
        event.preventDefault();
        trigger('light');
        SoundFeedback.navBack();
        navigate(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location, trigger]);
}
