import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MFAFactor {
  id: string;
  type?: 'totp';
  factor_type?: 'totp';
  friendly_name?: string;
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
}

export interface MFAEnrollmentData {
  id: string;
  type: 'totp';
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export interface UseMFAReturn {
  factors: MFAFactor[];
  isLoading: boolean;
  isEnrolling: boolean;
  isVerifying: boolean;
  enrollmentData: MFAEnrollmentData | null;
  isMFAEnabled: boolean;
  startEnrollment: (friendlyName?: string) => Promise<void>;
  verifyEnrollment: (code: string) => Promise<boolean>;
  cancelEnrollment: () => void;
  unenroll: (factorId: string) => Promise<boolean>;
  refreshFactors: () => Promise<void>;
  createChallenge: (factorId: string) => Promise<string | null>;
  verifyChallenge: (factorId: string, challengeId: string, code: string) => Promise<boolean>;
}

export function useMFA(): UseMFAReturn {
  const { user } = useAuth();
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<MFAEnrollmentData | null>(null);

  const refreshFactors = useCallback(async () => {
    if (!user) {
      setFactors([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      setFactors(data.totp || []);
    } catch (error) {
      if (import.meta.env.DEV) 
      toast.error('Erro ao carregar configurações MFA');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshFactors();
  }, [refreshFactors]);

  const startEnrollment = async (friendlyName = 'Autenticador') => {
    try {
      setIsEnrolling(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName,
      });

      if (error) throw error;

      setEnrollmentData(data);
    } catch (error) {
      if (import.meta.env.DEV) 
      const message = error instanceof Error ? error.message : 'Erro ao iniciar configuração MFA';
      toast.error(message);
      setIsEnrolling(false);
    }
  };

  const verifyEnrollment = async (code: string): Promise<boolean> => {
    if (!enrollmentData) {
      toast.error('Nenhuma configuração MFA em andamento');
      return false;
    }

    try {
      setIsVerifying(true);

      // First create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollmentData.id,
      });

      if (challengeError) throw challengeError;

      // Then verify with the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollmentData.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      toast.success('Autenticação de dois fatores ativada!');
      setEnrollmentData(null);
      setIsEnrolling(false);
      await refreshFactors();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) 
      const message = error instanceof Error ? error.message : 'Código inválido';
      toast.error(message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelEnrollment = () => {
    setEnrollmentData(null);
    setIsEnrolling(false);
  };

  const unenroll = async (factorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      toast.success('Autenticação de dois fatores desativada');
      await refreshFactors();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) 
      const message = error instanceof Error ? error.message : 'Erro ao desativar MFA';
      toast.error(message);
      return false;
    }
  };

  const createChallenge = async (factorId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (error) throw error;

      return data.id;
    } catch (error) {
      if (import.meta.env.DEV) 
      const message = error instanceof Error ? error.message : 'Erro ao criar desafio MFA';
      toast.error(message);
      return null;
    }
  };

  const verifyChallenge = async (
    factorId: string,
    challengeId: string,
    code: string
  ): Promise<boolean> => {
    try {
      setIsVerifying(true);
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (error) throw error;

      return true;
    } catch (error) {
      if (import.meta.env.DEV) 
      const message = error instanceof Error ? error.message : 'Código inválido';
      toast.error(message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const isMFAEnabled = factors.some(f => f.status === 'verified');

  return {
    factors,
    isLoading,
    isEnrolling,
    isVerifying,
    enrollmentData,
    isMFAEnabled,
    startEnrollment,
    verifyEnrollment,
    cancelEnrollment,
    unenroll,
    refreshFactors,
    createChallenge,
    verifyChallenge,
  };
}
