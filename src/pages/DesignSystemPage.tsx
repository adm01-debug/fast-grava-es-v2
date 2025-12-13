import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { CodeBlock } from '@/components/ui/code-block';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Palette, 
  Zap, 
  Sparkles, 
  Trophy, 
  Flame, 
  Coins,
  Star,
  Award,
  Target,
  TrendingUp,
  Check,
  X,
  AlertTriangle,
  Info,
  Play,
  MousePointer2,
  Wand2,
  RefreshCw,
  Type,
  LayoutGrid,
  Ruler,
  Layers,
  Square,
  Circle,
  Home,
  Settings,
  User,
  Users,
  Bell,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  ExternalLink,
  Link,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Share2,
  Copy,
  Clipboard,
  FileText,
  File,
  Folder,
  FolderOpen,
  Image,
  Camera,
  Video,
  Music,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Thermometer,
  Droplet,
  Wind,
  Umbrella,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Move,
  Grip,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Table as TableIcon,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Gauge,
  Package,
  Box,
  Truck,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Percent,
  Tag,
  Gift,
  Bookmark,
  Flag,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlusCircle,
  Loader2,
  RefreshCcw,
  Power,
  Cpu,
  Database,
  Server,
  Terminal,
  Code,
  GitBranch,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Printer,
  QrCode,
  Scan,
  Fingerprint,
  Crosshair,
  Navigation,
  Compass,
  Map,
  Building,
  Factory,
  Warehouse,
  type LucideIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableFooter 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <MainLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold gradient-text">Design System</h1>
          <p className="text-muted-foreground">
            Biblioteca completa de componentes, variantes e animações do sistema.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto p-1">
            <TabsTrigger value="overview" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="buttons" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Botões
            </TabsTrigger>
            <TabsTrigger value="forms" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Forms
            </TabsTrigger>
            <TabsTrigger value="modals" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Modais
            </TabsTrigger>
            <TabsTrigger value="tooltips" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Tooltips
            </TabsTrigger>
            <TabsTrigger value="tables" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Tabelas
            </TabsTrigger>
            <TabsTrigger value="navigation" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Navegação
            </TabsTrigger>
            <TabsTrigger value="cards" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Cards
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Badges
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Progress
            </TabsTrigger>
            <TabsTrigger value="icons" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Ícones
            </TabsTrigger>
            <TabsTrigger value="typography" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Tipografia
            </TabsTrigger>
            <TabsTrigger value="spacing" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Spacing
            </TabsTrigger>
            <TabsTrigger value="shadows" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Sombras
            </TabsTrigger>
            <TabsTrigger value="animations" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Animações
            </TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Cores
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Feedback
            </TabsTrigger>
            <TabsTrigger value="loading" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Loading
            </TabsTrigger>
            <TabsTrigger value="empty" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Empty States
            </TabsTrigger>
            <TabsTrigger value="errors" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Error States
            </TabsTrigger>
            <TabsTrigger value="theme" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Theme Toggle
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection onNavigate={setActiveTab} />
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <Card className="card-interactive card-shine">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Variantes de Botões
                </CardTitle>
                <CardDescription>Todas as variantes disponíveis para o componente Button</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Variants */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Padrão</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="subtle">Subtle</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <CodeBlock code={'<Button variant="default">\n  Texto\n</Button>'} label="Default" />
                    <CodeBlock code={'<Button variant="secondary">\n  Texto\n</Button>'} label="Secondary" />
                    <CodeBlock code={'<Button variant="outline">\n  Texto\n</Button>'} label="Outline" />
                    <CodeBlock code={'<Button variant="destructive">\n  Texto\n</Button>'} label="Destructive" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock code={'<Button variant="ghost">\n  Texto\n</Button>'} label="Ghost" />
                    <CodeBlock code={'<Button variant="link">\n  Texto\n</Button>'} label="Link" />
                    <CodeBlock code={'<Button variant="success">\n  Texto\n</Button>'} label="Success" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CodeBlock code={'<Button variant="warning">\n  Texto\n</Button>'} label="Warning" />
                    <CodeBlock code={'<Button variant="subtle">\n  Texto\n</Button>'} label="Subtle" />
                  </div>
                </div>

                {/* Gaming/Gradient Variants */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Gaming/Gradiente</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="gradient">Gradient</Button>
                    <Button variant="gradient-secondary">Gradient Secondary</Button>
                    <Button variant="gradient-success">Gradient Success</Button>
                    <Button variant="glow">Glow</Button>
                    <Button variant="glass">Glass</Button>
                    <Button variant="premium">Premium</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock code={'<Button variant="gradient">\n  Texto\n</Button>'} label="Gradient" />
                    <CodeBlock code={'<Button variant="gradient-secondary">\n  Texto\n</Button>'} label="Gradient Secondary" />
                    <CodeBlock code={'<Button variant="gradient-success">\n  Texto\n</Button>'} label="Gradient Success" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock code={'<Button variant="glow">\n  Texto\n</Button>'} label="Glow" />
                    <CodeBlock code={'<Button variant="glass">\n  Texto\n</Button>'} label="Glass" />
                    <CodeBlock code={'<Button variant="premium">\n  Texto\n</Button>'} label="Premium" />
                  </div>
                </div>

                {/* With Shimmer */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Efeito Shimmer</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="gradient" shimmer>Gradient + Shimmer</Button>
                    <Button variant="default" shimmer>Default + Shimmer</Button>
                    <Button variant="gradient-success" shimmer>Success + Shimmer</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock code={'<Button variant="gradient" shimmer>\n  Texto\n</Button>'} label="Gradient + Shimmer" />
                    <CodeBlock code={'<Button variant="default" shimmer>\n  Texto\n</Button>'} label="Default + Shimmer" />
                    <CodeBlock code={'<Button variant="gradient-success" shimmer>\n  Texto\n</Button>'} label="Success + Shimmer" />
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tamanhos</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </div>

                {/* Icon Sizes */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tamanhos de Ícone</h4>
                  
                  {/* Visual Examples */}
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Button size="icon-xs" variant="outline"><Star className="h-3 w-3" /></Button>
                      <span className="text-xs text-muted-foreground">icon-xs</span>
                      <span className="text-[10px] text-muted-foreground/60">24×24px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button size="icon-sm" variant="outline"><Star /></Button>
                      <span className="text-xs text-muted-foreground">icon-sm</span>
                      <span className="text-[10px] text-muted-foreground/60">32×32px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button size="icon" variant="outline"><Star /></Button>
                      <span className="text-xs text-muted-foreground">icon</span>
                      <span className="text-[10px] text-muted-foreground/60">40×40px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button size="icon-lg" variant="outline"><Star /></Button>
                      <span className="text-xs text-muted-foreground">icon-lg</span>
                      <span className="text-[10px] text-muted-foreground/60">48×48px</span>
                    </div>
                  </div>

                  {/* Examples with variants */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="icon-sm" variant="gradient"><Plus /></Button>
                    <Button size="icon" variant="gradient"><Plus /></Button>
                    <Button size="icon-lg" variant="gradient"><Plus /></Button>
                    <Button size="icon-sm" variant="destructive"><Trash2 /></Button>
                    <Button size="icon" variant="destructive"><Trash2 /></Button>
                    <Button size="icon-lg" variant="destructive"><Trash2 /></Button>
                  </div>

                  {/* Code Examples */}
                  <div className="space-y-3 mt-4">
                    <h5 className="text-xs font-medium text-muted-foreground">Código de Uso</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <CodeBlock 
                        code={'<Button size="icon-xs">\n  <Star className="h-3 w-3" />\n</Button>'} 
                        label="Icon XS (24px)"
                      />
                      <CodeBlock 
                        code={'<Button size="icon-sm">\n  <Plus />\n</Button>'} 
                        label="Icon Small (32px)"
                      />
                      <CodeBlock 
                        code={'<Button size="icon">\n  <Plus />\n</Button>'} 
                        label="Icon Default (40px)"
                      />
                      <CodeBlock 
                        code={'<Button size="icon-lg">\n  <Plus />\n</Button>'} 
                        label="Icon Large (48px)"
                      />
                    </div>
                  </div>
                </div>

                {/* With Icons */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Ícones</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="gradient"><Trophy className="h-4 w-4" /> Conquista</Button>
                    <Button variant="gradient-success"><Check className="h-4 w-4" /> Confirmar</Button>
                    <Button variant="destructive"><X className="h-4 w-4" /> Cancelar</Button>
                    <Button variant="outline"><Target className="h-4 w-4" /> Meta</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Button variant="gradient">\n  <Trophy className="h-4 w-4" />\n  Conquista\n</Button>'} 
                      label="Ícone à esquerda"
                    />
                    <CodeBlock 
                      code={'<Button variant="gradient-success">\n  <Check className="h-4 w-4" />\n  Confirmar\n</Button>'} 
                      label="Success com ícone"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Button variant="destructive">\n  <X className="h-4 w-4" />\n  Cancelar\n</Button>'} 
                      label="Destructive com ícone"
                    />
                    <CodeBlock 
                      code={'<Button variant="outline">\n  <Target className="h-4 w-4" />\n  Meta\n</Button>'} 
                      label="Outline com ícone"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <FormsSection />
          </TabsContent>

          {/* Modals Tab */}
          <TabsContent value="modals" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <ModalsSection />
          </TabsContent>

          {/* Tooltips Tab */}
          <TabsContent value="tooltips" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <TooltipsSection />
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <TablesSection />
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <NavigationSection />
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            {/* Card Variants Section */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Variantes de Card
                </CardTitle>
                <CardDescription>
                  O componente Card agora suporta variantes via prop: <code className="text-primary">variant="..."</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Default */}
                  <Card variant="default">
                    <CardHeader>
                      <CardTitle className="text-lg">Default</CardTitle>
                      <CardDescription>Variante padrão com sombra sutil</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="default"</code>
                    </CardContent>
                  </Card>

                  {/* Elevated */}
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle className="text-lg">Elevated</CardTitle>
                      <CardDescription>Maior elevação e profundidade</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="elevated"</code>
                    </CardContent>
                  </Card>

                  {/* Interactive */}
                  <Card variant="interactive">
                    <CardHeader>
                      <CardTitle className="text-lg">Interactive</CardTitle>
                      <CardDescription>Hover com lift e glow (clicável)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="interactive"</code>
                    </CardContent>
                  </Card>

                  {/* Glass */}
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="text-lg">Glass</CardTitle>
                      <CardDescription>Glassmorphism com blur</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="glass"</code>
                    </CardContent>
                  </Card>

                  {/* Ghost */}
                  <Card variant="ghost">
                    <CardHeader>
                      <CardTitle className="text-lg">Ghost</CardTitle>
                      <CardDescription>Transparente, aparece no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="ghost"</code>
                    </CardContent>
                  </Card>

                  {/* Outline */}
                  <Card variant="outline">
                    <CardHeader>
                      <CardTitle className="text-lg">Outline</CardTitle>
                      <CardDescription>Apenas borda, sem preenchimento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="outline"</code>
                    </CardContent>
                  </Card>

                  {/* Stat */}
                  <Card variant="stat">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Stat
                      </CardTitle>
                      <CardDescription>Para dashboards e KPIs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">1,234</div>
                      <code className="text-xs text-primary mt-2 block">variant="stat"</code>
                    </CardContent>
                  </Card>

                  {/* Premium */}
                  <Card variant="premium">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Coins className="h-4 w-4 text-amber-500" />
                        Premium
                      </CardTitle>
                      <CardDescription>Destaque especial com acento dourado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="premium"</code>
                    </CardContent>
                  </Card>
                </div>

                {/* Code Examples for Card Variants */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock 
                      code={'<Card variant="default">\n  <CardHeader>\n    <CardTitle>Título</CardTitle>\n  </CardHeader>\n  <CardContent>\n    Conteúdo\n  </CardContent>\n</Card>'} 
                      label="Default"
                    />
                    <CodeBlock 
                      code={'<Card variant="elevated">\n  <CardHeader>\n    <CardTitle>Título</CardTitle>\n  </CardHeader>\n  <CardContent>\n    Conteúdo\n  </CardContent>\n</Card>'} 
                      label="Elevated"
                    />
                    <CodeBlock 
                      code={'<Card variant="interactive">\n  <CardHeader>\n    <CardTitle>Título</CardTitle>\n  </CardHeader>\n  <CardContent>\n    Conteúdo\n  </CardContent>\n</Card>'} 
                      label="Interactive"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <CodeBlock 
                      code={'<Card variant="glass">\n  ...\n</Card>'} 
                      label="Glass"
                    />
                    <CodeBlock 
                      code={'<Card variant="ghost">\n  ...\n</Card>'} 
                      label="Ghost"
                    />
                    <CodeBlock 
                      code={'<Card variant="outline">\n  ...\n</Card>'} 
                      label="Outline"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Card variant="stat">\n  <CardHeader>\n    <CardTitle>Vendas</CardTitle>\n  </CardHeader>\n  <CardContent>\n    <div className="text-2xl font-bold">1,234</div>\n  </CardContent>\n</Card>'} 
                      label="Stat (Dashboard)"
                    />
                    <CodeBlock 
                      code={'<Card variant="premium">\n  <CardHeader>\n    <CardTitle>Premium</CardTitle>\n  </CardHeader>\n  <CardContent>\n    Conteúdo especial\n  </CardContent>\n</Card>'} 
                      label="Premium (Destaque)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Example Section */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  Exemplo de Dashboard
                </CardTitle>
                <CardDescription>
                  Layout combinando Cards stat e premium para painéis de controle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card variant="stat" className="hover-lift-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Vendas</p>
                          <p className="text-2xl font-bold text-foreground mt-1">R$ 45.231</p>
                          <p className="text-xs text-success flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" /> +12.5%
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="stat" className="hover-lift-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pedidos</p>
                          <p className="text-2xl font-bold text-foreground mt-1">1,234</p>
                          <p className="text-xs text-success flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" /> +8.2%
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-success" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="stat" className="hover-lift-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Clientes</p>
                          <p className="text-2xl font-bold text-foreground mt-1">892</p>
                          <p className="text-xs text-warning flex items-center gap-1 mt-1">
                            <Activity className="h-3 w-3" /> +2.1%
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-info" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="stat" className="hover-lift-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Taxa Conversão</p>
                          <p className="text-2xl font-bold text-foreground mt-1">3.24%</p>
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 rotate-180" /> -0.8%
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                          <Target className="h-5 w-5 text-warning" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Premium Highlight + Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card variant="premium" className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-amber-500" />
                        Plano Premium Ativo
                      </CardTitle>
                      <CardDescription>Acesso completo a todas as funcionalidades</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-sm text-muted-foreground mb-2">Uso do plano este mês</p>
                          <Progress value={68} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">68% de 10.000 créditos</p>
                        </div>
                        <Button variant="gradient" shimmer size="sm">
                          <Sparkles className="h-4 w-4" />
                          Upgrade
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="stat">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Top Performer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-amber-500/50">
                          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">João Silva</p>
                          <p className="text-xs text-muted-foreground">156 vendas este mês</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Code Example */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estrutura do Layout</h5>
                  <CodeBlock 
                    code={`{/* Stats Row */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card variant="stat" className="hover-lift-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Label</p>
          <p className="text-2xl font-bold">Valor</p>
          <p className="text-xs text-success">
            <TrendingUp /> +12.5%
          </p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10">
          <Icon />
        </div>
      </div>
    </CardContent>
  </Card>
  {/* ... mais cards */}
</div>

{/* Premium + Side Card */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <Card variant="premium" className="lg:col-span-2">
    {/* Conteúdo premium */}
  </Card>
  <Card variant="stat">
    {/* Card auxiliar */}
  </Card>
</div>`}
                    label="Layout Dashboard"
                    showLineNumbers
                  />
                </div>
              </CardContent>
            </Card>

            {/* CSS Class Cards Section */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Classes CSS Utilitárias
                </CardTitle>
                <CardDescription>
                  Classes adicionais para efeitos especiais via className
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Interactive + Shine */}
                  <Card className="card-interactive card-shine">
                    <CardHeader>
                      <CardTitle className="text-lg">Card Shine</CardTitle>
                      <CardDescription>Efeito de brilho passando</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-interactive card-shine</code>
                    </CardContent>
                  </Card>

                  {/* Float Card */}
                  <Card className="card-float">
                    <CardHeader>
                      <CardTitle className="text-lg">Card Float</CardTitle>
                      <CardDescription>Elevação suave no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-float</code>
                    </CardContent>
                  </Card>

                  {/* Pulse Border */}
                  <Card className="card-pulse-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Pulse Border</CardTitle>
                      <CardDescription>Borda pulsante animada</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-pulse-border</code>
                    </CardContent>
                  </Card>

                  {/* Glow Blue */}
                  <Card className="card-glow-blue">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(210,100%,55%)]" />
                        Glow Blue
                      </CardTitle>
                      <CardDescription>Glow azul no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-glow-blue</code>
                    </CardContent>
                  </Card>

                  {/* Glow Green */}
                  <Card className="card-glow-green">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(142,70%,45%)]" />
                        Glow Green
                      </CardTitle>
                      <CardDescription>Glow verde no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-glow-green</code>
                    </CardContent>
                  </Card>

                  {/* Glow Purple */}
                  <Card className="card-glow-purple">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(280,80%,55%)]" />
                        Glow Purple
                      </CardTitle>
                      <CardDescription>Glow roxo no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-glow-purple</code>
                    </CardContent>
                  </Card>

                  {/* Glow Orange */}
                  <Card className="card-glow-orange">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(24,95%,50%)]" />
                        Glow Orange
                      </CardTitle>
                      <CardDescription>Glow laranja no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-glow-orange</code>
                    </CardContent>
                  </Card>

                  {/* Glass Card */}
                  <Card className="glass-card hover-lift">
                    <CardHeader>
                      <CardTitle className="text-lg">Glass Card</CardTitle>
                      <CardDescription>Glassmorphism clássico</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">glass-card hover-lift</code>
                    </CardContent>
                  </Card>

                  {/* Hover Lift */}
                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle className="text-lg">Hover Lift</CardTitle>
                      <CardDescription>Eleva no hover com sombra</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">hover-lift</code>
                    </CardContent>
                  </Card>
                </div>

                {/* Code Examples for CSS Classes */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock 
                      code={'<Card className="card-interactive card-shine">\n  ...\n</Card>'} 
                      label="Interactive + Shine"
                    />
                    <CodeBlock 
                      code={'<Card className="card-float">\n  ...\n</Card>'} 
                      label="Float"
                    />
                    <CodeBlock 
                      code={'<Card className="card-pulse-border">\n  ...\n</Card>'} 
                      label="Pulse Border"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <CodeBlock 
                      code={'<Card className="card-glow-blue">\n  ...\n</Card>'} 
                      label="Glow Blue"
                    />
                    <CodeBlock 
                      code={'<Card className="card-glow-green">\n  ...\n</Card>'} 
                      label="Glow Green"
                    />
                    <CodeBlock 
                      code={'<Card className="card-glow-purple">\n  ...\n</Card>'} 
                      label="Glow Purple"
                    />
                    <CodeBlock 
                      code={'<Card className="card-glow-orange">\n  ...\n</Card>'} 
                      label="Glow Orange"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Card className="glass-card hover-lift">\n  ...\n</Card>'} 
                      label="Glass + Hover Lift"
                    />
                    <CodeBlock 
                      code={'<Card className="hover-lift">\n  ...\n</Card>'} 
                      label="Hover Lift"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Variantes de Badges
                </CardTitle>
                <CardDescription>Todas as variantes incluindo gamificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Padrão</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                  </div>
                </div>

                {/* Gamification Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Gamificação</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="xp" animated><Sparkles className="h-3 w-3" /> +150 XP</Badge>
                    <Badge variant="coins" animated><Coins className="h-3 w-3" /> 500 Coins</Badge>
                    <Badge variant="streak" animated><Flame className="h-3 w-3" /> 7 Dias</Badge>
                    <Badge variant="gold" animated><Trophy className="h-3 w-3" /> Ouro</Badge>
                    <Badge variant="silver" animated><Award className="h-3 w-3" /> Prata</Badge>
                    <Badge variant="bronze" animated><Star className="h-3 w-3" /> Bronze</Badge>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status Badges</h4>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="queue" />
                    <StatusBadge status="ready" />
                    <StatusBadge status="scheduled" />
                    <StatusBadge status="production" />
                    <StatusBadge status="finished" />
                    <StatusBadge status="paused" />
                    <StatusBadge status="cancelled" />
                    <StatusBadge status="delayed" />
                    <StatusBadge status="rework" />
                  </div>
                </div>

                {/* Code Examples */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                  
                  {/* Standard Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock 
                      code={'<Badge variant="default">Label</Badge>'} 
                      label="Default"
                    />
                    <CodeBlock 
                      code={'<Badge variant="success">Sucesso</Badge>'} 
                      label="Success"
                    />
                    <CodeBlock 
                      code={'<Badge variant="destructive">Erro</Badge>'} 
                      label="Destructive"
                    />
                  </div>
                  
                  {/* Gamification Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Badge variant="xp" animated>\n  <Sparkles className="h-3 w-3" />\n  +150 XP\n</Badge>'} 
                      label="XP Badge"
                    />
                    <CodeBlock 
                      code={'<Badge variant="gold" animated>\n  <Trophy className="h-3 w-3" />\n  Ouro\n</Badge>'} 
                      label="Gold Badge"
                    />
                  </div>
                  
                  {/* Status Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<StatusBadge status="production" />'} 
                      label="Status Badge"
                    />
                    <CodeBlock 
                      code={'<StatusBadge status="finished" />'} 
                      label="Status Finished"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Barras de Progresso
                </CardTitle>
                <CardDescription>Variantes com animações de gamificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Standard Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Padrão</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Default</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} />
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">XP (Experiência)</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[hsl(var(--xp))]" />
                          Nível 12
                        </span>
                        <span>2,450 / 3,000 XP</span>
                      </div>
                      <Progress value={82} variant="xp" animated showGlow />
                    </div>
                  </div>
                </div>

                {/* Success Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sucesso</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                          Concluído
                        </span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} variant="success" animated showGlow />
                    </div>
                  </div>
                </div>

                {/* Warning Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Atenção</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                          Prazo próximo
                        </span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} variant="warning" animated />
                    </div>
                  </div>
                </div>

                {/* Destructive Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Crítico</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <X className="h-4 w-4 text-destructive" />
                          Capacidade excedida
                        </span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} variant="destructive" animated showGlow />
                    </div>
                  </div>
                </div>

                {/* Code Examples */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Progress value={65} />'} 
                      label="Default"
                    />
                    <CodeBlock 
                      code={'<Progress \n  value={82} \n  variant="xp" \n  animated \n  showGlow \n/>'} 
                      label="XP com Animação e Glow"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Progress \n  value={100} \n  variant="success" \n  animated \n  showGlow \n/>'} 
                      label="Success"
                    />
                    <CodeBlock 
                      code={'<Progress \n  value={75} \n  variant="warning" \n  animated \n/>'} 
                      label="Warning"
                    />
                  </div>
                  <CodeBlock 
                    code={'<Progress \n  value={95} \n  variant="destructive" \n  animated \n  showGlow \n/>'} 
                    label="Destructive (Crítico)"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Icons Tab */}
          <TabsContent value="icons" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <IconsSection />
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Paleta de Cores
                </CardTitle>
                <CardDescription>Tokens de cores do design system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Primary Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores Principais</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-primary glow-primary" />
                      <p className="text-sm font-medium">Primary</p>
                      <p className="text-xs text-muted-foreground">--primary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-secondary glow-secondary" />
                      <p className="text-sm font-medium">Secondary</p>
                      <p className="text-xs text-muted-foreground">--secondary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-accent glow-accent" />
                      <p className="text-sm font-medium">Accent</p>
                      <p className="text-xs text-muted-foreground">--accent</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-muted border" />
                      <p className="text-sm font-medium">Muted</p>
                      <p className="text-xs text-muted-foreground">--muted</p>
                    </div>
                  </div>
                </div>

                {/* Semantic Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores Semânticas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-[hsl(var(--success))] glow-success" />
                      <p className="text-sm font-medium">Success</p>
                      <p className="text-xs text-muted-foreground">--success</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-[hsl(var(--warning))] glow-warning" />
                      <p className="text-sm font-medium">Warning</p>
                      <p className="text-xs text-muted-foreground">--warning</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-destructive" />
                      <p className="text-sm font-medium">Destructive</p>
                      <p className="text-xs text-muted-foreground">--destructive</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg gradient-primary" />
                      <p className="text-sm font-medium">Gradient Primary</p>
                      <p className="text-xs text-muted-foreground">.gradient-primary</p>
                    </div>
                  </div>
                </div>

                {/* Gamification Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores Gamificação</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--xp))]" />
                      <p className="text-sm font-medium">XP</p>
                      <p className="text-xs text-muted-foreground">--xp</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--coins))]" />
                      <p className="text-sm font-medium">Coins</p>
                      <p className="text-xs text-muted-foreground">--coins</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--streak))]" />
                      <p className="text-sm font-medium">Streak</p>
                      <p className="text-xs text-muted-foreground">--streak</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--gold))]" />
                      <p className="text-sm font-medium">Gold</p>
                      <p className="text-xs text-muted-foreground">--gold</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--silver))]" />
                      <p className="text-sm font-medium">Silver</p>
                      <p className="text-xs text-muted-foreground">--silver</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--bronze))]" />
                      <p className="text-sm font-medium">Bronze</p>
                      <p className="text-xs text-muted-foreground">--bronze</p>
                    </div>
                  </div>
                </div>

                {/* Gradients */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gradientes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg gradient-primary" />
                      <p className="text-sm font-medium">Gradient Primary</p>
                      <p className="text-xs text-muted-foreground">.gradient-primary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg gradient-secondary" />
                      <p className="text-sm font-medium">Gradient Secondary</p>
                      <p className="text-xs text-muted-foreground">.gradient-secondary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg gradient-success" />
                      <p className="text-sm font-medium">Gradient Success</p>
                      <p className="text-xs text-muted-foreground">.gradient-success</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Família de Fontes
                </CardTitle>
                <CardDescription>Plus Jakarta Sans - fonte principal do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Display / Títulos</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-display text-2xl font-bold">Plus Jakarta Sans</p>
                      <p className="text-sm text-muted-foreground">font-family: Plus Jakarta Sans, system-ui, sans-serif</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-display</code></p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Body / Texto</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-sans text-2xl">Plus Jakarta Sans</p>
                      <p className="text-sm text-muted-foreground">font-family: Plus Jakarta Sans, system-ui, sans-serif</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-sans</code></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Weights */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Pesos de Fonte</CardTitle>
                <CardDescription>Variações de peso disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-normal">Regular</p>
                      <p className="text-xs text-muted-foreground">font-weight: 400</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-normal</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-medium">Medium</p>
                      <p className="text-xs text-muted-foreground">font-weight: 500</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-medium</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-semibold">Semibold</p>
                      <p className="text-xs text-muted-foreground">font-weight: 600</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-semibold</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-bold">Bold</p>
                      <p className="text-xs text-muted-foreground">font-weight: 700</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-bold</code></p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-2xl font-extrabold">Extra Bold</p>
                    <p className="text-xs text-muted-foreground">font-weight: 800</p>
                    <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-extrabold</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Sizes */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Tamanhos de Fonte</CardTitle>
                <CardDescription>Escala tipográfica do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Classe</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tamanho</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Exemplo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-xs</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">12px / 0.75rem</td>
                          <td className="py-3 px-4 text-xs">Texto extra pequeno</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-sm</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">14px / 0.875rem</td>
                          <td className="py-3 px-4 text-sm">Texto pequeno</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-base</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">16px / 1rem</td>
                          <td className="py-3 px-4 text-base">Texto base (padrão)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-lg</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">18px / 1.125rem</td>
                          <td className="py-3 px-4 text-lg">Texto grande</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">20px / 1.25rem</td>
                          <td className="py-3 px-4 text-xl">Texto XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-2xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">24px / 1.5rem</td>
                          <td className="py-3 px-4 text-2xl">Título 2XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-3xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">30px / 1.875rem</td>
                          <td className="py-3 px-4 text-3xl">Título 3XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-4xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">36px / 2.25rem</td>
                          <td className="py-3 px-4 text-4xl">Título 4XL</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-5xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">48px / 3rem</td>
                          <td className="py-3 px-4 text-5xl">Título 5XL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Headings */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Hierarquia de Títulos</CardTitle>
                <CardDescription>Estrutura semântica de headings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight">Heading 1 - Principal</h1>
                    <p className="text-xs text-muted-foreground">text-4xl font-bold tracking-tight</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h2 className="text-3xl font-semibold tracking-tight">Heading 2 - Seção</h2>
                    <p className="text-xs text-muted-foreground">text-3xl font-semibold tracking-tight</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h3 className="text-2xl font-semibold">Heading 3 - Subseção</h3>
                    <p className="text-xs text-muted-foreground">text-2xl font-semibold</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h4 className="text-xl font-medium">Heading 4 - Card Title</h4>
                    <p className="text-xs text-muted-foreground">text-xl font-medium</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h5 className="text-lg font-medium">Heading 5 - Item Title</h5>
                    <p className="text-xs text-muted-foreground">text-lg font-medium</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h6 className="text-base font-medium">Heading 6 - Label</h6>
                    <p className="text-xs text-muted-foreground">text-base font-medium</p>
                  </div>
                  
                  {/* Code Examples for Headings */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CodeBlock 
                        code={'<h1 className="text-4xl font-bold tracking-tight">\n  Título Principal\n</h1>'} 
                        label="Heading 1"
                      />
                      <CodeBlock 
                        code={'<h2 className="text-3xl font-semibold tracking-tight">\n  Título de Seção\n</h2>'} 
                        label="Heading 2"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CodeBlock 
                        code={'<h3 className="text-2xl font-semibold">\n  Subseção\n</h3>'} 
                        label="Heading 3"
                      />
                      <CodeBlock 
                        code={'<h4 className="text-xl font-medium">\n  Card Title\n</h4>'} 
                        label="Heading 4"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Styles */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Estilos de Texto</CardTitle>
                <CardDescription>Variações e efeitos especiais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estilos Básicos</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-foreground">Texto padrão (foreground)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-foreground</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">Texto secundário (muted)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-muted-foreground</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-primary font-medium">Texto primário (destaque)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-primary</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="italic">Texto em itálico</p>
                        <p className="text-xs text-muted-foreground mt-1">italic</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="underline underline-offset-4">Texto sublinhado</p>
                        <p className="text-xs text-muted-foreground mt-1">underline underline-offset-4</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="line-through text-muted-foreground">Texto riscado</p>
                        <p className="text-xs text-muted-foreground mt-1">line-through</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Efeitos Especiais</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold gradient-text">Texto com Gradiente</p>
                        <p className="text-xs text-muted-foreground mt-1">gradient-text</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="uppercase tracking-widest text-sm font-semibold">Texto Uppercase</p>
                        <p className="text-xs text-muted-foreground mt-1">uppercase tracking-widest</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="tracking-tight text-xl font-bold">Tracking Tight</p>
                        <p className="text-xs text-muted-foreground mt-1">tracking-tight</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="tracking-wide">Tracking Wide</p>
                        <p className="text-xs text-muted-foreground mt-1">tracking-wide</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="leading-relaxed">Texto com line-height relaxado para melhor legibilidade em parágrafos longos.</p>
                        <p className="text-xs text-muted-foreground mt-1">leading-relaxed</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="truncate w-48">Texto muito longo que será truncado com ellipsis no final</p>
                        <p className="text-xs text-muted-foreground mt-1">truncate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code & Mono */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Código e Monospace</CardTitle>
                <CardDescription>Estilos para código e dados técnicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Inline code:</p>
                      <p>Use a classe <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-sm font-mono">.gradient-primary</code> para gradientes.</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Code block:</p>
                      <pre className="p-4 rounded-lg bg-card border text-sm font-mono overflow-x-auto">
{`const theme = {
  primary: "hsl(24, 95%, 48%)",
  secondary: "hsl(210, 100%, 50%)",
  accent: "hsl(280, 80%, 50%)"
};`}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Code Examples */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CodeBlock 
                        code={'<code className="px-1.5 py-0.5 rounded bg-muted text-primary text-sm font-mono">\n  .classe-exemplo\n</code>'} 
                        label="Inline Code"
                      />
                      <CodeBlock 
                        code={'<pre className="p-4 rounded-lg bg-card border text-sm font-mono overflow-x-auto">\n  {codeString}\n</pre>'} 
                        label="Code Block"
                      />
                    </div>
                    <CodeBlock 
                      code={'<p className="text-2xl font-bold gradient-text">\n  Texto com Gradiente\n</p>'} 
                      label="Gradient Text"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            {/* Spacing Scale */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  Escala de Espaçamento
                </CardTitle>
                <CardDescription>Sistema de spacing baseado em múltiplos de 4px</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <div className="space-y-2 min-w-[500px]">
                      {[
                        { name: '0', value: '0px', class: 'p-0' },
                        { name: '0.5', value: '2px', class: 'p-0.5' },
                        { name: '1', value: '4px', class: 'p-1' },
                        { name: '1.5', value: '6px', class: 'p-1.5' },
                        { name: '2', value: '8px', class: 'p-2' },
                        { name: '3', value: '12px', class: 'p-3' },
                        { name: '4', value: '16px', class: 'p-4' },
                        { name: '5', value: '20px', class: 'p-5' },
                        { name: '6', value: '24px', class: 'p-6' },
                        { name: '8', value: '32px', class: 'p-8' },
                        { name: '10', value: '40px', class: 'p-10' },
                        { name: '12', value: '48px', class: 'p-12' },
                        { name: '16', value: '64px', class: 'p-16' },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-4">
                          <div className="w-16 text-sm font-mono text-muted-foreground">{item.class}</div>
                          <div className="w-16 text-sm text-muted-foreground">{item.value}</div>
                          <div className="flex-1">
                            <div 
                              className="bg-primary/20 border border-primary/30 rounded"
                              style={{ width: item.value === '0px' ? '4px' : item.value, height: '24px' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gap Examples */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Gap (Espaçamento entre elementos)</CardTitle>
                <CardDescription>Classes gap-* para flex e grid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { name: 'gap-1', value: '4px' },
                    { name: 'gap-2', value: '8px' },
                    { name: 'gap-3', value: '12px' },
                    { name: 'gap-4', value: '16px' },
                    { name: 'gap-6', value: '24px' },
                  ].map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-primary text-sm">{item.name}</code>
                        <span className="text-xs text-muted-foreground">({item.value})</span>
                      </div>
                      <div className={`flex ${item.name}`}>
                        {[1, 2, 3, 4].map((n) => (
                          <div key={n} className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-medium">
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grid System */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  Sistema de Grid
                </CardTitle>
                <CardDescription>Layouts responsivos com CSS Grid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 12 Column Grid */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Grid 12 Colunas</h4>
                  <div className="grid grid-cols-12 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-10 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">grid grid-cols-12 gap-2</code></p>
                </div>

                {/* Responsive Grid */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Grid Responsivo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-20 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center font-medium">
                        Item {n}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4</code></p>
                </div>

                {/* Column Span */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Column Span</h4>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-6 h-12 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-sm">
                      col-span-6 (100%)
                    </div>
                    <div className="col-span-4 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-sm">
                      col-span-4
                    </div>
                    <div className="col-span-2 h-12 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center text-sm">
                      col-span-2
                    </div>
                    <div className="col-span-3 h-12 rounded-lg bg-[hsl(var(--success))]/20 border border-[hsl(var(--success))]/30 flex items-center justify-center text-sm">
                      col-span-3
                    </div>
                    <div className="col-span-3 h-12 rounded-lg bg-[hsl(var(--warning))]/20 border border-[hsl(var(--warning))]/30 flex items-center justify-center text-sm">
                      col-span-3
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flexbox */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Flexbox Utilities</CardTitle>
                <CardDescription>Classes para alinhamento e distribuição</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Justify Content */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Justify Content</h4>
                  {[
                    { name: 'justify-start', label: 'Start' },
                    { name: 'justify-center', label: 'Center' },
                    { name: 'justify-end', label: 'End' },
                    { name: 'justify-between', label: 'Between' },
                    { name: 'justify-around', label: 'Around' },
                    { name: 'justify-evenly', label: 'Evenly' },
                  ].map((item) => (
                    <div key={item.name} className="space-y-1">
                      <code className="text-primary text-xs">{item.name}</code>
                      <div className={`flex ${item.name} p-3 rounded-lg bg-muted/50 border`}>
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="w-10 h-10 rounded bg-primary/30 border border-primary/50 flex items-center justify-center text-sm font-medium">
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Align Items */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Align Items</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'items-start', label: 'Start' },
                      { name: 'items-center', label: 'Center' },
                      { name: 'items-end', label: 'End' },
                    ].map((item) => (
                      <div key={item.name} className="space-y-1">
                        <code className="text-primary text-xs">{item.name}</code>
                        <div className={`flex ${item.name} gap-2 p-3 rounded-lg bg-muted/50 border h-24`}>
                          <div className="w-10 h-6 rounded bg-primary/30 border border-primary/50" />
                          <div className="w-10 h-10 rounded bg-primary/30 border border-primary/50" />
                          <div className="w-10 h-8 rounded bg-primary/30 border border-primary/50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flex Direction */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Flex Direction</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <code className="text-primary text-xs">flex-row (padrão)</code>
                      <div className="flex flex-row gap-2 p-3 rounded-lg bg-muted/50 border">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="w-10 h-10 rounded bg-primary/30 border border-primary/50 flex items-center justify-center text-sm">{n}</div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <code className="text-primary text-xs">flex-col</code>
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 border">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="w-full h-8 rounded bg-primary/30 border border-primary/50 flex items-center justify-center text-sm">{n}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Container & Breakpoints */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Breakpoints Responsivos</CardTitle>
                <CardDescription>Pontos de quebra para layouts responsivos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Prefixo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Min-width</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Exemplo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4"><code className="text-primary text-sm">sm:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">640px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">sm:grid-cols-2</code></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><code className="text-primary text-sm">md:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">768px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">md:grid-cols-3</code></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><code className="text-primary text-sm">lg:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">1024px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">lg:grid-cols-4</code></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><code className="text-primary text-sm">xl:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">1280px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">xl:grid-cols-5</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4"><code className="text-primary text-sm">2xl:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">1536px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">2xl:grid-cols-6</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Border Radius */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
                <CardDescription>Escalas de arredondamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {[
                    { name: 'rounded-none', value: '0' },
                    { name: 'rounded-sm', value: '2px' },
                    { name: 'rounded', value: '4px' },
                    { name: 'rounded-md', value: '6px' },
                    { name: 'rounded-lg', value: '8px' },
                    { name: 'rounded-xl', value: '12px' },
                    { name: 'rounded-2xl', value: '16px' },
                    { name: 'rounded-3xl', value: '24px' },
                    { name: 'rounded-full', value: '9999px' },
                  ].map((item) => (
                    <div key={item.name} className="text-center space-y-2">
                      <div className={`w-16 h-16 bg-primary/30 border-2 border-primary ${item.name}`} />
                      <p className="text-xs font-mono text-muted-foreground">{item.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shadows Tab */}
          <TabsContent value="shadows" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <ShadowsSection />
          </TabsContent>

          {/* Animations Tab */}
          <TabsContent value="animations" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <AnimationsSection />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <FeedbackSection />
          </TabsContent>

          {/* Loading Tab */}
          <TabsContent value="loading" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <LoadingSection />
          </TabsContent>

          {/* Empty States Tab */}
          <TabsContent value="empty" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <EmptyStatesSection />
          </TabsContent>

          {/* Error States Tab */}
          <TabsContent value="errors" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <ErrorStatesSection />
          </TabsContent>

          {/* Theme Toggle Tab */}
          <TabsContent value="theme" className="space-y-6">
            <BackToOverviewButton onNavigate={setActiveTab} />
            <ThemeToggleSection />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function ShadowsSection() {
  const boxShadows = [
    { name: 'shadow-sm', class: 'shadow-sm', desc: 'Sombra pequena' },
    { name: 'shadow', class: 'shadow', desc: 'Sombra padrão' },
    { name: 'shadow-md', class: 'shadow-md', desc: 'Sombra média' },
    { name: 'shadow-lg', class: 'shadow-lg', desc: 'Sombra grande' },
    { name: 'shadow-xl', class: 'shadow-xl', desc: 'Sombra extra grande' },
    { name: 'shadow-2xl', class: 'shadow-2xl', desc: 'Sombra 2XL' },
  ];

  const customShadows = [
    { name: 'card-shadow', class: 'card-shadow', desc: 'Sombra para cards' },
    { name: 'glow-primary', class: 'glow-primary', desc: 'Glow primário' },
    { name: 'glow-secondary', class: 'glow-secondary', desc: 'Glow secundário' },
    { name: 'glow-success', class: 'glow-success', desc: 'Glow sucesso' },
    { name: 'glow-accent', class: 'glow-accent', desc: 'Glow accent' },
    { name: 'glow-warning', class: 'glow-warning', desc: 'Glow warning' },
  ];

  const borderWidths = [
    { name: 'border-0', width: '0px' },
    { name: 'border', width: '1px' },
    { name: 'border-2', width: '2px' },
    { name: 'border-4', width: '4px' },
    { name: 'border-8', width: '8px' },
  ];

  const borderStyles = [
    { name: 'border-solid', style: 'solid' },
    { name: 'border-dashed', style: 'dashed' },
    { name: 'border-dotted', style: 'dotted' },
    { name: 'border-double', style: 'double' },
  ];

  const borderRadius = [
    { name: 'rounded-none', radius: '0px' },
    { name: 'rounded-sm', radius: '0.125rem' },
    { name: 'rounded', radius: '0.25rem' },
    { name: 'rounded-md', radius: '0.375rem' },
    { name: 'rounded-lg', radius: '0.5rem' },
    { name: 'rounded-xl', radius: '0.75rem' },
    { name: 'rounded-2xl', radius: '1rem' },
    { name: 'rounded-3xl', radius: '1.5rem' },
    { name: 'rounded-full', radius: '9999px' },
  ];

  const borderColors = [
    { name: 'border-border', colorClass: 'border-border', desc: 'Padrão' },
    { name: 'border-primary', colorClass: 'border-primary', desc: 'Primário' },
    { name: 'border-secondary', colorClass: 'border-secondary', desc: 'Secundário' },
    { name: 'border-accent', colorClass: 'border-accent', desc: 'Accent' },
    { name: 'border-destructive', colorClass: 'border-destructive', desc: 'Destructive' },
    { name: 'border-success', colorClass: 'border-[hsl(var(--success))]', desc: 'Success' },
    { name: 'border-warning', colorClass: 'border-[hsl(var(--warning))]', desc: 'Warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Box Shadows - Tailwind */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Box Shadows (Tailwind)
          </CardTitle>
          <CardDescription>Sombras padrão do Tailwind CSS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {boxShadows.map((shadow) => (
              <div key={shadow.name} className="space-y-2 text-center">
                <div className={`h-20 rounded-lg bg-card border border-border ${shadow.class} flex items-center justify-center`}>
                  <Square className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs font-mono text-primary">.{shadow.name}</p>
                <p className="text-xs text-muted-foreground">{shadow.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Shadows & Glows */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sombras Customizadas & Glows
          </CardTitle>
          <CardDescription>Efeitos de glow e sombras especiais do design system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {customShadows.map((shadow) => (
              <div key={shadow.name} className="space-y-2 text-center">
                <div className={`h-20 rounded-lg bg-card border border-border ${shadow.class} flex items-center justify-center`}>
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs font-mono text-primary">.{shadow.name}</p>
                <p className="text-xs text-muted-foreground">{shadow.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Shadow Examples */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Sombras Interativas (Hover)
          </CardTitle>
          <CardDescription>Efeitos de sombra ativados no hover</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card border border-border hover-lift cursor-pointer flex items-center justify-center">
                <span className="text-sm font-medium">Hover Lift</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.hover-lift</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card border border-border hover-glow cursor-pointer flex items-center justify-center">
                <span className="text-sm font-medium">Hover Glow</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.hover-glow</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card border border-border card-interactive cursor-pointer flex items-center justify-center">
                <span className="text-sm font-medium">Card Interactive</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.card-interactive</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card border border-border card-float cursor-pointer flex items-center justify-center">
                <span className="text-sm font-medium">Card Float</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.card-float</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Border Widths */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5 text-primary" />
            Espessura de Bordas
          </CardTitle>
          <CardDescription>Diferentes espessuras de borda disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 items-end">
            {borderWidths.map((border) => (
              <div key={border.name} className="space-y-2 text-center">
                <div className={`w-16 h-16 rounded-lg bg-muted ${border.name} border-primary flex items-center justify-center`}>
                  <span className="text-xs font-medium">{border.width}</span>
                </div>
                <p className="text-xs font-mono text-primary">.{border.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Styles */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Estilos de Borda
          </CardTitle>
          <CardDescription>Diferentes estilos de linha para bordas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {borderStyles.map((style) => (
              <div key={style.name} className="space-y-2 text-center">
                <div className={`h-16 rounded-lg bg-muted border-2 border-primary ${style.name} flex items-center justify-center`}>
                  <span className="text-sm font-medium capitalize">{style.style}</span>
                </div>
                <p className="text-xs font-mono text-primary">.{style.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-primary" />
            Border Radius
          </CardTitle>
          <CardDescription>Diferentes raios de borda para arredondamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {borderRadius.map((radius) => (
              <div key={radius.name} className="space-y-2 text-center">
                <div className={`w-14 h-14 bg-primary ${radius.name} mx-auto`} />
                <p className="text-xs font-mono text-primary">.{radius.name}</p>
                <p className="text-xs text-muted-foreground">{radius.radius}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Colors */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Cores de Borda
          </CardTitle>
          <CardDescription>Cores semânticas para bordas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {borderColors.map((color) => (
              <div key={color.name} className="space-y-2 text-center">
                <div className={`h-16 rounded-lg bg-muted border-2 ${color.colorClass} flex items-center justify-center`}>
                  <span className="text-xs font-medium">{color.desc}</span>
                </div>
                <p className="text-xs font-mono text-primary">.{color.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Border Effects */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Efeitos Especiais de Borda
          </CardTitle>
          <CardDescription>Bordas animadas e efeitos especiais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card card-pulse-border flex items-center justify-center">
                <span className="text-sm font-medium">Pulse Border</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.card-pulse-border</p>
              <p className="text-xs text-muted-foreground text-center">Borda com animação pulsante</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card neon-border border border-border flex items-center justify-center">
                <span className="text-sm font-medium">Neon Border</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.neon-border</p>
              <p className="text-xs text-muted-foreground text-center">Efeito neon no hover (dark mode)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-xl bg-card card-shine border border-border/50 flex items-center justify-center">
                <span className="text-sm font-medium">Card Shine</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.card-shine</p>
              <p className="text-xs text-muted-foreground text-center">Efeito de brilho passando</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dividers */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Divisores
          </CardTitle>
          <CardDescription>Linhas divisórias e separadores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Horizontal (border-t)</p>
            <div className="border-t border-border" />
            <p className="text-xs font-mono text-muted-foreground">.border-t .border-border</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Com margem (divide-y)</p>
            <div className="divide-y divide-border">
              <div className="py-3">Item 1</div>
              <div className="py-3">Item 2</div>
              <div className="py-3">Item 3</div>
            </div>
            <p className="text-xs font-mono text-muted-foreground">.divide-y .divide-border</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Vertical (divide-x)</p>
            <div className="flex divide-x divide-border">
              <div className="px-4">Col 1</div>
              <div className="px-4">Col 2</div>
              <div className="px-4">Col 3</div>
            </div>
            <p className="text-xs font-mono text-muted-foreground">.divide-x .divide-border</p>
          </div>
        </CardContent>
      </Card>

      {/* Ring (Focus) */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Ring (Focus States)
          </CardTitle>
          <CardDescription>Anéis de foco para estados de interação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 text-center">
              <div className="h-16 rounded-lg bg-muted ring-1 ring-ring flex items-center justify-center">
                <span className="text-xs">ring-1</span>
              </div>
              <p className="text-xs font-mono text-primary">.ring-1 .ring-ring</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="h-16 rounded-lg bg-muted ring-2 ring-ring flex items-center justify-center">
                <span className="text-xs">ring-2</span>
              </div>
              <p className="text-xs font-mono text-primary">.ring-2 .ring-ring</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="h-16 rounded-lg bg-muted ring-2 ring-primary flex items-center justify-center">
                <span className="text-xs">ring-primary</span>
              </div>
              <p className="text-xs font-mono text-primary">.ring-2 .ring-primary</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="h-16 rounded-lg bg-muted ring-2 ring-offset-2 ring-offset-background ring-primary flex items-center justify-center">
                <span className="text-xs">ring-offset</span>
              </div>
              <p className="text-xs font-mono text-primary">.ring-offset-2</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IconsSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const iconCategories: { category: string; icons: { name: string; Icon: LucideIcon }[] }[] = [
    {
      category: 'Navegação',
      icons: [
        { name: 'Home', Icon: Home },
        { name: 'Menu', Icon: Menu },
        { name: 'ChevronUp', Icon: ChevronUp },
        { name: 'ChevronDown', Icon: ChevronDown },
        { name: 'ChevronLeft', Icon: ChevronLeft },
        { name: 'ChevronRight', Icon: ChevronRight },
        { name: 'ArrowUp', Icon: ArrowUp },
        { name: 'ArrowDown', Icon: ArrowDown },
        { name: 'ArrowLeft', Icon: ArrowLeft },
        { name: 'ArrowRight', Icon: ArrowRight },
        { name: 'ExternalLink', Icon: ExternalLink },
        { name: 'Link', Icon: Link },
      ],
    },
    {
      category: 'Ações',
      icons: [
        { name: 'Plus', Icon: Plus },
        { name: 'Minus', Icon: Minus },
        { name: 'Check', Icon: Check },
        { name: 'X', Icon: X },
        { name: 'Edit', Icon: Edit },
        { name: 'Trash2', Icon: Trash2 },
        { name: 'Save', Icon: Save },
        { name: 'Download', Icon: Download },
        { name: 'Upload', Icon: Upload },
        { name: 'Copy', Icon: Copy },
        { name: 'Clipboard', Icon: Clipboard },
        { name: 'Send', Icon: Send },
        { name: 'Share2', Icon: Share2 },
        { name: 'RefreshCw', Icon: RefreshCw },
        { name: 'RefreshCcw', Icon: RefreshCcw },
        { name: 'RotateCw', Icon: RotateCw },
        { name: 'RotateCcw', Icon: RotateCcw },
      ],
    },
    {
      category: 'Usuário & Autenticação',
      icons: [
        { name: 'User', Icon: User },
        { name: 'Users', Icon: Users },
        { name: 'Lock', Icon: Lock },
        { name: 'Unlock', Icon: Unlock },
        { name: 'Key', Icon: Key },
        { name: 'Shield', Icon: Shield },
        { name: 'ShieldCheck', Icon: ShieldCheck },
        { name: 'Eye', Icon: Eye },
        { name: 'EyeOff', Icon: EyeOff },
        { name: 'Fingerprint', Icon: Fingerprint },
      ],
    },
    {
      category: 'Comunicação',
      icons: [
        { name: 'Bell', Icon: Bell },
        { name: 'Mail', Icon: Mail },
        { name: 'Phone', Icon: Phone },
        { name: 'MessageSquare', Icon: MessageSquare },
      ],
    },
    {
      category: 'Status & Alertas',
      icons: [
        { name: 'AlertTriangle', Icon: AlertTriangle },
        { name: 'AlertCircle', Icon: AlertCircle },
        { name: 'Info', Icon: Info },
        { name: 'HelpCircle', Icon: HelpCircle },
        { name: 'CheckCircle', Icon: CheckCircle },
        { name: 'XCircle', Icon: XCircle },
        { name: 'MinusCircle', Icon: MinusCircle },
        { name: 'PlusCircle', Icon: PlusCircle },
      ],
    },
    {
      category: 'Gamificação',
      icons: [
        { name: 'Trophy', Icon: Trophy },
        { name: 'Award', Icon: Award },
        { name: 'Star', Icon: Star },
        { name: 'Flame', Icon: Flame },
        { name: 'Sparkles', Icon: Sparkles },
        { name: 'Coins', Icon: Coins },
        { name: 'Target', Icon: Target },
        { name: 'Zap', Icon: Zap },
        { name: 'Heart', Icon: Heart },
        { name: 'ThumbsUp', Icon: ThumbsUp },
        { name: 'ThumbsDown', Icon: ThumbsDown },
        { name: 'Gift', Icon: Gift },
      ],
    },
    {
      category: 'Arquivos & Mídia',
      icons: [
        { name: 'File', Icon: File },
        { name: 'FileText', Icon: FileText },
        { name: 'Folder', Icon: Folder },
        { name: 'FolderOpen', Icon: FolderOpen },
        { name: 'Image', Icon: Image },
        { name: 'Camera', Icon: Camera },
        { name: 'Video', Icon: Video },
        { name: 'Music', Icon: Music },
        { name: 'Volume2', Icon: Volume2 },
        { name: 'VolumeX', Icon: VolumeX },
      ],
    },
    {
      category: 'Data & Tempo',
      icons: [
        { name: 'Calendar', Icon: Calendar },
        { name: 'Clock', Icon: Clock },
        { name: 'TrendingUp', Icon: TrendingUp },
        { name: 'Activity', Icon: Activity },
        { name: 'BarChart', Icon: BarChart },
        { name: 'PieChart', Icon: PieChart },
        { name: 'LineChart', Icon: LineChart },
        { name: 'Gauge', Icon: Gauge },
      ],
    },
    {
      category: 'Interface',
      icons: [
        { name: 'Settings', Icon: Settings },
        { name: 'Search', Icon: Search },
        { name: 'Filter', Icon: Filter },
        { name: 'Grid', Icon: Grid },
        { name: 'List', Icon: List },
        { name: 'Table', Icon: TableIcon },
        { name: 'LayoutGrid', Icon: LayoutGrid },
        { name: 'Maximize', Icon: Maximize },
        { name: 'Minimize', Icon: Minimize },
        { name: 'ZoomIn', Icon: ZoomIn },
        { name: 'ZoomOut', Icon: ZoomOut },
        { name: 'Move', Icon: Move },
        { name: 'Grip', Icon: Grip },
        { name: 'MoreHorizontal', Icon: MoreHorizontal },
        { name: 'MoreVertical', Icon: MoreVertical },
      ],
    },
    {
      category: 'Produção & Logística',
      icons: [
        { name: 'Package', Icon: Package },
        { name: 'Box', Icon: Box },
        { name: 'Truck', Icon: Truck },
        { name: 'Factory', Icon: Factory },
        { name: 'Warehouse', Icon: Warehouse },
        { name: 'Building', Icon: Building },
        { name: 'QrCode', Icon: QrCode },
        { name: 'Scan', Icon: Scan },
        { name: 'Printer', Icon: Printer },
      ],
    },
    {
      category: 'E-commerce',
      icons: [
        { name: 'ShoppingCart', Icon: ShoppingCart },
        { name: 'CreditCard', Icon: CreditCard },
        { name: 'DollarSign', Icon: DollarSign },
        { name: 'Percent', Icon: Percent },
        { name: 'Tag', Icon: Tag },
        { name: 'Bookmark', Icon: Bookmark },
        { name: 'Flag', Icon: Flag },
      ],
    },
    {
      category: 'Clima & Ambiente',
      icons: [
        { name: 'Sun', Icon: Sun },
        { name: 'Moon', Icon: Moon },
        { name: 'Cloud', Icon: Cloud },
        { name: 'CloudRain', Icon: CloudRain },
        { name: 'Thermometer', Icon: Thermometer },
        { name: 'Droplet', Icon: Droplet },
        { name: 'Wind', Icon: Wind },
        { name: 'Umbrella', Icon: Umbrella },
      ],
    },
    {
      category: 'Tecnologia',
      icons: [
        { name: 'Cpu', Icon: Cpu },
        { name: 'Database', Icon: Database },
        { name: 'Server', Icon: Server },
        { name: 'Terminal', Icon: Terminal },
        { name: 'Code', Icon: Code },
        { name: 'GitBranch', Icon: GitBranch },
        { name: 'Wifi', Icon: Wifi },
        { name: 'WifiOff', Icon: WifiOff },
        { name: 'Battery', Icon: Battery },
        { name: 'BatteryCharging', Icon: BatteryCharging },
        { name: 'Power', Icon: Power },
        { name: 'Loader2', Icon: Loader2 },
      ],
    },
    {
      category: 'Localização',
      icons: [
        { name: 'MapPin', Icon: MapPin },
        { name: 'Map', Icon: Map },
        { name: 'Navigation', Icon: Navigation },
        { name: 'Compass', Icon: Compass },
        { name: 'Globe', Icon: Globe },
        { name: 'Crosshair', Icon: Crosshair },
      ],
    },
    {
      category: 'Redes Sociais',
      icons: [
        { name: 'Github', Icon: Github },
        { name: 'Linkedin', Icon: Linkedin },
        { name: 'Twitter', Icon: Twitter },
        { name: 'Facebook', Icon: Facebook },
        { name: 'Instagram', Icon: Instagram },
        { name: 'Youtube', Icon: Youtube },
      ],
    },
    {
      category: 'Formas & Design',
      icons: [
        { name: 'Square', Icon: Square },
        { name: 'Circle', Icon: Circle },
        { name: 'Layers', Icon: Layers },
        { name: 'Palette', Icon: Palette },
        { name: 'Wand2', Icon: Wand2 },
        { name: 'MousePointer2', Icon: MousePointer2 },
        { name: 'Play', Icon: Play },
        { name: 'Type', Icon: Type },
        { name: 'Ruler', Icon: Ruler },
      ],
    },
  ];

  const allIcons = iconCategories.flatMap((cat) => cat.icons);

  const filteredCategories = searchTerm
    ? [
        {
          category: 'Resultados da Busca',
          icons: allIcons.filter((icon) =>
            icon.name.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        },
      ]
    : iconCategories;

  const totalIcons = allIcons.length;

  return (
    <div className="space-y-6">
      {/* Search & Stats */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Biblioteca de Ícones
          </CardTitle>
          <CardDescription>
            {totalIcons} ícones do Lucide React organizados por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar ícone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Badge variant="secondary" className="gap-1">
              <Box className="h-3 w-3" />
              {totalIcons} ícones
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Icon Categories */}
      {filteredCategories.map((category) => (
        category.icons.length > 0 && (
          <Card key={category.category} className="card-interactive">
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
              <CardDescription>{category.icons.length} ícones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                {category.icons.map(({ name, Icon }) => (
                  <div
                    key={name}
                    className="group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    title={name}
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center truncate w-full">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ))}

      {/* Icon Sizes */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Tamanhos de Ícones
          </CardTitle>
          <CardDescription>Variações de tamanho padrão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-8">
            {[
              { size: 'h-3 w-3', label: '12px', desc: 'Extra Small' },
              { size: 'h-4 w-4', label: '16px', desc: 'Small' },
              { size: 'h-5 w-5', label: '20px', desc: 'Default' },
              { size: 'h-6 w-6', label: '24px', desc: 'Medium' },
              { size: 'h-8 w-8', label: '32px', desc: 'Large' },
              { size: 'h-10 w-10', label: '40px', desc: 'XL' },
              { size: 'h-12 w-12', label: '48px', desc: '2XL' },
              { size: 'h-16 w-16', label: '64px', desc: '3XL' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <Star className={`${item.size} text-primary`} />
                <span className="text-xs font-mono text-primary">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Icon Colors */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Cores de Ícones
          </CardTitle>
          <CardDescription>Cores semânticas para ícones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[
              { color: 'text-foreground', label: 'foreground' },
              { color: 'text-muted-foreground', label: 'muted' },
              { color: 'text-primary', label: 'primary' },
              { color: 'text-secondary', label: 'secondary' },
              { color: 'text-accent', label: 'accent' },
              { color: 'text-destructive', label: 'destructive' },
              { color: 'text-[hsl(var(--success))]', label: 'success' },
              { color: 'text-[hsl(var(--warning))]', label: 'warning' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Star className={`h-6 w-6 ${item.color}`} />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Icon with Background */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Ícones com Background
          </CardTitle>
          <CardDescription>Estilos de ícones com fundos coloridos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-lg gradient-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-lg gradient-success flex items-center justify-center">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-lg bg-destructive flex items-center justify-center">
              <X className="h-6 w-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--success))] flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--warning))] flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FormsSection() {
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

function ModalsSection() {
  return (
    <div className="space-y-6">
      {/* Dialog */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Dialog
          </CardTitle>
          <CardDescription>Modal padrão para conteúdo e formulários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Basic Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog Básico</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Básico</DialogTitle>
                  <DialogDescription>
                    Este é um exemplo de dialog básico com título e descrição.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    O conteúdo do dialog vai aqui. Pode incluir texto, imagens, formulários ou qualquer outro elemento.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="gradient">Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog with Form */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="gradient">Dialog com Formulário</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>
                    Atualize suas informações de perfil aqui.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-name">Nome</Label>
                    <Input id="modal-name" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-email">Email</Label>
                    <Input id="modal-email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-bio">Bio</Label>
                    <Textarea id="modal-bio" placeholder="Conte um pouco sobre você..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="gradient">Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Large Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Dialog Grande</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalhes do Trabalho</DialogTitle>
                  <DialogDescription>
                    Informações completas sobre o trabalho de produção.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Número do Pedido</p>
                      <p className="text-sm text-muted-foreground">#ORD-2024-001</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Cliente</p>
                      <p className="text-sm text-muted-foreground">Empresa ABC Ltda</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Técnica</p>
                      <Badge variant="secondary">Silk Têxtil</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>
                      <StatusBadge status="production" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Observações</p>
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted">
                      Cliente solicitou entrega expressa. Verificar qualidade da impressão antes de finalizar.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Fechar</Button>
                  <Button variant="gradient">Editar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Dialog"
              code={`<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Dialog</DialogTitle>
      <DialogDescription>
        Descrição do dialog aqui.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Conteúdo */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button variant="gradient">Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Dialog com largura customizada */}
<DialogContent className="sm:max-w-md">
  ...
</DialogContent>

<DialogContent className="sm:max-w-2xl">
  ...
</DialogContent>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Dialog */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Alert Dialog
          </CardTitle>
          <CardDescription>Diálogos de confirmação para ações importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Delete Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Excluir Item</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O item será permanentemente removido do sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Confirm Action */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Confirmar Ação</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar finalização</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a finalizar este trabalho. Certifique-se de que todas as verificações foram feitas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction className="gradient-primary text-white">
                    Finalizar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Warning */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-[hsl(var(--warning))] text-[hsl(var(--warning))]">
                  Ação com Aviso
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
                    Atenção
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação pode afetar outros trabalhos em andamento. Deseja continuar mesmo assim?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Não, cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning))]/90">
                    Sim, continuar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Alert Dialog"
              code={`<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Excluir</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

{/* Estilo success/warning */}
<AlertDialogAction className="gradient-primary text-white">
  Confirmar
</AlertDialogAction>

<AlertDialogAction className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">
  Continuar
</AlertDialogAction>`}
            />
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Sheet"
              code={`<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Abrir Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Título</SheetTitle>
      <SheetDescription>Descrição aqui.</SheetDescription>
    </SheetHeader>
    <div className="py-6">
      {/* Conteúdo */}
    </div>
  </SheetContent>
</Sheet>

{/* Posições */}
<SheetContent side="right">...</SheetContent>
<SheetContent side="left">...</SheetContent>
<SheetContent side="top" className="h-auto">...</SheetContent>
<SheetContent side="bottom" className="h-auto">...</SheetContent>

{/* Com largura customizada */}
<SheetContent side="right" className="sm:max-w-lg">
  ...
</SheetContent>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sheet */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Sheet (Drawer)
          </CardTitle>
          <CardDescription>Painéis deslizantes para conteúdo secundário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Right Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Direita</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Configurações</SheetTitle>
                  <SheetDescription>
                    Ajuste as configurações da sua conta aqui.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="sheet-name">Nome</Label>
                    <Input id="sheet-name" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sheet-email">Email</Label>
                    <Input id="sheet-email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sheet-notifications">Notificações</Label>
                    <Switch id="sheet-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sheet-dark">Modo Escuro</Label>
                    <Switch id="sheet-dark" defaultChecked />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="gradient" className="flex-1">Salvar</Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Left Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Esquerda</Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu de Navegação</SheetTitle>
                  <SheetDescription>
                    Acesse rapidamente as principais seções.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-2 py-6">
                  {['Dashboard', 'Produção', 'Kanban', 'Calendário', 'Alertas', 'KPIs'].map((item) => (
                    <Button key={item} variant="ghost" className="w-full justify-start gap-2">
                      <Zap className="h-4 w-4" />
                      {item}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Top Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Topo</Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Notificação</SheetTitle>
                  <SheetDescription>
                    Você tem novas atualizações disponíveis.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex gap-3 py-4">
                  <Button variant="gradient">Ver Atualizações</Button>
                  <Button variant="outline">Mais Tarde</Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Bottom Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Inferior</Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Ações Rápidas</SheetTitle>
                  <SheetDescription>
                    Escolha uma ação para executar.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-3 py-6">
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <Plus className="h-6 w-6" />
                    <span className="text-xs">Novo Job</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <Scan className="h-6 w-6" />
                    <span className="text-xs">Escanear QR</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <Bell className="h-6 w-6" />
                    <span className="text-xs">Alertas</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Sheet with Form */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Sheet com Formulário
          </CardTitle>
          <CardDescription>Exemplo de sheet com formulário completo</CardDescription>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="gradient">Adicionar Novo Trabalho</Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Novo Trabalho</SheetTitle>
                <SheetDescription>
                  Preencha os dados para criar um novo trabalho de produção.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número do Pedido</Label>
                    <Input placeholder="ORD-2024-XXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input placeholder="Nome do cliente" />
                </div>
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Input placeholder="Descrição do produto" />
                </div>
                <div className="space-y-2">
                  <Label>Técnica</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a técnica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silk">Silk Têxtil</SelectItem>
                      <SelectItem value="laser">Fiber Laser</SelectItem>
                      <SelectItem value="tampo">Tampografia</SelectItem>
                      <SelectItem value="sublimacao">Sublimação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input type="number" placeholder="60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Notas adicionais..." />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">Cancelar</Button>
                <Button variant="gradient" className="flex-1">Criar Trabalho</Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Usage Notes */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Guia de Uso
          </CardTitle>
          <CardDescription>Quando usar cada tipo de modal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Dialog
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para formulários curtos, confirmações e conteúdo que requer atenção focada. Ideal para ações que não precisam de muito espaço.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                Alert Dialog
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para ações destrutivas ou irreversíveis que precisam de confirmação explícita do usuário antes de prosseguir.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-secondary" />
                Sheet
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para formulários longos, configurações, navegação secundária ou conteúdo que precisa de mais espaço vertical.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TooltipsSection() {
  const [popoverDate, setPopoverDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      {/* Tooltips */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Tooltips
          </CardTitle>
          <CardDescription>Dicas contextuais que aparecem ao passar o mouse</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="space-y-6">
              {/* Basic Tooltips */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Posições</h4>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Tooltip Topo</Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Tooltip posicionado no topo</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Tooltip Inferior</Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Tooltip posicionado embaixo</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Tooltip Esquerda</Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Tooltip à esquerda</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Tooltip Direita</Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Tooltip à direita</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Icon Tooltips */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Em Ícones</h4>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Configurações</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notificações</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Meu Perfil</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir item</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Rich Tooltips */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tooltips com Conteúdo Rico</h4>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="gradient">Com Atalho</Button>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center gap-2">
                      <p>Salvar alterações</p>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                        ⌘S
                      </kbd>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-pointer">
                        <HelpCircle className="h-3 w-3 mr-1" />
                        Ajuda
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">Precisa de ajuda?</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Clique aqui para acessar nossa base de conhecimento com tutoriais e FAQs.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </TooltipProvider>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tooltip"
              code={`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>Tooltip no topo</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

{/* Posições: side="top" | "bottom" | "left" | "right" */}

{/* Com atalho de teclado */}
<TooltipContent className="flex items-center gap-2">
  <p>Salvar</p>
  <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]">
    ⌘S
  </kbd>
</TooltipContent>

{/* Em ícones */}
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <Settings className="h-5 w-5" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Configurações</p>
  </TooltipContent>
</Tooltip>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Popovers */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Popovers
          </CardTitle>
          <CardDescription>Painéis flutuantes com conteúdo interativo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Popovers */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Posições</h4>
              <div className="flex flex-wrap gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover Topo</Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover no Topo</h4>
                      <p className="text-sm text-muted-foreground">
                        Este popover abre acima do elemento trigger.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover Inferior</Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover Inferior</h4>
                      <p className="text-sm text-muted-foreground">
                        Este popover abre abaixo do elemento trigger.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover Esquerda</Button>
                  </PopoverTrigger>
                  <PopoverContent side="left" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover Esquerda</h4>
                      <p className="text-sm text-muted-foreground">
                        Este popover abre à esquerda do elemento trigger.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover Direita</Button>
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover Direita</h4>
                      <p className="text-sm text-muted-foreground">
                        Este popover abre à direita do elemento trigger.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Popover with Form */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Formulário</h4>
              <div className="flex flex-wrap gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Tag
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Nova Tag</h4>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma tag ao item selecionado.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tag-name">Nome da Tag</Label>
                        <Input id="tag-name" placeholder="Digite o nome..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Cor</Label>
                        <div className="flex gap-2">
                          {['bg-primary', 'bg-secondary', 'bg-[hsl(var(--success))]', 'bg-[hsl(var(--warning))]', 'bg-destructive'].map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full ${color} hover:ring-2 ring-offset-2 ring-offset-background ring-ring transition-all`}
                            />
                          ))}
                        </div>
                      </div>
                      <Button variant="gradient" className="w-full">Criar Tag</Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Selecionar Data
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={popoverDate}
                      onSelect={setPopoverDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Popover with Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Ações</h4>
              <div className="flex flex-wrap gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                        <Edit className="h-4 w-4" /> Editar
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                        <Copy className="h-4 w-4" /> Duplicar
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                        <Share2 className="h-4 w-4" /> Compartilhar
                      </Button>
                      <div className="h-px bg-border my-1" />
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" /> Excluir
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filtrar por</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="active">Ativos</SelectItem>
                              <SelectItem value="completed">Concluídos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Técnica</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Todas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas</SelectItem>
                              <SelectItem value="silk">Silk</SelectItem>
                              <SelectItem value="laser">Laser</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">Limpar</Button>
                        <Button variant="gradient" className="flex-1">Aplicar</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Popover"
              code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Abrir Popover</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" className="w-80">
    <div className="space-y-2">
      <h4 className="font-medium">Título</h4>
      <p className="text-sm text-muted-foreground">
        Conteúdo do popover aqui.
      </p>
    </div>
  </PopoverContent>
</Popover>

{/* Posições: side="top" | "bottom" | "left" | "right" */}

{/* Com formulário */}
<PopoverContent className="w-80">
  <div className="space-y-4">
    <Label htmlFor="name">Nome</Label>
    <Input id="name" placeholder="Digite..." />
    <Button variant="gradient" className="w-full">Salvar</Button>
  </div>
</PopoverContent>

{/* Com Calendar (DatePicker) */}
<PopoverContent className="w-auto p-0" align="start">
  <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="pointer-events-auto"
  />
</PopoverContent>

{/* Menu de ações */}
<PopoverContent className="w-48 p-1">
  <Button variant="ghost" className="w-full justify-start gap-2">
    <Edit className="h-4 w-4" /> Editar
  </Button>
  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
    <Trash2 className="h-4 w-4" /> Excluir
  </Button>
</PopoverContent>`}
            />
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="HoverCard"
              code={`<HoverCard>
  <HoverCardTrigger asChild>
    <span className="cursor-pointer underline">@username</span>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex space-x-4">
      <Avatar>
        <AvatarImage src="..." />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">Nome Completo</h4>
        <p className="text-sm text-muted-foreground">@username</p>
        <p className="text-sm">Bio do usuário aqui.</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>

{/* Com informações detalhadas */}
<HoverCardContent className="w-80">
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold">Pedido #001</h4>
      <StatusBadge status="production" />
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <p className="text-muted-foreground">Cliente</p>
        <p className="font-medium">Empresa ABC</p>
      </div>
      ...
    </div>
    <Progress value={65} variant="xp" className="h-2" />
  </div>
</HoverCardContent>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hover Cards */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Hover Cards
          </CardTitle>
          <CardDescription>Cards com informações detalhadas que aparecem ao passar o mouse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* User Hover Cards */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Perfil de Usuário</h4>
              <div className="flex flex-wrap gap-6">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium underline underline-offset-4">@joao_silva</span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-semibold">João da Silva</h4>
                        <p className="text-sm text-muted-foreground">@joao_silva</p>
                        <p className="text-sm">
                          Operador de Silk Têxtil com 5 anos de experiência.
                        </p>
                        <div className="flex items-center pt-2">
                          <Calendar className="mr-2 h-4 w-4 opacity-70" />
                          <span className="text-xs text-muted-foreground">
                            Entrou em Março de 2020
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">MC</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium underline underline-offset-4">@maria_coord</span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">MC</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-semibold">Maria Costa</h4>
                        <p className="text-sm text-muted-foreground">@maria_coord</p>
                        <Badge variant="secondary" className="mt-1">Coordenadora</Badge>
                        <p className="text-sm mt-2">
                          Coordenadora de Gravação responsável pelo setor de Laser.
                        </p>
                        <div className="flex items-center pt-2">
                          <Calendar className="mr-2 h-4 w-4 opacity-70" />
                          <span className="text-xs text-muted-foreground">
                            Entrou em Janeiro de 2019
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>

            {/* Product Hover Cards */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informações de Trabalho</h4>
              <div className="flex flex-wrap gap-4">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer hover:border-primary transition-colors">
                      #ORD-2024-001
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Pedido #ORD-2024-001</h4>
                        <StatusBadge status="production" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Cliente</p>
                          <p className="font-medium">Empresa ABC</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Técnica</p>
                          <p className="font-medium">Silk Têxtil</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantidade</p>
                          <p className="font-medium">500 peças</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prazo</p>
                          <p className="font-medium">15/12/2024</p>
                        </div>
                      </div>
                      <Progress value={65} variant="xp" className="h-2" />
                      <p className="text-xs text-muted-foreground">65% concluído</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                      <Zap className="h-3 w-3 mr-1" />
                      Fiber Laser
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                          <Zap className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">Fiber Laser</h4>
                          <p className="text-xs text-muted-foreground">Técnica de Gravação</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gravação a laser de alta precisão em metais e plásticos. Ideal para marcações permanentes.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline">4 máquinas</Badge>
                        <Badge variant="outline">~5min setup</Badge>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Guia de Uso
          </CardTitle>
          <CardDescription>Quando usar cada componente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Tooltip
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para informações breves e não interativas. Aparece instantaneamente ao passar o mouse. Ideal para descrever ícones e ações.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-secondary" />
                Popover
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para conteúdo interativo como formulários, menus de ações ou filtros. Permanece aberto até ser fechado explicitamente.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                Hover Card
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para previews de conteúdo como perfis de usuário ou detalhes de itens. Aparece com delay e fecha ao sair do hover.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TablesSection() {
  const sampleData = [
    { id: "INV001", status: "Pago", method: "Cartão de Crédito", amount: "R$ 250,00" },
    { id: "INV002", status: "Pendente", method: "PayPal", amount: "R$ 150,00" },
    { id: "INV003", status: "Cancelado", method: "Transferência", amount: "R$ 350,00" },
    { id: "INV004", status: "Pago", method: "Cartão de Crédito", amount: "R$ 450,00" },
    { id: "INV005", status: "Pago", method: "PayPal", amount: "R$ 550,00" },
  ];

  const jobsData = [
    { order: "ORD-001", client: "Cliente Alpha", product: "Camiseta", technique: "Serigrafia", status: "production", priority: "high" },
    { order: "ORD-002", client: "Cliente Beta", product: "Caneca", technique: "Sublimação", status: "queue", priority: "medium" },
    { order: "ORD-003", client: "Cliente Gamma", product: "Adesivo", technique: "Vinil", status: "finished", priority: "low" },
    { order: "ORD-004", client: "Cliente Delta", product: "Boné", technique: "Bordado", status: "ready", priority: "urgent" },
    { order: "ORD-005", client: "Cliente Epsilon", product: "Squeeze", technique: "Laser", status: "delayed", priority: "high" },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      production: { label: "Em Produção", variant: "default" },
      queue: { label: "Na Fila", variant: "secondary" },
      finished: { label: "Finalizado", variant: "outline" },
      ready: { label: "Pronto", variant: "default" },
      delayed: { label: "Atrasado", variant: "destructive" },
    };
    const { label, variant } = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      urgent: { label: "Urgente", className: "bg-destructive text-destructive-foreground" },
      high: { label: "Alta", className: "bg-orange-500 text-white" },
      medium: { label: "Média", className: "bg-yellow-500 text-black" },
      low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
    };
    const { label, className } = priorityMap[priority] || { label: priority, className: "" };
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Basic Table */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Tabela Básica
          </CardTitle>
          <CardDescription>Tabela simples com caption e footer</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de faturas recentes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">R$ 1.750,00</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela Básica"
              code={`<Table>
  <TableCaption>Lista de faturas</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Fatura</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Método</TableHead>
      <TableHead className="text-right">Valor</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.id}</TableCell>
        <TableCell>{item.status}</TableCell>
        <TableCell>{item.method}</TableCell>
        <TableCell className="text-right">{item.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">R$ 1.750,00</TableCell>
    </TableRow>
  </TableFooter>
</Table>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Striped Table */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Tabela com Linhas Alternadas
          </CardTitle>
          <CardDescription>Estilo zebrado para melhor legibilidade</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice, index) => (
                <TableRow key={invoice.id} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela Zebrada"
              code={`{/* Aplique bg-muted/50 em linhas alternadas */}
<TableBody>
  {data.map((item, index) => (
    <TableRow 
      key={item.id} 
      className={index % 2 === 0 ? "bg-muted/50" : ""}
    >
      <TableCell>{item.id}</TableCell>
      ...
    </TableRow>
  ))}
</TableBody>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table with Badges */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Tabela com Badges e Status
          </CardTitle>
          <CardDescription>Tabela estilizada com badges coloridos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Técnica</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsData.map((job) => (
                <TableRow key={job.order}>
                  <TableCell className="font-medium">{job.order}</TableCell>
                  <TableCell>{job.client}</TableCell>
                  <TableCell>{job.product}</TableCell>
                  <TableCell>{job.technique}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{getPriorityBadge(job.priority)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela com Badges"
              code={`{/* Helper function para badges de status */}
const getStatusBadge = (status: string) => {
  const statusMap = {
    production: { label: "Em Produção", variant: "default" },
    queue: { label: "Na Fila", variant: "secondary" },
    finished: { label: "Finalizado", variant: "outline" },
    delayed: { label: "Atrasado", variant: "destructive" },
  };
  const { label, variant } = statusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
};

{/* Na tabela */}
<TableCell>{getStatusBadge(job.status)}</TableCell>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table with Actions */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Tabela com Ações
          </CardTitle>
          <CardDescription>Tabela com botões de ação em cada linha</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "Pago" ? "default" : invoice.status === "Pendente" ? "secondary" : "destructive"}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela com Ações"
              code={`<TableHead className="text-center">Ações</TableHead>

<TableCell className="text-center">
  <div className="flex items-center justify-center gap-2">
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Eye className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Edit className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compact Table */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Minimize className="h-5 w-5 text-primary" />
            Tabela Compacta
          </CardTitle>
          <CardDescription>Menor padding para visualização densa</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-2">Fatura</TableHead>
                <TableHead className="py-2">Status</TableHead>
                <TableHead className="py-2">Método</TableHead>
                <TableHead className="py-2 text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="py-2 font-medium">{invoice.id}</TableCell>
                  <TableCell className="py-2">{invoice.status}</TableCell>
                  <TableCell className="py-2">{invoice.method}</TableCell>
                  <TableCell className="py-2 text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela com Seleção"
              code={`<TableHeader>
  <TableRow>
    <TableHead className="w-[50px]">
      <Checkbox 
        checked={allSelected}
        onCheckedChange={handleSelectAll}
      />
    </TableHead>
    ...
  </TableRow>
</TableHeader>

<TableBody>
  {data.map((item) => (
    <TableRow 
      key={item.id} 
      className="cursor-pointer"
      data-state={selected.includes(item.id) ? "selected" : undefined}
    >
      <TableCell>
        <Checkbox 
          checked={selected.includes(item.id)}
          onCheckedChange={() => handleSelect(item.id)}
        />
      </TableCell>
      ...
    </TableRow>
  ))}
</TableBody>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hoverable Table with Selection */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-primary" />
            Tabela com Seleção
          </CardTitle>
          <CardDescription>Linhas selecionáveis com checkboxes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox />
                </TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice, index) => (
                <TableRow key={invoice.id} className="cursor-pointer" data-state={index === 1 ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={index === 1} />
                  </TableCell>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Table with Pagination */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            Tabela com Paginação
          </CardTitle>
          <CardDescription>Navegação entre páginas de dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.slice(0, 3).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Paginação"
              code={`<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="card-interactive border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Guia de Uso
          </CardTitle>
          <CardDescription>Quando usar cada estilo de tabela</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela Básica</h4>
              <p className="text-xs text-muted-foreground">Listas simples de dados sem muita interação.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela Zebrada</h4>
              <p className="text-xs text-muted-foreground">Tabelas com muitas linhas para melhor legibilidade.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela com Badges</h4>
              <p className="text-xs text-muted-foreground">Quando há status ou categorias para destacar.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela com Ações</h4>
              <p className="text-xs text-muted-foreground">Quando cada linha requer operações CRUD.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela Compacta</h4>
              <p className="text-xs text-muted-foreground">Para exibir muitos dados em espaço limitado.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela com Seleção</h4>
              <p className="text-xs text-muted-foreground">Para ações em lote (excluir, exportar, etc).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NavigationSection() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            Breadcrumbs
          </CardTitle>
          <CardDescription>Navegação hierárquica para mostrar localização do usuário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Breadcrumb */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Breadcrumb Básico</h4>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Documentos</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Configurações</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Breadcrumb with Icons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Ícones</h4>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="flex items-center gap-1">
                    <Folder className="h-4 w-4" />
                    Projetos
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Relatórios
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1">
                    <File className="h-4 w-4" />
                    Documento.pdf
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Long Breadcrumb */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Breadcrumb Longo</h4>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Categoria</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Subcategoria</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Produto</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Detalhe</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Breadcrumb"
              code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Categoria</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Página Atual</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

{/* Com ícones */}
<BreadcrumbLink href="#" className="flex items-center gap-1">
  <Home className="h-4 w-4" />
  Home
</BreadcrumbLink>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Variants */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Tabs
          </CardTitle>
          <CardDescription>Navegação por abas para organização de conteúdo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Tabs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs Padrão</h4>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList>
                <TabsTrigger value="tab1">Conta</TabsTrigger>
                <TabsTrigger value="tab2">Senha</TabsTrigger>
                <TabsTrigger value="tab3">Notificações</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Conteúdo da aba Conta</p>
              </TabsContent>
              <TabsContent value="tab2" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Conteúdo da aba Senha</p>
              </TabsContent>
              <TabsContent value="tab3" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Conteúdo da aba Notificações</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Tabs with Icons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs com Ícones</h4>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Análises
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Visão geral do dashboard</p>
              </TabsContent>
              <TabsContent value="analytics" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Dados analíticos</p>
              </TabsContent>
              <TabsContent value="settings" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Configurações do sistema</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Gradient Tabs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs com Gradiente</h4>
            <Tabs defaultValue="home" className="w-full">
              <TabsList className="flex flex-wrap gap-2 h-auto p-1">
                <TabsTrigger value="home" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Home
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Pedidos
                </TabsTrigger>
                <TabsTrigger value="customers" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Clientes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="home" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Página inicial</p>
              </TabsContent>
              <TabsContent value="products" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Lista de produtos</p>
              </TabsContent>
              <TabsContent value="orders" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Histórico de pedidos</p>
              </TabsContent>
              <TabsContent value="customers" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Lista de clientes</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabs"
              code={`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
    <TabsTrigger value="tab3">Aba 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Conteúdo da aba 1
  </TabsContent>
  <TabsContent value="tab2">
    Conteúdo da aba 2
  </TabsContent>
</Tabs>

{/* Com ícones */}
<TabsTrigger value="settings" className="flex items-center gap-2">
  <Settings className="h-4 w-4" />
  Configurações
</TabsTrigger>

{/* Com gradiente ativo */}
<TabsTrigger 
  value="home" 
  className="data-[state=active]:gradient-primary data-[state=active]:text-white"
>
  Home
</TabsTrigger>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5 text-primary" />
            Navigation Menu
          </CardTitle>
          <CardDescription>Menu de navegação com dropdowns e submenus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Navigation Menu */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Menu Básico</h4>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="#"
                          >
                            <Package className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Catálogo
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Explore nosso catálogo completo de produtos.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none">Novidades</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Últimos lançamentos da coleção.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none">Promoções</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Ofertas especiais e descontos.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none">Mais Vendidos</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Os favoritos dos clientes.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Documentação
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Guias e tutoriais completos.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Code className="h-4 w-4" />
                              API Reference
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Referência completa da API.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <HelpCircle className="h-4 w-4" />
                              Suporte
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Central de ajuda e FAQ.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Comunidade
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Fórum e discussões.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    Preços
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    Contato
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Simple Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Links Simples</h4>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <Users className="h-4 w-4 mr-2" />
                    Equipe
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Navigation Menu"
              code={`<NavigationMenu>
  <NavigationMenuList>
    {/* Link simples */}
    <NavigationMenuItem>
      <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
        Home
      </NavigationMenuLink>
    </NavigationMenuItem>

    {/* Com dropdown */}
    <NavigationMenuItem>
      <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4 w-[400px] md:grid-cols-2">
          <li>
            <NavigationMenuLink asChild>
              <a href="#" className="block p-3 rounded-md hover:bg-accent">
                <div className="text-sm font-medium">Título</div>
                <p className="text-sm text-muted-foreground">Descrição</p>
              </a>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="card-interactive border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Guia de Uso
          </CardTitle>
          <CardDescription>Quando usar cada componente de navegação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                Breadcrumb
              </h4>
              <p className="text-xs text-muted-foreground">
                Use para mostrar a hierarquia de navegação e permitir retorno fácil a páginas anteriores. Ideal para sites com estrutura profunda.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" />
                Tabs
              </h4>
              <p className="text-xs text-muted-foreground">
                Use para organizar conteúdo relacionado em uma mesma página, alternando entre diferentes visualizações sem navegar para outra rota.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Menu className="h-4 w-4 text-primary" />
                Navigation Menu
              </h4>
              <p className="text-xs text-muted-foreground">
                Use para navegação principal do site com submenus ricos em conteúdo. Ideal para headers e barras de navegação globais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnimationsSection() {
  const [animationKey, setAnimationKey] = useState(0);
  
  const replayAnimations = () => {
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Replay Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={replayAnimations} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Replay Animações
        </Button>
      </div>

      {/* Entry Animations */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Animações de Entrada
          </CardTitle>
          <CardDescription>Animações para elementos que aparecem na tela</CardDescription>
        </CardHeader>
        <CardContent>
          <div key={animationKey} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-fade-in opacity-0 [animation-fill-mode:forwards]">
                <span className="text-sm font-medium">Fade In</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.animate-fade-in</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-scale-in opacity-0 [animation-fill-mode:forwards] [animation-delay:0.1s]">
                <span className="text-sm font-medium">Scale In</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.animate-scale-in</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-slide-in-right opacity-0 [animation-fill-mode:forwards] [animation-delay:0.2s]">
                <span className="text-sm font-medium">Slide Right</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.animate-slide-in-right</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-enter opacity-0 [animation-fill-mode:forwards] [animation-delay:0.3s]">
                <span className="text-sm font-medium">Enter (Combined)</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.animate-enter</p>
            </div>
          </div>
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="animate-fade-in">\n  Conteúdo com fade in\n</div>'} 
                label="Fade In"
              />
              <CodeBlock 
                code={'<div className="animate-scale-in">\n  Conteúdo com scale in\n</div>'} 
                label="Scale In"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="animate-slide-in-right">\n  Slide da direita\n</div>'} 
                label="Slide In Right"
              />
              <CodeBlock 
                code={'<div className="animate-enter">\n  Fade + Scale combinados\n</div>'} 
                label="Enter (Combined)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stagger Animations */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Animações Stagger (Escalonadas)
          </CardTitle>
          <CardDescription>Delays sequenciais para listas de elementos</CardDescription>
        </CardHeader>
        <CardContent>
          <div key={animationKey + 1} className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className={`h-16 w-16 rounded-lg gradient-primary flex items-center justify-center text-white font-bold animate-fade-in opacity-0 [animation-fill-mode:forwards] stagger-${num}`}
              >
                {num}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Classes: <code className="text-primary">.stagger-1</code> até <code className="text-primary">.stagger-6</code>
          </p>
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <CodeBlock 
              code={'{items.map((item, index) => (\n  <div \n    key={item.id}\n    className={`animate-fade-in stagger-${index + 1}`}\n  >\n    {item.content}\n  </div>\n))}'} 
              label="Lista com Stagger"
            />
          </div>
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="hover-lift">\n  Eleva no hover\n</div>'} 
                label="Hover Lift"
              />
              <CodeBlock 
                code={'<div className="hover-scale">\n  Escala no hover\n</div>'} 
                label="Hover Scale"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="hover-glow">\n  Brilha no hover\n</div>'} 
                label="Hover Glow"
              />
              <CodeBlock 
                code={'<Card className="card-interactive">\n  Card interativo\n</Card>'} 
                label="Card Interactive"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hover Effects */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-primary" />
            Efeitos de Hover
          </CardTitle>
          <CardDescription>Interações visuais ao passar o mouse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center hover-lift cursor-pointer">
                <span className="text-sm font-medium">Hover Lift</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.hover-lift</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center hover-scale cursor-pointer">
                <span className="text-sm font-medium">Hover Scale</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.hover-scale</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-primary/20 flex items-center justify-center hover-glow cursor-pointer">
                <span className="text-sm font-medium">Hover Glow</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.hover-glow</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center card-interactive cursor-pointer border">
                <span className="text-sm font-medium">Card Interactive</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.card-interactive</p>
            </div>
          </div>
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="bg-primary glow-primary">\n  Glow Primary\n</div>'} 
                label="Glow Primary"
              />
              <CodeBlock 
                code={'<div className="bg-success glow-success">\n  Glow Success\n</div>'} 
                label="Glow Success"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Glow Effects */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Efeitos de Glow (Brilho)
          </CardTitle>
          <CardDescription>Efeitos de brilho e neon para destaque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-primary flex items-center justify-center glow-primary">
                <span className="text-sm font-medium text-primary-foreground">Primary</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-primary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-secondary flex items-center justify-center glow-secondary">
                <span className="text-sm font-medium text-secondary-foreground">Secondary</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-secondary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[hsl(var(--success))] flex items-center justify-center glow-success">
                <span className="text-sm font-medium text-white">Success</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-success</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-accent flex items-center justify-center glow-accent">
                <span className="text-sm font-medium text-accent-foreground">Accent</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-accent</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[hsl(var(--warning))] flex items-center justify-center glow-warning">
                <span className="text-sm font-medium text-foreground">Warning</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-warning</p>
            </div>
          </div>
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="xp-bar xp-bar-glow">\n  Barra de XP\n</div>'} 
                label="XP Bar"
              />
              <CodeBlock 
                code={'<div className="streak-fire">\n  <Flame /> 7\n</div>'} 
                label="Streak Fire"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="coin-shine">\n  <Coins />\n</div>'} 
                label="Coin Shine"
              />
              <CodeBlock 
                code={'<div className="animate-level-up">\n  LEVEL UP!\n</div>'} 
                label="Level Up"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="achievement-unlock">\n  <Trophy /> Conquista!\n</div>'} 
                label="Achievement Unlock"
              />
              <CodeBlock 
                code={'<div className="points-pop">\n  +100\n</div>'} 
                label="Points Pop"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="rank-gold">\n  <Trophy />\n</div>'} 
                label="Rank Gold"
              />
              <CodeBlock 
                code={'<div className="animate-float">\n  <Sparkles />\n</div>'} 
                label="Float Animation"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Animations */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Animações de Gamificação
          </CardTitle>
          <CardDescription>Animações especiais para elementos de gamificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* XP Bar */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">XP Bar Shimmer</h4>
            <div className="space-y-2">
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-3/4 rounded-full xp-bar xp-bar-glow" />
              </div>
              <p className="text-xs text-muted-foreground">Classes: <code className="text-primary">.xp-bar .xp-bar-glow</code></p>
            </div>
          </div>

          {/* Fire Pulse */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Streak Fire Pulse</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 streak-fire">
                <Flame className="h-8 w-8 text-orange-500" />
                <span className="text-2xl font-bold">7</span>
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.streak-fire</code></p>
            </div>
          </div>

          {/* Coin Shine */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Coin Shine</h4>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--coins))] flex items-center justify-center coin-shine">
                <Coins className="h-6 w-6 text-yellow-900" />
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.coin-shine</code></p>
            </div>
          </div>

          {/* Level Up */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Level Up Flash</h4>
            <div key={animationKey + 2} className="flex gap-4">
              <div className="px-6 py-3 rounded-lg bg-[hsl(var(--xp))] text-white font-bold animate-level-up">
                LEVEL UP!
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.animate-level-up</code></p>
            </div>
          </div>

          {/* Achievement Unlock */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Achievement Unlock</h4>
            <div key={animationKey + 3} className="flex gap-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[hsl(var(--gold))] text-yellow-900 achievement-unlock">
                <Trophy className="h-6 w-6" />
                <span className="font-bold">Conquista Desbloqueada!</span>
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.achievement-unlock</code></p>
            </div>
          </div>

          {/* Points Pop */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Points Pop</h4>
            <div key={animationKey + 4} className="flex gap-4">
              <div className="text-2xl font-bold text-[hsl(var(--xp))] points-pop">
                +100
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.points-pop</code></p>
            </div>
          </div>

          {/* Badge Ranks */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ranking Badges</h4>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center rank-gold">
                  <Trophy className="h-8 w-8 text-yellow-900" />
                </div>
                <p className="text-xs text-muted-foreground">.rank-gold</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center rank-silver">
                  <Award className="h-8 w-8 text-gray-700" />
                </div>
                <p className="text-xs text-muted-foreground">.rank-silver</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center rank-bronze">
                  <Star className="h-8 w-8 text-orange-900" />
                </div>
                <p className="text-xs text-muted-foreground">.rank-bronze</p>
              </div>
            </div>
          </div>

          {/* Floating Animation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Floating Icon</h4>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center animate-float">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.animate-float</code></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pulse Animation */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Animação Pulse Glow
          </CardTitle>
          <CardDescription>Pulsação contínua com glow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center pulse-glow">
              <Zap className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="space-y-2 self-center">
              <p className="text-sm font-medium">Pulse Glow</p>
              <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">.pulse-glow</code></p>
              <p className="text-xs text-muted-foreground">Efeito de pulsação contínua ideal para CTAs e notificações</p>
            </div>
          </div>
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <CodeBlock 
              code={'<div className="pulse-glow">\n  <Zap /> Ação importante\n</div>'} 
              label="Pulse Glow"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackSection() {
  return (
    <div className="space-y-6">
      {/* Alert Variants */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Alert
          </CardTitle>
          <CardDescription>Componentes de alerta para mensagens importantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default Alert */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variante Default</h4>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Informação</AlertTitle>
              <AlertDescription>
                Esta é uma mensagem informativa para o usuário.
              </AlertDescription>
            </Alert>
          </div>

          {/* Destructive Alert */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variante Destructive</h4>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.
              </AlertDescription>
            </Alert>
          </div>

          {/* Custom Styled Alerts */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Alertas Customizados</h4>
            <div className="grid gap-3">
              <Alert className="border-success bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertTitle className="text-success">Sucesso</AlertTitle>
                <AlertDescription>
                  Operação realizada com sucesso!
                </AlertDescription>
              </Alert>
              
              <Alert className="border-warning bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertTitle className="text-warning">Atenção</AlertTitle>
                <AlertDescription>
                  Verifique as informações antes de prosseguir.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Alert"
              code={`{/* Default */}
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Informação</AlertTitle>
  <AlertDescription>
    Mensagem informativa aqui.
  </AlertDescription>
</Alert>

{/* Destructive */}
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Erro</AlertTitle>
  <AlertDescription>
    Ocorreu um erro.
  </AlertDescription>
</Alert>

{/* Custom Success */}
<Alert className="border-success bg-success/10">
  <CheckCircle className="h-4 w-4 text-success" />
  <AlertTitle className="text-success">Sucesso</AlertTitle>
  <AlertDescription>Operação realizada!</AlertDescription>
</Alert>

{/* Custom Warning */}
<Alert className="border-warning bg-warning/10">
  <AlertTriangle className="h-4 w-4 text-warning" />
  <AlertTitle className="text-warning">Atenção</AlertTitle>
  <AlertDescription>Verifique antes de prosseguir.</AlertDescription>
</Alert>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Toast Examples */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Toast (Sonner)
          </CardTitle>
          <CardDescription>Notificações temporárias e toasts interativos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes de Toast</h4>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => toast('Mensagem padrão', { description: 'Esta é uma notificação padrão.' })}
              >
                Toast Default
              </Button>
              <Button 
                variant="outline"
                className="border-success text-success hover:bg-success/10"
                onClick={() => toast.success('Sucesso!', { description: 'Operação completada.' })}
              >
                Toast Success
              </Button>
              <Button 
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => toast.error('Erro!', { description: 'Algo deu errado.' })}
              >
                Toast Error
              </Button>
              <Button 
                variant="outline"
                className="border-warning text-warning hover:bg-warning/10"
                onClick={() => toast.warning('Atenção!', { description: 'Verifique esta ação.' })}
              >
                Toast Warning
              </Button>
              <Button 
                variant="outline"
                className="border-info text-info hover:bg-info/10"
                onClick={() => toast.info('Informação', { description: 'Detalhes importantes.' })}
              >
                Toast Info
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Toast com Ações</h4>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="gradient"
                onClick={() => toast('Ação necessária', { 
                  description: 'Deseja confirmar esta operação?',
                  action: {
                    label: 'Confirmar',
                    onClick: () => toast.success('Confirmado!')
                  }
                })}
              >
                Toast com Ação
              </Button>
              <Button 
                variant="gradient-secondary"
                onClick={() => toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: 'Carregando...',
                    success: 'Dados carregados!',
                    error: 'Erro ao carregar',
                  }
                )}
              >
                Toast Promise
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Toast (Sonner)"
              code={`import { toast } from "sonner";

{/* Variantes básicas */}
toast("Mensagem padrão", { description: "Descrição opcional" });
toast.success("Sucesso!", { description: "Operação completada." });
toast.error("Erro!", { description: "Algo deu errado." });
toast.warning("Atenção!", { description: "Verifique esta ação." });
toast.info("Informação", { description: "Detalhes importantes." });

{/* Com ação */}
toast("Confirmar?", {
  description: "Deseja continuar?",
  action: {
    label: "Confirmar",
    onClick: () => toast.success("Confirmado!")
  }
});

{/* Promise (loading -> success/error) */}
toast.promise(
  fetch("/api/save"),
  {
    loading: "Salvando...",
    success: "Dados salvos!",
    error: "Erro ao salvar",
  }
);`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skeleton Examples */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-primary" />
            Skeleton
          </CardTitle>
          <CardDescription>Placeholders de carregamento para conteúdo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Skeletons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Formas Básicas</h4>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <p className="text-xs text-muted-foreground">Linha de texto</p>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <p className="text-xs text-muted-foreground">Avatar</p>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <p className="text-xs text-muted-foreground">Botão</p>
              </div>
            </div>
          </div>

          {/* Card Skeleton */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Card Skeleton</h4>
            <div className="border rounded-lg p-4 space-y-3 max-w-md">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Table Skeleton</h4>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 p-3 flex gap-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border-t flex gap-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </div>
          </div>

          {/* List Skeleton */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lista Skeleton</h4>
            <div className="space-y-3 max-w-sm">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 border rounded-md">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-[70%]" />
                    <Skeleton className="h-2 w-[40%]" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Skeleton"
              code={`{/* Linha de texto */}
<Skeleton className="h-4 w-[250px]" />

{/* Avatar circular */}
<Skeleton className="h-12 w-12 rounded-full" />

{/* Botão */}
<Skeleton className="h-8 w-24 rounded-md" />

{/* Card Skeleton */}
<div className="border rounded-lg p-4 space-y-3">
  <div className="flex items-center gap-3">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[150px]" />
      <Skeleton className="h-3 w-[100px]" />
    </div>
  </div>
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-[80%]" />
</div>

{/* Múltiplas linhas */}
{[1, 2, 3].map((i) => (
  <Skeleton key={i} className="h-4 w-full" />
))}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Spinners */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-primary" />
            Spinners
          </CardTitle>
          <CardDescription>Indicadores de carregamento giratórios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Spinners */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tamanhos</h4>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2 text-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Small (16px)</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Default (24px)</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Large (32px)</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">XL (48px)</p>
              </div>
            </div>
          </div>

          {/* Colored Spinners */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores</h4>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-success mx-auto" />
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-warning mx-auto" />
                <p className="text-xs text-muted-foreground">Warning</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-destructive mx-auto" />
                <p className="text-xs text-muted-foreground">Destructive</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-info mx-auto" />
                <p className="text-xs text-muted-foreground">Info</p>
              </div>
            </div>
          </div>

          {/* Alternative Spinners */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Alternativas</h4>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2 text-center">
                <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">RefreshCw</p>
              </div>
              <div className="space-y-2 text-center">
                <RotateCw className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">RotateCw</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">CSS Border</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="flex gap-1 mx-auto">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-xs text-muted-foreground">Dots Bounce</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="flex gap-1 mx-auto items-end h-6">
                  <div className="h-full w-1 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="h-4 w-1 bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="h-5 w-1 bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                  <div className="h-3 w-1 bg-primary animate-pulse" style={{ animationDelay: '450ms' }} />
                </div>
                <p className="text-xs text-muted-foreground">Bars Pulse</p>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Spinners"
              code={`{/* Spinner básico com Lucide */}
<Loader2 className="h-6 w-6 animate-spin text-primary" />

{/* Tamanhos */}
<Loader2 className="h-4 w-4 animate-spin" />  {/* Small */}
<Loader2 className="h-8 w-8 animate-spin" />  {/* Large */}
<Loader2 className="h-12 w-12 animate-spin" /> {/* XL */}

{/* Cores */}
<Loader2 className="animate-spin text-success" />
<Loader2 className="animate-spin text-warning" />
<Loader2 className="animate-spin text-destructive" />

{/* CSS Border Spinner */}
<div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />

{/* Dots Bounce */}
<div className="flex gap-1">
  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
</div>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress Bars */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Progress Bars
          </CardTitle>
          <CardDescription>Barras de progresso estáticas e animadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Static Progress */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Valores Estáticos</h4>
            <div className="space-y-3 max-w-md">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>0%</span>
                  <span className="text-muted-foreground">Início</span>
                </div>
                <Progress value={0} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>25%</span>
                  <span className="text-muted-foreground">Processando</span>
                </div>
                <Progress value={25} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>50%</span>
                  <span className="text-muted-foreground">Metade</span>
                </div>
                <Progress value={50} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>75%</span>
                  <span className="text-muted-foreground">Quase lá</span>
                </div>
                <Progress value={75} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>100%</span>
                  <span className="text-muted-foreground">Completo</span>
                </div>
                <Progress value={100} />
              </div>
            </div>
          </div>

          {/* Animated Progress */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Progresso Animado</h4>
            <div className="space-y-3 max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{progress}%</span>
                  <span className="text-muted-foreground">
                    {progress === 0 ? 'Aguardando' : progress < 100 ? 'Em progresso' : 'Completo!'}
                  </span>
                </div>
                <Progress value={progress} className="transition-all duration-200" />
                <Button size="sm" onClick={simulateProgress} disabled={progress > 0 && progress < 100}>
                  {progress === 100 ? 'Reiniciar' : 'Iniciar Progresso'}
                </Button>
              </div>
            </div>
          </div>

          {/* Indeterminate Progress */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Indeterminado</h4>
            <div className="max-w-md space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary rounded-full animate-[shimmer_1.5s_infinite]" 
                  style={{ 
                    animation: 'shimmer 1.5s infinite',
                    background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)'
                  }} 
                />
              </div>
              <p className="text-xs text-muted-foreground">Para operações sem tempo definido</p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Progress Bars"
              code={`{/* Básico */}
<Progress value={50} />

{/* Com label */}
<div className="space-y-1">
  <div className="flex justify-between text-xs">
    <span>50%</span>
    <span className="text-muted-foreground">Processando</span>
  </div>
  <Progress value={50} />
</div>

{/* Animado com estado */}
const [progress, setProgress] = useState(0);

<Progress value={progress} className="transition-all duration-200" />

{/* Variantes */}
<Progress value={75} variant="xp" />
<Progress value={50} variant="success" />
<Progress value={30} variant="warning" />
<Progress value={80} variant="destructive" />`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Button Loading States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Estados de Loading em Botões
          </CardTitle>
          <CardDescription>Botões com indicadores de carregamento integrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading Button Examples */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes com Loading</h4>
            <div className="flex flex-wrap gap-3">
              <Button disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </Button>
              <Button variant="secondary" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando
              </Button>
              <Button variant="outline" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguarde
              </Button>
              <Button variant="gradient" disabled className="opacity-80">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando
              </Button>
              <Button variant="destructive" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo
              </Button>
            </div>
          </div>

          {/* Interactive Loading Demo */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Demo Interativa</h4>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="gradient"
                onClick={simulateLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Clique para simular (2s)
                  </>
                )}
              </Button>
              <Button 
                variant="gradient-success"
                onClick={simulateLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Icon Only Loading */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Apenas Ícone</h4>
            <div className="flex flex-wrap gap-3">
              <Button size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
              <Button size="icon" variant="secondary" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
              <Button size="icon" variant="outline" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
              <Button size="icon" variant="ghost" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Button Loading States"
              code={`{/* Botão com loading */}
<Button disabled>
  <Loader2 className="h-4 w-4 animate-spin" />
  Carregando...
</Button>

{/* Toggle loading com estado */}
const [isLoading, setIsLoading] = useState(false);

<Button 
  disabled={isLoading}
  onClick={handleAction}
>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Processando...
    </>
  ) : (
    <>
      <Save className="h-4 w-4" />
      Salvar
    </>
  )}
</Button>

{/* Icon button loading */}
<Button size="icon" disabled>
  <Loader2 className="h-4 w-4 animate-spin" />
</Button>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Full Page Loading */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Loading de Página
          </CardTitle>
          <CardDescription>Padrões para carregamento de página inteira</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-8 bg-background/50">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-muted" />
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium">Carregando dados...</p>
                <p className="text-xs text-muted-foreground">Por favor, aguarde</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Use este padrão para carregamentos que ocupam a tela inteira ou seções grandes.
          </p>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Full Page Loading"
              code={`{/* Spinner circular duplo */}
<div className="flex flex-col items-center justify-center space-y-4">
  <div className="relative">
    <div className="h-16 w-16 rounded-full border-4 border-muted" />
    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
  <div className="space-y-2 text-center">
    <p className="text-sm font-medium">Carregando dados...</p>
    <p className="text-xs text-muted-foreground">Por favor, aguarde</p>
  </div>
</div>

{/* Overlay de loading */}
{isLoading && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
)}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyStatesSection() {
  return (
    <div className="space-y-6">
      {/* Basic Empty States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Estados Vazios Básicos
          </CardTitle>
          <CardDescription>Padrões para quando não há dados a exibir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* No Data */}
            <div className="border rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Nenhum item encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Não há itens para exibir no momento.
                </p>
              </div>
            </div>

            {/* No Results */}
            <div className="border rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Nenhum resultado</h3>
                <p className="text-sm text-muted-foreground">
                  Sua busca não retornou resultados. Tente outros termos.
                </p>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`<div className="border rounded-lg p-8 bg-background/50 
  flex flex-col items-center justify-center 
  text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-muted 
    flex items-center justify-center">
    <Package className="h-8 w-8 text-muted-foreground" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum item</h3>
    <p className="text-sm text-muted-foreground">
      Não há itens para exibir.
    </p>
  </div>
</div>`} 
                label="Sem Dados (Básico)"
              />
              <CodeBlock 
                code={`<div className="border rounded-lg p-8 bg-background/50 
  flex flex-col items-center justify-center 
  text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-muted 
    flex items-center justify-center">
    <Search className="h-8 w-8 text-muted-foreground" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum resultado</h3>
    <p className="text-sm text-muted-foreground">
      Tente outros termos.
    </p>
  </div>
</div>`} 
                label="Sem Resultados de Busca"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty States with CTA */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-primary" />
            Com Call-to-Action
          </CardTitle>
          <CardDescription>Estados vazios que incentivam ação do usuário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* No Jobs */}
            <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Nenhum job agendado</h3>
                <p className="text-sm text-muted-foreground">
                  Comece criando seu primeiro job.
                </p>
              </div>
              <Button variant="gradient" size="sm">
                <Plus className="h-4 w-4" />
                Criar Job
              </Button>
            </div>

            {/* No Messages */}
            <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-info/10 flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-info" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Sem conversas</h3>
                <p className="text-sm text-muted-foreground">
                  Inicie uma conversa com o assistente.
                </p>
              </div>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
                Nova Conversa
              </Button>
            </div>

            {/* No Notifications */}
            <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <Bell className="h-7 w-7 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Tudo em dia!</h3>
                <p className="text-sm text-muted-foreground">
                  Você não tem notificações pendentes.
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <CodeBlock 
                code={`<div className="border rounded-lg p-6 bg-background/50 
  flex flex-col items-center text-center space-y-4">
  <div className="h-14 w-14 rounded-full bg-primary/10 
    flex items-center justify-center">
    <Calendar className="h-7 w-7 text-primary" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum job</h3>
    <p className="text-sm text-muted-foreground">
      Comece criando seu primeiro job.
    </p>
  </div>
  <Button variant="gradient" size="sm">
    <Plus className="h-4 w-4" />
    Criar Job
  </Button>
</div>`} 
                label="Com Botão Primário"
              />
              <CodeBlock 
                code={`<div className="border rounded-lg p-6 bg-background/50 
  flex flex-col items-center text-center space-y-4">
  <div className="h-14 w-14 rounded-full bg-info/10 
    flex items-center justify-center">
    <MessageSquare className="h-7 w-7 text-info" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Sem conversas</h3>
    <p className="text-sm text-muted-foreground">
      Inicie uma conversa.
    </p>
  </div>
  <Button variant="outline" size="sm">
    <MessageSquare className="h-4 w-4" />
    Nova Conversa
  </Button>
</div>`} 
                label="Com Botão Outline"
              />
              <CodeBlock 
                code={`<div className="border rounded-lg p-6 bg-background/50 
  flex flex-col items-center text-center space-y-4">
  <div className="h-14 w-14 rounded-full bg-success/10 
    flex items-center justify-center">
    <Bell className="h-7 w-7 text-success" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Tudo em dia!</h3>
    <p className="text-sm text-muted-foreground">
      Sem notificações pendentes.
    </p>
  </div>
  <Button variant="ghost" size="sm">
    <Settings className="h-4 w-4" />
    Configurar
  </Button>
</div>`} 
                label="Estado Positivo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Illustrated Empty States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Com Ilustrações Elaboradas
          </CardTitle>
          <CardDescription>Estados vazios com visual mais impactante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Welcome State */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-primary/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Wand2 className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-success flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-success-foreground" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-lg font-semibold">Bem-vindo ao Sistema!</h3>
                <p className="text-sm text-muted-foreground">
                  Estamos prontos para ajudá-lo a gerenciar sua produção de forma inteligente.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient">
                  Começar Agora
                </Button>
                <Button variant="outline">
                  Ver Tutorial
                </Button>
              </div>
            </div>

            {/* Error/Offline State */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-destructive/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center">
                  <WifiOff className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-lg font-semibold">Sem Conexão</h3>
                <p className="text-sm text-muted-foreground">
                  Verifique sua conexão com a internet e tente novamente.
                </p>
              </div>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`<div className="border rounded-xl p-8 
  bg-gradient-to-br from-primary/5 to-transparent 
  flex flex-col items-center text-center space-y-6">
  <div className="relative">
    <div className="h-24 w-24 rounded-full 
      bg-gradient-to-br from-primary/20 to-primary/5 
      flex items-center justify-center">
      <Wand2 className="h-12 w-12 text-primary" />
    </div>
    <div className="absolute -top-1 -right-1 h-6 w-6 
      rounded-full bg-success flex items-center justify-center">
      <Sparkles className="h-3 w-3 text-success-foreground" />
    </div>
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-lg font-semibold">Bem-vindo!</h3>
    <p className="text-sm text-muted-foreground">
      Descrição do estado.
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="gradient">Começar</Button>
    <Button variant="outline">Tutorial</Button>
  </div>
</div>`} 
                label="Welcome State"
              />
              <CodeBlock 
                code={`<div className="border rounded-xl p-8 
  bg-gradient-to-br from-destructive/5 to-transparent 
  flex flex-col items-center text-center space-y-6">
  <div className="h-24 w-24 rounded-full 
    bg-gradient-to-br from-destructive/20 to-destructive/5 
    flex items-center justify-center">
    <WifiOff className="h-12 w-12 text-destructive" />
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-lg font-semibold">Sem Conexão</h3>
    <p className="text-sm text-muted-foreground">
      Verifique sua conexão.
    </p>
  </div>
  <Button variant="outline">
    <RefreshCw className="h-4 w-4" />
    Tentar Novamente
  </Button>
</div>`} 
                label="Offline State"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Empty States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Estados Contextuais
          </CardTitle>
          <CardDescription>Estados vazios específicos para diferentes contextos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Empty Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 p-3 border-b">
                <div className="flex gap-4">
                  <span className="text-xs font-medium text-muted-foreground w-20">ID</span>
                  <span className="text-xs font-medium text-muted-foreground flex-1">Nome</span>
                  <span className="text-xs font-medium text-muted-foreground w-24">Status</span>
                </div>
              </div>
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                <TableIcon className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Tabela vazia</p>
                  <p className="text-xs text-muted-foreground">Nenhum registro encontrado</p>
                </div>
              </div>
            </div>

            {/* Empty List */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Alertas Recentes</h4>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-success/50" />
                <div>
                  <p className="text-sm font-medium">Nenhum alerta</p>
                  <p className="text-xs text-muted-foreground">Sistema funcionando normalmente</p>
                </div>
              </div>
            </div>

            {/* Empty Files */}
            <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Arraste arquivos aqui</p>
                <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
              </div>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4" />
                Procurar
              </Button>
            </div>

            {/* Empty Filter Results */}
            <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Filter className="h-6 w-6 text-warning" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Filtros muito restritivos</p>
                <p className="text-xs text-muted-foreground">Tente ajustar os filtros aplicados</p>
              </div>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Tabela Vazia */}
<div className="border rounded-lg overflow-hidden">
  <div className="bg-muted/30 p-3 border-b">
    <div className="flex gap-4">
      <span className="text-xs font-medium 
        text-muted-foreground w-20">ID</span>
      <span className="text-xs font-medium 
        text-muted-foreground flex-1">Nome</span>
    </div>
  </div>
  <div className="p-12 flex flex-col items-center 
    justify-center text-center space-y-3">
    <TableIcon className="h-10 w-10 
      text-muted-foreground/50" />
    <div>
      <p className="text-sm font-medium">Tabela vazia</p>
      <p className="text-xs text-muted-foreground">
        Nenhum registro encontrado
      </p>
    </div>
  </div>
</div>`} 
                label="Tabela Vazia"
              />
              <CodeBlock 
                code={`{/* Upload Area */}
<div className="border rounded-lg p-6 
  flex flex-col items-center text-center space-y-4 
  border-dashed">
  <div className="h-12 w-12 rounded-lg bg-muted 
    flex items-center justify-center">
    <Upload className="h-6 w-6 text-muted-foreground" />
  </div>
  <div className="space-y-1">
    <p className="text-sm font-medium">
      Arraste arquivos aqui
    </p>
    <p className="text-xs text-muted-foreground">
      ou clique para selecionar
    </p>
  </div>
  <Button variant="outline" size="sm">
    <FolderOpen className="h-4 w-4" />
    Procurar
  </Button>
</div>`} 
                label="Upload Dropzone"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Lista Vazia (Sucesso) */}
<div className="border rounded-lg p-4 space-y-3">
  <div className="flex items-center justify-between">
    <h4 className="text-sm font-medium">Alertas</h4>
    <Badge variant="secondary">0</Badge>
  </div>
  <div className="py-8 flex flex-col items-center 
    text-center space-y-2">
    <CheckCircle className="h-10 w-10 text-success/50" />
    <div>
      <p className="text-sm font-medium">Nenhum alerta</p>
      <p className="text-xs text-muted-foreground">
        Sistema funcionando normalmente
      </p>
    </div>
  </div>
</div>`} 
                label="Lista Vazia (Sucesso)"
              />
              <CodeBlock 
                code={`{/* Filtros Restritivos */}
<div className="border rounded-lg p-6 
  flex flex-col items-center text-center space-y-4">
  <div className="h-12 w-12 rounded-lg bg-warning/10 
    flex items-center justify-center">
    <Filter className="h-6 w-6 text-warning" />
  </div>
  <div className="space-y-1">
    <p className="text-sm font-medium">
      Filtros muito restritivos
    </p>
    <p className="text-xs text-muted-foreground">
      Tente ajustar os filtros
    </p>
  </div>
  <Button variant="ghost" size="sm">
    <X className="h-4 w-4" />
    Limpar Filtros
  </Button>
</div>`} 
                label="Filtros Restritivos"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorStatesSection() {
  return (
    <div className="space-y-6">
      {/* HTTP Error Pages */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-primary" />
            Páginas de Erro HTTP
          </CardTitle>
          <CardDescription>Estados para erros de navegação e servidor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 404 Not Found */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-warning/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-display font-bold text-warning/20">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="h-12 w-12 text-warning" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-semibold">Página não encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  A página que você está procurando não existe ou foi movida.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient">
                  <Home className="h-4 w-4" />
                  Ir para Início
                </Button>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </div>

            {/* 500 Server Error */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-destructive/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-display font-bold text-destructive/20">500</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Server className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-semibold">Erro no Servidor</h3>
                <p className="text-sm text-muted-foreground">
                  Algo deu errado em nossos servidores. Estamos trabalhando para resolver.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button variant="ghost">
                  <HelpCircle className="h-4 w-4" />
                  Suporte
                </Button>
              </div>
            </div>

            {/* 403 Forbidden */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-orange-500/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-display font-bold text-orange-500/20">403</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-12 w-12 text-orange-500" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-semibold">Acesso Negado</h3>
                <p className="text-sm text-muted-foreground">
                  Você não tem permissão para acessar este recurso.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient">
                  <Key className="h-4 w-4" />
                  Fazer Login
                </Button>
                <Button variant="outline">
                  <Home className="h-4 w-4" />
                  Ir para Início
                </Button>
              </div>
            </div>

            {/* 503 Service Unavailable */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-info/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-display font-bold text-info/20">503</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="h-12 w-12 text-info" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-semibold">Em Manutenção</h3>
                <p className="text-sm text-muted-foreground">
                  O sistema está temporariamente indisponível para manutenção programada.
                </p>
              </div>
              <Button variant="outline">
                <Clock className="h-4 w-4" />
                Verificar Status
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Erro 404 */}
<div className="border rounded-xl p-8 
  bg-gradient-to-br from-warning/5 to-transparent 
  flex flex-col items-center text-center space-y-6">
  <div className="relative">
    <div className="text-8xl font-display font-bold 
      text-warning/20">404</div>
    <div className="absolute inset-0 flex items-center 
      justify-center">
      <Search className="h-12 w-12 text-warning" />
    </div>
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-xl font-semibold">
      Página não encontrada
    </h3>
    <p className="text-sm text-muted-foreground">
      A página não existe ou foi movida.
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="gradient">
      <Home className="h-4 w-4" /> Início
    </Button>
    <Button variant="outline">
      <ArrowLeft className="h-4 w-4" /> Voltar
    </Button>
  </div>
</div>`} 
                label="Erro 404"
              />
              <CodeBlock 
                code={`{/* Erro 500 */}
<div className="border rounded-xl p-8 
  bg-gradient-to-br from-destructive/5 to-transparent 
  flex flex-col items-center text-center space-y-6">
  <div className="relative">
    <div className="text-8xl font-display font-bold 
      text-destructive/20">500</div>
    <div className="absolute inset-0 flex items-center 
      justify-center">
      <Server className="h-12 w-12 text-destructive" />
    </div>
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-xl font-semibold">
      Erro no Servidor
    </h3>
    <p className="text-sm text-muted-foreground">
      Algo deu errado. Estamos resolvendo.
    </p>
  </div>
  <Button variant="outline">
    <RefreshCw className="h-4 w-4" /> Tentar Novamente
  </Button>
</div>`} 
                label="Erro 500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inline Error States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Erros Inline
          </CardTitle>
          <CardDescription>Estados de erro dentro de componentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form Field Error */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Campo com Erro</h4>
              <div className="space-y-2">
                <Label htmlFor="error-input" className="text-destructive">Email</Label>
                <Input 
                  id="error-input" 
                  placeholder="seu@email.com" 
                  className="border-destructive focus-visible:ring-destructive"
                  defaultValue="email-invalido"
                />
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Por favor, insira um email válido
                </p>
              </div>
            </div>

            {/* Card with Error */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Card com Erro</h4>
              <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Falha ao carregar dados</h4>
                    <p className="text-xs text-muted-foreground">
                      Não foi possível conectar ao servidor. Verifique sua conexão.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-3 w-3" />
                  Tentar Novamente
                </Button>
              </div>
            </div>

            {/* Failed API Request */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Requisição Falhou</h4>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GET /api/jobs</span>
                  <Badge variant="destructive">500</Badge>
                </div>
                <div className="bg-destructive/10 rounded p-3">
                  <code className="text-xs text-destructive">
                    Error: Internal Server Error - Database connection failed
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3" />
                    Copy Error
                  </Button>
                </div>
              </div>
            </div>

            {/* Validation Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resumo de Validação</h4>
              <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-destructive">Corrija os erros abaixo</h4>
                    <p className="text-xs text-muted-foreground">3 campos precisam de atenção</p>
                  </div>
                </div>
                <ul className="space-y-1 text-xs text-destructive">
                  <li className="flex items-center gap-2">
                    <MinusCircle className="h-3 w-3" />
                    Nome é obrigatório
                  </li>
                  <li className="flex items-center gap-2">
                    <MinusCircle className="h-3 w-3" />
                    Email inválido
                  </li>
                  <li className="flex items-center gap-2">
                    <MinusCircle className="h-3 w-3" />
                    Senha deve ter no mínimo 8 caracteres
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Campo com Erro */}
<div className="space-y-2">
  <Label className="text-destructive">Email</Label>
  <Input 
    className="border-destructive 
      focus-visible:ring-destructive"
    defaultValue="email-invalido"
  />
  <p className="text-xs text-destructive 
    flex items-center gap-1">
    <AlertCircle className="h-3 w-3" />
    Por favor, insira um email válido
  </p>
</div>`} 
                label="Campo com Erro"
              />
              <CodeBlock 
                code={`{/* Card com Erro */}
<div className="border border-destructive/50 
  rounded-lg p-4 bg-destructive/5 space-y-3">
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-full bg-destructive/10 
      flex items-center justify-center flex-shrink-0">
      <XCircle className="h-4 w-4 text-destructive" />
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium">
        Falha ao carregar dados
      </h4>
      <p className="text-xs text-muted-foreground">
        Não foi possível conectar ao servidor.
      </p>
    </div>
  </div>
  <Button variant="outline" size="sm" className="w-full">
    <RefreshCw className="h-3 w-3" /> Tentar Novamente
  </Button>
</div>`} 
                label="Card com Erro"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Requisição Falhou */}
<div className="border rounded-lg p-4 space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">
      GET /api/jobs
    </span>
    <Badge variant="destructive">500</Badge>
  </div>
  <div className="bg-destructive/10 rounded p-3">
    <code className="text-xs text-destructive">
      Error: Internal Server Error
    </code>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" size="sm">
      <RefreshCw className="h-3 w-3" /> Retry
    </Button>
    <Button variant="ghost" size="sm">
      <Copy className="h-3 w-3" /> Copy Error
    </Button>
  </div>
</div>`} 
                label="Requisição Falhou"
              />
              <CodeBlock 
                code={`{/* Resumo de Validação */}
<div className="border border-destructive/50 
  rounded-lg p-4 bg-destructive/5">
  <div className="flex items-start gap-3 mb-3">
    <AlertTriangle className="h-5 w-5 text-destructive 
      flex-shrink-0" />
    <div>
      <h4 className="text-sm font-medium text-destructive">
        Corrija os erros abaixo
      </h4>
      <p className="text-xs text-muted-foreground">
        3 campos precisam de atenção
      </p>
    </div>
  </div>
  <ul className="space-y-1 text-xs text-destructive">
    <li className="flex items-center gap-2">
      <MinusCircle className="h-3 w-3" />
      Nome é obrigatório
    </li>
    <li className="flex items-center gap-2">
      <MinusCircle className="h-3 w-3" />
      Email inválido
    </li>
  </ul>
</div>`} 
                label="Resumo de Validação"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Error States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Estados Críticos
          </CardTitle>
          <CardDescription>Erros que requerem atenção imediata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Session Expired */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-warning/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-warning/20 flex items-center justify-center">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Sessão Expirada</h3>
                <p className="text-sm text-muted-foreground">
                  Sua sessão expirou por inatividade. Faça login novamente.
                </p>
              </div>
              <Button variant="gradient">
                <Key className="h-4 w-4" />
                Fazer Login
              </Button>
            </div>

            {/* Connection Lost */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-destructive/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                <WifiOff className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Conexão Perdida</h3>
                <p className="text-sm text-muted-foreground">
                  Conexão com o servidor foi interrompida. Reconectando...
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Tentando reconectar...
              </div>
            </div>

            {/* Unsaved Changes */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-info/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-info/20 flex items-center justify-center">
                <Save className="h-8 w-8 text-info" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Alterações não salvas</h3>
                <p className="text-sm text-muted-foreground">
                  Você tem alterações que não foram salvas. Deseja continuar?
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient-success" size="sm">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Descartar
                </Button>
              </div>
            </div>

            {/* Rate Limited */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-orange-500/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Limite Atingido</h3>
                <p className="text-sm text-muted-foreground">
                  Muitas requisições. Aguarde antes de tentar novamente.
                </p>
              </div>
              <div className="text-2xl font-mono font-bold text-orange-500">
                00:42
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Sessão Expirada */}
<div className="border rounded-xl p-6 
  bg-gradient-to-br from-warning/10 to-transparent 
  flex flex-col items-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-warning/20 
    flex items-center justify-center">
    <Clock className="h-8 w-8 text-warning" />
  </div>
  <div className="space-y-1">
    <h3 className="font-semibold">Sessão Expirada</h3>
    <p className="text-sm text-muted-foreground">
      Sua sessão expirou. Faça login novamente.
    </p>
  </div>
  <Button variant="gradient">
    <Key className="h-4 w-4" /> Fazer Login
  </Button>
</div>`} 
                label="Sessão Expirada"
              />
              <CodeBlock 
                code={`{/* Conexão Perdida */}
<div className="border rounded-xl p-6 
  bg-gradient-to-br from-destructive/10 to-transparent 
  flex flex-col items-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-destructive/20 
    flex items-center justify-center animate-pulse">
    <WifiOff className="h-8 w-8 text-destructive" />
  </div>
  <div className="space-y-1">
    <h3 className="font-semibold">Conexão Perdida</h3>
    <p className="text-sm text-muted-foreground">
      Conexão interrompida. Reconectando...
    </p>
  </div>
  <div className="flex items-center gap-2 text-xs 
    text-muted-foreground">
    <Loader2 className="h-3 w-3 animate-spin" />
    Tentando reconectar...
  </div>
</div>`} 
                label="Conexão Perdida"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Alterações não salvas */}
<div className="border rounded-xl p-6 
  bg-gradient-to-br from-info/10 to-transparent 
  flex flex-col items-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-info/20 
    flex items-center justify-center">
    <Save className="h-8 w-8 text-info" />
  </div>
  <div className="space-y-1">
    <h3 className="font-semibold">Alterações não salvas</h3>
    <p className="text-sm text-muted-foreground">
      Deseja continuar sem salvar?
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="gradient-success" size="sm">
      <Save className="h-4 w-4" /> Salvar
    </Button>
    <Button variant="destructive" size="sm">
      <Trash2 className="h-4 w-4" /> Descartar
    </Button>
  </div>
</div>`} 
                label="Alterações não salvas"
              />
              <CodeBlock 
                code={`{/* Rate Limited */}
<div className="border rounded-xl p-6 
  bg-gradient-to-br from-orange-500/10 to-transparent 
  flex flex-col items-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-orange-500/20 
    flex items-center justify-center">
    <Shield className="h-8 w-8 text-orange-500" />
  </div>
  <div className="space-y-1">
    <h3 className="font-semibold">Limite Atingido</h3>
    <p className="text-sm text-muted-foreground">
      Muitas requisições. Aguarde.
    </p>
  </div>
  <div className="text-2xl font-mono font-bold 
    text-orange-500">
    00:42
  </div>
</div>`} 
                label="Rate Limited"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeToggleSection() {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-warning" />
            <Moon className="h-5 w-5 text-primary" />
            Theme Toggle
          </CardTitle>
          <CardDescription>
            Componente para alternar entre temas claro e escuro com animações cinematográficas e feedback sonoro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Live Demo */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Demonstração</h4>
            <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-xl border">
              <ThemeToggle />
              <div className="text-sm text-muted-foreground">
                <p>Clique para trocar o tema ou use o dropdown para opções.</p>
                <p className="text-xs mt-1">Clique com botão direito ou pressione para ver menu com opção de som.</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recursos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-warning animate-[spin_8s_linear_infinite]" />
                  <span className="font-medium">Animação Solar</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ícone do sol gira lentamente (8s) em modo claro com glow dourado.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary animate-pulse" />
                  <span className="font-medium">Pulsação Lunar</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ícone da lua pulsa suavemente (3s) em modo escuro com glow azulado.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">Overlay Cinematográfico</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Transição com gradiente radial e blur suave ao trocar de tema.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-success" />
                  <span className="font-medium">Feedback Sonoro</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sons distintos: chime ascendente (claro) e tom descendente (escuro).
                </p>
              </div>
            </div>
          </div>

          {/* Sound Control */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Controle de Som</h4>
            <div className="p-4 rounded-lg bg-muted/20 border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted/40">
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Preferência Persistida</p>
                  <p className="text-sm text-muted-foreground">
                    A opção de som é salva em <code className="text-primary text-xs">localStorage</code> e 
                    persiste entre sessões. Um indicador visual aparece quando o som está desativado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Code */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Como Usar</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`import { ThemeToggle } from '@/components/layout/ThemeToggle';

// No seu componente:
<ThemeToggle />`}
              </pre>
            </div>
          </div>

          {/* Hook Usage */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hook useThemeSound</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`import { useThemeSound } from '@/hooks/useThemeSound';

const { 
  playLightModeSound,  // Toca som de tema claro
  playDarkModeSound,   // Toca som de tema escuro
  soundEnabled,        // Estado atual do som
  toggleSound          // Alternar som on/off
} = useThemeSound();`}
              </pre>
            </div>
          </div>

          {/* Transitions */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transições Globais</h4>
            <p className="text-sm text-muted-foreground">
              Ao trocar de tema, transições suaves são aplicadas automaticamente a:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">background-color</Badge>
              <Badge variant="outline">border-color</Badge>
              <Badge variant="outline">color</Badge>
              <Badge variant="outline">box-shadow</Badge>
              <Badge variant="outline">filter</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Duração: 0.3s-0.4s com <code className="text-primary">cubic-bezier(0.4, 0, 0.2, 1)</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customization Examples Card */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Customização de Animações
          </CardTitle>
          <CardDescription>
            Exemplos de como personalizar as animações do ThemeToggle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Sun Animation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Animação do Sol</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`/* Rotação lenta contínua - padrão */
.sun-icon {
  animation: spin 8s linear infinite;
  filter: drop-shadow(0 0 6px hsl(var(--warning) / 0.6));
}

/* Rotação mais rápida */
.sun-icon-fast {
  animation: spin 3s linear infinite;
}

/* Pulsação ao invés de rotação */
.sun-icon-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Brilho intermitente */
@keyframes sun-glow {
  0%, 100% { filter: drop-shadow(0 0 4px hsl(var(--warning) / 0.4)); }
  50% { filter: drop-shadow(0 0 12px hsl(var(--warning) / 0.8)); }
}
.sun-icon-glow {
  animation: sun-glow 2s ease-in-out infinite;
}`}
              </pre>
            </div>
          </div>

          {/* Custom Moon Animation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Animação da Lua</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`/* Pulsação suave - padrão */
.moon-icon {
  animation: pulse 3s ease-in-out infinite;
  filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.6));
}

/* Flutuação vertical */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
.moon-icon-float {
  animation: float 3s ease-in-out infinite;
}

/* Brilho de estrelas ao redor */
@keyframes twinkle {
  0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px hsl(var(--primary) / 0.5)); }
  50% { opacity: 0.8; filter: drop-shadow(0 0 12px hsl(var(--primary) / 0.9)); }
}
.moon-icon-twinkle {
  animation: twinkle 2s ease-in-out infinite;
}`}
              </pre>
            </div>
          </div>

          {/* Custom Transition Overlay */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overlay de Transição</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`/* Gradiente radial cinematográfico - padrão */
.theme-overlay-dark {
  background: radial-gradient(
    circle at center,
    hsl(var(--primary) / 0.15) 0%,
    hsl(222 47% 8% / 0.4) 100%
  );
  backdrop-filter: blur(2px);
}

.theme-overlay-light {
  background: radial-gradient(
    circle at center,
    hsl(var(--warning) / 0.2) 0%,
    hsl(220 20% 97% / 0.5) 100%
  );
}

/* Efeito de cortina horizontal */
@keyframes curtain {
  0% { transform: scaleX(0); transform-origin: left; }
  50% { transform: scaleX(1); transform-origin: left; }
  51% { transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}

/* Efeito de círculo expandindo */
@keyframes circle-expand {
  0% { clip-path: circle(0% at center); }
  100% { clip-path: circle(150% at center); }
}`}
              </pre>
            </div>
          </div>

          {/* Custom Sound Effects */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Efeitos Sonoros Customizados</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`// Customizar frequências e duração dos sons
const playCustomLightSound = () => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // Frequência inicial e final
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.2);
  
  // Envelope de volume
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
};

// Adicionar harmônicos para som mais rico
const addHarmonic = (ctx, baseFreq, multiplier, delay) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = baseFreq * multiplier;
  gain.gain.value = 0.02 / multiplier; // Harmônicos mais fracos
  // ... configurar envelope
};`}
              </pre>
            </div>
          </div>

          {/* CSS Variables */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variáveis CSS Relevantes</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`:root {
  /* Cores principais para temas */
  --background: 220 20% 97%;      /* Fundo light mode */
  --foreground: 222 47% 12%;      /* Texto light mode */
  --primary: 222 47% 50%;         /* Cor primária (lua) */
  --warning: 38 92% 50%;          /* Cor de warning (sol) */
  
  /* Transições globais */
  --theme-transition: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark {
  --background: 222 47% 8%;       /* Fundo dark mode */
  --foreground: 220 20% 95%;      /* Texto dark mode */
}

/* Aplicar transições suaves */
html, body, .bg-background, .bg-card {
  transition: 
    background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`}
              </pre>
            </div>
          </div>

          {/* Animation Timing Tips */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dicas de Timing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <span className="font-medium">Easing Functions</span>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><code className="text-primary">ease-out</code> - Entrada rápida, saída suave</li>
                  <li><code className="text-primary">ease-in-out</code> - Suave nos dois lados</li>
                  <li><code className="text-primary">cubic-bezier(0.34,1.56,0.64,1)</code> - Efeito "bounce"</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <span className="font-medium">Durações Recomendadas</span>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><code className="text-primary">150ms</code> - Micro-interações</li>
                  <li><code className="text-primary">300-400ms</code> - Transições de tema</li>
                  <li><code className="text-primary">500-600ms</code> - Overlay cinematográfico</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Back to Overview Button Component
function BackToOverviewButton({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => onNavigate('overview')}
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar ao Overview
    </Button>
  );
}

// Overview Section Component
interface OverviewSectionProps {
  onNavigate: (tabId: string) => void;
}

function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const [animatedValues, setAnimatedValues] = useState({ categories: 0, components: 0, variants: 0, copiable: 0 });

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = { categories: 20, components: 150, variants: 50, copiable: 100 };
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Bounce easing function
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Add overshoot for bounce effect at the end
      const bounceProgress = progress >= 0.8 
        ? 1 + Math.sin((progress - 0.8) * 5 * Math.PI) * 0.1 * (1 - progress) * 5
        : eased;
      
      const finalProgress = Math.min(1, Math.max(0, progress >= 0.95 ? 1 : bounceProgress));
      
      setAnimatedValues({
        categories: Math.round(targets.categories * finalProgress),
        components: Math.round(targets.components * finalProgress),
        variants: Math.round(targets.variants * finalProgress),
        copiable: Math.round(targets.copiable * finalProgress),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'buttons', icon: Zap, title: 'Botões', description: '12 variantes de botões incluindo gradient, glow e premium', count: 12 },
    { id: 'forms', icon: Edit, title: 'Formulários', description: 'Inputs, selects, checkboxes, radio buttons e mais', count: 8 },
    { id: 'modals', icon: Layers, title: 'Modais', description: 'Dialog, AlertDialog, Sheet e Drawer', count: 4 },
    { id: 'tooltips', icon: MessageSquare, title: 'Tooltips', description: 'Tooltips, Popovers e HoverCards', count: 3 },
    { id: 'tables', icon: TableIcon, title: 'Tabelas', description: 'Tabelas com zebra, badges, ações e paginação', count: 5 },
    { id: 'navigation', icon: Navigation, title: 'Navegação', description: 'Breadcrumbs, Tabs, Navigation Menu', count: 4 },
    { id: 'cards', icon: Square, title: 'Cards', description: '8 variantes incluindo stat, premium e glass', count: 8 },
    { id: 'badges', icon: Tag, title: 'Badges', description: 'Status badges com variantes coloridas', count: 6 },
    { id: 'progress', icon: Activity, title: 'Progress', description: 'Barras de progresso com variantes', count: 4 },
    { id: 'icons', icon: Sparkles, title: 'Ícones', description: 'Biblioteca completa de ícones Lucide', count: 150 },
    { id: 'typography', icon: Type, title: 'Tipografia', description: 'Hierarquia tipográfica e fontes', count: 6 },
    { id: 'spacing', icon: Ruler, title: 'Spacing', description: 'Escala de espaçamentos e gaps', count: 12 },
    { id: 'shadows', icon: Layers, title: 'Sombras', description: 'Sombras e elevações para cards', count: 5 },
    { id: 'animations', icon: Play, title: 'Animações', description: 'Entry, hover, stagger e glow effects', count: 20 },
    { id: 'colors', icon: Palette, title: 'Cores', description: 'Paleta de cores semânticas do sistema', count: 16 },
    { id: 'feedback', icon: Bell, title: 'Feedback', description: 'Alerts, Toasts e Skeletons', count: 6 },
    { id: 'loading', icon: Loader2, title: 'Loading', description: 'Spinners, progress e estados de loading', count: 5 },
    { id: 'empty', icon: Package, title: 'Empty States', description: 'Estados vazios com CTAs e ilustrações', count: 8 },
    { id: 'errors', icon: AlertCircle, title: 'Error States', description: 'Páginas de erro HTTP e inline', count: 10 },
    { id: 'theme', icon: Sun, title: 'Theme Toggle', description: 'Alternador de tema com animações', count: 2 },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 12 + 6}px`,
              height: `${Math.random() * 12 + 6}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `hsl(var(--${['primary', 'success', 'warning', 'info'][i % 4]}))`,
              opacity: 0.15 + Math.random() * 0.15,
              filter: `blur(${Math.random() * 2 + 1}px)`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="stat" className="hover-lift-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                <LayoutGrid className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary tabular-nums drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]">{animatedValues.categories}</div>
                <p className="text-xs text-muted-foreground">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat" className="hover-lift-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-success/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--success)/0.4)]">
                <Layers className="h-5 w-5 text-success transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success tabular-nums drop-shadow-[0_0_10px_hsl(var(--success)/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]">{animatedValues.components}+</div>
                <p className="text-xs text-muted-foreground">Componentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat" className="hover-lift-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-warning/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--warning)/0.4)]">
                <Sparkles className="h-5 w-5 text-warning transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning tabular-nums drop-shadow-[0_0_10px_hsl(var(--warning)/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]">{animatedValues.variants}+</div>
                <p className="text-xs text-muted-foreground">Variantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat" className="hover-lift-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-info/5 via-transparent to-info/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--info)/0.4)]">
                <Copy className="h-5 w-5 text-info transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <div className="text-2xl font-bold text-info tabular-nums drop-shadow-[0_0_10px_hsl(var(--info)/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]">{animatedValues.copiable}%</div>
                <p className="text-xs text-muted-foreground">Copiável</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Categorias do Design System
          </CardTitle>
          <CardDescription>
            Clique em qualquer card abaixo para navegar diretamente para a categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => onNavigate(category.id)}
                  className="group relative p-4 rounded-xl bg-card/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover-lift-sm animate-fade-in before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-border before:transition-all before:duration-300 hover:before:bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--primary)))] hover:before:bg-[length:200%_200%] hover:before:animate-[gradient-shift_2s_ease_infinite] before:-z-10 after:absolute after:inset-[1px] after:rounded-[11px] after:bg-card/50 group-hover:after:bg-primary/5 after:transition-all after:duration-300 after:-z-10"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300">
                      <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-sm truncate">{category.title}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-amber-500" />
            Como Usar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              <div>
                <h4 className="font-medium text-sm">Navegue pelas abas</h4>
                <p className="text-xs text-muted-foreground mt-1">Explore cada categoria usando o menu de abas acima</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
              <div>
                <h4 className="font-medium text-sm">Visualize exemplos</h4>
                <p className="text-xs text-muted-foreground mt-1">Veja os componentes renderizados com suas variantes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
              <div>
                <h4 className="font-medium text-sm">Copie o código</h4>
                <p className="text-xs text-muted-foreground mt-1">Use os CodeBlocks para copiar e colar no seu projeto</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
