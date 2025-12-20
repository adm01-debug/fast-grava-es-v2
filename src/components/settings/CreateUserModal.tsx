import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['operator', 'coordinator', 'manager']),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onOpenChange, onSuccess }: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    fullName: '',
    role: 'operator',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setErrors({});

    try {
      createUserSchema.parse(form);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) fieldErrors[String(e.path[0])] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create user using edge function to avoid exposing admin API
      const { data, error } = await supabase.functions.invoke('create-operator', {
        body: {
          email: form.email,
          password: form.password,
          full_name: form.fullName,
          role: form.role,
        },
      });

      if (error) throw error;

      toast.success('Usuário criado com sucesso!');
      onSuccess();
      onOpenChange(false);
      setForm({ email: '', password: '', fullName: '', role: 'operator' });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erro ao criar usuário. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Crie uma nova conta de usuário no sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nome do usuário"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@exemplo.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Senha</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Papel</Label>
            <Select
              value={form.role}
              onValueChange={(value: 'operator' | 'coordinator' | 'manager') => 
                setForm({ ...form, role: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operador</SelectItem>
                <SelectItem value="coordinator">Coordenador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Criando...
              </>
            ) : (
              'Criar Usuário'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
