// Content Personalization System
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Sparkles, History, Heart, Star, 
  TrendingUp, Clock, Filter, Shuffle, ThumbsUp, ThumbsDown,
  Eye, EyeOff, RefreshCw, Sliders, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

// Types
interface UserPreferences {
  interests: string[];
  favoriteCategories: string[];
  excludedCategories: string[];
  contentDensity: 'compact' | 'comfortable' | 'spacious';
  showRecommendations: boolean;
  showTrending: boolean;
  showRecent: boolean;
  feedAlgorithm: 'personalized' | 'chronological' | 'trending';
  language: string;
  contentMaturity: 'all' | 'family' | 'mature';
}

interface UserBehavior {
  viewHistory: Array<{ id: string; timestamp: Date; duration: number }>;
  interactions: Array<{ id: string; type: 'like' | 'dislike' | 'save' | 'share'; timestamp: Date }>;
  searchHistory: string[];
  clickPatterns: Record<string, number>;
  timeSpentByCategory: Record<string, number>;
}

interface ContentItem {
  id: string;
  type: string;
  category: string;
  tags: string[];
  title: string;
  score?: number;
  isPersonalized?: boolean;
  isSponsored?: boolean;
  isTrending?: boolean;
}

interface PersonalizationContextType {
  preferences: UserPreferences;
  behavior: UserBehavior;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  trackView: (id: string, duration: number) => void;
  trackInteraction: (id: string, type: 'like' | 'dislike' | 'save' | 'share') => void;
  trackSearch: (query: string) => void;
  trackClick: (category: string) => void;
  getPersonalizedScore: (item: ContentItem) => number;
  sortByRelevance: <T extends ContentItem>(items: T[]) => T[];
  filterByPreferences: <T extends ContentItem>(items: T[]) => T[];
  resetBehavior: () => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | null>(null);

// Default values
const defaultPreferences: UserPreferences = {
  interests: [],
  favoriteCategories: [],
  excludedCategories: [],
  contentDensity: 'comfortable',
  showRecommendations: true,
  showTrending: true,
  showRecent: true,
  feedAlgorithm: 'personalized',
  language: 'pt-BR',
  contentMaturity: 'all'
};

const defaultBehavior: UserBehavior = {
  viewHistory: [],
  interactions: [],
  searchHistory: [],
  clickPatterns: {},
  timeSpentByCategory: {}
};

// Provider
interface PersonalizationProviderProps {
  children: ReactNode;
  userId?: string;
}

export function PersonalizationProvider({ children, userId }: PersonalizationProviderProps) {
  const storageKey = userId ? `personalization-${userId}` : 'personalization-anonymous';
  
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    `${storageKey}-prefs`,
    defaultPreferences
  );
  
