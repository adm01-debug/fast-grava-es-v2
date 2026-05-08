import { Download, FileText, Flame, GitCompare, ZoomIn, Group, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarZoomLevel, CalendarGroupBy, CalendarOverlays, ZOOM_LABELS } from './types';

interface CalendarToolbarProps {
  zoom: CalendarZoomLevel;
  onZoomChange: (z: CalendarZoomLevel) => void;
  groupBy: CalendarGroupBy;
  onGroupByChange: (g: CalendarGroupBy) => void;
  overlays: CalendarOverlays;
  onToggleOverlay: (key: keyof CalendarOverlays) => void;
  onExportPdf: () => void;
  onExportICal: () => void;
  onShowOnboarding: () => void;
  extraSlot?: React.ReactNode;
}

export function CalendarToolbar({
  zoom,
  onZoomChange,
  groupBy,
  onGroupByChange,
  overlays,
  onToggleOverlay,
  onExportPdf,
  onExportICal,
  onShowOnboarding,
  extraSlot,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap w-full">
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {/* ... keep existing buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={overlays.showHeatmap}
              onPressedChange={() => onToggleOverlay('showHeatmap')}
              aria-label="Mostrar mapa de ocupação"
              className="h-9 px-2.5 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
            >
              <Flame className="h-3.5 w-3.5" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Mapa de ocupação</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={overlays.showActualVsPlanned}
              onPressedChange={() => onToggleOverlay('showActualVsPlanned')}
              aria-label="Comparar planejado vs realizado"
              className="h-9 px-2.5 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
            >
              <GitCompare className="h-3.5 w-3.5" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Planejado vs Realizado</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2.5 bg-card border-border/40">
                  <ZoomIn className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">{ZOOM_LABELS[zoom]}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Zoom temporal</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Granularidade</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(ZOOM_LABELS) as unknown as CalendarZoomLevel[])
              .map((k) => Number(k) as CalendarZoomLevel)
              .map((z) => (
                <DropdownMenuItem key={z} onClick={() => onZoomChange(z)}>
                  {ZOOM_LABELS[z]}
                  {zoom === z && <span className="ml-auto text-primary">●</span>}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2.5 bg-card border-border/40">
                  <Group className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">{groupBy === 'machine' ? 'Máquina' : 'Técnica'}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Agrupar por…</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Agrupar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onGroupByChange('machine')}>
              Máquina {groupBy === 'machine' && <span className="ml-auto text-primary">●</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGroupByChange('technique')}>
              Técnica (agregada) {groupBy === 'technique' && <span className="ml-auto text-primary">●</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2.5 bg-card border-border/40">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Exportar / Imprimir</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportPdf}>
              <FileText className="h-3.5 w-3.5 mr-2" />
              Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportICal}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Exportar iCal (.ics)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.print()}>
              <FileText className="h-3.5 w-3.5 mr-2" />
              Imprimir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onShowOnboarding}
              aria-label="Ajuda e atalhos"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Atalhos & dicas</TooltipContent>
        </Tooltip>
      </div>

      <div className="ml-auto">
        {extraSlot}
      </div>
    </div>
    </div>
  );
}
