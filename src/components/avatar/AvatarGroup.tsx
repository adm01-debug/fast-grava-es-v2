import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface AvatarUser {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  role?: string;
}

interface AvatarGroupProps {
  users: AvatarUser[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  overlap?: 'tight' | 'normal' | 'loose';
  showTooltip?: boolean;
  showStatus?: boolean;
  expandable?: boolean;
  onUserClick?: (user: AvatarUser) => void;
  className?: string;
}

// Size configurations
const sizeConfig = {
  xs: { avatar: 'h-6 w-6', text: 'text-[10px]', status: 'h-2 w-2', offset: '-ml-2' },
  sm: { avatar: 'h-8 w-8', text: 'text-xs', status: 'h-2.5 w-2.5', offset: '-ml-2.5' },
  md: { avatar: 'h-10 w-10', text: 'text-sm', status: 'h-3 w-3', offset: '-ml-3' },
  lg: { avatar: 'h-12 w-12', text: 'text-base', status: 'h-3.5 w-3.5', offset: '-ml-4' },
  xl: { avatar: 'h-16 w-16', text: 'text-lg', status: 'h-4 w-4', offset: '-ml-5' },
};

const overlapConfig = {
  tight: { xs: '-ml-3', sm: '-ml-4', md: '-ml-5', lg: '-ml-6', xl: '-ml-8' },
  normal: { xs: '-ml-2', sm: '-ml-2.5', md: '-ml-3', lg: '-ml-4', xl: '-ml-5' },
  loose: { xs: '-ml-1', sm: '-ml-1.5', md: '-ml-2', lg: '-ml-2.5', xl: '-ml-3' },
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-muted-foreground',
  busy: 'bg-destructive',
  away: 'bg-yellow-500',
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Single Avatar with status
interface SingleAvatarProps {
  user: AvatarUser;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SingleAvatar: React.FC<SingleAvatarProps> = ({
  user,
  size = 'md',
  showStatus = false,
  showTooltip = true,
  onClick,
  className,
}) => {
  const config = sizeConfig[size];

  const avatarContent = (
    <div className="relative">
      <Avatar
        className={cn(
          config.avatar,
          'ring-2 ring-background cursor-pointer transition-transform hover:scale-110 hover:z-10',
          className
        )}
        onClick={onClick}
      >
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className={config.text}>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      {showStatus && user.status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
            config.status,
            statusColors[user.status]
          )}
        />
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{avatarContent}</TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{user.name}</p>
            {user.role && <p className="text-xs text-muted-foreground">{user.role}</p>}
            {user.status && (
              <p className="text-xs capitalize text-muted-foreground">{user.status}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return avatarContent;
};

// Avatar Group Component
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 5,
  size = 'md',
  overlap = 'normal',
  showTooltip = true,
  showStatus = false,
  expandable = true,
  onUserClick,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = sizeConfig[size];
  const overlapClass = overlapConfig[overlap][size];

  const visibleUsers = users.slice(0, max);
  const hiddenUsers = users.slice(max);
  const hasMore = hiddenUsers.length > 0;

  return (
    <div className={cn('flex items-center', className)}>
      <AnimatePresence>
        {visibleUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.05 }}
            className={cn(index > 0 && overlapClass)}
            style={{ zIndex: visibleUsers.length - index }}
          >
            <SingleAvatar
              user={user}
              size={size}
              showStatus={showStatus}
              showTooltip={showTooltip}
              onClick={() => onUserClick?.(user)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
          <PopoverTrigger asChild>
            <motion.div
              className={cn(overlapClass)}
              style={{ zIndex: 0 }}
              whileHover={{ scale: 1.1 }}
            >
              <div
                className={cn(
                  config.avatar,
                  'rounded-full bg-muted flex items-center justify-center ring-2 ring-background cursor-pointer hover:bg-muted/80 transition-colors',
                  config.text
                )}
              >
                +{hiddenUsers.length}
              </div>
            </motion.div>
          </PopoverTrigger>
          {expandable && (
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  +{hiddenUsers.length} mais
                </p>
                {hiddenUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => {
                      onUserClick?.(user);
                      setIsExpanded(false);
                    }}
                  >
                    <SingleAvatar user={user} size="sm" showStatus={showStatus} showTooltip={false} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      {user.role && (
                        <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                      )}
                    </div>
                    {user.status && (
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          statusColors[user.status]
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          )}
        </Popover>
      )}
    </div>
  );
};

// Avatar Stack - Vertical stack
interface AvatarStackProps {
  users: AvatarUser[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
  onUserClick?: (user: AvatarUser) => void;
  className?: string;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  users,
  max = 5,
  size = 'md',
  showDetails = true,
  onUserClick,
  className,
}) => {
  const visibleUsers = users.slice(0, max);
  const hiddenCount = users.length - max;

  return (
    <div className={cn('space-y-2', className)}>
      {visibleUsers.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
          onClick={() => onUserClick?.(user)}
        >
          <SingleAvatar user={user} size={size} showStatus showTooltip={false} />
          {showDetails && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              {user.role && (
                <p className="text-sm text-muted-foreground truncate">{user.role}</p>
              )}
            </div>
          )}
        </motion.div>
      ))}
      {hiddenCount > 0 && (
        <p className="text-sm text-muted-foreground pl-2">
          +{hiddenCount} mais usuários
        </p>
      )}
    </div>
  );
};

// Avatar with Presence Indicator
interface PresenceAvatarProps extends Omit<SingleAvatarProps, 'showStatus'> {
  lastSeen?: Date;
  isTyping?: boolean;
}

export const PresenceAvatar: React.FC<PresenceAvatarProps> = ({
  user,
  lastSeen,
  isTyping,
  ...props
}) => {
  const getPresenceText = () => {
    if (isTyping) return 'Digitando...';
    if (user.status === 'online') return 'Online';
    if (lastSeen) {
      const diff = Date.now() - lastSeen.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Visto agora';
      if (minutes < 60) return `Visto há ${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `Visto há ${hours}h`;
      return `Visto há ${Math.floor(hours / 24)}d`;
    }
    return 'Offline';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <SingleAvatar user={user} showStatus {...props} />
        {isTyping && (
          <motion.div
            className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.div>
        )}
      </div>
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{getPresenceText()}</p>
      </div>
    </div>
  );
};

// Avatar Upload
interface AvatarUploadProps {
  currentAvatar?: string;
  name: string;
  size?: 'md' | 'lg' | 'xl';
  onUpload: (file: File) => void;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  name,
  size = 'xl',
  onUpload,
  className,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const config = sizeConfig[size];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onUpload(file);
    }
  };

  return (
    <div className={cn('relative group', className)}>
      <Avatar className={cn(config.avatar, 'ring-4 ring-background shadow-lg')}>
        <AvatarImage src={preview || currentAvatar} alt={name} />
        <AvatarFallback className={config.text}>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <span className="text-white text-xs font-medium">Editar</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default AvatarGroup;
