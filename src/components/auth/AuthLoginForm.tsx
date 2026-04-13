import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, LogIn, Chrome } from 'lucide-react';
import { PasskeyLoginButton } from '@/components/auth/PasskeyLoginButton';

interface AuthLoginFormProps {
  loginEmail: string;
  loginPassword: string;
  rememberMe: boolean;
  isLoading: boolean;
  socialLoading: string | null;
  errors: Record<string, string>;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onRememberMeChange: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
  onForgotPassword: () => void;
  onPasskeySuccess: () => void;
}

export function AuthLoginForm({
  loginEmail, loginPassword, rememberMe, isLoading, socialLoading, errors,
  onEmailChange, onPasswordChange, onRememberMeChange, onSubmit, onGoogleLogin, onForgotPassword, onPasskeySuccess,
}: AuthLoginFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm font-medium">{t('auth.email')}</Label>
        <Input id="login-email" type="email" placeholder={t('auth.email')} value={loginEmail} onChange={(e) => onEmailChange(e.target.value)} disabled={isLoading} />
        {errors.login_email && <p className="text-xs text-destructive animate-fade-in">{errors.login_email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-sm font-medium">{t('auth.password')}</Label>
        <PasswordInput id="login-password" placeholder="••••••••" value={loginPassword} onChange={(e) => onPasswordChange(e.target.value)} disabled={isLoading} />
        {errors.login_password && <p className="text-xs text-destructive animate-fade-in">{errors.login_password}</p>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => onRememberMeChange(checked === true)} />
          <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground cursor-pointer">Lembrar meu e-mail</Label>
        </div>
      </div>
      <Button type="submit" variant="gradient" className="w-full h-12 text-base font-semibold tracking-wide" disabled={isLoading || !!socialLoading}>
        {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</> : <><LogIn className="h-4 w-4 mr-2" />{t('auth.login')}</>}
      </Button>
      <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">ou</span></div></div>
      <PasskeyLoginButton email={loginEmail} onSuccess={onPasskeySuccess} className="w-full" />
      <Button type="button" variant="outline" className="w-full h-11 gap-2" onClick={onGoogleLogin} disabled={isLoading || !!socialLoading}>
        {socialLoading === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}Entrar com Google
      </Button>
      <Button type="button" variant="link" className="w-full text-muted-foreground hover:text-primary transition-colors" onClick={onForgotPassword}>{t('auth.forgotPassword')}</Button>
    </form>
  );
}
