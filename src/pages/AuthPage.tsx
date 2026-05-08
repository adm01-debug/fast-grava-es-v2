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
    <AuthErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
...
        </Dialog>
      </div>
    </AuthErrorBoundary>
  );
}
