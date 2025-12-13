import { MainLayout } from "@/components/layout/MainLayout";
import { QRScanner } from "@/components/qrcode/QRScanner";

const QRScannerPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Scanner de Produção
          </h1>
          <p className="text-muted-foreground text-sm">
            Escaneie o QR Code do job para iniciar, pausar ou finalizar a produção
          </p>
        </div>
        <QRScanner />
      </div>
    </MainLayout>
  );
};

export default QRScannerPage;
