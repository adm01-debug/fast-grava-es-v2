import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { QRScanner } from "@/components/qrcode/QRScanner";
import { ScanHistory } from "@/components/qrcode/ScanHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, History } from "lucide-react";

const QRScannerPage = () => {
  const [activeTab, setActiveTab] = useState("scanner");

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Scanner de Produção
          </h1>
          <p className="text-muted-foreground text-sm">
            Escaneie o QR Code do job para iniciar, pausar ou finalizar a produção
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scanner" className="mt-0">
            <QRScanner />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <ScanHistory limit={100} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default QRScannerPage;
