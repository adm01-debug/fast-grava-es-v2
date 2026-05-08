import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Printer, Moon, Sun, KeyRound } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';
import { AuthSignupForm } from '@/components/auth/AuthSignupForm';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, signUp, user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const loginSchema = z.object({ email: z.string().email(t('auth.invalidEmail')), password: z.string().min(6, t('auth.passwordMinLength', { min: 6 })) });
  const signupSchema = z.object({ fullName: z.string().min(2, t('validation.minLength', { min: 2 })), email: z.string().email(t('auth.invalidEmail')), password: z.string().min(6, t('auth.passwordMinLength', { min: 6 })), confirmPassword: z.string() }).refine(data => data.password === data.confirmPassword, { message: t('auth.passwordMismatch'), path: ['confirmPassword'] });

  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  useEffect(() => { const saved = localStorage.getItem('rememberedEmail'); if (saved) { setLoginEmail(saved); setRememberMe(true); } }, []);
  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);
  if (user) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    try { loginSchema.parse({ email: loginEmail, password: loginPassword }); } catch (err) { if (err instanceof z.ZodError) { const fe: Record<string, string> = {}; err.errors.forEach(e => { if (e.path[0]) fe[`login_${e.path[0]}`] = e.message; }); setErrors(fe); return; } }
    if (rememberMe) localStorage.setItem('rememberedEmail', loginEmail); else localStorage.removeItem('rememberedEmail');
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) { const le = error as Error & { isLockout?: boolean; remainingMinutes?: number; lockoutMinutes?: number }; if (le.isLockout) { toast.error('Conta Bloqueada', { description: `Muitas tentativas falhas. Tente novamente em ${le.remainingMinutes || le.lockoutMinutes || 0} minuto(s).`, duration: 10000 }); } else { toast.error(t('auth.loginError')); } setIsLoading(false); return; }
    toast.success(t('auth.loginSuccess')); navigate('/');
  };

  const handleGoogleLogin = async () => { setSocialLoading('google'); try { const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin }); if (result.error) toast.error('Erro ao conectar com Google'); } catch { toast.error('Erro ao iniciar login social'); } finally { setSocialLoading(null); } };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault(); if (!forgotEmail.trim()) { toast.error(t('validation.required')); return; }
    try { z.string().email().parse(forgotEmail); } catch { toast.error(t('auth.invalidEmail')); return; }
    setIsSendingReset(true);
    const { error } = await supabase.from('password_reset_requests').insert({ user_email: forgotEmail.trim().toLowerCase(), requested_by_name: null });
    if (error) { if (import.meta.env.DEV) console.error('Error creating reset request:', error); toast.error(t('errors.generic')); setIsSendingReset(false); return; }
    toast.success(t('auth.resetRequestSent', 'Solicitação enviada! Aguarde aprovação do gestor.')); setShowForgotPassword(false); setForgotEmail(''); setIsSendingReset(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    try { signupSchema.parse({ fullName: signupName, email: signupEmail, password: signupPassword, confirmPassword: signupConfirmPassword }); } catch (err) { if (err instanceof z.ZodError) { const fe: Record<string, string> = {}; err.errors.forEach(e => { if (e.path[0]) fe[`signup_${e.path[0]}`] = e.message; }); setErrors(fe); return; } }
    setIsLoading(true); const { error } = await signUp(signupEmail, signupPassword, signupName);
    if (error) { toast.error(t('errors.generic')); setIsLoading(false); return; }
    toast.success(t('common.success')); setIsLoading(false);
  };

  return (
    <ErrorBoundary componentName="AuthPage">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" /><div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" /></div>
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9 rounded-lg"><Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /><Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /></Button>
        </div>
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-3">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }} className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-xl shadow-primary/25"><Printer className="h-10 w-10 text-white" /></motion.div>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="text-4xl font-display font-bold tracking-tight"><span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">{t('common.appName')}</span></motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="text-muted-foreground text-lg">Sistema de Gestão de Produção</motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
            <Card variant="elevated" className="border-border/60 shadow-xl dark:shadow-glow-primary/20 backdrop-blur-xl">
              <CardContent className="pt-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6"><TabsTrigger value="login">{t('auth.login')}</TabsTrigger><TabsTrigger value="signup">{t('auth.register')}</TabsTrigger></TabsList>
                  <TabsContent value="login">
                    <AuthLoginForm loginEmail={loginEmail} loginPassword={loginPassword} rememberMe={rememberMe} isLoading={isLoading} socialLoading={socialLoading} errors={errors} onEmailChange={setLoginEmail} onPasswordChange={setLoginPassword} onRememberMeChange={setRememberMe} onSubmit={handleLogin} onGoogleLogin={handleGoogleLogin} onForgotPassword={() => setShowForgotPassword(true)} onPasskeySuccess={() => navigate('/')} />
                  </TabsContent>
                  <TabsContent value="signup">
                    <AuthSignupForm signupName={signupName} signupEmail={signupEmail} signupPassword={signupPassword} signupConfirmPassword={signupConfirmPassword} isLoading={isLoading} errors={errors} onNameChange={setSignupName} onEmailChange={setSignupEmail} onPasswordChange={setSignupPassword} onConfirmPasswordChange={setSignupConfirmPassword} onSubmit={handleSignup} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />{t('auth.resetPassword')}</DialogTitle><DialogDescription>{t('auth.resetNeedsApproval', 'Digite seu e-mail. A solicitação será enviada para aprovação do gestor.')}</DialogDescription></DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="forgot-email">{t('auth.email')}</Label><Input id="forgot-email" type="email" placeholder={t('auth.email')} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} disabled={isSendingReset} autoFocus /><p className="text-xs text-muted-foreground">{t('auth.resetApprovalNote', 'Sua solicitação será analisada por um gestor antes do envio do e-mail de redefinição.')}</p></div>
              <div className="flex gap-2 justify-end"><Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)} disabled={isSendingReset}>{t('common.cancel')}</Button><Button type="submit" disabled={isSendingReset}>{isSendingReset ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</> : t('auth.sendRequest', 'Enviar Solicitação')}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}
