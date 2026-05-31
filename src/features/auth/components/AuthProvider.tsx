import { useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { toast } from 'sonner';
import { AuthService } from '../services/authService';
import { logger } from '@/lib/logger';
import {
  AuthContext,
  type AuthContextType,
  type AppRole,
  type Profile,
} from '../types/auth.types';

const AUTH_BOOT_TIMEOUT_MS = 8000;
const USER_DATA_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} excedeu o tempo limite`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}

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
      const [profileResult, roleResult] = await withTimeout(
        Promise.allSettled([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),
          supabase.rpc('get_user_role', { _user_id: userId }),
        ]),
        USER_DATA_TIMEOUT_MS,
        'Carregamento dos dados do usuário'
      );

      const profileData = profileResult.status === 'fulfilled' ? profileResult.value?.data : null;
      const roleData = roleResult.status === 'fulfilled' ? roleResult.value?.data : null;

      if (profileData) {
        setProfile(profileData as Profile);
      }

      if (roleData) {
        setRole(roleData as AppRole);
      } else {
        // Explicitly set to null if no role is returned to avoid "stuck" states
        setRole(null);
      }
    } catch (error) {
      setRole(null);
      logger.warn('Não foi possível carregar todos os dados do usuário', error, 'AuthProvider');
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
      logger.warn('Não foi possível renovar a sessão', error, 'AuthProvider');
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
    let isInitialMount = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip INITIAL_SESSION if we already handled it via getSession to avoid race conditions
        if (event === 'INITIAL_SESSION' && !isInitialMount) return;
        
        logger.debug('Auth state change event:', { event, hasSession: !!session }, 'AuthProvider');
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setIsLoading(true);
          try {
            await fetchUserData(session.user.id);
          } finally {
            setIsLoading(false);
          }
        } else {
          setProfile(null);
          setRole(null);
          setIsLoading(false);
        }
        
        isInitialMount = false;
      }
    );

    // Initial boot
    const initAuth = async () => {
      try {
        const session = await withTimeout(
          AuthService.getSession(), 
          AUTH_BOOT_TIMEOUT_MS, 
          'Inicialização da sessão'
        );
        
        if (isInitialMount) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserData(session.user.id);
          }
        }
      } catch (error) {
        logger.warn('Não foi possível inicializar a sessão no boot', error, 'AuthProvider');
        if (isInitialMount) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } finally {
        if (isInitialMount) {
          setIsLoading(false);
          isInitialMount = false;
        }
      }
    };

    initAuth();

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
        // Set loading true while we fetch profile/role to prevent ProtectedRoute from redirecting too early
        setIsLoading(true);
        
        setSession(data.session);
        setUser(data.user);
        
        // Load user data
        await fetchUserData(data.user.id);
        setIsLoading(false);
        
        // Check device in background
        (async () => {
          try {
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
          } catch (e) {
            logger.warn('Erro ao verificar dispositivo (em background)', e, 'AuthProvider');
          }
        })();
      }

      return { error: null };
    } catch (error: unknown) {
      const result = await AuthService.recordLoginAttempt(email, false, ipAddress);

      if (result.locked) {
        const lockoutError = Object.assign(
          new Error(result.message || `Conta bloqueada por ${result.lockout_minutes} minuto(s)`),
          { isLockout: true, lockoutMinutes: result.lockout_minutes || 0 }
        );
        return { error: lockoutError };
      }

      if (result.attempts_remaining !== undefined && result.attempts_remaining <= 2) {
        toast.warning(`Atenção: ${result.attempts_remaining} tentativa(s) restante(s)`, {
          description: 'Após 5 tentativas falhas, sua conta será bloqueada temporariamente.',
          duration: 5000,
        });
      }

      return { error: error instanceof Error ? error : new Error(String(error)) };
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
    isCoordinator: role === 'coordinator' || role === 'admin',
    isOperator: role === 'operator',
    isManager: role === 'manager',
    isAdmin: role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
