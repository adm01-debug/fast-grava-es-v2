import React, { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-media';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Context para layout
interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayout must be used within LayoutProvider');
  return context;
}

// Provider de layout
interface LayoutProviderProps {
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
  defaultSidebarCollapsed?: boolean;
}

export function LayoutProvider({ 
  children, 
  defaultSidebarOpen = true,
  defaultSidebarCollapsed = false 
}: LayoutProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
}

// Layout com sidebar responsiva
interface ResponsiveSidebarLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarWidth?: string;
  collapsedWidth?: string;
  className?: string;
}

export function ResponsiveSidebarLayout({
  children,
  sidebar,
  header,
  footer,
  sidebarWidth = '280px',
  collapsedWidth = '64px',
  className
}: ResponsiveSidebarLayoutProps) {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useLayout();
  const { isMobile } = useBreakpoint();

  const actualWidth = sidebarCollapsed ? collapsedWidth : sidebarWidth;

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {header && (
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex items-center h-14 px-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {header}
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {/* Overlay mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full bg-background border-r transition-transform duration-300',
            isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'relative translate-x-0',
            header && !isMobile && 'top-14 h-[calc(100vh-3.5rem)]'
          )}
          style={{ width: isMobile ? sidebarWidth : actualWidth }}
        >
          <div className="flex flex-col h-full">
            {isMobile && (
              <div className="flex justify-end p-2">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <div className="flex-1 overflow-auto">
              {sidebar}
            </div>

            {!isMobile && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main 
          className="flex-1 overflow-auto"
          style={{ marginLeft: isMobile ? 0 : actualWidth }}
        >
          {children}
        </main>
      </div>

      {footer && (
        <footer className="border-t bg-background">
          {footer}
        </footer>
      )}
    </div>
  );
}

// Grid responsivo
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: { default: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = '1rem',
  className 
}: ResponsiveGridProps) {
  return (
    <div 
      className={cn('grid', className)}
      style={{
        gap,
        gridTemplateColumns: `repeat(${cols.default}, minmax(0, 1fr))`
      }}
    >
      <style>{`
        @media (min-width: 640px) {
          .responsive-grid { grid-template-columns: repeat(${cols.sm || cols.default}, minmax(0, 1fr)); }
        }
        @media (min-width: 768px) {
          .responsive-grid { grid-template-columns: repeat(${cols.md || cols.sm || cols.default}, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .responsive-grid { grid-template-columns: repeat(${cols.lg || cols.md || cols.sm || cols.default}, minmax(0, 1fr)); }
        }
        @media (min-width: 1280px) {
          .responsive-grid { grid-template-columns: repeat(${cols.xl || cols.lg || cols.md || cols.sm || cols.default}, minmax(0, 1fr)); }
        }
      `}</style>
      {children}
    </div>
  );
}

// Container responsivo
interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Container({ children, size = 'lg', className }: ContainerProps) {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 w-full', maxWidths[size], className)}>
      {children}
    </div>
  );
}

// Stack responsivo
interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'responsive';
  gap?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  className?: string;
}

export function Stack({ 
  children, 
  direction = 'column', 
  gap = '1rem',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className 
}: StackProps) {
  const alignMap = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };
  const justifyMap = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around' };
  
  const directionClass = direction === 'responsive' 
    ? 'flex-col sm:flex-row' 
    : direction === 'row' ? 'flex-row' : 'flex-col';

  return (
    <div 
      className={cn(
        'flex',
        directionClass,
        alignMap[align],
        justifyMap[justify],
        wrap && 'flex-wrap',
        className
      )}
      style={{ gap }}
    >
      {children}
    </div>
  );
}

// Componente para esconder em breakpoints específicos
interface HideOnProps {
  children: React.ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
}

export function HideOn({ children, mobile, tablet, desktop }: HideOnProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  if ((mobile && isMobile) || (tablet && isTablet) || (desktop && isDesktop)) {
    return null;
  }

  return <>{children}</>;
}

// Componente para mostrar apenas em breakpoints específicos
interface ShowOnProps {
  children: React.ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
}

export function ShowOn({ children, mobile, tablet, desktop }: ShowOnProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  if ((mobile && isMobile) || (tablet && isTablet) || (desktop && isDesktop)) {
    return <>{children}</>;
  }

  return null;
}

// Layout de duas colunas responsivo
interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  gap?: string;
  reverseOnMobile?: boolean;
  stackOnMobile?: boolean;
  className?: string;
}

export function TwoColumnLayout({
  left,
  right,
  leftWidth = '1fr',
  rightWidth = '1fr',
  gap = '2rem',
  reverseOnMobile = false,
  stackOnMobile = true,
  className
}: TwoColumnLayoutProps) {
  const { isMobile } = useBreakpoint();

  if (isMobile && stackOnMobile) {
    return (
      <div className={cn('flex flex-col', className)} style={{ gap }}>
        {reverseOnMobile ? (
          <>
            {right}
            {left}
          </>
        ) : (
          <>
            {left}
            {right}
          </>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn('grid', className)}
      style={{ 
        gridTemplateColumns: `${leftWidth} ${rightWidth}`,
        gap 
      }}
    >
      {left}
      {right}
    </div>
  );
}

// Aspect ratio container
interface AspectRatioContainerProps {
  children: React.ReactNode;
  ratio?: number;
  className?: string;
}

export function AspectRatioContainer({ 
  children, 
  ratio = 16 / 9, 
  className 
}: AspectRatioContainerProps) {
  return (
    <div 
      className={cn('relative w-full', className)}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
