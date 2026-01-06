import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  Lightbulb,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
  feedback?: "positive" | "negative";
}

interface Suggestion {
  id: string;
  text: string;
  icon?: React.ReactNode;
}

interface AIAssistantWidgetProps {
  title?: string;
  placeholder?: string;
  suggestions?: Suggestion[];
  onSendMessage: (message: string) => Promise<string>;
  className?: string;
}

export function AIAssistantWidget({
  title = "Assistente IA",
  placeholder = "Pergunte algo...",
  suggestions = [],
  onSendMessage,
  className,
}: AIAssistantWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage.content);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
        status: "sent",
      };

      setMessages((prev) => [
        ...prev.map((m) => (m.id === userMessage.id ? { ...m, status: "sent" as const } : m)),
        assistantMessage,
      ]);
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "error" as const } : m))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.text);
    inputRef.current?.focus();
  };

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
    );
  };

  const handleRetry = (message: Message) => {
    setInput(message.content);
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-48px)]",
              isMinimized && "w-auto",
              className
            )}
          >
            <Card className="shadow-2xl border-primary/20 overflow-hidden">
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Messages */}
                    <ScrollArea ref={scrollRef} className="h-80">
                      <CardContent className="p-4 space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <Sparkles className="h-12 w-12 mx-auto text-primary/30 mb-3" />
                            <p className="text-sm text-muted-foreground">
                              Olá! Como posso ajudar você hoje?
                            </p>

                            {/* Suggestions */}
                            {suggestions.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {suggestions.map((suggestion) => (
                                  <Button
                                    key={suggestion.id}
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-left h-auto py-2"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                  >
                                    {suggestion.icon || <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />}
                                    <span className="truncate">{suggestion.text}</span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          messages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "flex gap-2",
                                message.role === "user" ? "flex-row-reverse" : ""
                              )}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                {message.role === "assistant" ? (
                                  <>
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                  </>
                                ) : (
                                  <AvatarFallback>
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                )}
                              </Avatar>

                              <div
                                className={cn(
                                  "flex-1 space-y-1",
                                  message.role === "user" ? "text-right" : ""
                                )}
                              >
                                <div
                                  className={cn(
                                    "inline-block p-3 rounded-lg text-sm max-w-[85%]",
                                    message.role === "assistant"
                                      ? "bg-muted"
                                      : "bg-primary text-primary-foreground",
                                    message.status === "error" && "bg-destructive/10 border border-destructive"
                                  )}
                                >
                                  {message.content}

                                  {message.status === "error" && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
                                      <AlertCircle className="h-3 w-3" />
                                      <span>Erro ao enviar</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => handleRetry(message)}
                                      >
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Tentar novamente
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {/* Actions for assistant messages */}
                                {message.role === "assistant" && message.status === "sent" && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => copyToClipboard(message.content)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-6 w-6",
                                        message.feedback === "positive" && "text-success"
                                      )}
                                      onClick={() => handleFeedback(message.id, "positive")}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-6 w-6",
                                        message.feedback === "negative" && "text-destructive"
                                      )}
                                      onClick={() => handleFeedback(message.id, "negative")}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Pensando...</span>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </ScrollArea>

                    {/* Input */}
                    <CardFooter className="p-3 border-t">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSend();
                        }}
                        className="flex gap-2 w-full"
                      >
                        <Input
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={placeholder}
                          disabled={isLoading}
                          className="flex-1"
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={!input.trim() || isLoading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// AI-powered suggestions component
interface AISuggestionsProps {
  context?: string;
  onSelect: (suggestion: string) => void;
  suggestions: string[];
  isLoading?: boolean;
}

export function AISuggestions({
  context,
  onSelect,
  suggestions,
  isLoading,
}: AISuggestionsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Gerando sugestões...</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Sugestões da IA</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}
