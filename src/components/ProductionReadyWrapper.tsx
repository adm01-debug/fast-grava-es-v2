import { useEffect, useState, ReactNode } from 'react';
import { validateEnv, isProduction } from './envConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface ProductionReadyWrapperProps {
  children: ReactNode;
  requiredEnvVars?: string[];
  healthCheckUrl?: string;
}

export function ProductionReadyWrapper({ children, requiredEnvVars = [], healthCheckUrl }: ProductionReadyWrapperProps) {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const checkReadiness = async () => {
      const issues: string[] = [];

      // Check env vars
      const { valid, missing } = validateEnv();
      if (!valid) issues.push(`Variáveis de ambiente faltando: ${missing.join(', ')}`);

      // Health check
      if (healthCheckUrl) {
        try {
          const res = await fetch(healthCheckUrl, { method: 'GET' });
          if (!res.ok) issues.push(`Health check falhou: ${res.status}`);
        } catch {
          issues.push('Health check: servidor indisponível');
        }
      }

      if (issues.length > 0) {
        setErrors(issues);
        setStatus('error');
      } else {
        setStatus('ready');
      }
    };

    checkReadiness();
  }, [healthCheckUrl]);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando ambiente...</p>
        </div>
      </div>
    );
  }

  if (status === 'error' && isProduction) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sistema não está pronto</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === 'error' && !isProduction) {
    console.warn('Production checks failed:', errors);
  }

  return <>{children}</>;
}
