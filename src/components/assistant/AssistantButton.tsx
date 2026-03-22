import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { TechnicalAssistant } from "./TechnicalAssistant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDevice } from "@/hooks/use-device";

export const AssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useDevice();

  // On mobile, hide the floating button to avoid overlap with FAB and bottom nav
  // Assistant is accessible via sidebar "Mais" menu on mobile
  return (
    <>
      {!isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-accent-foreground hover:from-primary/90 hover:to-accent-foreground/90"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Assistente Técnico IA</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TechnicalAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
