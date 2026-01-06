import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Copy,
  Trash2,
  Edit,
  Eye,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  ArrowRight,
  Command,
  Keyboard,
  HelpCircle,
  BookOpen,
  Wrench,
  Activity,
  Package,
  Layers,
  History,
  Star,
  StarOff,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type CommandCategory = 
  | "navigation" 
  | "actions" 
  | "settings" 
  | "recent" 
  | "contextual"
  | "jobs"
  | "search";

interface CommandItemType {
  id: string;
  name: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: CommandCategory;
  keywords?: string[];
  priority?: number;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface CommandGroup {
  heading: string;
  commands: CommandItemType[];
  icon?: React.ReactNode;
}

// ============================================================================
// FUZZY SEARCH
// ============================================================================

function fuzzyMatch(pattern: string, str: string): { match: boolean; score: number } {
  if (!pattern) return { match: true, score: 0 };
  
  const patternLower = pattern.toLowerCase();
  const strLower = str.toLowerCase();
  
  // Exact match
  if (strLower.includes(patternLower)) {
    return { match: true, score: 100 - strLower.indexOf(patternLower) };
  }
  
  // Fuzzy match
  let patternIdx = 0;
  let score = 0;
  let consecutiveMatches = 0;
  
  for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
    if (strLower[i] === patternLower[patternIdx]) {
      patternIdx++;
      consecutiveMatches++;
      score += consecutiveMatches * 2;
    } else {
      consecutiveMatches = 0;
    }
  }
  
  const match = patternIdx === patternLower.length;
  return { match, score: match ? score : 0 };
}

function searchCommands(commands: CommandItemType[], query: string): CommandItemType[] {
  if (!query) return commands;
  
  const results = commands
    .map(cmd => {
      const nameMatch = fuzzyMatch(query, cmd.name);
      const descMatch = cmd.description ? fuzzyMatch(query, cmd.description) : { match: false, score: 0 };
      const keywordMatches = (cmd.keywords || []).map(k => fuzzyMatch(query, k));
      const bestKeywordScore = Math.max(0, ...keywordMatches.map(m => m.score));
      
      const totalScore = Math.max(
        nameMatch.score * 2,
        descMatch.score,
        bestKeywordScore
      ) + (cmd.priority || 0);
      
      const match = nameMatch.match || descMatch.match || keywordMatches.some(m => m.match);
      
      return { cmd, score: totalScore, match };
    })
    .filter(r => r.match)
    .sort((a, b) => b.score - a.score)
    .map(r => r.cmd);
  
  return results;
}

