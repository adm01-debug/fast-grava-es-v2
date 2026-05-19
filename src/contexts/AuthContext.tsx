import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { toast } from 'sonner';
import { AuthService } from '@/services/authService';

export type AppRole = 'coordinator' | 'operator' | 'manager';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isCoordinator: boolean;
  isOperator: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { checkDevice } = useDeviceDetection();
  
  const lastActivityRef = useRef<Date>(new Date());
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ACTIVITY_TIMEOUT_MINUTES = 60;
  const REFRESH_INTERVAL_MINUTES = 30;

  const fetchUserData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      const { data: roleData } = await supabase
        .rpc('get_user_role', { _user_id: userId });

      if (roleData) {
        setRole(roleData as AppRole);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
  }, []);

  const isSessionActive = useCallback(() => {
    const now = new Date();
    const diffMs = now.getTime() - lastActivityRef.current.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes < ACTIVITY_TIMEOUT_MINUTES;
  }, []);

  const refreshSession = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        const isAuthError = error.message.includes('refresh_token_not_found') || 
                           error.message.includes('Invalid Refresh Token');
        if (isAuthError || !isSessionActive()) {
          await signOut();
        }
        return;
      }
      if (!data.session) await signOut();
    } catch (error) {
      console.error("Critical session refresh error:", error);
    }
  }, [user, isSessionActive]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, updateActivity, { passive: true }));
    
    refreshIntervalRef.current = setInterval(() => {
      if (isSessionActive()) refreshSession();
    }, REFRESH_INTERVAL_MINUTES * 60 * 1000);

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const session = await AuthService.getSession();
        if (!session) {
          await signOut();
          return;
        }
        const expiresAt = session.expires_at;
        if (expiresAt) {
          const diffHours = (new Date(expiresAt * 1000).getTime() - new Date().getTime()) / (1000 * 60 * 60);
          if (diffHours < 1) await refreshSession();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, updateActivity, isSessionActive, refreshSession]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setIsLoading(false);
      }
    );

    AuthService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const ipAddress = await AuthService.getClientIP();
    const lockoutStatus = await AuthService.checkLockout(email, ipAddress);
    
    if (lockoutStatus.locked) {
      const lockoutError = new Error(lockoutStatus.message || 'Conta temporariamente bloqueada') as any;
      lockoutError.isLockout = true;
      lockoutError.remainingMinutes = lockoutStatus.remaining_minutes || 0;
      return { error: lockoutError };
    }

    try {
      const data = await AuthService.signIn(email, password);
      await AuthService.recordLoginAttempt(email, true, ipAddress);

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .maybeSingle();

        const result = await checkDevice(
          data.user.id,
          data.user.email || email,
          profileData?.full_name || undefined
        );

        if (result.isNewDevice) {
          toast.info('Novo dispositivo detectado', {
            description: 'Um email de alerta foi enviado para sua caixa de entrada.',
            duration: 5000,
          });
        }
      }

      return { error: null };
    } catch (error: any) {
      const result = await AuthService.recordLoginAttempt(email, false, ipAddress);

      if (result.locked) {
        const lockoutError = new Error(result.message || `Conta bloqueada por ${result.lockout_minutes} minuto(s)`) as any;
        lockoutError.isLockout = true;
        lockoutError.lockoutMinutes = result.lockout_minutes || 0;
        return { error: lockoutError };
      }

      if (result.attempts_remaining !== undefined && result.attempts_remaining <= 2) {
        toast.warning(`Atenção: ${result.attempts_remaining} tentativa(s) restante(s)`, {
          description: 'Após 5 tentativas falhas, sua conta será bloqueada temporariamente.',
          duration: 5000,
        });
      }

      return { error };
    }
  };

  const signUp = async (_email: string, _password: string, _fullName: string) => {
    return { error: new Error('Cadastro público desabilitado. Solicite acesso ao gestor.') };
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    role,
    isLoading,
    signIn,
    signUp,
    signOut,
    isCoordinator: role === 'coordinator',
    isOperator: role === 'operator',
    isManager: role === 'manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
