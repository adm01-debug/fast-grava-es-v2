import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2 } from 'lucide-react';
import { useWebAuthn } from '@/hooks/useWebAuthn';

interface PasskeyLoginButtonProps {
  email?: string;
  onSuccess?: (userId: string) => void;
  className?: string;
}

export function PasskeyLoginButton({ email, onSuccess, className }: PasskeyLoginButtonProps) {
  const { isSupported, isAuthenticating, authenticateWithPasskey } = useWebAuthn();
  const [isPlatformAvailable, setIsPlatformAvailable] = useState<boolean | null>(null);

  // Check platform authenticator on mount with proper cleanup
  useEffect(() => {
    let isMounted = true;

    const checkPlatform = async () => {
      if (isSupported && typeof PublicKeyCredential !== 'undefined') {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (isMounted) {
            setIsPlatformAvailable(available);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error checking platform authenticator:', error);
            setIsPlatformAvailable(false);
          }
        }
      }
    };

    checkPlatform();

    return () => {
      isMounted = false;
    };
  }, [isSupported]);

  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    const result = await authenticateWithPasskey(email);
    if (result.success && result.userId && onSuccess) {
      onSuccess(result.userId);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isAuthenticating}
      className={className}
    >
      {isAuthenticating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Autenticando...
        </>
      ) : (
        <>
          <Fingerprint className="h-4 w-4 mr-2" />
          Login com Biometria
        </>
      )}
    </Button>
  );
}
