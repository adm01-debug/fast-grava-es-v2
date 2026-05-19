import { supabase } from '@/integrations/supabase/client';

export interface LockoutStatus {
  locked: boolean;
  remaining_minutes?: number;
  message?: string;
  attempts_remaining?: number;
}

export const AuthService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Security Helpers
  async checkLockout(email: string, ipAddress?: string): Promise<LockoutStatus> {
    try {
      const { data, error } = await supabase.functions.invoke('check-login-lockout', {
        body: { email, ip_address: ipAddress, action: 'check' }
      });
      if (error) return { locked: false };
      return data;
    } catch (err) {
      return { locked: false };
    }
  },

  async recordLoginAttempt(email: string, success: boolean, ipAddress?: string): Promise<LockoutStatus> {
    try {
      const { data, error } = await supabase.functions.invoke('check-login-lockout', {
        body: {
          email,
          ip_address: ipAddress,
          action: success ? 'record_success' : 'record_failure'
        }
      });
      if (error) return { locked: false };
      return data;
    } catch (err) {
      return { locked: false };
    }
  },

  async getClientIP(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }
};
