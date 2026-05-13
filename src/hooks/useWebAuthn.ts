import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WebAuthnCredential {
  id: string;
  credential_id: string;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

function bufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64URLToBuffer(base64URL: string): ArrayBuffer {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return bufferToBase64URL(array.buffer);
}

export function useWebAuthn() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetIsLoading = (val: boolean) => isMounted.current && setIsLoading(val);
  const safeSetIsRegistering = (val: boolean) => isMounted.current && setIsRegistering(val);
  const safeSetIsAuthenticating = (val: boolean) => isMounted.current && setIsAuthenticating(val);

  const isSupported = typeof window !== 'undefined' && 
    !!window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function';

  const checkPlatformAuthenticator = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }, [isSupported]);

  const fetchCredentials = useCallback(async () => {
    if (!user) return;
    
    safeSetIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('webauthn_credentials')
        .select('id, credential_id, device_name, created_at, last_used_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (isMounted.current) setCredentials(data || []);
    } catch (error) {
      if (import.meta.env.DEV) 
    } finally {
      safeSetIsLoading(false);
    }
  }, [user]);

  const registerPasskey = useCallback(async (deviceName?: string): Promise<boolean> => {
    if (!user || !isSupported) {
      toast.error('WebAuthn não é suportado neste navegador');
      return false;
    }

    safeSetIsRegistering(true);
    try {
      const challenge = generateChallenge();
      const { error: challengeError } = await supabase
        .from('webauthn_challenges')
        .insert({
          user_id: user.id,
          challenge,
          type: 'registration'
        });

      if (challengeError) throw challengeError;

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64URLToBuffer(challenge),
        rp: {
          name: 'GráficaPro',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(user.id),
          name: user.email || '',
          displayName: user.email?.split('@')[0] || 'Usuário'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' }
        ],
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        }
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) throw new Error('Falha ao criar credencial');

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = bufferToBase64URL(credential.rawId);
      const publicKey = bufferToBase64URL(response.getPublicKey?.() || response.attestationObject);
      const transports = response.getTransports?.() || [];

      const { error: insertError } = await supabase
        .from('webauthn_credentials')
        .insert({
          user_id: user.id,
          credential_id: credentialId,
          public_key: publicKey,
          device_name: deviceName || getDeviceName(),
          transports,
          counter: 0
        });

      if (insertError) throw insertError;

      await supabase
        .from('webauthn_challenges')
        .delete()
        .eq('user_id', user.id)
        .eq('type', 'registration');

      toast.success('Passkey registrada com sucesso!');
      await fetchCredentials();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) 
      const err = error as { name?: string };
      if (err.name === 'NotAllowedError') {
        toast.error('Registro cancelado pelo usuário');
      } else if (err.name === 'InvalidStateError') {
        toast.error('Este dispositivo já está registrado');
      } else {
        toast.error('Erro ao registrar passkey');
      }
      return false;
    } finally {
      safeSetIsRegistering(false);
    }
  }, [user, isSupported, fetchCredentials]);

  const authenticateWithPasskey = useCallback(async (email?: string): Promise<{ success: boolean; userId?: string }> => {
    if (!isSupported) {
      toast.error('WebAuthn não é suportado neste navegador');
      return { success: false };
    }

    safeSetIsAuthenticating(true);
    try {
      const challenge = generateChallenge();
      const { error: challengeError } = await supabase
        .from('webauthn_challenges')
        .insert({
          user_email: email,
          challenge,
          type: 'authentication'
        });

      if (challengeError) throw challengeError;

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64URLToBuffer(challenge),
        timeout: 60000,
        rpId: window.location.hostname,
        userVerification: 'required'
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!assertion) throw new Error('Falha na autenticação');

      const credentialId = bufferToBase64URL(assertion.rawId);

      const { data: credData, error: credError } = await supabase
        .from('webauthn_credentials')
        .select('user_id, counter')
        .eq('credential_id', credentialId)
        .single();

      if (credError || !credData) throw new Error('Credencial não encontrada');

      await supabase
        .from('webauthn_credentials')
        .update({ 
          last_used_at: new Date().toISOString(),
          counter: (credData.counter || 0) + 1
        })
        .eq('credential_id', credentialId);

      await supabase
        .from('webauthn_challenges')
        .delete()
        .eq('challenge', challenge);

      toast.success('Autenticação bem-sucedida!');
      return { success: true, userId: credData.user_id };
    } catch (error) {
      if (import.meta.env.DEV) 
      const err = error as { name?: string };
      if (err.name === 'NotAllowedError') {
        toast.error('Autenticação cancelada');
      } else {
        toast.error('Erro na autenticação biométrica');
      }
      return { success: false };
    } finally {
      safeSetIsAuthenticating(false);
    }
  }, [isSupported]);

  const removePasskey = useCallback(async (credentialId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('webauthn_credentials')
        .delete()
        .eq('id', credentialId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Passkey removida com sucesso');
      await fetchCredentials();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) 
      toast.error('Erro ao remover passkey');
      return false;
    }
  }, [user, fetchCredentials]);

  return {
    credentials,
    isLoading,
    isRegistering,
    isAuthenticating,
    isSupported,
    checkPlatformAuthenticator,
    fetchCredentials,
    registerPasskey,
    authenticateWithPasskey,
    removePasskey
  };
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Dispositivo';
}
