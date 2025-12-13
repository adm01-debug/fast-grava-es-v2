import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Layers, 
  Clock, 
  Palette, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { useSmartSequencing, SequencingSuggestion } from "@/hooks/useSmartSequencing";

interface SequencingCardProps {
  suggestion: SequencingSuggestion;
}

function SequencingCard({ suggestion }: SequencingCardProps) {
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

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
        <span>{suggestion.currentSequence.length} jobs</span>
        <ArrowRight className="h-3 w-3" />
        <span className="text-green-400">Sequência otimizada disponível</span>
      </div>
    </div>
  );
}

export function SmartSequencingWidget() {
  const { suggestions, totalSavings, hasSuggestions } = useSmartSequencing();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Layers className="h-5 w-5 text-violet-400" />
            </div>
            Sequenciamento Inteligente
          </div>
          {hasSuggestions ? (
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 border">
              <Sparkles className="h-3 w-3 mr-1" />
              {totalSavings} min economizáveis
            </Badge>
          ) : (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Otimizado
            </Badge>
          )}
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
                <SequencingCard key={suggestion.machineId} suggestion={suggestion} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