  const [behavior, setBehavior] = useLocalStorage<UserBehavior>(
    `${storageKey}-behavior`,
    defaultBehavior
  );

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, [setPreferences]);

  const trackView = useCallback((id: string, duration: number) => {
    setBehavior(prev => ({
      ...prev,
      viewHistory: [
        { id, timestamp: new Date(), duration },
        ...prev.viewHistory.slice(0, 99)
      ]
    }));
  }, [setBehavior]);

  const trackInteraction = useCallback((id: string, type: 'like' | 'dislike' | 'save' | 'share') => {
    setBehavior(prev => ({
      ...prev,
      interactions: [
        { id, type, timestamp: new Date() },
        ...prev.interactions.slice(0, 199)
      ]
    }));
  }, [setBehavior]);

  const trackSearch = useCallback((query: string) => {
    setBehavior(prev => ({
      ...prev,
      searchHistory: [query, ...prev.searchHistory.filter(q => q !== query).slice(0, 49)]
    }));
  }, [setBehavior]);

  const trackClick = useCallback((category: string) => {
    setBehavior(prev => ({
      ...prev,
      clickPatterns: {
        ...prev.clickPatterns,
        [category]: (prev.clickPatterns[category] || 0) + 1
      }
    }));
  }, [setBehavior]);

  const getPersonalizedScore = useCallback((item: ContentItem): number => {
    let score = item.score || 50;

    // Boost for favorite categories
    if (preferences.favoriteCategories.includes(item.category)) {
      score += 25;
    }

    // Boost for matching interests
    const matchingInterests = item.tags.filter(tag => 
      preferences.interests.includes(tag)
    ).length;
    score += matchingInterests * 10;

    // Boost based on click patterns
    const clickCount = behavior.clickPatterns[item.category] || 0;
    score += Math.min(clickCount * 2, 20);

    // Boost based on interaction history
    const hasLiked = behavior.interactions.some(
      i => i.id === item.id && i.type === 'like'
    );
    if (hasLiked) score += 30;

    const hasDisliked = behavior.interactions.some(
      i => i.id === item.id && i.type === 'dislike'
    );
    if (hasDisliked) score -= 50;

    // Trending boost
    if (item.isTrending && preferences.showTrending) {
      score += 15;
    }

    // Cap score
    return Math.max(0, Math.min(100, score));
  }, [preferences, behavior]);

  const sortByRelevance = useCallback(<T extends ContentItem>(items: T[]): T[] => {
    if (preferences.feedAlgorithm === 'chronological') {
      return items;
    }

    if (preferences.feedAlgorithm === 'trending') {
      return [...items].sort((a, b) => 
        (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0)
      );
    }

    return [...items].sort((a, b) => 
      getPersonalizedScore(b) - getPersonalizedScore(a)
    );
  }, [preferences.feedAlgorithm, getPersonalizedScore]);

  const filterByPreferences = useCallback(<T extends ContentItem>(items: T[]): T[] => {
    return items.filter(item => {
      // Filter out excluded categories
      if (preferences.excludedCategories.includes(item.category)) {
        return false;
      }

      return true;
    });
  }, [preferences.excludedCategories]);

  const resetBehavior = useCallback(() => {
    setBehavior(defaultBehavior);
  }, [setBehavior]);

  return (
    <PersonalizationContext.Provider
      value={{
        preferences,
        behavior,
        updatePreferences,
        trackView,
        trackInteraction,
        trackSearch,
        trackClick,
        getPersonalizedScore,
        sortByRelevance,
        filterByPreferences,
        resetBehavior
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) throw new Error('usePersonalization must be used within PersonalizationProvider');
  return context;
}

// Interest Selector
interface InterestSelectorProps {
  availableInterests: Array<{ id: string; label: string; icon?: React.ElementType }>;
}

export function InterestSelector({ availableInterests }: InterestSelectorProps) {
  const { preferences, updatePreferences } = usePersonalization();

  const toggleInterest = (id: string) => {
    const interests = preferences.interests.includes(id)
      ? preferences.interests.filter(i => i !== id)
      : [...preferences.interests, id];
    updatePreferences({ interests });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Your Interests</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableInterests.map(interest => {
          const isSelected = preferences.interests.includes(interest.id);
          const Icon = interest.icon;
          
          return (
            <motion.button
              key={interest.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleInterest(interest.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {interest.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Content Feedback Buttons
interface ContentFeedbackProps {
  itemId: string;
  size?: 'sm' | 'default';
}

export function ContentFeedback({ itemId, size = 'default' }: ContentFeedbackProps) {
  const { behavior, trackInteraction } = usePersonalization();
  
  const liked = behavior.interactions.some(
    i => i.id === itemId && i.type === 'like'
  );
  const disliked = behavior.interactions.some(
    i => i.id === itemId && i.type === 'dislike'
  );

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => trackInteraction(itemId, 'like')}
        className={cn(
          'rounded-full flex items-center justify-center transition-colors',
          buttonSize,
          liked 
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : 'hover:bg-muted'
        )}
      >
        <ThumbsUp className={iconSize} />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => trackInteraction(itemId, 'dislike')}
        className={cn(
          'rounded-full flex items-center justify-center transition-colors',
          buttonSize,
          disliked 
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'hover:bg-muted'
        )}
      >
        <ThumbsDown className={iconSize} />
      </motion.button>
    </div>
  );
}

// Personalized Badge
interface PersonalizedBadgeProps {
  reason?: string;
}

export function PersonalizedBadge({ reason }: PersonalizedBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1 text-xs">
      <Sparkles className="h-3 w-3" />
      {reason || 'Para você'}
    </Badge>
  );
}

// Feed Settings Panel
export function FeedSettingsPanel() {
  const { preferences, updatePreferences, resetBehavior } = usePersonalization();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Sliders className="h-4 w-4 mr-2" />
          Personalizar Feed
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Configurações do Feed</SheetTitle>
          <SheetDescription>
            Personalize como o conteúdo é exibido para você
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="algorithm" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="algorithm">Algoritmo</TabsTrigger>
            <TabsTrigger value="display">Exibição</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          </TabsList>

          <TabsContent value="algorithm" className="space-y-6 mt-4">
            <div className="space-y-4">
              <Label>Ordenação do Feed</Label>
              <div className="space-y-2">
                {[
                  { value: 'personalized', label: 'Personalizado', icon: Sparkles, desc: 'Baseado nos seus interesses' },
                  { value: 'chronological', label: 'Cronológico', icon: Clock, desc: 'Mais recentes primeiro' },
                  { value: 'trending', label: 'Trending', icon: TrendingUp, desc: 'Mais populares' }
                ].map(option => (
                  <motion.button
                    key={option.value}
                    whileHover={{ x: 4 }}
                    onClick={() => updatePreferences({ feedAlgorithm: option.value as any })}
                    className={cn(
                      'w-full p-3 rounded-lg flex items-center gap-3 text-left transition-colors',
                      preferences.feedAlgorithm === option.value
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                    )}
                  >
                    <option.icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.desc}</div>
                    </div>
                    {preferences.feedAlgorithm === option.value && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mostrar Recomendações</Label>
                  <p className="text-xs text-muted-foreground">Sugestões baseadas no seu perfil</p>
                </div>
                <Switch
                  checked={preferences.showRecommendations}
                  onCheckedChange={(checked) => updatePreferences({ showRecommendations: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mostrar Trending</Label>
                  <p className="text-xs text-muted-foreground">Conteúdo popular no momento</p>
                </div>
                <Switch
                  checked={preferences.showTrending}
                  onCheckedChange={(checked) => updatePreferences({ showTrending: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-6 mt-4">
            <div className="space-y-4">
              <Label>Densidade do Conteúdo</Label>
              <div className="space-y-2">
                {[
                  { value: 'compact', label: 'Compacto' },
                  { value: 'comfortable', label: 'Confortável' },
                  { value: 'spacious', label: 'Espaçoso' }
                ].map(option => (
                  <motion.button
                    key={option.value}
                    whileHover={{ x: 4 }}
                    onClick={() => updatePreferences({ contentDensity: option.value as any })}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-colors',
                      preferences.contentDensity === option.value
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                    )}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Seus Dados de Personalização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Usamos seu histórico de navegação e interações para melhorar suas recomendações.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resetBehavior}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Histórico
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Recommendation Card
interface RecommendationCardProps {
  item: ContentItem;
  reason?: string;
  onView?: () => void;
  children?: ReactNode;
}

export function RecommendationCard({ item, reason, onView, children }: RecommendationCardProps) {
  const { getPersonalizedScore, trackClick } = usePersonalization();
  const score = getPersonalizedScore(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => {
        trackClick(item.category);
        onView?.();
      }}
    >
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{item.title}</CardTitle>
            <ContentFeedback itemId={item.id} size="sm" />
          </div>
          {item.isPersonalized && <PersonalizedBadge reason={reason} />}
        </CardHeader>
        <CardContent>
          {children}
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
            {item.isTrending && (
              <Badge variant="secondary" className="text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                Trending
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Recently Viewed
export function RecentlyViewed() {
  const { behavior } = usePersonalization();
  const recentViews = behavior.viewHistory.slice(0, 5);

  if (recentViews.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Visualizados Recentemente</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {recentViews.map((view, i) => (
          <motion.div
            key={view.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 px-3 py-2 bg-muted rounded-lg text-sm"
          >
            {view.id}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// For You Section
interface ForYouSectionProps {
  items: ContentItem[];
  title?: string;
  emptyMessage?: string;
}

export function ForYouSection({ items, title = 'Para Você', emptyMessage = 'Nenhuma recomendação' }: ForYouSectionProps) {
  const { sortByRelevance, filterByPreferences, preferences } = usePersonalization();
  
  if (!preferences.showRecommendations) return null;

  const personalizedItems = sortByRelevance(filterByPreferences(items)).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <FeedSettingsPanel />
      </div>

      {personalizedItems.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          {emptyMessage}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {personalizedItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
              >
                <RecommendationCard item={{ ...item, isPersonalized: true }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
