import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Clock,
  Palette,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Play,
  Loader2
} from "lucide-react";
import { useSmartSequencingWithActions, SequencingSuggestion } from "@/features/jobs";

interface SequencingCardProps {
  suggestion: SequencingSuggestion;
  onApply: () => void;
  isApplying: boolean;
}

const SequencingCard = memo(function SequencingCard({ suggestion, onApply, isApplying }: SequencingCardProps) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {suggestion.machineCode}
          </Badge>
          <span className="text-sm text-muted-foreground">{suggestion.machineName}</span>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
          <Clock className="h-3 w-3 mr-1" />
          -{suggestion.estimatedSavings} min
        </Badge>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Palette className="h-3 w-3" />
          Grupos por cor:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {suggestion.colorGroups.map((group, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="text-xs bg-background/50"
            >
              {group.color} ({group.jobCount})
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{suggestion.currentSequence.length} jobs</span>
          <ArrowRight className="h-3 w-3" />
          <span className="text-green-400">Sequência otimizada</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
          onClick={onApply}
          disabled={isApplying}
        >
          {isApplying ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Play className="h-3 w-3 mr-1" />
          )}
          Aplicar
        </Button>
      </div>
    </div>
  );
});
SequencingCard.displayName = 'SequencingCard';

function SmartSequencingWidgetComponent() {
  const { suggestions, totalSavings, hasSuggestions, applySequencing, applyAllSequencing, isApplying } = useSmartSequencingWithActions();

  return (
    <Card className="glass-card card-interactive animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.15s] dark:hover:shadow-[0_8px_32px_-8px_hsl(280,80%,60%,0.25)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-accent/20 dark:glow-accent">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
            <span className="gradient-text text-sm sm:text-base">Sequenciamento Inteligente</span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasSuggestions && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                onClick={() => applyAllSequencing()}
                disabled={isApplying}
              >
                {isApplying ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                Aplicar Tudo
              </Button>
            )}
            {hasSuggestions ? (
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 border text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {totalSavings} min
              </Badge>
            ) : (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Otimizado
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasSuggestions ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-400/50" />
            <p className="text-sm">Sequenciamento atual já está otimizado</p>
            <p className="text-xs mt-1">Jobs agrupados por cor/material</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-3">
              {suggestions.slice(0, 5).map((suggestion) => (
                <SequencingCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={() => applySequencing(suggestion)}
                  isApplying={isApplying}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export const SmartSequencingWidget = memo(SmartSequencingWidgetComponent);
SmartSequencingWidget.displayName = 'SmartSequencingWidget';
