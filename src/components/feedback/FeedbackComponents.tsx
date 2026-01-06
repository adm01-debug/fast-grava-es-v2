import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ThumbsUp, ThumbsDown, Smile, Meh, Frown, Heart, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// Star Rating Component
interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  className = '',
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  const displayValue = hoverValue || value;

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          disabled={readonly}
          className={cn(
            'transition-transform',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= displayValue
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value}/{max}
        </span>
      )}
    </div>
  );
};

// Thumbs Rating
interface ThumbsRatingProps {
  value: 'up' | 'down' | null;
  onChange?: (value: 'up' | 'down') => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabels?: boolean;
  className?: string;
}

export const ThumbsRating: React.FC<ThumbsRatingProps> = ({
  value,
  onChange,
  size = 'md',
  readonly = false,
  showLabels = false,
  className = '',
}) => {
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };

  return (
    <div className={cn('inline-flex items-center gap-4', className)}>
      <button
        type="button"
        onClick={() => !readonly && onChange?.('up')}
        disabled={readonly}
        className={cn(
          'flex items-center gap-1 p-2 rounded-lg transition-colors',
          value === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'hover:bg-muted',
          readonly && 'cursor-default'
        )}
      >
        <ThumbsUp className={sizeClasses[size]} />
        {showLabels && <span className="text-sm">Sim</span>}
      </button>
      <button
        type="button"
        onClick={() => !readonly && onChange?.('down')}
        disabled={readonly}
        className={cn(
          'flex items-center gap-1 p-2 rounded-lg transition-colors',
          value === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'hover:bg-muted',
          readonly && 'cursor-default'
        )}
      >
        <ThumbsDown className={sizeClasses[size]} />
        {showLabels && <span className="text-sm">Não</span>}
      </button>
    </div>
  );
};

// Emoji Rating
interface EmojiRatingProps {
  value: 1 | 2 | 3 | null;
  onChange?: (value: 1 | 2 | 3) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

export const EmojiRating: React.FC<EmojiRatingProps> = ({
  value,
  onChange,
  size = 'md',
  readonly = false,
  className = '',
}) => {
  const sizeClasses = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' };

  const emojis = [
    { value: 1, icon: Frown, label: 'Insatisfeito', color: 'text-red-500' },
    { value: 2, icon: Meh, label: 'Neutro', color: 'text-yellow-500' },
    { value: 3, icon: Smile, label: 'Satisfeito', color: 'text-green-500' },
  ] as const;

  return (
    <div className={cn('inline-flex items-center gap-4', className)}>
      {emojis.map((emoji) => {
        const Icon = emoji.icon;
        return (
          <button
            key={emoji.value}
            type="button"
            onClick={() => !readonly && onChange?.(emoji.value)}
            disabled={readonly}
            className={cn(
              'p-2 rounded-full transition-all',
              value === emoji.value
                ? 'bg-muted scale-110'
                : 'opacity-50 hover:opacity-100',
              readonly && 'cursor-default'
            )}
            title={emoji.label}
          >
            <Icon className={cn(sizeClasses[size], emoji.color)} />
          </button>
        );
      })}
    </div>
  );
};

// NPS Score
interface NPSScoreProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  showLabels?: boolean;
  className?: string;
}

export const NPSScore: React.FC<NPSScoreProps> = ({
  value,
  onChange,
  readonly = false,
  showLabels = true,
  className = '',
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between gap-1">
        {Array.from({ length: 11 }, (_, i) => i).map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => !readonly && onChange?.(score)}
            disabled={readonly}
            className={cn(
              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              value === score
                ? score <= 6
                  ? 'bg-red-500 text-white'
                  : score <= 8
                  ? 'bg-yellow-500 text-white'
                  : 'bg-green-500 text-white'
                : 'bg-muted hover:bg-muted/80',
              readonly && 'cursor-default'
            )}
          >
            {score}
          </button>
        ))}
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Nada provável</span>
          <span>Muito provável</span>
        </div>
      )}
    </div>
  );
};

// Complete Feedback Form
interface FeedbackFormData {
  rating: number;
  category: string;
  comment: string;
  recommend: 'up' | 'down' | null;
}

interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData) => Promise<void> | void;
  title?: string;
  categories?: string[];
  showRecommend?: boolean;
  className?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  title = 'Deixe seu feedback',
  categories = ['Geral', 'Interface', 'Performance', 'Funcionalidade', 'Suporte'],
  showRecommend = true,
  className = '',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<FeedbackFormData>({
    rating: 0,
    category: '',
    comment: '',
    recommend: null,
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating */}
        <div className="space-y-2">
          <Label>Como você avalia sua experiência?</Label>
          <StarRating
            value={data.rating}
            onChange={(rating) => setData({ ...data, rating })}
            size="lg"
            showValue
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Categoria</Label>
          <RadioGroup
            value={data.category}
            onValueChange={(category) => setData({ ...data, category })}
            className="flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <div key={cat} className="flex items-center">
                <RadioGroupItem value={cat} id={cat} className="peer sr-only" />
                <Label
                  htmlFor={cat}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors',
                    'border border-input hover:bg-muted',
                    'peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary'
                  )}
                >
                  {cat}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label>Comentário (opcional)</Label>
          <Textarea
            value={data.comment}
            onChange={(e) => setData({ ...data, comment: e.target.value })}
            placeholder="Conte-nos mais sobre sua experiência..."
            rows={3}
          />
        </div>

        {/* Recommend */}
        {showRecommend && (
          <div className="space-y-2">
            <Label>Você recomendaria para um amigo?</Label>
            <ThumbsRating
              value={data.recommend}
              onChange={(recommend) => setData({ ...data, recommend })}
              showLabels
            />
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || data.rating === 0}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Feedback Dialog
interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FeedbackFormData) => Promise<void> | void;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, category: '', comment, recommend: null });
      onOpenChange(false);
      setRating(0);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback Rápido</DialogTitle>
          <DialogDescription>
            Como foi sua experiência hoje?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário opcional..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for feedback state
export function useFeedback() {
  const [isOpen, setIsOpen] = useState(false);

  const openFeedback = () => setIsOpen(true);
  const closeFeedback = () => setIsOpen(false);

  return { isOpen, openFeedback, closeFeedback, setIsOpen };
}
