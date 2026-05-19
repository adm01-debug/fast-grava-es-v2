import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useMFA() {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkMFA() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) throw error;
        setMfaEnabled(data.currentLevel === 'aal2');
      } catch (error) {
        console.error('Error checking MFA status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkMFA();
  }, [user]);

  return { mfaEnabled, isLoading };
}
