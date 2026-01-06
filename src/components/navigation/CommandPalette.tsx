import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Calendar,
  Kanban,
  BarChart3,
  Users,
  Settings,
  Search,
  Star,
  Clock,
  FileText,
  Zap,
  Shield,
  Factory,
  ScanLine,
  Bell,
  Gauge,
  TrendingUp,
  Sparkles,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface CommandItem {
  id: string;
  name: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: "navigation" | "actions" | "settings" | "recent";
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();

  // Load recent searches from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Keyboard shortcut to open command palette
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigateTo = (path: string) => {
    navigate(path);
    setOpen(false);
    addRecentSearch(path);
  };

  const addRecentSearch = (item: string) => {
    const updated = [item, ...recentSearches.filter((s) => s !== item)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "dashboard",
      name: "Dashboard",
      description: "Visão geral do sistema",
      icon: <LayoutDashboard className="h-4 w-4" />,
      shortcut: "⌘D",
      action: () => navigateTo("/"),
      category: "navigation",
      keywords: ["home", "início", "painel"],
    },
    {
      id: "calendar-daily",
      name: "Calendário Diário",
      description: "Programação do dia",
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigateTo("/calendar/daily"),
      category: "navigation",
      keywords: ["agenda", "programação", "dia"],
    },
    {
      id: "calendar-weekly",
      name: "Calendário Semanal",
      description: "Programação da semana",
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigateTo("/calendar/weekly"),
      category: "navigation",
      keywords: ["agenda", "semana"],
    },
    {
      id: "kanban",
      name: "Kanban",
      description: "Quadro de tarefas",
      icon: <Kanban className="h-4 w-4" />,
      shortcut: "⌘K",
      action: () => navigateTo("/kanban"),
      category: "navigation",
      keywords: ["board", "tarefas", "cards"],
    },
    {
      id: "kpis",
      name: "KPIs",
      description: "Indicadores de performance",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigateTo("/kpis"),
      category: "navigation",
      keywords: ["métricas", "indicadores", "performance"],
    },
    {
      id: "oee",
      name: "OEE Dashboard",
      description: "Overall Equipment Effectiveness",
      icon: <Gauge className="h-4 w-4" />,
      action: () => navigateTo("/oee"),
      category: "navigation",
      keywords: ["eficiência", "máquinas", "equipamentos"],
    },
    {
      id: "efficiency",
      name: "Eficiência",
      description: "Análise de eficiência operacional",
      icon: <TrendingUp className="h-4 w-4" />,
      action: () => navigateTo("/efficiency"),
      category: "navigation",
      keywords: ["produtividade", "análise"],
    },
    {
      id: "operators",
      name: "Operadores",
      description: "Gestão de operadores",
      icon: <Users className="h-4 w-4" />,
      action: () => navigateTo("/operators"),
      category: "navigation",
      keywords: ["equipe", "funcionários", "pessoas"],
    },
    {
      id: "machines",
      name: "Máquinas",
      description: "Gestão de máquinas",
      icon: <Factory className="h-4 w-4" />,
      action: () => navigateTo("/machines"),
      category: "navigation",
      keywords: ["equipamentos", "ativos"],
    },
    {
      id: "scanner",
      name: "Scanner QR",
      description: "Leitura de códigos QR",
      icon: <ScanLine className="h-4 w-4" />,
      action: () => navigateTo("/scanner"),
      category: "navigation",
      keywords: ["qrcode", "leitura", "código"],
    },
    {
      id: "notifications",
      name: "Notificações",
      description: "Central de notificações",
      icon: <Bell className="h-4 w-4" />,
      action: () => navigateTo("/notifications"),
      category: "navigation",
    },
    {
      id: "gamification",
      name: "Gamificação",
      description: "Rankings e conquistas",
      icon: <Sparkles className="h-4 w-4" />,
      action: () => navigateTo("/gamification"),
      category: "navigation",
      keywords: ["pontos", "ranking", "conquistas"],
    },
    {
      id: "documents",
      name: "Documentos",
      description: "Gestão de documentos",
      icon: <FileText className="h-4 w-4" />,
      action: () => navigateTo("/documents"),
      category: "navigation",
    },
    {
      id: "security",
      name: "Segurança",
      description: "Dashboard de segurança",
      icon: <Shield className="h-4 w-4" />,
      action: () => navigateTo("/security"),
      category: "navigation",
    },
    {
      id: "settings",
      name: "Configurações",
      description: "Configurações do sistema",
      icon: <Settings className="h-4 w-4" />,
      shortcut: "⌘,",
      action: () => navigateTo("/settings"),
      category: "navigation",
    },
    // Actions
    {
      id: "new-job",
      name: "Nova Ordem",
      description: "Criar nova ordem de produção",
      icon: <Zap className="h-4 w-4 text-primary" />,
      shortcut: "⌘N",
      action: () => navigateTo("/new-job"),
      category: "actions",
      keywords: ["criar", "adicionar", "ordem"],
    },
    // Settings
    {
      id: "toggle-theme",
      name: theme === "dark" ? "Modo Claro" : "Modo Escuro",
      description: "Alternar tema do sistema",
      icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      shortcut: "⌘T",
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        setOpen(false);
      },
      category: "settings",
      keywords: ["tema", "dark", "light", "escuro", "claro"],
    },
    {
      id: "logout",
      name: "Sair",
      description: "Encerrar sessão",
      icon: <LogOut className="h-4 w-4" />,
      action: () => {
        signOut();
        setOpen(false);
      },
      category: "settings",
      keywords: ["logout", "desconectar"],
    },
  ];

  const navigationCommands = commands.filter((c) => c.category === "navigation");
  const actionCommands = commands.filter((c) => c.category === "actions");
  const settingsCommands = commands.filter((c) => c.category === "settings");

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <Search className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
          </div>
        </CommandEmpty>

        {recentSearches.length > 0 && (
          <CommandGroup heading="Recentes">
            {recentSearches.slice(0, 3).map((path) => {
              const cmd = commands.find((c) => c.action.toString().includes(path));
              return cmd ? (
                <CommandItem key={`recent-${cmd.id}`} onSelect={cmd.action}>
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{cmd.name}</span>
                </CommandItem>
              ) : null;
            })}
          </CommandGroup>
        )}

        <CommandGroup heading="Ações Rápidas">
          {actionCommands.map((cmd) => (
            <CommandItem key={cmd.id} onSelect={cmd.action}>
              {cmd.icon}
              <span className="ml-2">{cmd.name}</span>
              {cmd.description && (
                <span className="ml-2 text-xs text-muted-foreground">{cmd.description}</span>
              )}
              {cmd.shortcut && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {cmd.shortcut}
                </Badge>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navegação">
          {navigationCommands.map((cmd) => (
            <CommandItem key={cmd.id} onSelect={cmd.action} keywords={cmd.keywords}>
              {cmd.icon}
              <span className="ml-2">{cmd.name}</span>
              {cmd.description && (
                <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
                  {cmd.description}
                </span>
              )}
              {cmd.shortcut && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {cmd.shortcut}
                </Badge>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Configurações">
          {settingsCommands.map((cmd) => (
            <CommandItem key={cmd.id} onSelect={cmd.action}>
              {cmd.icon}
              <span className="ml-2">{cmd.name}</span>
              {cmd.shortcut && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {cmd.shortcut}
                </Badge>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Trigger button component
export function CommandPaletteTrigger() {
  return (
    <button
      onClick={() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
        });
        document.dispatchEvent(event);
      }}
      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border rounded-lg hover:bg-accent transition-colors"
    >
      <Search className="h-4 w-4" />
      <span className="hidden md:inline">Buscar...</span>
      <Badge variant="outline" className="hidden md:flex text-xs">
        ⌘K
      </Badge>
    </button>
  );
}
