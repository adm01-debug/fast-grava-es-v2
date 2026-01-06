import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: "online" | "away" | "busy";
  lastSeen?: Date;
  currentPage?: string;
}

interface LivePresenceProps {
  users: User[];
  maxVisible?: number;
  className?: string;
}

const statusColors = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
};

export function LivePresence({ users, maxVisible = 4, className }: LivePresenceProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const hiddenCount = users.length - maxVisible;

  return (
    <TooltipProvider>
      <div className={cn("flex items-center -space-x-2", className)}>
        <AnimatePresence mode="popLayout">
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{ zIndex: visibleUsers.length - index }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar
                      className="h-8 w-8 border-2 border-background"
                      style={{ boxShadow: `0 0 0 2px ${user.color}` }}
                    >
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback
                        style={{ backgroundColor: user.color }}
                        className="text-white text-xs"
                      >
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Status indicator */}
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                        statusColors[user.status]
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-medium">{user.name}</p>
                    {user.currentPage && (
                      <p className="text-muted-foreground">
                        Visualizando: {user.currentPage}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </AnimatePresence>

        {hiddenCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{hiddenCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {users.slice(maxVisible).map((user) => (
                  <p key={user.id} className="text-xs">{user.name}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Cursor presence for collaborative editing
interface CursorPresenceProps {
  cursors: { userId: string; userName: string; color: string; x: number; y: number }[];
}

export function CursorPresence({ cursors }: CursorPresenceProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            {/* Cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: cursor.color }}
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>

            {/* Name tag */}
            <div
              className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.userName}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Activity indicator
interface ActivityIndicatorProps {
  isTyping?: boolean;
  isEditing?: boolean;
  userName?: string;
}

export function ActivityIndicator({ isTyping, isEditing, userName }: ActivityIndicatorProps) {
  if (!isTyping && !isEditing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 text-xs text-muted-foreground"
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span>
        {userName} está {isTyping ? "digitando" : "editando"}...
      </span>
    </motion.div>
  );
}

// Who's here banner
interface WhosHereBannerProps {
  users: User[];
  currentUserId: string;
}

export function WhosHereBanner({ users, currentUserId }: WhosHereBannerProps) {
  const otherUsers = users.filter((u) => u.id !== currentUserId);

  if (otherUsers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b"
    >
      <LivePresence users={otherUsers} maxVisible={3} />
      <span className="text-sm text-muted-foreground">
        {otherUsers.length === 1
          ? `${otherUsers[0].name} está online`
          : `${otherUsers.length} pessoas online`}
      </span>
    </motion.div>
  );
}

// Hook for simulating presence (replace with real-time in production)
export function useLivePresence(currentUser: { id: string; name: string }) {
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    // Simulate current user presence
    setUsers([
      {
        id: currentUser.id,
        name: currentUser.name,
        color: "hsl(234, 89%, 63%)",
        status: "online",
      },
    ]);

    // In production, connect to real-time service (Supabase Realtime, etc.)
    // and update users based on presence events
  }, [currentUser.id, currentUser.name]);

  return { users };
}
