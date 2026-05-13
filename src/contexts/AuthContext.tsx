import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { toast } from 'sonner';

// Lockout check helper
async function checkLockout(email: string, ipAddress?: string): Promise<{
  locked: boolean;
  remaining_minutes?: number;
  message?: string;
  attempts_remaining?: number;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('check-login-lockout', {
      body: { email, ip_address: ipAddress, action: 'check' }
    });
    
    if (error) {
      if (import.meta.env.DEV) console.error('Lockout check error:', error);
      return { locked: false };
    }
    
    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('Lockout check failed:', err);
    return { locked: false };
  }
}

async function recordLoginAttempt(email: string, success: boolean, ipAddress?: string): Promise<{
  locked?: boolean;
  lockout_minutes?: number;
  attempts_remaining?: number;
  message?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('check-login-lockout', {
      body: { 
        email, 
        ip_address: ipAddress, 
        action: success ? 'record_success' : 'record_failure' 
      }
    });
    
    if (error) {
      if (import.meta.env.DEV) console.error('Record attempt error:', error);
      return {};
    }
    
    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('Record attempt failed:', err);
    return {};
  }
}

// Get client IP (best effort)
async function getClientIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
}

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

  const fetchUserData = async (userId: string) => {
    console.log('[AuthContext] Fetching user data for:', userId);
    try {
      // Fetch profile
      console.log('[AuthContext] Fetching profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) console.error('[AuthContext] Profile fetch error:', profileError);
      if (profileData) {
        console.log('[AuthContext] Profile found:', profileData);
        setProfile(profileData as Profile);
      } else {
        console.log('[AuthContext] No profile found');
      }

      // Fetch role using RPC
      console.log('[AuthContext] Fetching role via RPC get_user_role...');
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role', { _user_id: userId });

      if (roleError) {
        console.error('[AuthContext] Role RPC error:', roleError);
      }
      
      if (roleData) {
        console.log('[AuthContext] Role found:', roleData);
        setRole(roleData as AppRole);
      } else {
        console.warn('[AuthContext] No role returned for user');
      }
    } catch (error) {
      console.error('[AuthContext] Error in fetchUserData:', error);
    }
  };

  useEffect(() => {
    console.log('[AuthContext] Mounting AuthProvider, checking session...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthContext] Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls with setTimeout
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AuthContext] Initial getSession result:', session?.user?.id, error);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log('[AuthContext] Unmounting AuthProvider');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Get client IP for lockout tracking
    const ipAddress = await getClientIP();
    
    // Check if account is locked
    const lockoutStatus = await checkLockout(email, ipAddress);
    if (lockoutStatus.locked) {
      const lockoutError = new Error(lockoutStatus.message || 'Conta temporariamente bloqueada') as Error & { 
        isLockout: boolean;
        remainingMinutes: number;
      };
      lockoutError.isLockout = true;
      lockoutError.remainingMinutes = lockoutStatus.remaining_minutes || 0;
      return { error: lockoutError };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Record login attempt result
    if (error) {
      const result = await recordLoginAttempt(email, false, ipAddress);
      
      // If account is now locked, return specific error
      if (result.locked) {
        const lockoutError = new Error(result.message || `Conta bloqueada por ${result.lockout_minutes} minuto(s)`) as Error & {
          isLockout: boolean;
          lockoutMinutes: number;
        };
        lockoutError.isLockout = true;
        lockoutError.lockoutMinutes = result.lockout_minutes || 0;
        return { error: lockoutError };
      }
      
      // Show remaining attempts warning
      if (result.attempts_remaining !== undefined && result.attempts_remaining <= 2) {
        toast.warning(`Atenção: ${result.attempts_remaining} tentativa(s) restante(s)`, {
          description: 'Após 5 tentativas falhas, sua conta será bloqueada temporariamente.',
          duration: 5000,
        });
      }
      
      return { error };
    }
    
    // Login successful - reset lockout
    await recordLoginAttempt(email, true, ipAddress);
    
    // Se login bem-sucedido, verificar dispositivo
    if (data.user) {
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
      } catch (deviceError) {
        if (import.meta.env.DEV) console.error('Error checking device:', deviceError);
      }
    }
    
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
