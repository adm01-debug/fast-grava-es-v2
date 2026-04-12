import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader2, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  pattern: RegExp;
  action: (matches: RegExpMatchArray) => void;
  description: string;
}

interface UseVoiceCommandsOptions {
  commands: VoiceCommand[];
  continuous?: boolean;
  language?: string;
  onTranscript?: (transcript: string) => void;
}

export function useVoiceCommands({
  commands,
  continuous = false,
  language = 'pt-BR',
  onTranscript,
}: UseVoiceCommandsOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof Object> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognitionAPI = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript.toLowerCase();
        
        setTranscript(transcriptText);
        onTranscript?.(transcriptText);

        if (result.isFinal) {
          // Match commands
          for (const command of commands) {
            const matches = transcriptText.match(command.pattern);
            if (matches) {
              command.action(matches);
              break;
            }
          }
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (import.meta.env.DEV) console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: 'Erro no reconhecimento de voz',
          description: 'Não foi possível processar sua voz.',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        if (!continuous) {
          setIsListening(false);
        }
      };
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [commands, continuous, language, onTranscript, toast]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript('');
    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}

// Voice Button Component
export const VoiceButton = forwardRef<HTMLDivElement, {
  onCommand?: (transcript: string) => void;
  className?: string;
}>(function VoiceButton({
  onCommand,
  className,
}, ref) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  const commands: VoiceCommand[] = [
    {
      pattern: /(?:ir para|abrir|navegar para) (.+)/i,
      action: (matches) => {
        const destination = matches[1];
        setLastCommand(`Navegando para ${destination}`);
        onCommand?.(`navigate:${destination}`);
      },
      description: 'Navegar para uma página',
    },
    {
      pattern: /(?:buscar|pesquisar|procurar) (.+)/i,
      action: (matches) => {
        const query = matches[1];
        setLastCommand(`Buscando: ${query}`);
        onCommand?.(`search:${query}`);
      },
      description: 'Buscar algo',
    },
    {
      pattern: /(?:criar|novo|adicionar) (.+)/i,
      action: (matches) => {
        const item = matches[1];
        setLastCommand(`Criando: ${item}`);
        onCommand?.(`create:${item}`);
      },
      description: 'Criar novo item',
    },
    {
      pattern: /(?:ajuda|help|comandos)/i,
      action: () => {
        setShowFeedback(true);
      },
      description: 'Mostrar ajuda',
    },
  ];

  const { isListening, transcript, isSupported, toggleListening } = useVoiceCommands({
    commands,
    onTranscript: (t) => {
      if (t.length > 0) {
        setShowFeedback(true);
      }
    },
  });

  useEffect(() => {
    if (!isListening && showFeedback) {
      const timer = setTimeout(() => setShowFeedback(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isListening, showFeedback]);

  if (!isSupported) return null;

  return (
    <div className={cn('relative', className)}>
      <Button
        size="icon"
        variant={isListening ? 'default' : 'outline'}
        onClick={toggleListening}
        className={cn(
          'relative transition-all',
          isListening && 'animate-pulse'
        )}
      >
        {isListening ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
        
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </Button>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 w-64 bg-card border rounded-xl shadow-lg p-4 z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                {isListening ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ouvindo...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Comando
                  </>
                )}
              </span>
              <button onClick={() => setShowFeedback(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            {transcript && (
              <p className="text-sm text-muted-foreground italic mb-2">
                "{transcript}"
              </p>
            )}
            
            {lastCommand && (
              <p className="text-sm text-chart-2">
                {lastCommand}
              </p>
            )}

            {!transcript && !lastCommand && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Comandos disponíveis:</p>
                <ul className="list-disc list-inside">
                  <li>"Ir para [página]"</li>
                  <li>"Buscar [termo]"</li>
                  <li>"Criar [item]"</li>
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Voice Feedback (Text-to-Speech)
export function useVoiceFeedback() {
  const speak = useCallback((text: string, options?: { lang?: string; rate?: number; pitch?: number; volume?: number }) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || 'pt-BR';
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, stop };
}

// Voice Feedback Button
export function VoiceFeedbackButton({ text }: { text: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak, stop } = useVoiceFeedback();

  const handleClick = () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    } else {
      speak(text);
      setIsSpeaking(true);
      
      // Reset after speaking
      const duration = (text.length / 10) * 1000;
      setTimeout(() => setIsSpeaking(false), duration);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleClick}
      className="h-8 w-8"
      title={isSpeaking ? 'Parar' : 'Ouvir'}
    >
      <Volume2 className={cn('h-4 w-4', isSpeaking && 'text-primary animate-pulse')} />
    </Button>
  );
}

export default useVoiceCommands;
