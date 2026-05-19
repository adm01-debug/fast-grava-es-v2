import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Moon, Sun, KeyRound } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';
import { MFALoginVerification } from '@/components/auth/MFALoginVerification';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';

const ORANGE = '#FF5A1F';

export default function AuthPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const loginSchema = z.object({ email: z.string().email(t('auth.invalidEmail')), password: z.string().min(6, t('auth.passwordMinLength', { min: 6 })) });

  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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


  return (
    <AuthErrorBoundary>
      <Helmet>
        <title>{t('auth.login')} | FAST GRAVAÇÕES</title>
        <meta name="description" content="Acesse o sistema FAST GRAVAÇÕES para gerenciar sua produção industrial." />
      </Helmet>

      <div className="min-h-screen w-full flex bg-[#050505] text-white font-display selection:bg-[#FF5A1F]/30">
        {/* LEFT — Industrial Showcase */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0a0a0a] border-r border-white/5">
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-br from-[#FF5A1F]/20 to-transparent blur-[120px] pointer-events-none" />

          <div className="relative z-10 p-12 xl:p-16 flex flex-col justify-between h-full w-full">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="FAST GRAVAÇÕES — Qualidade + Velocidade"
                  className="h-24 xl:h-32 w-auto object-contain scale-[2]"
                />
              </picture>
            </motion.div>

            <div className="max-w-2xl space-y-6">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A1F] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5A1F]" />
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">52 Estúdios de Gravação</span>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Excelência <span className="text-[#FF5A1F]">Operacional</span><br />em Tempo Real.
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-zinc-400 text-lg leading-relaxed max-w-md">
                Gestão inteligente de agendamentos, monitoramento de OEE e KPIs de produção em uma plataforma unificada.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-3 gap-4 xl:gap-6">
              {[
                { label: 'OEE Médio', value: '87', suffix: '%', highlight: false },
                { label: 'Uptime', value: '99.9', suffix: '%', highlight: false },
                { label: 'Velocidade', value: '<3', suffix: 's', highlight: true },
              ].map((k) => (
                <div key={k.label} className={`p-5 rounded-xl backdrop-blur-sm border ${k.highlight ? 'bg-[#FF5A1F]/10 border-[#FF5A1F]/20' : 'bg-white/5 border-white/10'}`}>
                  <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${k.highlight ? 'text-[#FF5A1F]' : 'text-zinc-500'}`}>{k.label}</p>
                  <p className="text-3xl font-bold leading-none">{k.value}<span className="text-[#FF5A1F]">{k.suffix}</span></p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* RIGHT — Login form */}
        <div className="w-full lg:w-[540px] flex flex-col p-6 sm:p-10 lg:p-16 justify-center relative bg-[#050505]">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center mb-10">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt="FAST GRAVAÇÕES — Qualidade + Velocidade"
                className="h-12 w-auto object-contain"
              />
            </picture>
          </div>

          {/* Top utility */}
          <div className="absolute top-6 right-6 lg:top-8 lg:right-8 flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9 rounded-full text-zinc-400 hover:text-white hover:bg-white/5">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              {mfaFactorId ? (
                <motion.div key="mfa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <MFALoginVerification factorId={mfaFactorId} onSuccess={() => navigate('/')} onCancel={() => setMfaFactorId(null)} />
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold mb-2 tracking-tight">Bem-vindo</h3>
                    <p className="text-zinc-500 text-sm">Acesse sua conta para gerenciar as máquinas.</p>
                  </div>

                  <div className="w-full">
                    <AuthLoginForm loginEmail={loginEmail} loginPassword={loginPassword} rememberMe={rememberMe} isLoading={isLoading} socialLoading={socialLoading} errors={errors} onEmailChange={setLoginEmail} onPasswordChange={setLoginPassword} onRememberMeChange={setRememberMe} onSubmit={handleLogin} onGoogleLogin={handleGoogleLogin} onForgotPassword={() => setShowForgotPassword(true)} />
                  </div>

                  <footer className="mt-16 text-center">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">© {new Date().getFullYear()} FAST GRAVAÇÕES • Indústria 4.0</p>
                  </footer>
                </motion.div>
              )}
            </AnimatePresence>
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
