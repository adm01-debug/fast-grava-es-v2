import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, User, Check, X, Mail, Phone, MapPin, Calendar, Edit2 } from 'lucide-react';

// Avatar com status
interface StatusAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'dnd';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function StatusAvatar({ 
  src, 
  alt, 
  fallback, 
  status,
  size = 'md',
  className 
}: StatusAvatarProps) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-orange-500',
    dnd: 'bg-red-500'
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4'
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>
          {fallback || <User className="h-1/2 w-1/2" />}
        </AvatarFallback>
      </Avatar>
      {status && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full border-2 border-background',
          statusColors[status],
          statusSizes[size]
        )} />
      )}
    </div>
  );
}

// Grupo de avatares
interface AvatarGroupProps {
  avatars: { src?: string; alt?: string; fallback?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'md', className }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const sizeClasses = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };
  const overlapClasses = { sm: '-ml-2', md: '-ml-3', lg: '-ml-4' };

  return (
    <div className={cn('flex items-center', className)}>
      {displayed.map((avatar, index) => (
        <Avatar 
          key={index}
          className={cn(
            sizeClasses[size],
            'border-2 border-background',
            index > 0 && overlapClasses[size]
          )}
        >
          <AvatarImage src={avatar.src} alt={avatar.alt} />
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className={cn(
          sizeClasses[size],
          overlapClasses[size],
          'rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium'
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

// Avatar editável
interface EditableAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  onImageChange?: (file: File) => void;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

export function EditableAvatar({ 
  src, 
  alt, 
  fallback, 
  onImageChange,
  size = 'lg',
  className 
}: EditableAvatarProps) {
  const sizeClasses = { md: 'h-16 w-16', lg: 'h-24 w-24', xl: 'h-32 w-32' };
  const iconSizes = { md: 'h-4 w-4', lg: 'h-5 w-5', xl: 'h-6 w-6' };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  return (
    <div className={cn('relative inline-block group', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className="text-2xl">
          {fallback || <User className="h-1/2 w-1/2" />}
        </AvatarFallback>
      </Avatar>
      <label className={cn(
        'absolute inset-0 flex items-center justify-center rounded-full',
        'bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity'
      )}>
        <Camera className={cn('text-white', iconSizes[size])} />
        <input 
          type="file" 
          accept="image/*" 
          className="sr-only" 
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}

// Card de perfil compacto
interface ProfileCardProps {
  name: string;
  role?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  verified?: boolean;
  onEdit?: () => void;
  className?: string;
}

export function ProfileCard({
  name,
  role,
  avatar,
  email,
  phone,
  location,
  status,
  verified,
  onEdit,
  className
}: ProfileCardProps) {
  return (
    <div className={cn('bg-card rounded-lg border p-4', className)}>
      <div className="flex items-start gap-4">
        <StatusAvatar src={avatar} fallback={name[0]} status={status} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{name}</h3>
            {verified && (
              <Badge variant="secondary" className="h-5 gap-1">
                <Check className="h-3 w-3" /> Verificado
              </Badge>
            )}
          </div>
          {role && <p className="text-sm text-muted-foreground">{role}</p>}
          
          <div className="mt-3 space-y-1">
            {email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{phone}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
        
        {onEdit && (
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Header de perfil (para páginas de perfil)
interface ProfileHeaderProps {
  name: string;
  role?: string;
  avatar?: string;
  coverImage?: string;
  stats?: { label: string; value: string | number }[];
  actions?: React.ReactNode;
  className?: string;
}

export function ProfileHeader({
  name,
  role,
  avatar,
  coverImage,
  stats,
  actions,
  className
}: ProfileHeaderProps) {
  return (
    <div className={cn('bg-card rounded-lg border overflow-hidden', className)}>
      {/* Cover */}
      <div 
        className="h-32 bg-gradient-to-r from-primary/20 to-primary/40"
        style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover' } : undefined}
      />
      
      {/* Profile info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-2xl">{name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 sm:mb-2">
            <h1 className="text-2xl font-bold">{name}</h1>
            {role && <p className="text-muted-foreground">{role}</p>}
          </div>
          
          {actions && (
            <div className="flex gap-2 sm:mb-2">
              {actions}
            </div>
          )}
        </div>
        
        {stats && stats.length > 0 && (
          <div className="flex gap-6 mt-6 pt-6 border-t">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Lista de usuários
interface UserListItemProps {
  name: string;
  avatar?: string;
  subtitle?: string;
  status?: 'online' | 'offline' | 'away';
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function UserListItem({
  name,
  avatar,
  subtitle,
  status,
  trailing,
  onClick,
  className
}: UserListItemProps) {
  return (
    <div 
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        onClick && 'cursor-pointer hover:bg-accent',
        className
      )}
      onClick={onClick}
    >
      <StatusAvatar src={avatar} fallback={name[0]} status={status} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  );
}

// Badge de nível/ranking
interface LevelBadgeProps {
  level: number;
  maxLevel?: number;
  label?: string;
  color?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  className?: string;
}

export function LevelBadge({ 
  level, 
  maxLevel = 100, 
  label,
  color = 'bronze',
  className 
}: LevelBadgeProps) {
  const colorClasses = {
    bronze: 'from-amber-600 to-amber-800 text-amber-100',
    silver: 'from-gray-300 to-gray-500 text-gray-900',
    gold: 'from-yellow-400 to-yellow-600 text-yellow-900',
    platinum: 'from-cyan-300 to-cyan-500 text-cyan-900',
    diamond: 'from-purple-400 to-purple-600 text-purple-100'
  };

  const progress = (level / maxLevel) * 100;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className={cn(
        'h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-sm',
        colorClasses[color]
      )}>
        {level}
      </div>
      {label && (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{label}</span>
          <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn('h-full bg-gradient-to-r', colorClasses[color])}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
