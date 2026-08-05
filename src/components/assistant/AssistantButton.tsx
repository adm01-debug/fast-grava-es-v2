import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import { TechnicalAssistant } from "./TechnicalAssistant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDevice } from "@/hooks/use-device";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const AssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useDevice();

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "fixed z-50 transition-all duration-300",
                isMobile ? "bottom-24 right-4" : "bottom-6 right-6"
              )}
            >
              <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className={cn(
                  "relative rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] bg-gradient-to-br from-primary via-primary/90 to-accent border border-primary/20",
                  isMobile ? "h-12 w-12" : "h-14 w-14"
                )}
                aria-label="Assistente IA"
              >
                <Bot className={cn("z-10", isMobile ? "h-5 w-5" : "h-6 w-6")} />
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full p-0.5 shadow-sm border border-accent-foreground/10">
                  <Sparkles className="h-2.5 w-2.5" />
                </div>
              </Button>
            </motion.div>
          </TooltipTrigger>
          {!isMobile && (
            <TooltipContent side="left" className="bg-popover/90 backdrop-blur-sm border-primary/20">
              <p className="font-medium">Assistente Técnico IA (Hyper 13/10)</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <TechnicalAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
