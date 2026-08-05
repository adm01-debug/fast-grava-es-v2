import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';

interface AuthSignupFormProps {
  signupName: string;
  signupEmail: string;
  signupPassword: string;
  signupConfirmPassword: string;
  isLoading: boolean;
  errors: Record<string, string>;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthSignupForm({
  signupName, signupEmail, signupPassword, signupConfirmPassword, isLoading, errors,
  onNameChange, onEmailChange, onPasswordChange, onConfirmPasswordChange, onSubmit,
}: AuthSignupFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="text-sm font-medium">{t('operators.fullName')}</Label>
        <Input id="signup-name" type="text" placeholder={t('operators.fullName')} value={signupName} onChange={(e) => onNameChange(e.target.value)} disabled={isLoading} />
        {errors.signup_fullName && <p className="text-xs text-destructive animate-fade-in">{errors.signup_fullName}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-medium">{t('auth.email')}</Label>
        <Input id="signup-email" type="email" placeholder={t('auth.email')} value={signupEmail} onChange={(e) => onEmailChange(e.target.value)} disabled={isLoading} />
        {errors.signup_email && <p className="text-xs text-destructive animate-fade-in">{errors.signup_email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-sm font-medium">{t('auth.password')}</Label>
        <PasswordInput id="signup-password" placeholder="••••••••" value={signupPassword} onChange={(e) => onPasswordChange(e.target.value)} disabled={isLoading} />
        <PasswordStrengthIndicator password={signupPassword} />
        {errors.signup_password && <p className="text-xs text-destructive animate-fade-in">{errors.signup_password}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm" className="text-sm font-medium">{t('auth.confirmPassword')}</Label>
        <PasswordInput id="signup-confirm" placeholder="••••••••" value={signupConfirmPassword} onChange={(e) => onConfirmPasswordChange(e.target.value)} disabled={isLoading} />
        {errors.signup_confirmPassword && <p className="text-xs text-destructive animate-fade-in">{errors.signup_confirmPassword}</p>}
      </div>
      <Button type="submit" className="w-full h-12 text-base font-semibold tracking-wide bg-[#FF5A1F] hover:bg-[#e44d18] text-white shadow-lg shadow-[#FF5A1F]/10" disabled={isLoading}>
        {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</> : <><UserPlus className="h-4 w-4 mr-2" />{t('auth.register')}</>}
      </Button>
    </form>
  );
}
