import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target, 
  Zap,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Award,
  Calendar,
  MousePointer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Hook para rastrear analytics pessoais
interface UserActivity {
  timestamp: number;
  action: string;
  page: string;
  duration?: number;
}

interface DailyStats {
  date: string;
  actionsCount: number;
  pagesVisited: number;
  timeSpent: number;
  completedTasks: number;
}

interface PersonalAnalytics {
  totalActions: number;
  totalTimeSpent: number;
  mostVisitedPages: { page: string; count: number }[];
  dailyStats: DailyStats[];
  streak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  achievements: string[];
  productivityScore: number;
  peakHours: number[];
}

const STORAGE_KEY = "lovable-personal-analytics";
const ACTIVITY_KEY = "lovable-user-activities";

export function usePersonalAnalytics() {
  const [analytics, setAnalytics] = React.useState<PersonalAnalytics>(() => {
    if (typeof window === "undefined") return getDefaultAnalytics();
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultAnalytics();
  });

  const [activities, setActivities] = React.useState<UserActivity[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(ACTIVITY_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Salvar analytics
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
  }, [analytics]);

  React.useEffect(() => {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(-1000)));
  }, [activities]);

  // Rastrear ação
  const trackAction = React.useCallback((action: string, page?: string) => {
    const now = Date.now();
    const currentPage = page || window.location.pathname;

    setActivities(prev => [...prev, {
      timestamp: now,
      action,
      page: currentPage
    }]);

    setAnalytics(prev => {
      const newXp = prev.xp + getXpForAction(action);
      const { level, xp: remainingXp, xpToNextLevel } = calculateLevel(prev.level, newXp, prev.xpToNextLevel);

      return {
        ...prev,
        totalActions: prev.totalActions + 1,
        xp: remainingXp,
        level,
        xpToNextLevel,
        productivityScore: Math.min(100, prev.productivityScore + 0.1)
      };
    });
  }, []);

  // Rastrear tempo na página
  const trackTimeSpent = React.useCallback((seconds: number) => {
    setAnalytics(prev => ({
      ...prev,
      totalTimeSpent: prev.totalTimeSpent + seconds
    }));
  }, []);

  // Rastrear visita à página
  const trackPageVisit = React.useCallback((page: string) => {
    setAnalytics(prev => {
      const existingPage = prev.mostVisitedPages.find(p => p.page === page);
      let updatedPages;

      if (existingPage) {
        updatedPages = prev.mostVisitedPages.map(p =>
          p.page === page ? { ...p, count: p.count + 1 } : p
        );
      } else {
        updatedPages = [...prev.mostVisitedPages, { page, count: 1 }];
      }

      // Ordenar e manter top 10
      updatedPages.sort((a, b) => b.count - a.count);
      updatedPages = updatedPages.slice(0, 10);

      // Atualizar peak hours
      const hour = new Date().getHours();
      const peakHours = [...prev.peakHours];
      peakHours[hour] = (peakHours[hour] || 0) + 1;

      return {
        ...prev,
        mostVisitedPages: updatedPages,
        peakHours
      };
    });
  }, []);

  // Atualizar streak
  const updateStreak = React.useCallback(() => {
    setAnalytics(prev => {
      const today = new Date().toDateString();
      const lastActivity = activities[activities.length - 1];
      
      if (!lastActivity) return prev;

      const lastDate = new Date(lastActivity.timestamp).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (lastDate === today) {
        return prev; // Já atualizou hoje
      } else if (lastDate === yesterday) {
        return { ...prev, streak: prev.streak + 1 };
      } else {
        return { ...prev, streak: 1 };
      }
    });
  }, [activities]);

  // Resetar analytics
  const resetAnalytics = React.useCallback(() => {
    setAnalytics(getDefaultAnalytics());
    setActivities([]);
  }, []);

  return {
    analytics,
    activities,
    trackAction,
    trackTimeSpent,
    trackPageVisit,
    updateStreak,
    resetAnalytics
  };
}

function getDefaultAnalytics(): PersonalAnalytics {
  return {
    totalActions: 0,
    totalTimeSpent: 0,
    mostVisitedPages: [],
    dailyStats: [],
    streak: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    achievements: [],
    productivityScore: 50,
    peakHours: new Array(24).fill(0)
  };
}

function getXpForAction(action: string): number {
  const xpMap: Record<string, number> = {
    'click': 1,
    'navigate': 2,
    'create': 10,
    'update': 5,
    'delete': 3,
    'complete': 15,
    'search': 2
  };
  return xpMap[action] || 1;
}

function calculateLevel(currentLevel: number, xp: number, xpToNext: number) {
  let level = currentLevel;
  let remainingXp = xp;
  let xpToNextLevel = xpToNext;

  while (remainingXp >= xpToNextLevel) {
    remainingXp -= xpToNextLevel;
    level++;
    xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
  }

  return { level, xp: remainingXp, xpToNextLevel };
}

// Componente de Widget
interface PersonalAnalyticsWidgetProps {
  className?: string;
  compact?: boolean;
}

