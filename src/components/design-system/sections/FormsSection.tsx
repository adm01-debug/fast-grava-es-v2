import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';

export function FormsSection() {
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);

  return (
    <div className="space-y-6">
      {/* Text Inputs */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Inputs de Texto
          </CardTitle>
          <CardDescription>Campos de entrada de texto em diferentes estados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Input */}
            <div className="space-y-2">
              <Label htmlFor="input-default">Input Padrão</Label>
              <Input id="input-default" placeholder="Digite algo..." />
              <p className="text-xs text-muted-foreground">Estado padrão</p>
            </div>

            {/* Disabled Input */}
            <div className="space-y-2">
              <Label htmlFor="input-disabled">Input Desabilitado</Label>
              <Input id="input-disabled" placeholder="Desabilitado" disabled />
              <p className="text-xs text-muted-foreground">disabled</p>
            </div>

            {/* With Value */}
            <div className="space-y-2">
              <Label htmlFor="input-value">Com Valor</Label>
              <Input id="input-value" defaultValue="Valor preenchido" />
              <p className="text-xs text-muted-foreground">defaultValue</p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="input-email">Email</Label>
              <Input id="input-email" type="email" placeholder="email@exemplo.com" />
              <p className="text-xs text-muted-foreground">type="email"</p>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="input-password">Senha</Label>
              <Input id="input-password" type="password" placeholder="••••••••" />
              <p className="text-xs text-muted-foreground">type="password"</p>
            </div>

            {/* Number Input */}
            <div className="space-y-2">
              <Label htmlFor="input-number">Número</Label>
              <Input id="input-number" type="number" placeholder="0" />
              <p className="text-xs text-muted-foreground">type="number"</p>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="input-search">Busca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="input-search" placeholder="Buscar..." className="pl-10" />
              </div>
              <p className="text-xs text-muted-foreground">Com ícone</p>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="input-date">Data</Label>
              <Input id="input-date" type="date" />
              <p className="text-xs text-muted-foreground">type="date"</p>
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="input-time">Hora</Label>
              <Input id="input-time" type="time" />
              <p className="text-xs text-muted-foreground">type="time"</p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CodeBlock
                label="Input Padrão"
                code={`<Input placeholder="Digite algo..." />`}
              />
              <CodeBlock
                label="Input Desabilitado"
                code={`<Input placeholder="Desabilitado" disabled />`}
              />
              <CodeBlock
                label="Input com Ícone"
                code={`<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input placeholder="Buscar..." className="pl-10" />
</div>`}
              />
              <CodeBlock
                label="Input de Data/Hora"
                code={`<Input type="date" />
<Input type="time" />`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Textarea */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Textarea
          </CardTitle>
          <CardDescription>Campos de texto multilinha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="textarea-default">Textarea Padrão</Label>
              <Textarea id="textarea-default" placeholder="Digite sua mensagem..." />
              <p className="text-xs text-muted-foreground">Componente Textarea padrão</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textarea-disabled">Textarea Desabilitado</Label>
              <Textarea id="textarea-disabled" placeholder="Desabilitado" disabled />
              <p className="text-xs text-muted-foreground">disabled</p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Textarea"
              code={`<Textarea placeholder="Digite sua mensagem..." />

{/* Desabilitado */}
<Textarea placeholder="Desabilitado" disabled />

{/* Com linhas definidas */}
<Textarea placeholder="..." rows={4} />`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Select */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronDown className="h-5 w-5 text-primary" />
            Select
          </CardTitle>
          <CardDescription>Componentes de seleção dropdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Select Padrão</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Opção 1</SelectItem>
                  <SelectItem value="option2">Opção 2</SelectItem>
                  <SelectItem value="option3">Opção 3</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Shadcn Select</p>
            </div>

            <div className="space-y-2">
              <Label>Select com Valor</Label>
              <Select defaultValue="option2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Opção 1</SelectItem>
                  <SelectItem value="option2">Opção 2</SelectItem>
                  <SelectItem value="option3">Opção 3</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">defaultValue</p>
            </div>

            <div className="space-y-2">
              <Label>Select Desabilitado</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Desabilitado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Opção 1</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">disabled</p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Select"
              code={`<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecione uma opção" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
    <SelectItem value="option2">Opção 2</SelectItem>
    <SelectItem value="option3">Opção 3</SelectItem>
  </SelectContent>
</Select>

{/* Com valor padrão */}
<Select defaultValue="option2">
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>...</SelectContent>
</Select>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checkbox */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Checkbox
          </CardTitle>
          <CardDescription>Caixas de seleção para múltiplas opções</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estados</h4>
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox-unchecked" />
                <Label htmlFor="checkbox-unchecked">Não marcado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox-checked" checked={checkboxValue} onCheckedChange={(checked) => setCheckboxValue(checked as boolean)} />
                <Label htmlFor="checkbox-checked">Interativo (clique)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox-default-checked" defaultChecked />
                <Label htmlFor="checkbox-default-checked">Marcado por padrão</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox-disabled" disabled />
                <Label htmlFor="checkbox-disabled" className="text-muted-foreground">Desabilitado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox-disabled-checked" disabled defaultChecked />
                <Label htmlFor="checkbox-disabled-checked" className="text-muted-foreground">Desabilitado marcado</Label>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lista de Opções</h4>
              <div className="grid grid-cols-2 gap-3">
                {['Fiber Laser', 'Silk Têxtil', 'Tampografia', 'Hot Stamping', 'Sublimação', 'DTF UV'].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox id={`checkbox-${item}`} />
                    <Label htmlFor={`checkbox-${item}`}>{item}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Checkbox"
              code={`{/* Básico */}
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Aceito os termos</Label>
</div>

{/* Controlado */}
<Checkbox 
  checked={checked} 
  onCheckedChange={(checked) => setChecked(checked as boolean)} 
/>

{/* Estados */}
<Checkbox defaultChecked />
<Checkbox disabled />
<Checkbox disabled defaultChecked />`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Radio Group */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-primary" />
            Radio Group
          </CardTitle>
          <CardDescription>Botões de opção para seleção única</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vertical</h4>
              <RadioGroup defaultValue="option1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option1" id="radio-1" />
                  <Label htmlFor="radio-1">Opção 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option2" id="radio-2" />
                  <Label htmlFor="radio-2">Opção 2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option3" id="radio-3" />
                  <Label htmlFor="radio-3">Opção 3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option4" id="radio-4" disabled />
                  <Label htmlFor="radio-4" className="text-muted-foreground">Desabilitado</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Horizontal</h4>
              <RadioGroup defaultValue="high" className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low">Baixa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="priority-medium" />
                  <Label htmlFor="priority-medium">Média</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high">Alta</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="RadioGroup"
              code={`{/* Vertical */}
<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="radio-1" />
    <Label htmlFor="radio-1">Opção 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="radio-2" />
    <Label htmlFor="radio-2">Opção 2</Label>
  </div>
</RadioGroup>

{/* Horizontal */}
<RadioGroup defaultValue="high" className="flex gap-4">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="low" id="priority-low" />
    <Label htmlFor="priority-low">Baixa</Label>
  </div>
  ...
</RadioGroup>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Switch */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5 text-primary" />
            Switch
          </CardTitle>
          <CardDescription>Interruptores de alternância</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="switch-interactive">Switch Interativo</Label>
                <p className="text-xs text-muted-foreground">{switchValue ? 'Ativado' : 'Desativado'}</p>
              </div>
              <Switch id="switch-interactive" checked={switchValue} onCheckedChange={setSwitchValue} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="switch-default">Switch Ativo</Label>
                <p className="text-xs text-muted-foreground">defaultChecked</p>
              </div>
              <Switch id="switch-default" defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 opacity-50">
              <div>
                <Label htmlFor="switch-disabled">Switch Desabilitado</Label>
                <p className="text-xs text-muted-foreground">disabled</p>
              </div>
              <Switch id="switch-disabled" disabled />
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Switch"
              code={`{/* Básico */}
<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Modo Avião</Label>
</div>

{/* Controlado */}
<Switch 
  checked={switchValue} 
  onCheckedChange={setSwitchValue} 
/>

{/* Estados */}
<Switch defaultChecked />
<Switch disabled />`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Slider */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Slider
          </CardTitle>
          <CardDescription>Controles deslizantes para valores numéricos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Slider Interativo</Label>
                <span className="text-sm font-medium text-primary">{sliderValue[0]}%</span>
              </div>
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Arraste para alterar o valor</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Slider com Steps</Label>
                <span className="text-sm font-medium text-muted-foreground">25%</span>
              </div>
              <Slider
                defaultValue={[25]}
                max={100}
                step={25}
              />
              <p className="text-xs text-muted-foreground">step=25</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Slider Range</Label>
                <span className="text-sm font-medium text-muted-foreground">20 - 80</span>
              </div>
              <Slider
                defaultValue={[20, 80]}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Dois valores para intervalo</p>
            </div>

            <div className="space-y-4 opacity-50">
              <div className="flex justify-between">
                <Label>Slider Desabilitado</Label>
                <span className="text-sm font-medium text-muted-foreground">50%</span>
              </div>
              <Slider
                defaultValue={[50]}
                max={100}
                disabled
              />
              <p className="text-xs text-muted-foreground">disabled</p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Slider"
              code={`{/* Básico */}
<Slider defaultValue={[50]} max={100} step={1} />

{/* Controlado */}
<Slider 
  value={sliderValue} 
  onValueChange={setSliderValue} 
  max={100} 
  step={1} 
/>

{/* Com Steps */}
<Slider defaultValue={[25]} max={100} step={25} />

{/* Range (dois valores) */}
<Slider defaultValue={[20, 80]} max={100} step={1} />

{/* Desabilitado */}
<Slider defaultValue={[50]} max={100} disabled />`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Example */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Exemplo de Formulário Completo
          </CardTitle>
          <CardDescription>Demonstração de um formulário com validação visual</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Nome Completo *</Label>
                <Input id="form-name" placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-email">Email *</Label>
                <Input id="form-email" type="email" placeholder="email@exemplo.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-phone">Telefone</Label>
                <Input id="form-phone" type="tel" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producao">Produção</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="admin">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-message">Mensagem</Label>
              <Textarea id="form-message" placeholder="Digite sua mensagem..." rows={4} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="form-terms" />
                <Label htmlFor="form-terms" className="text-sm">
                  Aceito os termos e condições
                </Label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="form-newsletter" />
                  <Label htmlFor="form-newsletter" className="text-sm">
                    Receber newsletter
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="gradient">Enviar</Button>
              <Button type="button" variant="outline">Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Input States */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Estados de Validação
          </CardTitle>
          <CardDescription>Feedback visual para validação de formulários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="input-success" className="text-[hsl(var(--success))]">Campo Válido</Label>
              <Input 
                id="input-success" 
                defaultValue="email@valido.com" 
                className="border-[hsl(var(--success))] focus-visible:ring-[hsl(var(--success))]" 
              />
              <p className="text-xs text-[hsl(var(--success))] flex items-center gap-1">
                <Check className="h-3 w-3" /> Email válido
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="input-error" className="text-destructive">Campo com Erro</Label>
              <Input 
                id="input-error" 
                defaultValue="email-invalido" 
                className="border-destructive focus-visible:ring-destructive" 
              />
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="h-3 w-3" /> Email inválido
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="input-warning" className="text-[hsl(var(--warning))]">Campo com Aviso</Label>
              <Input 
                id="input-warning" 
                defaultValue="senha123" 
                className="border-[hsl(var(--warning))] focus-visible:ring-[hsl(var(--warning))]" 
              />
              <p className="text-xs text-[hsl(var(--warning))] flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Senha fraca
              </p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Estados de Validação"
              code={`{/* Sucesso */}
<Label className="text-[hsl(var(--success))]">Campo Válido</Label>
<Input 
  className="border-[hsl(var(--success))] focus-visible:ring-[hsl(var(--success))]" 
/>
<p className="text-xs text-[hsl(var(--success))]">
  <Check className="h-3 w-3" /> Email válido
</p>

{/* Erro */}
<Label className="text-destructive">Campo com Erro</Label>
<Input 
  className="border-destructive focus-visible:ring-destructive" 
/>
<p className="text-xs text-destructive">
  <X className="h-3 w-3" /> Email inválido
</p>

{/* Aviso */}
<Label className="text-[hsl(var(--warning))]">Campo com Aviso</Label>
<Input 
  className="border-[hsl(var(--warning))] focus-visible:ring-[hsl(var(--warning))]" 
/>
<p className="text-xs text-[hsl(var(--warning))]">
  <AlertTriangle className="h-3 w-3" /> Senha fraca
</p>`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
