import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Loader2 } from 'lucide-react';

interface MFAChallengeProps {
  factorId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MFAChallenge({ factorId, onSuccess, onCancel }: MFAChallengeProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Digite um código de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    try {
      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      // Verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      onSuccess();
    } catch (error) {
      if (import.meta.env.DEV) console.error('MFA verification error:', error);
      const message = error instanceof Error ? error.message : 'Código inválido';
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <CardTitle>Verificação de Dois Fatores</CardTitle>
        <CardDescription>
          Digite o código do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Código</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="text-center text-3xl tracking-[0.5em] font-mono"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && code.length === 6) {
                handleVerify();
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isVerifying}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleVerify}
            disabled={code.length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Verificar
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          O código expira a cada 30 segundos. Use o código mais recente do seu app.
        </p>
      </CardContent>
    </Card>
  );
}