export const PersonalAnalyticsWidget = React.memo(function PersonalAnalyticsWidget({
  className,
  compact = false
}: PersonalAnalyticsWidgetProps) {
  const { analytics } = usePersonalAnalytics();
  const [activeTab, setActiveTab] = React.useState("overview");

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getProductivityTrend = () => {
    if (analytics.productivityScore > 70) return { trend: "up", color: "text-green-500" };
    if (analytics.productivityScore > 40) return { trend: "stable", color: "text-yellow-500" };
    return { trend: "down", color: "text-red-500" };
  };

  const trend = getProductivityTrend();
  const xpPercentage = (analytics.xp / analytics.xpToNextLevel) * 100;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("flex items-center gap-4 p-3 rounded-lg bg-muted/50", className)}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="absolute -top-1 -right-1 text-xs font-bold">{analytics.streak}</span>
          </div>
          <span className="text-sm text-muted-foreground">dias</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Award className="h-3 w-3" />
            Nível {analytics.level}
          </Badge>
        </div>

        <div className="flex-1">
          <Progress value={xpPercentage} className="h-1.5" />
        </div>

        <span className="text-xs text-muted-foreground">
          {analytics.xp}/{analytics.xpToNextLevel} XP
        </span>
      </motion.div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Analytics Pessoais
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            {analytics.streak} dias
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="font-medium">Nível {analytics.level}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analytics.xp}/{analytics.xpToNextLevel} XP
            </span>
          </div>
          <Progress value={xpPercentage} className="h-2" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={MousePointer}
                label="Ações Totais"
                value={analytics.totalActions}
                trend="up"
              />
              <StatCard
                icon={Clock}
                label="Tempo Total"
                value={formatTime(analytics.totalTimeSpent)}
                trend="up"
              />
              <StatCard
                icon={Target}
                label="Produtividade"
                value={`${Math.round(analytics.productivityScore)}%`}
                trend={trend.trend as "up" | "down" | "stable"}
              />
              <StatCard
                icon={Zap}
                label="XP Ganho"
                value={analytics.xp + (analytics.level - 1) * 100}
                trend="up"
              />
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Páginas Mais Visitadas
              </h4>
              <div className="space-y-2">
                {analytics.mostVisitedPages.slice(0, 5).map((page, index) => (
                  <motion.div
                    key={page.page}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-sm truncate max-w-[200px]">
                      {formatPageName(page.page)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {page.count}x
                    </Badge>
                  </motion.div>
                ))}
                {analytics.mostVisitedPages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade registrada ainda
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 pt-4">
            <div className="space-y-3">
              <InsightCard
                icon={Calendar}
                title="Horário de Pico"
                description={getPeakHourInsight(analytics.peakHours)}
              />
              <InsightCard
                icon={TrendingUp}
                title="Tendência"
                description={getProductivityInsight(analytics.productivityScore)}
              />
              <InsightCard
                icon={Flame}
                title="Sequência"
                description={getStreakInsight(analytics.streak)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

// Componentes auxiliares
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend: "up" | "down" | "stable";
}

const StatCard = React.memo(function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-3 rounded-lg bg-muted/30 space-y-1"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">{value}</span>
        {trend === "up" && <ArrowUpRight className="h-4 w-4 text-green-500" />}
        {trend === "down" && <ArrowDownRight className="h-4 w-4 text-red-500" />}
      </div>
    </motion.div>
  );
});

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const InsightCard = React.memo(function InsightCard({ icon: Icon, title, description }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 rounded-lg bg-muted/20"
    >
      <div className="p-2 rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h5 className="font-medium text-sm">{title}</h5>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
});

// Funções auxiliares
function formatPageName(path: string): string {
  if (path === "/") return "Dashboard";
  return path
    .split("/")
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "))
    .join(" > ");
}

function getPeakHourInsight(peakHours: number[]): string {
  const maxHour = peakHours.indexOf(Math.max(...peakHours));
  if (Math.max(...peakHours) === 0) return "Sem dados suficientes ainda";
  
  const period = maxHour < 12 ? "manhã" : maxHour < 18 ? "tarde" : "noite";
  return `Você é mais produtivo às ${maxHour}h (${period})`;
}

function getProductivityInsight(score: number): string {
  if (score >= 80) return "Excelente! Você está no seu melhor!";
  if (score >= 60) return "Bom ritmo! Continue assim!";
  if (score >= 40) return "Há espaço para melhorar";
  return "Tente manter o foco por mais tempo";
}

function getStreakInsight(streak: number): string {
  if (streak >= 30) return "Incrível! Um mês de consistência!";
  if (streak >= 7) return "Uma semana inteira! Impressionante!";
  if (streak >= 3) return "Bom começo! Mantenha o ritmo!";
  if (streak >= 1) return "Continue para construir seu streak!";
  return "Comece hoje para iniciar sua sequência!";
}

// Mini widget para sidebar
export const MiniAnalyticsWidget = React.memo(function MiniAnalyticsWidget() {
  const { analytics } = usePersonalAnalytics();
  const xpPercentage = (analytics.xp / analytics.xpToNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Award className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Nível {analytics.level}</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="h-3 w-3 text-orange-500" />
          <span className="text-xs">{analytics.streak}</span>
        </div>
      </div>
      <Progress value={xpPercentage} className="h-1" />
      <p className="text-xs text-muted-foreground mt-1">
        {analytics.xp}/{analytics.xpToNextLevel} XP
      </p>
    </motion.div>
  );
});
