import { useState } from 'react';
import { useMFA } from '@/hooks/useMFA';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, Copy, Check, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export function MFAEnroll() {
  const { 
    isEnrolling, 
    isVerifying, 
    enrollmentData, 
    startEnrollment, 
    verifyEnrollment, 
    cancelEnrollment 
  } = useMFA();
  
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopySecret = async () => {
    if (enrollmentData?.totp.secret) {
      await navigator.clipboard.writeText(enrollmentData.totp.secret);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Digite um código de 6 dígitos');
      return;
    }

    const success = await verifyEnrollment(code);
    if (success) {
      setCode('');
    }
  };

  if (!isEnrolling && !enrollmentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Configurar Autenticação de Dois Fatores
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Aplicativos recomendados:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Google Authenticator</li>
                  <li>Microsoft Authenticator</li>
                  <li>Authy</li>
                  <li>1Password</li>
                </ul>
              </div>
            </div>
            
            <Button onClick={() => startEnrollment()} className="w-full">
              Começar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Configurar Autenticador
        </CardTitle>
        <CardDescription>
          Escaneie o QR code com seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {enrollmentData && (
          <>
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <img 
                  src={enrollmentData.totp.qr_code} 
                  alt="QR Code para autenticador"
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Ou insira o código manualmente:
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={enrollmentData.totp.secret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopySecret}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Verification Code */}
            <div className="space-y-2">
              <Label htmlFor="verification-code">
                Digite o código de 6 dígitos do seu app:
              </Label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && code.length === 6) {
                    handleVerify();
                  }
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={cancelEnrollment}
                disabled={isVerifying}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleVerify}
                disabled={code.length !== 6 || isVerifying}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  'Ativar 2FA'
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
