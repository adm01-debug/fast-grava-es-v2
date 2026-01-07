import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, Edit3, MessageCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: 'viewing' | 'editing' | 'idle';
  location?: string;
  lastActivity: Date;
}

interface CollaborationContextType {
  collaborators: Collaborator[];
  currentUser: Collaborator | null;
  setStatus: (status: Collaborator['status']) => void;
  setLocation: (location: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

interface CollaborationProviderProps {
  children: ReactNode;
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

export function CollaborationProvider({
  children,
  userId = 'current-user',
  userName = 'Você',
  userAvatar,
}: CollaborationProviderProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUser, setCurrentUser] = useState<Collaborator>({
    id: userId,
    name: userName,
    avatar: userAvatar,
    color: COLORS[0],
    status: 'viewing',
    lastActivity: new Date(),
  });

  const setStatus = useCallback((status: Collaborator['status']) => {
    setCurrentUser(prev => ({ ...prev, status, lastActivity: new Date() }));
  }, []);

  const setLocation = useCallback((location: string) => {
    setCurrentUser(prev => ({ ...prev, location, lastActivity: new Date() }));
  }, []);

  // Simulate other collaborators for demo
  useEffect(() => {
    const demoCollaborators: Collaborator[] = [
      {
        id: 'user-2',
        name: 'Maria Silva',
        color: COLORS[1],
        status: 'editing',
        location: 'Dashboard',
        lastActivity: new Date(),
      },
      {
        id: 'user-3',
        name: 'João Santos',
        color: COLORS[2],
        status: 'viewing',
        location: 'Relatórios',
        lastActivity: new Date(Date.now() - 60000),
      },
    ];
    setCollaborators(demoCollaborators);
  }, []);

  return (
    <CollaborationContext.Provider value={{ collaborators, currentUser, setStatus, setLocation }}>
      {children}
    </CollaborationContext.Provider>
  );
}

// Presence Avatars
export function PresenceAvatars({ maxVisible = 3 }: { maxVisible?: number }) {
  const { collaborators } = useCollaboration();
  const visible = collaborators.slice(0, maxVisible);
  const remaining = collaborators.length - maxVisible;

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        <AnimatePresence>
          {visible.map((collaborator) => (
            <Tooltip key={collaborator.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative"
                >
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback style={{ backgroundColor: collaborator.color }}>
                      {collaborator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <StatusIndicator status={collaborator.status} />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">{collaborator.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {collaborator.status === 'editing' ? 'Editando' : 
                     collaborator.status === 'viewing' ? 'Visualizando' : 'Inativo'}
                    {collaborator.location && ` em ${collaborator.location}`}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </AnimatePresence>
        
        {remaining > 0 && (
          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
            +{remaining}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function StatusIndicator({ status }: { status: Collaborator['status'] }) {
  const colors = {
    editing: 'bg-chart-2',
    viewing: 'bg-primary',
    idle: 'bg-muted-foreground',
  };

  return (
    <span className={cn(
      'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
      colors[status]
    )} />
  );
}

// Live Cursors (simplified representation)
export function LiveCursors() {
  const { collaborators } = useCollaboration();
  
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {collaborators.filter(c => c.status === 'editing').map((collaborator) => (
          <motion.div
            key={collaborator.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
          >
            <div className="flex items-center gap-1">
              <Edit3 className="h-4 w-4" style={{ color: collaborator.color }} />
              <span 
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Collaboration Panel
export function CollaborationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { collaborators } = useCollaboration();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border hover:bg-muted transition-colors"
      >
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">{collaborators.length + 1} online</span>
        <Circle className="h-2 w-2 fill-chart-2 text-chart-2" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-card border rounded-xl shadow-lg p-4 z-50"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Colaboradores Online
            </h3>
            
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback style={{ backgroundColor: collaborator.color }}>
                        {collaborator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <StatusIndicator status={collaborator.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{collaborator.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {collaborator.status === 'editing' ? (
                        <><Edit3 className="h-3 w-3" /> Editando</>
                      ) : collaborator.status === 'viewing' ? (
                        <><Eye className="h-3 w-3" /> Visualizando</>
                      ) : (
                        <><Circle className="h-3 w-3" /> Inativo</>
                      )}
                      {collaborator.location && ` • ${collaborator.location}`}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CollaborationProvider;
