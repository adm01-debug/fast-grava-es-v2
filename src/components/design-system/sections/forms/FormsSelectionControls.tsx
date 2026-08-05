import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeBlock } from '@/components/ui/code-block';
import { CheckCircle, ChevronDown, Circle, Power, Ruler } from 'lucide-react';

export function FormsSelectionControls() {
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);

  return (
    <>
      {/* Select */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ChevronDown className="h-5 w-5 text-primary" />Select</CardTitle>
          <CardDescription>Componentes de seleção dropdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2"><Label>Select Padrão</Label><Select><SelectTrigger><SelectValue placeholder="Selecione uma opção" /></SelectTrigger><SelectContent><SelectItem value="option1">Opção 1</SelectItem><SelectItem value="option2">Opção 2</SelectItem><SelectItem value="option3">Opção 3</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">Shadcn Select</p></div>
            <div className="space-y-2"><Label>Select com Valor</Label><Select defaultValue="option2"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="option1">Opção 1</SelectItem><SelectItem value="option2">Opção 2</SelectItem><SelectItem value="option3">Opção 3</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">defaultValue</p></div>
            <div className="space-y-2"><Label>Select Desabilitado</Label><Select disabled><SelectTrigger><SelectValue placeholder="Desabilitado" /></SelectTrigger><SelectContent><SelectItem value="option1">Opção 1</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">disabled</p></div>
          </div>
          <div className="space-y-4 pt-4 border-t"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4><CodeBlock label="Select" code={`<Select>\n  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>\n  <SelectContent>\n    <SelectItem value="option1">Opção 1</SelectItem>\n  </SelectContent>\n</Select>`} /></div>
        </CardContent>
      </Card>

      {/* Checkbox */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" />Checkbox</CardTitle>
          <CardDescription>Caixas de seleção para múltiplas opções</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estados</h4>
              <div className="flex items-center space-x-2"><Checkbox id="checkbox-unchecked" /><Label htmlFor="checkbox-unchecked">Não marcado</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="checkbox-checked" checked={checkboxValue} onCheckedChange={(checked) => setCheckboxValue(checked as boolean)} /><Label htmlFor="checkbox-checked">Interativo (clique)</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="checkbox-default-checked" defaultChecked /><Label htmlFor="checkbox-default-checked">Marcado por padrão</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="checkbox-disabled" disabled /><Label htmlFor="checkbox-disabled" className="text-muted-foreground">Desabilitado</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="checkbox-disabled-checked" disabled defaultChecked /><Label htmlFor="checkbox-disabled-checked" className="text-muted-foreground">Desabilitado marcado</Label></div>
            </div>
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lista de Opções</h4>
              <div className="grid grid-cols-2 gap-3">
                {['Fiber Laser', 'Silk Têxtil', 'Tampografia', 'Hot Stamping', 'Sublimação', 'DTF UV'].map((item) => (
                  <div key={item} className="flex items-center space-x-2"><Checkbox id={`checkbox-${item}`} /><Label htmlFor={`checkbox-${item}`}>{item}</Label></div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4><CodeBlock label="Checkbox" code={`<div className="flex items-center space-x-2">\n  <Checkbox id="terms" />\n  <Label htmlFor="terms">Aceito os termos</Label>\n</div>`} /></div>
        </CardContent>
      </Card>

      {/* Radio Group */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Circle className="h-5 w-5 text-primary" />Radio Group</CardTitle>
          <CardDescription>Botões de opção para seleção única</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vertical</h4>
              <RadioGroup defaultValue="option1">
                <div className="flex items-center space-x-2"><RadioGroupItem value="option1" id="radio-1" /><Label htmlFor="radio-1">Opção 1</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="option2" id="radio-2" /><Label htmlFor="radio-2">Opção 2</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="option3" id="radio-3" /><Label htmlFor="radio-3">Opção 3</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="option4" id="radio-4" disabled /><Label htmlFor="radio-4" className="text-muted-foreground">Desabilitado</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Horizontal</h4>
              <RadioGroup defaultValue="high" className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="low" id="priority-low" /><Label htmlFor="priority-low">Baixa</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="medium" id="priority-medium" /><Label htmlFor="priority-medium">Média</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="high" id="priority-high" /><Label htmlFor="priority-high">Alta</Label></div>
              </RadioGroup>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4><CodeBlock label="RadioGroup" code={`<RadioGroup defaultValue="option1">\n  <RadioGroupItem value="option1" id="radio-1" />\n  <Label htmlFor="radio-1">Opção 1</Label>\n</RadioGroup>`} /></div>
        </CardContent>
      </Card>

      {/* Switch */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Power className="h-5 w-5 text-primary" />Switch</CardTitle>
          <CardDescription>Interruptores de alternância</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50"><div><Label htmlFor="switch-interactive">Switch Interativo</Label><p className="text-xs text-muted-foreground">{switchValue ? 'Ativado' : 'Desativado'}</p></div><Switch id="switch-interactive" checked={switchValue} onCheckedChange={setSwitchValue} /></div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50"><div><Label htmlFor="switch-default">Switch Ativo</Label><p className="text-xs text-muted-foreground">defaultChecked</p></div><Switch id="switch-default" defaultChecked /></div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 opacity-50"><div><Label htmlFor="switch-disabled">Switch Desabilitado</Label><p className="text-xs text-muted-foreground">disabled</p></div><Switch id="switch-disabled" disabled /></div>
          </div>
          <div className="space-y-4 pt-4 border-t"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4><CodeBlock label="Switch" code={`<Switch checked={switchValue} onCheckedChange={setSwitchValue} />`} /></div>
        </CardContent>
      </Card>

      {/* Slider */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5 text-primary" />Slider</CardTitle>
          <CardDescription>Controles deslizantes para valores numéricos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4"><div className="flex justify-between"><Label>Slider Interativo</Label><span className="text-sm font-medium text-primary">{sliderValue[0]}%</span></div><Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} /><p className="text-xs text-muted-foreground">Arraste para alterar o valor</p></div>
            <div className="space-y-4"><div className="flex justify-between"><Label>Slider com Steps</Label><span className="text-sm font-medium text-muted-foreground">25%</span></div><Slider defaultValue={[25]} max={100} step={25} /><p className="text-xs text-muted-foreground">step=25</p></div>
            <div className="space-y-4"><div className="flex justify-between"><Label>Slider Range</Label><span className="text-sm font-medium text-muted-foreground">20 - 80</span></div><Slider defaultValue={[20, 80]} max={100} step={1} /><p className="text-xs text-muted-foreground">Dois valores para intervalo</p></div>
            <div className="space-y-4 opacity-50"><div className="flex justify-between"><Label>Slider Desabilitado</Label><span className="text-sm font-medium text-muted-foreground">50%</span></div><Slider defaultValue={[50]} max={100} disabled /><p className="text-xs text-muted-foreground">disabled</p></div>
          </div>
          <div className="space-y-4 pt-4 border-t"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4><CodeBlock label="Slider" code={`<Slider defaultValue={[50]} max={100} step={1} />\n<Slider defaultValue={[20, 80]} max={100} step={1} />`} /></div>
        </CardContent>
      </Card>
    </>
  );
}
