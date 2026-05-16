import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Moon, Sun, KeyRound, ArrowUpRight, Zap, ShieldCheck, Activity } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';
import { AuthSignupForm } from '@/components/auth/AuthSignupForm';
import { MFALoginVerification } from '@/components/auth/MFALoginVerification';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  useEffect(() => { const saved = localStorage.getItem('rememberedEmail'); if (saved) { setLoginEmail(saved); setRememberMe(true); } }, []);
  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);
  if (user) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    try { loginSchema.parse({ email: loginEmail, password: loginPassword }); } catch (err) { if (err instanceof z.ZodError) { const fe: Record<string, string> = {}; err.errors.forEach(e => { if (e.path[0]) fe[`login_${e.path[0]}`] = e.message; }); setErrors(fe); return; } }
    if (rememberMe) localStorage.setItem('rememberedEmail', loginEmail); else localStorage.removeItem('rememberedEmail');
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      const le = error as Error & { isLockout?: boolean; remainingMinutes?: number; lockoutMinutes?: number };
      if (le.isLockout) {
        toast.error('Conta Bloqueada', { description: `Muitas tentativas falhas. Tente novamente em ${le.remainingMinutes || le.lockoutMinutes || 0} minuto(s).`, duration: 10000 });
      } else {
        toast.error(t('auth.loginError'));
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const totpFactor = factors.totp.find(f => f.status === 'verified');
      if (totpFactor) { setMfaFactorId(totpFactor.id); setIsLoading(false); return; }
    } catch { /* proceed */ }

    toast.success(t('auth.loginSuccess')); navigate('/');
  };

  const handleGoogleLogin = async () => { setSocialLoading('google'); try { const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin }); if (result.error) toast.error('Erro ao conectar com Google'); } catch { toast.error('Erro ao iniciar login social'); } finally { setSocialLoading(null); } };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault(); if (!forgotEmail.trim()) { toast.error(t('validation.required')); return; }
    try { z.string().email().parse(forgotEmail); } catch { toast.error(t('auth.invalidEmail')); return; }
    setIsSendingReset(true);
    const { error } = await supabase.from('password_reset_requests').insert({ user_email: forgotEmail.trim().toLowerCase(), requested_by_name: null, status: 'pending' });
    if (error) { toast.error('Erro ao enviar solicitação. Tente novamente.'); setIsSendingReset(false); return; }
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
    <AuthErrorBoundary>
      <Helmet>
        <title>{t('auth.login')} | Fast Gravações</title>
        <meta name="description" content="Acesse o sistema Fast Gravações para gerenciar sua produção industrial." />
      </Helmet>

      <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr] bg-background text-foreground overflow-hidden">
        {/* LEFT — Brand panel with solid color */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-[#FF5A1F] text-white overflow-hidden">
          {/* Geometric solid shapes */}
          <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#0B0B0F]" />
          <div className="absolute -bottom-40 -left-20 w-[520px] h-[520px] rounded-full bg-white/10" />
          <div className="absolute top-1/3 right-16 w-32 h-32 rounded-2xl bg-white/15 rotate-12" />
          <div className="absolute bottom-24 right-1/3 w-20 h-20 rounded-full border-4 border-white/40" />

          {/* Top: brand mark */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white grid place-items-center">
              <span className="text-[#FF5A1F] font-black text-xl tracking-tighter">F</span>
            </div>
            <div className="leading-tight">
              <div className="font-display font-black text-xl tracking-tight">FAST GRAVAÇÕES</div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-white/70">Sistema de Produção</div>
            </div>
          </motion.div>

          {/* Middle: hero copy */}
          <div className="relative z-10 space-y-8 max-w-xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-medium uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              52 máquinas · tempo real
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="font-display font-black text-5xl xl:text-6xl leading-[0.95] tracking-tight">
              Controle total<br />da sua<br /><span className="bg-[#0B0B0F] text-white px-3 -ml-1 inline-block">produção.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-white/90 text-lg max-w-md leading-relaxed">
              Agendamento inteligente, OEE em tempo real e KPIs operacionais — em uma única plataforma.
            </motion.p>
          </div>

          {/* Bottom: feature pills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="relative z-10 grid grid-cols-3 gap-3">
            {[
              { icon: Zap, label: 'Velocidade', value: '<3s' },
              { icon: Activity, label: 'OEE médio', value: '87%' },
              { icon: ShieldCheck, label: 'Uptime', value: '99.9%' },
            ].map((f) => (
              <div key={f.label} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4">
                <f.icon className="h-5 w-5 mb-3" />
                <div className="text-2xl font-display font-black leading-none">{f.value}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/70 mt-1">{f.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Form panel */}
        <div className="relative flex flex-col min-h-screen bg-background">
          {/* Top bar */}
          <div className="flex items-center justify-between p-6 lg:p-8">
            <div className="lg:hidden flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-[#FF5A1F] grid place-items-center">
                <span className="text-white font-black text-base">F</span>
              </div>
              <span className="font-display font-black tracking-tight">FAST GRAVAÇÕES</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9 rounded-lg">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 flex items-center justify-center px-6 pb-12 lg:px-12">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                {mfaFactorId ? (
                  <motion.div key="mfa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <MFALoginVerification factorId={mfaFactorId} onSuccess={() => navigate('/')} onCancel={() => setMfaFactorId(null)} />
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5A1F]">
                        <span className="h-px w-8 bg-[#FF5A1F]" />
                        Bem-vindo
                      </div>
                      <h2 className="font-display font-black text-4xl lg:text-5xl tracking-tight leading-[1.05]">
                        Entre na sua<br />conta.
                      </h2>
                      <p className="text-muted-foreground">Acesse o painel para gerenciar agendamentos, máquinas e equipe.</p>
                    </div>

                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6 h-11 rounded-xl bg-muted p-1">
                        <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white data-[state=active]:shadow-sm font-semibold">{t('auth.login')}</TabsTrigger>
                        <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-[#FF5A1F] data-[state=active]:text-white data-[state=active]:shadow-sm font-semibold">{t('auth.register')}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login">
                        <AuthLoginForm loginEmail={loginEmail} loginPassword={loginPassword} rememberMe={rememberMe} isLoading={isLoading} socialLoading={socialLoading} errors={errors} onEmailChange={setLoginEmail} onPasswordChange={setLoginPassword} onRememberMeChange={setRememberMe} onSubmit={handleLogin} onGoogleLogin={handleGoogleLogin} onForgotPassword={() => setShowForgotPassword(true)} />
                      </TabsContent>
                      <TabsContent value="signup">
                        <AuthSignupForm signupName={signupName} signupEmail={signupEmail} signupPassword={signupPassword} signupConfirmPassword={signupConfirmPassword} isLoading={isLoading} errors={errors} onNameChange={setSignupName} onEmailChange={setSignupEmail} onPasswordChange={setSignupPassword} onConfirmPasswordChange={setSignupConfirmPassword} onSubmit={handleSignup} />
                      </TabsContent>
                    </Tabs>

                    <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground">
                      <span>© {new Date().getFullYear()} Fast Gravações</span>
                      <a href="#" className="inline-flex items-center gap-1 hover:text-[#FF5A1F] transition-colors">Suporte <ArrowUpRight className="h-3 w-3" /></a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-[#FF5A1F]" />{t('auth.resetPassword')}</DialogTitle><DialogDescription>{t('auth.resetNeedsApproval', 'Digite seu e-mail. A solicitação será enviada para aprovação do gestor.')}</DialogDescription></DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="forgot-email">{t('auth.email')}</Label><Input id="forgot-email" type="email" placeholder={t('auth.email')} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} disabled={isSendingReset} autoFocus /><p className="text-xs text-muted-foreground">{t('auth.resetApprovalNote', 'Sua solicitação será analisada por um gestor antes do envio do e-mail de redefinição.')}</p></div>
            <div className="flex gap-2 justify-end"><Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)} disabled={isSendingReset}>{t('common.cancel')}</Button><Button type="submit" disabled={isSendingReset}>{isSendingReset ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.loading')}</> : t('auth.sendRequest', 'Enviar Solicitação')}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </AuthErrorBoundary>
  );
}
