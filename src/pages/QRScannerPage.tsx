import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { QRScanner } from "@/components/qrcode/QRScanner";
import { ScanHistory } from "@/components/qrcode/ScanHistory";
import { ScanStatsChart } from "@/components/qrcode/ScanStatsChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { QrCode, History, BarChart3 } from "lucide-react";

const QRScannerPage = () => {
  const [activeTab, setActiveTab] = useState("scanner");

  return (
    <MainLayout>
      <div className="container mx-auto p-4 sm:p-6 max-w-2xl">
        <Breadcrumbs className="mb-4" />

        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
            Scanner de Produção
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Escaneie o QR Code do job para iniciar, pausar ou finalizar a produção
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="scanner" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="mt-0">
            <QRScanner />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <ScanHistory limit={100} />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <ScanStatsChart />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default QRScannerPage;
