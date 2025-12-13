import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "shadow-sm hover:shadow-md",
          "dark:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]",
          "dark:hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.6)]",
          "dark:hover:translate-y-[-1px]",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          "shadow-sm hover:shadow-md",
          "dark:shadow-[0_0_20px_-5px_hsl(var(--destructive)/0.4)]",
          "dark:hover:shadow-[0_0_30px_-5px_hsl(var(--destructive)/0.6)]",
        ],
        outline: [
          "border-2 border-border bg-transparent text-foreground",
          "hover:bg-muted hover:border-primary/50 hover:text-primary",
          "dark:border-border/50 dark:hover:border-primary/50",
          "dark:hover:bg-primary/10 dark:hover:text-primary",
          "dark:hover:shadow-[0_0_20px_-8px_hsl(var(--primary)/0.3)]",
        ],
        secondary: [
          "bg-muted text-foreground border border-border",
          "hover:bg-muted/80 hover:border-border/80",
          "dark:border-white/5 dark:bg-secondary/50 dark:backdrop-blur-sm",
          "dark:hover:bg-secondary/80 dark:hover:border-white/10",
        ],
        ghost: [
          "text-foreground hover:bg-muted hover:text-foreground",
          "dark:hover:bg-white/5 dark:hover:text-foreground",
        ],
        link: "text-primary underline-offset-4 hover:underline font-semibold",
        // Gaming/Gradient variants
        gradient: [
          "gradient-primary text-white border-0",
          "shadow-md hover:shadow-lg",
          "dark:shadow-[0_4px_20px_-5px_hsl(var(--primary)/0.4)]",
          "dark:hover:shadow-[0_8px_30px_-5px_hsl(var(--primary)/0.6)]",
          "hover:translate-y-[-2px]",
          "active:translate-y-0",
        ],
        "gradient-secondary": [
          "gradient-secondary text-white border-0",
          "shadow-md hover:shadow-lg",
          "dark:shadow-[0_4px_20px_-5px_hsl(210_100%_60%/0.4)]",
          "dark:hover:shadow-[0_8px_30px_-5px_hsl(210_100%_60%/0.6)]",
          "hover:translate-y-[-2px]",
        ],
        "gradient-success": [
          "gradient-success text-white border-0",
          "shadow-md hover:shadow-lg",
          "dark:shadow-[0_4px_20px_-5px_hsl(142_70%_50%/0.4)]",
          "dark:hover:shadow-[0_8px_30px_-5px_hsl(142_70%_50%/0.6)]",
          "hover:translate-y-[-2px]",
        ],
        glow: [
          "bg-primary text-primary-foreground",
          "shadow-lg",
          "dark:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]",
          "dark:hover:shadow-[0_0_50px_-5px_hsl(var(--primary)/0.7)]",
          "hover:translate-y-[-2px]",
          "dark:pulse-glow",
        ],
        glass: [
          "bg-foreground/5 text-foreground border border-border/50 backdrop-blur-xl",
          "hover:bg-foreground/10 hover:border-border",
          "dark:bg-white/10 dark:text-white dark:border-white/10",
          "dark:hover:bg-white/20 dark:hover:border-white/20",
          "dark:hover:shadow-[0_0_20px_-8px_hsl(0_0%_100%/0.2)]",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      shimmer: {
        true: "relative overflow-hidden",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shimmer: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  shimmer?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shimmer, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, shimmer, className }))} 
        ref={ref} 
        {...props}
      >
        {children}
        {shimmer && (
          <span 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer-btn_2s_infinite]" 
            aria-hidden="true"
          />
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
