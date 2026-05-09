import { Badge } from '@/components/ui/badge';
import { TechnicalSheet } from '@/hooks/useTechnicalSheets';
import { CheckCircle2, FileEdit, AlertCircle } from 'lucide-react';

interface KnowledgeStatusBadgeProps {
  status: TechnicalSheet['status'];
  className?: string;
}

export const KnowledgeStatusBadge = ({ status, className }: KnowledgeStatusBadgeProps) => {
  switch (status) {
    case 'published':
      return (
        <Badge variant="secondary" className={`bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 ${className}`}>
          <CheckCircle2 className="h-3 w-3" />
          Homologada
        </Badge>
      );
    case 'review_needed':
      return (
        <Badge variant="secondary" className={`bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 ${className}`}>
          <AlertCircle className="h-3 w-3" />
          Revisão Necessária
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={`bg-muted/30 text-muted-foreground gap-1 ${className}`}>
          <FileEdit className="h-3 w-3" />
          Rascunho
        </Badge>
      );
  }
};
