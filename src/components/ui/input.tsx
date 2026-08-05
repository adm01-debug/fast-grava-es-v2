import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-11 w-full rounded-lg px-4 py-2 text-base transition-all duration-200",
          // Border & Background
          "border border-input bg-background/80 backdrop-blur-sm",
          // Focus states
          "ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0",
          "focus-visible:border-primary focus-visible:bg-background",
          // Dark mode improvements
          "dark:bg-muted/30 dark:border-white/10",
          "dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/20",
          "dark:focus-visible:bg-muted/50",
          // Placeholder
          "placeholder:text-muted-foreground/60",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Responsive
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
