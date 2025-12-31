import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Plus, Trash2, Smartphone, Laptop, Shield, Loader2, AlertCircle } from 'lucide-react';
import { useWebAuthn, WebAuthnCredential } from '@/hooks/useWebAuthn';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PasskeySettings() {
  const {
    credentials,
    isLoading,
    isRegistering,
    isSupported,
    checkPlatformAuthenticator,
    fetchCredentials,
    registerPasskey,
    removePasskey
  } = useWebAuthn();

  const [hasPlatformAuth, setHasPlatformAuth] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
    checkPlatformAuthenticator().then(setHasPlatformAuth);
  }, [fetchCredentials, checkPlatformAuthenticator]);

  const handleRegister = async () => {
    const success = await registerPasskey(deviceName || undefined);
    if (success) {
      setIsDialogOpen(false);
      setDeviceName('');
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    await removePasskey(id);
    setRemovingId(null);
  };

  const getDeviceIcon = (name: string | null) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('iphone') || n.includes('android') || n.includes('phone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Laptop className="h-5 w-5" />;
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Passkeys / Login Biométrico
          </CardTitle>
          <CardDescription>
            Faça login usando biometria ou chaves de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu navegador não suporta WebAuthn/Passkeys. 
              Tente usar um navegador mais recente como Chrome, Safari ou Firefox.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Passkeys / Login Biométrico
        </CardTitle>
        <CardDescription>
          Configure login seguro usando biometria (Face ID, Touch ID, Windows Hello) ou chaves de segurança
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform authenticator status */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Autenticador de Plataforma</p>
            <p className="text-sm text-muted-foreground">
              {hasPlatformAuth 
                ? 'Seu dispositivo suporta login biométrico (Face ID, Touch ID, Windows Hello)'
                : 'Seu dispositivo não possui autenticador biométrico integrado'
              }
            </p>
          </div>
          <Badge variant={hasPlatformAuth ? 'default' : 'secondary'}>
            {hasPlatformAuth ? 'Disponível' : 'Indisponível'}
          </Badge>
        </div>

        {/* Registered credentials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Passkeys Registradas</h4>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!hasPlatformAuth && credentials.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Passkey
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nova Passkey</DialogTitle>
                  <DialogDescription>
                    Adicione um nome para identificar este dispositivo. 
                    Você será solicitado a usar sua biometria ou chave de segurança.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceName">Nome do Dispositivo (opcional)</Label>
                    <Input
                      id="deviceName"
                      placeholder="Ex: MacBook Pro, iPhone"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleRegister} disabled={isRegistering}>
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="h-4 w-4 mr-2" />
                        Registrar
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma passkey registrada</p>
              <p className="text-sm">Adicione uma passkey para login rápido e seguro</p>
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((cred) => (
                <CredentialItem
                  key={cred.id}
                  credential={cred}
                  onRemove={handleRemove}
                  isRemoving={removingId === cred.id}
                  getDeviceIcon={getDeviceIcon}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <Alert>
          <Fingerprint className="h-4 w-4" />
          <AlertDescription>
            <strong>O que são Passkeys?</strong> São credenciais seguras armazenadas no seu dispositivo 
            que permitem login usando biometria (impressão digital, reconhecimento facial) ou uma chave 
            de segurança física. Elas são mais seguras que senhas tradicionais e não podem ser roubadas 
            por phishing.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

interface CredentialItemProps {
  credential: WebAuthnCredential;
  onRemove: (id: string) => void;
  isRemoving: boolean;
  getDeviceIcon: (name: string | null) => React.ReactNode;
}

function CredentialItem({ credential, onRemove, isRemoving, getDeviceIcon }: CredentialItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
      <div className="p-2 rounded-full bg-primary/10 text-primary">
        {getDeviceIcon(credential.device_name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {credential.device_name || 'Dispositivo'}
        </p>
        <p className="text-sm text-muted-foreground">
          Registrado em {format(new Date(credential.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
        {credential.last_used_at && (
          <p className="text-xs text-muted-foreground">
            Último uso: {format(new Date(credential.last_used_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(credential.id)}
        disabled={isRemoving}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
