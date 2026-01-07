import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, MoreHorizontal, Star, Heart, Share2 } from 'lucide-react';

// Card de feature/produto
interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  badge?: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, href, badge, className }: FeatureCardProps) {
  const content = (
    <Card className={cn('group hover:shadow-lg transition-all duration-300 h-full', className)}>
      <CardHeader>
        {badge && (
          <Badge variant="secondary" className="w-fit mb-2">{badge}</Badge>
        )}
        {icon && (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
            {icon}
          </div>
        )}
        <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
      {href && (
        <CardFooter>
          <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            Saiba mais <ArrowRight className="h-4 w-4" />
          </span>
        </CardFooter>
      )}
    </Card>
  );

  if (href) {
    return <a href={href} className="block h-full">{content}</a>;
  }

  return content;
}

// Card de preço
interface PricingCardProps {
  name: string;
  price: string | number;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  buttonText?: string;
  onSelect?: () => void;
  className?: string;
}

export function PricingCard({
  name,
  price,
  period = '/mês',
  description,
  features,
  highlighted,
  badge,
  buttonText = 'Começar',
  onSelect,
  className
}: PricingCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300',
      highlighted && 'border-primary shadow-lg scale-105',
      className
    )}>
      {badge && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
          {badge}
        </div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {typeof price === 'number' ? `R$ ${price}` : price}
          </span>
          {period && <span className="text-muted-foreground">{period}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={highlighted ? 'default' : 'outline'}
          onClick={onSelect}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Card de estatística
interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatCard({ label, value, change, icon, description, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <div className={cn(
                'flex items-center gap-1 text-sm mt-1',
                change.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                <span>{change.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(change.value)}%</span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          {icon && (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Card de blog/artigo
interface ArticleCardProps {
  title: string;
  excerpt: string;
  image?: string;
  author?: { name: string; avatar?: string };
  date?: string;
  readTime?: string;
  category?: string;
  href?: string;
  className?: string;
}

export function ArticleCard({
  title,
  excerpt,
  image,
  author,
  date,
  readTime,
  category,
  href,
  className
}: ArticleCardProps) {
  const content = (
    <Card className={cn('group overflow-hidden hover:shadow-lg transition-all', className)}>
      {image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        {category && (
          <Badge variant="secondary" className="w-fit">{category}</Badge>
        )}
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {author?.avatar && (
            <img src={author.avatar} alt={author.name} className="h-6 w-6 rounded-full" />
          )}
          {author?.name && (
            <span className="text-sm text-muted-foreground">{author.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {date && <span>{date}</span>}
          {readTime && <span>• {readTime}</span>}
        </div>
      </CardFooter>
    </Card>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }

  return content;
}

// Card de depoimento/testimonial
interface TestimonialCardProps {
  quote: string;
  author: { name: string; role?: string; company?: string; avatar?: string };
  rating?: number;
  className?: string;
}

export function TestimonialCard({ quote, author, rating, className }: TestimonialCardProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardContent className="pt-6">
        {rating && (
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                )}
              />
            ))}
          </div>
        )}
        <blockquote className="text-lg italic mb-6">"{quote}"</blockquote>
        <div className="flex items-center gap-3">
          {author.avatar ? (
            <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
              {author.name[0]}
            </div>
          )}
          <div>
            <p className="font-medium">{author.name}</p>
            {(author.role || author.company) && (
              <p className="text-sm text-muted-foreground">
                {author.role}{author.role && author.company && ' @ '}{author.company}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Card interativo com ações
interface InteractiveCardProps {
  title: string;
  description?: string;
  image?: string;
  likes?: number;
  onLike?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  footer?: React.ReactNode;
  className?: string;
}

export function InteractiveCard({
  title,
  description,
  image,
  likes,
  onLike,
  onShare,
  onMore,
  footer,
  className
}: InteractiveCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {image && (
        <div className="aspect-video">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {onMore && (
            <Button variant="ghost" size="icon" onClick={onMore}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onLike && (
            <Button variant="ghost" size="sm" onClick={onLike} className="gap-1">
              <Heart className="h-4 w-4" />
              {likes !== undefined && <span>{likes}</span>}
            </Button>
          )}
          {onShare && (
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {footer}
      </CardFooter>
    </Card>
  );
}

// Card de link externo
interface LinkCardProps {
  title: string;
  description?: string;
  url: string;
  favicon?: string;
  image?: string;
  className?: string;
}

export function LinkCard({ title, description, url, favicon, image, className }: LinkCardProps) {
  const domain = new URL(url).hostname;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block"
    >
      <Card className={cn('group hover:shadow-md transition-all overflow-hidden', className)}>
        <div className="flex">
          {image && (
            <div className="w-1/3 max-w-[200px]">
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-2">
              {favicon && <img src={favicon} alt="" className="h-4 w-4" />}
              <span className="text-xs text-muted-foreground">{domain}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
            </div>
            <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h4>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
            )}
          </div>
        </div>
      </Card>
    </a>
  );
}
