import { useState } from 'react';
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

  // Check platform authenticator on mount
  useState(() => {
    if (isSupported && typeof PublicKeyCredential !== 'undefined') {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setIsPlatformAvailable)
        .catch(() => setIsPlatformAvailable(false));
    }
  });

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
