import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DailyCalendar from "./pages/DailyCalendar";
import WeeklyCalendar from "./pages/WeeklyCalendar";
import PendingQueue from "./pages/PendingQueue";
import AlertsDashboard from "./pages/AlertsDashboard";
import KanbanBoard from "./pages/KanbanBoard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calendar/daily" element={<DailyCalendar />} />
          <Route path="/calendar/weekly" element={<WeeklyCalendar />} />
          <Route path="/pending" element={<PendingQueue />} />
          <Route path="/alerts" element={<AlertsDashboard />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
