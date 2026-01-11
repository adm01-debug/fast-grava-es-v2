import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SESSION_DURATION_HOURS = 24;
const REFRESH_INTERVAL_MINUTES = 30;
const ACTIVITY_TIMEOUT_MINUTES = 60;

export function useSessionManager() {
  const { user, signOut } = useAuth();
  const lastActivityRef = useRef<Date>(new Date());
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
  }, []);

  // Check if session is still valid based on activity
  const isSessionActive = useCallback(() => {
    const now = new Date();
    const diffMs = now.getTime() - lastActivityRef.current.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes < ACTIVITY_TIMEOUT_MINUTES;
  }, []);

  // Refresh the session token
  const refreshSession = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        
        // If refresh fails and session is inactive, sign out
        if (!isSessionActive()) {
          await signOut();
        }
        return;
      }

      if (data.session) {
        if (import.meta.env.DEV) console.log('Session refreshed successfully');
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, [user, isSessionActive, signOut]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user, updateActivity]);

  // Set up session refresh interval
  useEffect(() => {
    if (!user) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      return;
    }

    // Refresh session every 30 minutes if user is active
    refreshIntervalRef.current = setInterval(() => {
      if (isSessionActive()) {
        refreshSession();
      }
    }, REFRESH_INTERVAL_MINUTES * 60 * 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user, isSessionActive, refreshSession]);

  // Check session expiry on visibility change
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, check if session needs refresh
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          await signOut();
          return;
        }

        // Check if session will expire soon (within 1 hour)
        const expiresAt = session.expires_at;
        if (expiresAt) {
          const expiryDate = new Date(expiresAt * 1000);
          const now = new Date();
          const diffHours = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          if (diffHours < 1) {
            await refreshSession();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshSession, signOut]);

  return {
    updateActivity,
    isSessionActive,
    refreshSession,
    lastActivity: lastActivityRef.current,
    sessionDurationHours: SESSION_DURATION_HOURS,
    activityTimeoutMinutes: ACTIVITY_TIMEOUT_MINUTES,
  };
}

// Wrapper component to initialize session management
export function SessionManager({ children }: { children: React.ReactNode }) {
  useSessionManager();
  return <>{children}</>;
}
