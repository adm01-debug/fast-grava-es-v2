import React, { ReactNode, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  GripVertical,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDevice } from '@/hooks/use-device';

interface SplitViewProps {
  // Panels
  left: ReactNode;
  right: ReactNode;
  
  // Titles
  leftTitle?: string;
  rightTitle?: string;
  
  // Layout
  defaultRatio?: number; // 0-100 percentage for left panel
  minLeftWidth?: number;
  minRightWidth?: number;
  collapsible?: 'left' | 'right' | 'both' | 'none';
  defaultCollapsed?: 'left' | 'right' | null;
  
  // Behavior
  resizable?: boolean;
  syncScroll?: boolean;
  preserveState?: boolean;
  
  // Mobile
  mobileStack?: 'left-first' | 'right-first';
  mobileShowToggle?: boolean;
  
  // Styling
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
  dividerClassName?: string;
  
  // Callbacks
  onRatioChange?: (ratio: number) => void;
  onCollapse?: (panel: 'left' | 'right') => void;
  onExpand?: (panel: 'left' | 'right') => void;
}

export function SplitView({
  left,
  right,
  leftTitle,
  rightTitle,
  defaultRatio = 50,
  minLeftWidth = 200,
  minRightWidth = 200,
  collapsible = 'both',
  defaultCollapsed = null,
  resizable = true,
  syncScroll = false,
  preserveState = true,
  mobileStack = 'left-first',
  mobileShowToggle = true,
  className,
  leftClassName,
  rightClassName,
  dividerClassName,
  onRatioChange,
  onCollapse,
  onExpand,
}: SplitViewProps) {
  const { isMobile } = useDevice();
  const [ratio, setRatio] = useState(defaultRatio);
  const [collapsed, setCollapsed] = useState<'left' | 'right' | null>(defaultCollapsed);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileActivePanel, setMobileActivePanel] = useState<'left' | 'right'>(
    mobileStack === 'left-first' ? 'left' : 'right'
  );

  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startRatio = ratio;
    const container = (e.target as HTMLElement).parentElement;
    if (!container) return;

    const containerWidth = container.offsetWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaRatio = (deltaX / containerWidth) * 100;
      const newRatio = Math.max(
        (minLeftWidth / containerWidth) * 100,
        Math.min(100 - (minRightWidth / containerWidth) * 100, startRatio + deltaRatio)
      );
      setRatio(newRatio);
      onRatioChange?.(newRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [resizable, ratio, minLeftWidth, minRightWidth, onRatioChange]);

  // Handle collapse
  const toggleCollapse = (panel: 'left' | 'right') => {
    if (collapsed === panel) {
      setCollapsed(null);
      onExpand?.(panel);
    } else {
      setCollapsed(panel);
      onCollapse?.(panel);
    }
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className={cn("relative h-full", className)}>
        {/* Mobile toggle */}
        {mobileShowToggle && (
          <div className="flex border-b border-border">
            <button
              onClick={() => setMobileActivePanel('left')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                mobileActivePanel === 'left'
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {leftTitle || 'Painel 1'}
            </button>
            <button
              onClick={() => setMobileActivePanel('right')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                mobileActivePanel === 'right'
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {rightTitle || 'Painel 2'}
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mobileActivePanel === 'left' ? (
            <motion.div
              key="left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn("h-full overflow-auto", leftClassName)}
            >
              {left}
            </motion.div>
          ) : (
            <motion.div
              key="right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn("h-full overflow-auto", rightClassName)}
            >
              {right}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop view
  const leftWidth = collapsed === 'left' ? 0 : collapsed === 'right' ? 100 : ratio;
  const rightWidth = collapsed === 'right' ? 0 : collapsed === 'left' ? 100 : 100 - ratio;

  return (
    <div className={cn("flex h-full overflow-hidden", className)}>
      {/* Left Panel */}
      <motion.div
        animate={{ width: `${leftWidth}%` }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "relative overflow-hidden",
          collapsed === 'left' && "w-0",
          leftClassName
        )}
      >
        {/* Left header */}
        {(leftTitle || collapsible === 'left' || collapsible === 'both') && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            {leftTitle && (
              <h3 className="font-medium text-sm truncate">{leftTitle}</h3>
            )}
            {(collapsible === 'left' || collapsible === 'both') && collapsed !== 'left' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => toggleCollapse('left')}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <div className="h-[calc(100%-40px)] overflow-auto">
          {left}
        </div>
      </motion.div>

      {/* Divider */}
      {collapsed !== 'left' && collapsed !== 'right' && (
        <div
          className={cn(
            "relative flex items-center justify-center w-1",
            "bg-border hover:bg-primary/50 transition-colors",
            resizable && "cursor-col-resize",
            isDragging && "bg-primary",
            dividerClassName
          )}
          onMouseDown={handleMouseDown}
        >
          {resizable && (
            <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
          )}
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </div>
      )}

      {/* Collapse buttons when collapsed */}
      {collapsed === 'left' && (collapsible === 'left' || collapsible === 'both') && (
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-8 rounded-none border-r border-border"
          onClick={() => toggleCollapse('left')}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      {collapsed === 'right' && (collapsible === 'right' || collapsible === 'both') && (
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-8 rounded-none border-l border-border"
          onClick={() => toggleCollapse('right')}
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      )}

      {/* Right Panel */}
      <motion.div
        animate={{ width: `${rightWidth}%` }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "relative overflow-hidden",
          collapsed === 'right' && "w-0",
          rightClassName
        )}
      >
        {/* Right header */}
        {(rightTitle || collapsible === 'right' || collapsible === 'both') && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            {(collapsible === 'right' || collapsible === 'both') && collapsed !== 'right' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => toggleCollapse('right')}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            )}
            {rightTitle && (
              <h3 className="font-medium text-sm truncate ml-auto">{rightTitle}</h3>
            )}
          </div>
        )}
        
        <div className="h-[calc(100%-40px)] overflow-auto">
          {right}
        </div>
      </motion.div>
    </div>
  );
}

// Master-Detail variant for common list-detail pattern
interface MasterDetailProps<T> {
  items: T[];
  selectedItem: T | null;
  onSelectItem: (item: T) => void;
  renderMasterItem: (item: T, isSelected: boolean) => ReactNode;
  renderDetail: (item: T) => ReactNode;
  renderEmptyDetail?: () => ReactNode;
  masterTitle?: string;
  detailTitle?: string;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function MasterDetail<T>({
  items,
  selectedItem,
  onSelectItem,
  renderMasterItem,
  renderDetail,
  renderEmptyDetail,
  masterTitle = 'Lista',
  detailTitle = 'Detalhes',
  keyExtractor,
  className,
}: MasterDetailProps<T>) {
  const { isMobile } = useDevice();
  const [showDetail, setShowDetail] = useState(false);

  const handleSelectItem = (item: T) => {
    onSelectItem(item);
    if (isMobile) {
      setShowDetail(true);
    }
  };

  const masterContent = (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div
          key={keyExtractor(item)}
          onClick={() => handleSelectItem(item)}
          className={cn(
            "cursor-pointer transition-colors",
            selectedItem && keyExtractor(selectedItem) === keyExtractor(item)
              ? "bg-primary/10"
              : "hover:bg-muted/50"
          )}
        >
          {renderMasterItem(item, selectedItem ? keyExtractor(selectedItem) === keyExtractor(item) : false)}
        </div>
      ))}
    </div>
  );

  const detailContent = selectedItem ? (
    renderDetail(selectedItem)
  ) : (
    renderEmptyDetail?.() ?? (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Selecione um item para ver os detalhes
      </div>
    )
  );

  // Mobile: Show detail as overlay
  if (isMobile && showDetail && selectedItem) {
    return (
      <div className={cn("relative h-full", className)}>
        <div className="h-full overflow-auto">{masterContent}</div>
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed inset-0 z-50 bg-background"
        >
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDetail(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <h3 className="font-medium">{detailTitle}</h3>
          </div>
          <div className="h-[calc(100%-56px)] overflow-auto">
            {detailContent}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <SplitView
      left={masterContent}
      right={detailContent}
      leftTitle={masterTitle}
      rightTitle={detailTitle}
      defaultRatio={35}
      className={className}
    />
  );
}

// Hook for managing split view state
export function useSplitView(defaultRatio = 50) {
  const [ratio, setRatio] = useState(defaultRatio);
  const [collapsed, setCollapsed] = useState<'left' | 'right' | null>(null);

  const collapseLeft = useCallback(() => setCollapsed('left'), []);
  const collapseRight = useCallback(() => setCollapsed('right'), []);
  const expand = useCallback(() => setCollapsed(null), []);
  const reset = useCallback(() => {
    setRatio(defaultRatio);
    setCollapsed(null);
  }, [defaultRatio]);

  return {
    ratio,
    setRatio,
    collapsed,
    collapseLeft,
    collapseRight,
    expand,
    reset,
  };
}
