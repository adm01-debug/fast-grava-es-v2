import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface PasswordCriteria {
  id: string;
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  className,
}: PasswordStrengthIndicatorProps) {
  const analysis = useMemo(() => {
    const criteria: PasswordCriteria[] = [
      {
        id: 'length',
        label: 'Mínimo 8 caracteres',
        met: password.length >= 8,
      },
      {
        id: 'uppercase',
        label: 'Letra maiúscula (A-Z)',
        met: /[A-Z]/.test(password),
      },
      {
        id: 'lowercase',
        label: 'Letra minúscula (a-z)',
        met: /[a-z]/.test(password),
      },
      {
        id: 'number',
        label: 'Número (0-9)',
        met: /[0-9]/.test(password),
      },
      {
        id: 'special',
        label: 'Caractere especial (!@#$%)',
        met: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password),
      },
    ];

    const metCount = criteria.filter((c) => c.met).length;
    const strength = password.length === 0 ? 0 : Math.round((metCount / criteria.length) * 100);

    let level: 'none' | 'weak' | 'fair' | 'good' | 'strong' = 'none';
    let label = '';
    let colorClass = '';

    if (password.length === 0) {
      level = 'none';
      label = '';
      colorClass = '';
    } else if (metCount <= 1) {
      level = 'weak';
      label = 'Muito fraca';
      colorClass = 'bg-red-500';
    } else if (metCount === 2) {
      level = 'weak';
      label = 'Fraca';
      colorClass = 'bg-orange-500';
    } else if (metCount === 3) {
      level = 'fair';
      label = 'Razoável';
      colorClass = 'bg-yellow-500';
    } else if (metCount === 4) {
      level = 'good';
      label = 'Boa';
      colorClass = 'bg-lime-500';
    } else {
      level = 'strong';
      label = 'Forte';
      colorClass = 'bg-green-500';
    }

    return { criteria, strength, level, label, colorClass, metCount };
  }, [password]);

  if (password.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Força da senha</span>
          <span
            className={cn(
              'text-xs font-medium',
              analysis.level === 'weak' && 'text-red-500',
              analysis.level === 'fair' && 'text-yellow-600',
              analysis.level === 'good' && 'text-lime-600',
              analysis.level === 'strong' && 'text-green-600'
            )}
          >
            {analysis.label}
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              analysis.colorClass
            )}
            style={{ width: `${analysis.strength}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="grid grid-cols-1 gap-1.5">
          {analysis.criteria.map((criterion) => (
            <div
              key={criterion.id}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors duration-200',
                criterion.met ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {criterion.met ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50" />
              )}
              <span>{criterion.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for password validation
export function usePasswordStrength(password: string) {
  return useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password);

    const criteriaMet = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    const isStrong = criteriaMet >= 4;
    const isValid = hasMinLength && criteriaMet >= 3;

    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      criteriaMet,
      isStrong,
      isValid,
    };
  }, [password]);
}
