import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { InventoryItem } from '@/features/inventory';

interface QRLabelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
}

export function QRLabelModal({ open, onOpenChange, item }: QRLabelModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write('<html><head><title>Imprimir Etiqueta</title>');
    win.document.write('<style>body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .label { border: 2px solid #000; padding: 20px; text-align: center; width: 300px; }</style>');
    win.document.write('</head><body>');
    win.document.write('<div class="label">');
    win.document.write(printContent.innerHTML);
    win.document.write('</div>');
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Gerar Etiqueta QR</DialogTitle>
          <DialogDescription>
            Etiqueta oficial para identificação de materiais e rastreabilidade via scanner.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div ref={printRef} className="p-6 bg-white rounded-xl border-2 border-black flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-tighter mb-2 text-black">Propriedade: INDÚSTRIA 4.0</p>
            <QRCodeSVG
              value={JSON.stringify({ id: item.id, type: 'inventory', name: item.name })}
              size={180}
              level="H"
              includeMargin={true}
            />
            <div className="mt-4 text-center">
              <p className="text-lg font-black text-black leading-none uppercase">{item.name}</p>
              <p className="text-[10px] text-black/60 font-bold mt-1">ID: {item.id.substring(0, 8).toUpperCase()}</p>
              <p className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded mt-2 inline-block">
                LOC: {item.location || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="w-full gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimir Etiqueta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
