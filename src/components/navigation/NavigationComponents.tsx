import React, { useState, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Home, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Tipos
interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  badge?: string | number;
  disabled?: boolean;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Context para navegação
interface NavigationContextType {
  activeItem: string | null;
  setActiveItem: (item: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  return (
    <NavigationContext.Provider value={{ activeItem, setActiveItem }}>
      {children}
    </NavigationContext.Provider>
  );
}

// Breadcrumbs
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  homeHref?: string;
  className?: string;
}

export function Breadcrumbs({ 
  items, 
  separator = '/', 
  maxItems = 4,
  homeHref = '/',
  className 
}: BreadcrumbsProps) {
  const allItems = [{ label: 'Home', href: homeHref }, ...items];
  
  let displayItems = allItems;
  let collapsed = false;
  
  if (allItems.length > maxItems) {
    displayItems = [
      allItems[0],
      { label: '...', href: undefined },
      ...allItems.slice(-2)
    ];
    collapsed = true;
  }

  return (
    <nav className={cn('flex items-center text-sm text-muted-foreground', className)}>
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="mx-2 text-muted-foreground/50">{separator}</span>
          )}
          {item.label === '...' && collapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {allItems.slice(1, -2).map((hiddenItem, i) => (
                  <DropdownMenuItem key={i} asChild>
                    {hiddenItem.href ? (
                      <Link to={hiddenItem.href}>{hiddenItem.label}</Link>
                    ) : (
                      <span>{hiddenItem.label}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : item.href && index < displayItems.length - 1 ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="h-3.5 w-3.5" />}
              {index > 0 && item.label}
            </Link>
          ) : (
            <span className={cn(index === displayItems.length - 1 && 'text-foreground font-medium')}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Menu de navegação lateral
interface SideNavProps {
  items: NavItem[];
  collapsed?: boolean;
  className?: string;
}

export function SideNav({ items, collapsed = false, className }: SideNavProps) {
  const location = useLocation();

  return (
    <nav className={cn('flex flex-col gap-1 p-2', className)}>
      {items.map((item, index) => (
        <SideNavItem 
          key={index} 
          item={item} 
          collapsed={collapsed}
          isActive={item.href === location.pathname}
        />
      ))}
    </nav>
  );
}

interface SideNavItemProps {
  item: NavItem;
  collapsed?: boolean;
  isActive?: boolean;
  depth?: number;
}

function SideNavItem({ item, collapsed, isActive, depth = 0 }: SideNavItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const location = useLocation();

  const content = (
    <>
      {item.icon && <span className="shrink-0">{item.icon}</span>}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          )}
        </>
      )}
    </>
  );

  const baseClass = cn(
    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    isActive && 'bg-accent text-accent-foreground font-medium',
    item.disabled && 'opacity-50 cursor-not-allowed',
    depth > 0 && 'ml-4'
  );

  if (hasChildren) {
    return (
      <div>
        <button 
          className={cn(baseClass, 'w-full')}
          onClick={() => setExpanded(!expanded)}
          disabled={item.disabled}
        >
          {content}
        </button>
        {expanded && !collapsed && (
          <div className="mt-1">
            {item.children!.map((child, index) => (
              <SideNavItem 
                key={index} 
                item={child} 
                depth={depth + 1}
                isActive={child.href === location.pathname}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.href) {
    return (
      <Link to={item.href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClass}>
      {content}
    </div>
  );
}

// Tabs de navegação
interface NavTabsProps {
  items: { label: string; value: string; icon?: React.ReactNode; disabled?: boolean }[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NavTabs({ 
  items, 
  value, 
  onChange, 
  variant = 'default',
  size = 'md',
  className 
}: NavTabsProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5'
  };

  const variantClasses = {
    default: 'bg-muted rounded-lg p-1',
    pills: 'gap-2',
    underline: 'border-b gap-4'
  };

  const itemVariantClasses = {
    default: (isActive: boolean) => cn(
      'rounded-md transition-colors',
      isActive ? 'bg-background shadow-sm' : 'hover:bg-background/50'
    ),
    pills: (isActive: boolean) => cn(
      'rounded-full transition-colors',
      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
    ),
    underline: (isActive: boolean) => cn(
      'border-b-2 -mb-px transition-colors',
      isActive ? 'border-primary text-foreground' : 'border-transparent hover:border-muted-foreground/30'
    )
  };

  return (
    <div className={cn('flex items-center', variantClasses[variant], className)}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          disabled={item.disabled}
          className={cn(
            'flex items-center gap-2 font-medium',
            sizeClasses[size],
            itemVariantClasses[variant](value === item.value),
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

// Botão voltar
interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallbackHref = '/', label = 'Voltar', className }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackHref);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleClick}
      className={cn('gap-2', className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}

// Stepper de navegação
interface StepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({ 
  steps, 
  currentStep, 
  onStepClick,
  orientation = 'horizontal',
  className 
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'items-center' : 'flex-col gap-4',
      className
    )}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && (isCompleted || index <= currentStep);

        return (
          <React.Fragment key={index}>
            <div 
              className={cn(
                'flex items-center gap-3',
                isClickable && 'cursor-pointer'
              )}
              onClick={() => isClickable && onStepClick?.(index)}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className={cn(!isHorizontal && 'flex-1')}>
                <p className={cn(
                  'text-sm font-medium',
                  (isCompleted || isCurrent) && 'text-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={cn(
                isHorizontal ? 'flex-1 h-0.5 mx-4' : 'w-0.5 h-8 ml-4',
                isCompleted ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Pagination
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className
}: PaginationProps) {
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3;
    
    if (totalPages <= totalNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      return [...range(1, leftItemCount), '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      return [1, '...', ...range(totalPages - rightItemCount + 1, totalPages)];
    }

    return [1, '...', ...range(leftSiblingIndex, rightSiblingIndex), '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          ««
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        «
      </Button>

      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 text-muted-foreground">...</span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        »
      </Button>
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          »»
        </Button>
      )}
    </div>
  );
}

// Quick Actions Menu
interface QuickAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  shortcut?: string;
}

interface QuickActionsMenuProps {
  actions: QuickAction[];
  trigger?: React.ReactNode;
  className?: string;
}

export function QuickActionsMenu({ actions, trigger, className }: QuickActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem key={index} onClick={action.onClick}>
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2">
                {action.icon}
                {action.label}
              </div>
              {action.shortcut && (
                <span className="text-xs text-muted-foreground">{action.shortcut}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
