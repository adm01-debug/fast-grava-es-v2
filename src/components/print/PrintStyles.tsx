import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Printer, FileText, Settings, Download, Eye, EyeOff, Columns, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface PrintSettings {
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margins: 'normal' | 'narrow' | 'wide';
  showHeaders: boolean;
  showFooters: boolean;
  showPageNumbers: boolean;
  colorMode: 'color' | 'grayscale';
  hideElements: string[];
}

interface PrintContextValue {
  settings: PrintSettings;
  updateSettings: (settings: Partial<PrintSettings>) => void;
  print: () => void;
  isPrintMode: boolean;
  setIsPrintMode: (value: boolean) => void;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const defaultSettings: PrintSettings = {
  pageSize: 'a4',
  orientation: 'portrait',
  margins: 'normal',
  showHeaders: true,
  showFooters: true,
  showPageNumbers: true,
  colorMode: 'color',
  hideElements: [],
};

// ============================================================================
// CONTEXT
// ============================================================================

const PrintContext = createContext<PrintContextValue | null>(null);

export function usePrint() {
  const context = useContext(PrintContext);
  if (!context) {
    throw new Error('usePrint must be used within PrintProvider');
  }
  return context;
}

// ============================================================================
// PRINT PROVIDER
// ============================================================================

export function PrintProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrintSettings>(() => {
    const saved = localStorage.getItem('print-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('print-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<PrintSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const print = useCallback(() => {
    window.print();
  }, []);

  // Inject print styles
  useEffect(() => {
    const styleId = 'dynamic-print-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const margins = {
      normal: '2cm',
      narrow: '1cm',
      wide: '3cm',
    };

    const pageSize = settings.pageSize === 'a4' ? 'A4' : 
                     settings.pageSize === 'letter' ? 'letter' : 'legal';

    styleEl.textContent = `
      @media print {
        @page {
          size: ${pageSize} ${settings.orientation};
          margin: ${margins[settings.margins]};
        }

        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        ${settings.colorMode === 'grayscale' ? `
          * {
            filter: grayscale(100%) !important;
          }
        ` : ''}

        .no-print, [data-no-print], .print-hide {
          display: none !important;
        }

        .print-only {
          display: block !important;
        }

        ${!settings.showHeaders ? `
          .print-header, [data-print-header] {
            display: none !important;
          }
        ` : ''}

        ${!settings.showFooters ? `
          .print-footer, [data-print-footer] {
            display: none !important;
          }
        ` : ''}

        ${settings.showPageNumbers ? `
          .print-page-number::after {
            content: counter(page);
          }
        ` : ''}

        ${settings.hideElements.map(el => `${el} { display: none !important; }`).join('\n')}

        /* Reset backgrounds and shadows for printing */
        .print-clean {
          background: white !important;
          box-shadow: none !important;
          border: 1px solid #e5e5e5 !important;
        }

        /* Page break utilities */
        .print-break-before {
          page-break-before: always;
        }

        .print-break-after {
          page-break-after: always;
        }

        .print-avoid-break {
          page-break-inside: avoid;
        }
      }

      @media screen {
        .print-only {
          display: none !important;
        }
      }
    `;

    return () => {
      // Cleanup on unmount
    };
  }, [settings]);

  return (
    <PrintContext.Provider
      value={{
        settings,
        updateSettings,
        print,
        isPrintMode,
        setIsPrintMode,
      }}
    >
      {children}
    </PrintContext.Provider>
  );
}

// ============================================================================
// PRINT BUTTON
// ============================================================================

interface PrintButtonProps {
  className?: string;
  showSettings?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PrintButton({
  className,
  showSettings = true,
  variant = 'outline',
  size = 'default',
}: PrintButtonProps) {
  const { print } = usePrint();

  if (!showSettings) {
    return (
      <Button variant={variant} size={size} onClick={print} className={className}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Impressão</DialogTitle>
          <DialogDescription>
            Ajuste as configurações antes de imprimir
          </DialogDescription>
        </DialogHeader>
        <PrintSettingsPanel />
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// PRINT SETTINGS PANEL
// ============================================================================

export function PrintSettingsPanel() {
  const { settings, updateSettings, print } = usePrint();

  return (
    <div className="space-y-6 py-4">
      {/* Page Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Página
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tamanho</Label>
            <Select
              value={settings.pageSize}
              onValueChange={(value: PrintSettings['pageSize']) =>
                updateSettings({ pageSize: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="letter">Carta</SelectItem>
                <SelectItem value="legal">Ofício</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Orientação</Label>
            <Select
              value={settings.orientation}
              onValueChange={(value: PrintSettings['orientation']) =>
                updateSettings({ orientation: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Retrato</SelectItem>
                <SelectItem value="landscape">Paisagem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Margens</Label>
          <Select
            value={settings.margins}
            onValueChange={(value: PrintSettings['margins']) =>
              updateSettings({ margins: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="narrow">Estreitas (1cm)</SelectItem>
              <SelectItem value="normal">Normais (2cm)</SelectItem>
              <SelectItem value="wide">Largas (3cm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Display Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Opções
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="headers">Cabeçalhos</Label>
            <Switch
              id="headers"
              checked={settings.showHeaders}
              onCheckedChange={(checked) =>
                updateSettings({ showHeaders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="footers">Rodapés</Label>
            <Switch
              id="footers"
              checked={settings.showFooters}
              onCheckedChange={(checked) =>
                updateSettings({ showFooters: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="pageNumbers">Números de Página</Label>
            <Switch
              id="pageNumbers"
              checked={settings.showPageNumbers}
              onCheckedChange={(checked) =>
                updateSettings({ showPageNumbers: checked })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Modo de Cor</Label>
          <Select
            value={settings.colorMode}
            onValueChange={(value: PrintSettings['colorMode']) =>
              updateSettings({ colorMode: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Colorido</SelectItem>
              <SelectItem value="grayscale">Escala de Cinza</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button onClick={print} className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// PRINT PREVIEW
// ============================================================================

interface PrintPreviewProps {
  children: React.ReactNode;
  className?: string;
}

export function PrintPreview({ children, className }: PrintPreviewProps) {
  const { settings, isPrintMode, setIsPrintMode } = usePrint();

  return (
    <div className={cn('relative', className)}>
      <div className="absolute top-2 right-2 z-10 no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPrintMode(!isPrintMode)}
        >
          {isPrintMode ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Sair Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          )}
        </Button>
      </div>

      <div
        className={cn(
          'transition-all duration-300',
          isPrintMode && 'bg-white shadow-xl mx-auto',
          isPrintMode && settings.orientation === 'portrait' && 'max-w-[210mm] min-h-[297mm]',
          isPrintMode && settings.orientation === 'landscape' && 'max-w-[297mm] min-h-[210mm]',
          isPrintMode && settings.margins === 'narrow' && 'p-[1cm]',
          isPrintMode && settings.margins === 'normal' && 'p-[2cm]',
          isPrintMode && settings.margins === 'wide' && 'p-[3cm]',
          isPrintMode && settings.colorMode === 'grayscale' && 'grayscale'
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// PRINT UTILITIES
// ============================================================================

interface PrintOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function PrintOnly({ children, className }: PrintOnlyProps) {
  return (
    <div className={cn('print-only hidden', className)}>
      {children}
    </div>
  );
}

interface NoPrintProps {
  children: React.ReactNode;
  className?: string;
}

export function NoPrint({ children, className }: NoPrintProps) {
  return (
    <div className={cn('no-print', className)}>
      {children}
    </div>
  );
}

interface PrintHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function PrintHeader({ children, className }: PrintHeaderProps) {
  return (
    <div className={cn('print-header print-only', className)} data-print-header>
      {children}
    </div>
  );
}

interface PrintFooterProps {
  children: React.ReactNode;
  className?: string;
  showPageNumber?: boolean;
}

export function PrintFooter({ children, className, showPageNumber }: PrintFooterProps) {
  return (
    <div className={cn('print-footer print-only', className)} data-print-footer>
      {children}
      {showPageNumber && (
        <span className="print-page-number" />
      )}
    </div>
  );
}

interface PageBreakProps {
  type?: 'before' | 'after';
}

export function PageBreak({ type = 'after' }: PageBreakProps) {
  return (
    <div
      className={cn(
        'h-0',
        type === 'before' ? 'print-break-before' : 'print-break-after'
      )}
    />
  );
}

interface AvoidBreakProps {
  children: React.ReactNode;
  className?: string;
}

export function AvoidBreak({ children, className }: AvoidBreakProps) {
  return (
    <div className={cn('print-avoid-break', className)}>
      {children}
    </div>
  );
}

export default PrintProvider;