// ============================================================================
// HIGHLIGHT COMPONENT
// ============================================================================

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  
  const parts: React.ReactNode[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index >= 0) {
    parts.push(text.slice(0, index));
    parts.push(
      <span key="match" className="bg-primary/20 text-primary font-medium rounded px-0.5">
        {text.slice(index, index + query.length)}
      </span>
    );
    parts.push(text.slice(index + query.length));
  } else {
    return <>{text}</>;
  }
  
  return <>{parts}</>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CommandPaletteAdvanced() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recentCommands, setRecentCommands] = React.useState<string[]>([]);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [mode, setMode] = React.useState<"default" | "actions" | "navigation">("default");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { signOut, profile } = useAuth();

  // Load from localStorage
  React.useEffect(() => {
    const savedRecent = localStorage.getItem("command_recent");
    const savedFavorites = localStorage.getItem("command_favorites");
    if (savedRecent) setRecentCommands(JSON.parse(savedRecent));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K to open
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
        setMode("default");
      }
      // Cmd+Shift+P for actions mode
      if (e.key === "p" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setOpen(true);
        setMode("actions");
      }
      // Cmd+G for navigation
      if (e.key === "g" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
        setMode("navigation");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset query when closing
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setMode("default");
    }
  }, [open]);

  const navigateTo = (path: string, commandId: string) => {
    navigate(path);
    setOpen(false);
    addRecentCommand(commandId);
  };

  const executeAction = (commandId: string, action: () => void) => {
    action();
    addRecentCommand(commandId);
  };

  const addRecentCommand = (id: string) => {
    const updated = [id, ...recentCommands.filter(c => c !== id)].slice(0, 10);
    setRecentCommands(updated);
    localStorage.setItem("command_recent", JSON.stringify(updated));
  };

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("command_favorites", JSON.stringify(updated));
  };

  // ============================================================================
  // COMMANDS DEFINITION
  // ============================================================================

  const allCommands: CommandItemType[] = React.useMemo(() => [
    // ===== NAVIGATION =====
    {
      id: "nav-dashboard",
      name: "Dashboard",
      description: "Visão geral do sistema",
      icon: <LayoutDashboard className="h-4 w-4" />,
      shortcut: "⌘D",
      action: () => navigateTo("/", "nav-dashboard"),
      category: "navigation",
      keywords: ["home", "início", "painel", "principal"],
      priority: 100,
    },
    {
      id: "nav-calendar-daily",
      name: "Calendário Diário",
      description: "Programação do dia",
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigateTo("/calendar/daily", "nav-calendar-daily"),
      category: "navigation",
      keywords: ["agenda", "programação", "dia", "hoje"],
      priority: 90,
    },
    {
      id: "nav-calendar-weekly",
      name: "Calendário Semanal",
      description: "Programação da semana",
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigateTo("/calendar/weekly", "nav-calendar-weekly"),
      category: "navigation",
      keywords: ["agenda", "semana", "semanal"],
      priority: 89,
    },
    {
      id: "nav-kanban",
      name: "Kanban Board",
      description: "Quadro de tarefas visual",
      icon: <Kanban className="h-4 w-4" />,
      action: () => navigateTo("/kanban", "nav-kanban"),
      category: "navigation",
      keywords: ["board", "tarefas", "cards", "visual"],
      priority: 95,
    },
    {
      id: "nav-kpis",
      name: "KPIs Dashboard",
      description: "Indicadores de performance",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigateTo("/kpis", "nav-kpis"),
      category: "navigation",
      keywords: ["métricas", "indicadores", "performance", "dados"],
      priority: 85,
    },
    {
      id: "nav-oee",
      name: "OEE Dashboard",
      description: "Overall Equipment Effectiveness",
      icon: <Gauge className="h-4 w-4" />,
      action: () => navigateTo("/oee", "nav-oee"),
      category: "navigation",
      keywords: ["eficiência", "máquinas", "equipamentos", "oee"],
      priority: 84,
    },
    {
      id: "nav-efficiency",
      name: "Eficiência Operacional",
      description: "Análise de eficiência",
      icon: <TrendingUp className="h-4 w-4" />,
      action: () => navigateTo("/efficiency", "nav-efficiency"),
      category: "navigation",
      keywords: ["produtividade", "análise", "rendimento"],
      priority: 83,
    },
    {
      id: "nav-operators",
      name: "Gestão de Operadores",
      description: "Equipe e produtividade",
      icon: <Users className="h-4 w-4" />,
      action: () => navigateTo("/operators", "nav-operators"),
      category: "navigation",
      keywords: ["equipe", "funcionários", "pessoas", "time"],
      priority: 80,
    },
    {
      id: "nav-machines",
      name: "Gestão de Máquinas",
      description: "Equipamentos e manutenção",
      icon: <Factory className="h-4 w-4" />,
      action: () => navigateTo("/machines", "nav-machines"),
      category: "navigation",
      keywords: ["equipamentos", "ativos", "manutenção"],
      priority: 79,
    },
    {
      id: "nav-queue",
      name: "Fila de Espera",
      description: "Jobs pendentes",
      icon: <Layers className="h-4 w-4" />,
      action: () => navigateTo("/pending-queue", "nav-queue"),
      category: "navigation",
      keywords: ["pendentes", "aguardando", "buffer"],
      priority: 78,
    },
    {
      id: "nav-scanner",
      name: "Scanner QR Code",
      description: "Leitura de códigos",
      icon: <ScanLine className="h-4 w-4" />,
      action: () => navigateTo("/scanner", "nav-scanner"),
      category: "navigation",
      keywords: ["qrcode", "leitura", "código", "scan"],
      priority: 70,
    },
    {
      id: "nav-notifications",
      name: "Central de Notificações",
      description: "Alertas e avisos",
      icon: <Bell className="h-4 w-4" />,
      action: () => navigateTo("/notifications", "nav-notifications"),
      category: "navigation",
      keywords: ["alertas", "avisos", "mensagens"],
      priority: 75,
    },
    {
      id: "nav-gamification",
      name: "Gamificação",
      description: "Rankings e conquistas",
      icon: <Sparkles className="h-4 w-4" />,
      action: () => navigateTo("/gamification", "nav-gamification"),
      category: "navigation",
      keywords: ["pontos", "ranking", "conquistas", "xp"],
      priority: 65,
    },
    {
      id: "nav-documents",
      name: "Documentos Técnicos",
      description: "Gestão documental",
      icon: <FileText className="h-4 w-4" />,
      action: () => navigateTo("/documents", "nav-documents"),
      category: "navigation",
      keywords: ["arquivos", "pdfs", "manuais"],
      priority: 60,
    },
    {
      id: "nav-traceability",
      name: "Rastreabilidade",
      description: "Tracking de lotes",
      icon: <Package className="h-4 w-4" />,
      action: () => navigateTo("/traceability", "nav-traceability"),
      category: "navigation",
      keywords: ["lotes", "tracking", "histórico"],
      priority: 55,
    },
    {
      id: "nav-shift",
      name: "Passagem de Turno",
      description: "Handover entre turnos",
      icon: <RefreshCw className="h-4 w-4" />,
      action: () => navigateTo("/shift-handover", "nav-shift"),
      category: "navigation",
      keywords: ["turno", "handover", "passagem"],
      priority: 50,
    },
    {
      id: "nav-tpm",
      name: "TPM Dashboard",
      description: "Total Productive Maintenance",
      icon: <Wrench className="h-4 w-4" />,
      action: () => navigateTo("/tpm", "nav-tpm"),
      category: "navigation",
      keywords: ["manutenção", "preventiva", "tpm"],
      priority: 45,
    },
    {
      id: "nav-spc",
      name: "SPC Dashboard",
      description: "Controle Estatístico",
      icon: <Activity className="h-4 w-4" />,
      action: () => navigateTo("/spc", "nav-spc"),
      category: "navigation",
      keywords: ["estatística", "controle", "qualidade"],
      priority: 44,
    },
    {
      id: "nav-bi",
      name: "Business Intelligence",
      description: "Análises avançadas",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigateTo("/bi", "nav-bi"),
      category: "navigation",
      keywords: ["bi", "analytics", "relatórios"],
      priority: 43,
    },
    {
      id: "nav-security",
      name: "Segurança",
      description: "Dashboard de segurança",
      icon: <Shield className="h-4 w-4" />,
      action: () => navigateTo("/security", "nav-security"),
      category: "navigation",
      keywords: ["auditoria", "logs", "acessos"],
      priority: 40,
    },
    {
      id: "nav-settings",
      name: "Configurações",
      description: "Configurações do sistema",
      icon: <Settings className="h-4 w-4" />,
      shortcut: "⌘,",
      action: () => navigateTo("/settings", "nav-settings"),
      category: "navigation",
      keywords: ["preferências", "opções", "config"],
      priority: 35,
    },

    // ===== ACTIONS =====
    {
      id: "action-new-job",
      name: "Criar Nova Ordem",
      description: "Nova ordem de produção",
      icon: <Plus className="h-4 w-4 text-success" />,
      shortcut: "⌘N",
      action: () => navigateTo("/new-job", "action-new-job"),
      category: "actions",
      keywords: ["criar", "adicionar", "ordem", "nova"],
      priority: 100,
      badge: "Ação",
      badgeVariant: "default",
    },
    {
      id: "action-refresh",
      name: "Atualizar Dados",
      description: "Recarregar informações",
      icon: <RefreshCw className="h-4 w-4 text-info" />,
      shortcut: "⌘R",
      action: () => {
        window.location.reload();
        setOpen(false);
      },
      category: "actions",
      keywords: ["refresh", "reload", "atualizar"],
      priority: 90,
    },
    {
      id: "action-export",
      name: "Exportar Dados",
      description: "Download em Excel/CSV",
      icon: <Download className="h-4 w-4 text-primary" />,
      action: () => {
        // Trigger export modal
        setOpen(false);
      },
      category: "actions",
      keywords: ["download", "excel", "csv", "exportar"],
      priority: 80,
    },
    {
      id: "action-filter",
      name: "Abrir Filtros",
      description: "Filtrar visualização",
      icon: <Filter className="h-4 w-4" />,
      shortcut: "⌘F",
      action: () => {
        setOpen(false);
      },
      category: "actions",
      keywords: ["filtrar", "buscar", "pesquisar"],
      priority: 75,
    },

    // ===== SETTINGS =====
    {
      id: "settings-theme",
      name: theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro",
      description: "Alternar tema do sistema",
      icon: theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-primary" />,
      shortcut: "⌘T",
      action: () => executeAction("settings-theme", () => {
        setTheme(theme === "dark" ? "light" : "dark");
        setOpen(false);
      }),
      category: "settings",
      keywords: ["tema", "dark", "light", "escuro", "claro"],
      priority: 60,
    },
    {
      id: "settings-shortcuts",
      name: "Ver Atalhos de Teclado",
      description: "Lista de atalhos",
      icon: <Keyboard className="h-4 w-4" />,
      shortcut: "⌘/",
      action: () => {
        setOpen(false);
      },
      category: "settings",
      keywords: ["keyboard", "atalhos", "teclas"],
      priority: 55,
    },
    {
      id: "settings-help",
      name: "Central de Ajuda",
      description: "Documentação e suporte",
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => navigateTo("/knowledge-base", "settings-help"),
      category: "settings",
      keywords: ["ajuda", "help", "suporte", "docs"],
      priority: 50,
    },
    {
      id: "settings-logout",
      name: "Sair do Sistema",
      description: "Encerrar sessão",
      icon: <LogOut className="h-4 w-4 text-destructive" />,
      action: () => executeAction("settings-logout", () => {
        signOut();
        setOpen(false);
      }),
      category: "settings",
      keywords: ["logout", "desconectar", "sair"],
      priority: 10,
    },
  ], [theme, navigate, signOut, setTheme]);

  // ============================================================================
  // CONTEXTUAL COMMANDS (based on current page)
  // ============================================================================

  const contextualCommands = React.useMemo((): CommandItemType[] => {
    const path = location.pathname;
    const commands: CommandItemType[] = [];

    if (path === "/" || path.includes("dashboard")) {
      commands.push({
        id: "ctx-customize-dashboard",
        name: "Personalizar Dashboard",
        description: "Reorganizar widgets",
        icon: <Layers className="h-4 w-4 text-accent-foreground" />,
        action: () => setOpen(false),
        category: "contextual",
        priority: 100,
      });
    }

    if (path.includes("kanban")) {
      commands.push(
        {
          id: "ctx-add-column",
          name: "Adicionar Coluna",
          description: "Nova coluna no Kanban",
          icon: <Plus className="h-4 w-4" />,
          action: () => setOpen(false),
          category: "contextual",
          priority: 100,
        },
        {
          id: "ctx-collapse-all",
          name: "Recolher Todas Colunas",
          icon: <Layers className="h-4 w-4" />,
          action: () => setOpen(false),
          category: "contextual",
          priority: 90,
        }
      );
    }

    if (path.includes("operators")) {
      commands.push({
        id: "ctx-add-operator",
        name: "Adicionar Operador",
        description: "Novo operador",
        icon: <Plus className="h-4 w-4" />,
        action: () => setOpen(false),
        category: "contextual",
        priority: 100,
      });
    }

    return commands;
  }, [location.pathname]);

  // ============================================================================
  // FILTERED COMMANDS
  // ============================================================================

  const filteredCommands = React.useMemo(() => {
    let commands = [...allCommands, ...contextualCommands];
    
    // Filter by mode
    if (mode === "actions") {
      commands = commands.filter(c => c.category === "actions" || c.category === "contextual");
    } else if (mode === "navigation") {
      commands = commands.filter(c => c.category === "navigation");
    }
    
    // Apply fuzzy search
    return searchCommands(commands, query);
  }, [allCommands, contextualCommands, query, mode]);

  // Group commands
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItemType[]> = {};
    
    // Recent commands first
    if (!query && recentCommands.length > 0) {
      const recent = recentCommands
        .map(id => allCommands.find(c => c.id === id))
        .filter(Boolean) as CommandItemType[];
      if (recent.length > 0) {
        groups["Recentes"] = recent.slice(0, 5);
      }
    }
    
    // Favorites
    if (!query && favorites.length > 0) {
      const favs = favorites
        .map(id => allCommands.find(c => c.id === id))
        .filter(Boolean) as CommandItemType[];
      if (favs.length > 0) {
        groups["Favoritos"] = favs;
      }
    }
    
    // Contextual
    const contextual = filteredCommands.filter(c => c.category === "contextual");
    if (contextual.length > 0) {
      groups["Ações Contextuais"] = contextual;
    }
    
    // Actions
    const actions = filteredCommands.filter(c => c.category === "actions");
    if (actions.length > 0) {
      groups["Ações Rápidas"] = actions;
    }
    
    // Navigation
    const navigation = filteredCommands.filter(c => c.category === "navigation");
    if (navigation.length > 0) {
      groups["Navegação"] = navigation;
    }
    
    // Settings
    const settings = filteredCommands.filter(c => c.category === "settings");
    if (settings.length > 0) {
      groups["Configurações"] = settings;
    }
    
    return groups;
  }, [filteredCommands, recentCommands, favorites, allCommands, query]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2 px-3 border-b">
        <Command className="h-4 w-4 text-muted-foreground" />
        <CommandInput 
          placeholder={
            mode === "actions" 
              ? "Digite uma ação..." 
              : mode === "navigation" 
              ? "Ir para..." 
              : "Buscar comandos, páginas, ações..."
          }
          value={query}
          onValueChange={setQuery}
          className="border-0 focus:ring-0"
        />
        {mode !== "default" && (
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer"
            onClick={() => setMode("default")}
          >
            {mode === "actions" ? "Ações" : "Navegação"} ×
          </Badge>
        )}
      </div>
      
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-3 py-8">
            <Search className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="text-muted-foreground font-medium">
                Nenhum resultado para "{query}"
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Tente palavras-chave diferentes
              </p>
            </div>
          </div>
        </CommandEmpty>

        {/* Mode Switcher */}
        {!query && mode === "default" && (
          <div className="flex gap-2 p-2 border-b">
            <button
              onClick={() => setMode("actions")}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              <Zap className="h-3 w-3" />
              Ações
              <Badge variant="outline" className="text-[10px] px-1">⌘⇧P</Badge>
            </button>
            <button
              onClick={() => setMode("navigation")}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowRight className="h-3 w-3" />
              Ir para
              <Badge variant="outline" className="text-[10px] px-1">⌘G</Badge>
            </button>
          </div>
        )}

        {Object.entries(groupedCommands).map(([heading, commands], groupIndex) => (
          <React.Fragment key={heading}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={heading}>
              {commands.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={cmd.action}
                  className="group flex items-center gap-3 py-2.5"
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    "bg-muted group-hover:bg-primary/10 transition-colors"
                  )}>
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        <HighlightMatch text={cmd.name} query={query} />
                      </span>
                      {cmd.badge && (
                        <Badge variant={cmd.badgeVariant || "secondary"} className="text-[10px]">
                          {cmd.badge}
                        </Badge>
                      )}
                    </div>
                    {cmd.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        <HighlightMatch text={cmd.description} query={query} />
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(cmd.id);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {favorites.includes(cmd.id) ? (
                        <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                      ) : (
                        <StarOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  {cmd.shortcut && (
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {cmd.shortcut}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 px-3 py-2 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
            selecionar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
            fechar
          </span>
        </div>
        <span>
          {filteredCommands.length} comandos
        </span>
      </div>
    </CommandDialog>
  );
}

// ============================================================================
// TRIGGER BUTTON
// ============================================================================

export function CommandPaletteTriggerAdvanced({ className }: { className?: string }) {
  return (
    <button
      onClick={() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm",
        "text-muted-foreground hover:text-foreground",
        "border rounded-lg hover:bg-accent transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Buscar...</span>
      <Badge variant="outline" className="hidden md:flex text-xs gap-1">
        <Command className="h-3 w-3" />
        K
      </Badge>
    </button>
  );
}
