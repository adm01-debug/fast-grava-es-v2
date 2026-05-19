import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../index';
import { toast } from 'sonner';

export function useMFA() {
  const { user } = useAuth();
  const [factors, setFactors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  const refreshFactors = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors(data.all || []);
    } catch (error) {
      console.error('Error listing MFA factors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshFactors();
  }, [refreshFactors]);

  const startEnrollment = async () => {
    setIsEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Fast Gravações',
        friendlyName: 'Fast Gravações MFA'
      });
      if (error) throw error;
      setEnrollmentData(data);
      return data;
    } catch (error: any) {
      toast.error('Erro ao iniciar cadastro MFA', { description: error.message });
    } finally {
      setIsEnrolling(false);
    }
  };

  const verifyEnrollment = async (code: string) => {
    if (!enrollmentData) return;
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollmentData.id,
        code
      });
      if (error) throw error;
      await refreshFactors();
      setEnrollmentData(null);
      toast.success('MFA ativado com sucesso!');
      return data;
    } catch (error: any) {
      toast.error('Código inválido', { description: error.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelEnrollment = () => {
    setEnrollmentData(null);
  };

  const unenroll = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      await refreshFactors();
      toast.success('MFA desativado');
    } catch (error: any) {
      toast.error('Erro ao desativar MFA', { description: error.message });
    }
  };

  const isMFAEnabled = factors.some(f => f.status === 'verified');

  return {
    factors,
    isMFAEnabled,
    mfaEnabled: isMFAEnabled,
    isLoading,
    isEnrolling,
    isVerifying,
    enrollmentData,
    startEnrollment,
    verifyEnrollment,
    cancelEnrollment,
    unenroll,
    refreshFactors
  };
}
