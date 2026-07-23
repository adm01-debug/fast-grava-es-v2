import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { packagingRegisterFormSchema, type PackagingRegisterForm } from '../types/packaging.schema';

interface Props {
  received: number;
  defaultPackageTypes?: string[];
  onSubmit: (values: PackagingRegisterForm) => Promise<void> | void;
  submitting?: boolean;
}

const DEFAULT_TYPES = ['caixa', 'saco', 'envelope', 'pallet'];

export function PackagingRegisterForm({ received, defaultPackageTypes = DEFAULT_TYPES, onSubmit, submitting }: Props) {
  const form = useForm<PackagingRegisterForm>({
    resolver: zodResolver(packagingRegisterFormSchema),
    defaultValues: {
      package_type: defaultPackageTypes[0],
      packages_count: 1,
      total_weight_kg: undefined,
      approved_quantity: received,
      notes: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Tipo de embalagem</Label>
          <Select
            value={form.watch('package_type')}
            onValueChange={(v) => form.setValue('package_type', v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {defaultPackageTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="packages_count">Nº de pacotes</Label>
          <Input id="packages_count" type="number" min={1} {...form.register('packages_count')} />
          {form.formState.errors.packages_count && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.packages_count.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="total_weight_kg">Peso total (kg)</Label>
          <Input id="total_weight_kg" type="number" step="0.01" min={0} {...form.register('total_weight_kg')} />
        </div>
        <div>
          <Label htmlFor="approved_quantity">Peças aprovadas (recebidas: {received})</Label>
          <Input id="approved_quantity" type="number" min={0} max={received} {...form.register('approved_quantity')} />
        </div>
      </div>
      <div>
        <Label htmlFor="pack-notes">Observações</Label>
        <Textarea id="pack-notes" rows={3} {...form.register('notes')} />
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Salvando…' : 'Salvar embalagem'}
      </Button>
    </form>
  );
}
