import * as React from "react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CodeBlockProps {
  code: string;
  label?: string;
  className?: string;
  showLineNumbers?: boolean;
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, label, className, showLineNumbers = false }, ref) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.split('\n');

    return (
      <div ref={ref} className={cn("space-y-1.5", className)}>
        {label && (
          <span className="text-[10px] text-muted-foreground font-medium">
            {label}
          </span>
        )}
        <div className="relative group">
          <pre className="bg-muted/50 dark:bg-black/30 border border-border rounded-md p-3 text-xs font-mono overflow-x-auto">
            {showLineNumbers ? (
              <code className="text-foreground/80">
                {lines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none text-muted-foreground/50 w-6 inline-block text-right mr-3">
                      {i + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                ))}
              </code>
            ) : (
              <code className="text-foreground/80">{code}</code>
            )}
          </pre>
          <Button
            size="icon-sm"
            variant="ghost"
            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
            aria-label={copied ? "Copiado" : "Copiar código"}
          >
            {copied ? <Check className="text-success" /> : <Copy />}
          </Button>
        </div>
      </div>
    );
  }
);

CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
