import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border text-card-foreground transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out",
  {
    variants: {
      variant: {
        default: [
          "bg-card border-border/70",
          "shadow-[0_1px_3px_hsl(220_20%_20%/0.06),0_4px_16px_-4px_hsl(220_20%_20%/0.1),inset_0_1px_0_hsl(0_0%_100%/0.7)]",
          "dark:border-white/10 dark:bg-card/90 dark:backdrop-blur-xl",
          "dark:shadow-[0_8px_32px_-8px_hsl(0_0%_0%/0.5),inset_0_1px_0_hsl(0_0%_100%/0.05)]",
        ],
        elevated: [
          "bg-card border-border/50",
          "shadow-[0_4px_12px_-2px_hsl(220_20%_20%/0.1),0_8px_24px_-4px_hsl(220_20%_20%/0.12),inset_0_1px_0_hsl(0_0%_100%/0.8)]",
          "dark:border-white/10 dark:bg-card/95 dark:backdrop-blur-2xl",
          "dark:shadow-[0_12px_40px_-8px_hsl(0_0%_0%/0.6),0_0_0_1px_hsl(0_0%_100%/0.05)_inset,inset_0_1px_0_hsl(0_0%_100%/0.08)]",
        ],
        interactive: [
          "bg-card border-border/70 cursor-pointer",
          "shadow-[0_1px_3px_hsl(220_20%_20%/0.06),0_4px_16px_-4px_hsl(220_20%_20%/0.1),inset_0_1px_0_hsl(0_0%_100%/0.7)]",
          "hover:shadow-[0_8px_25px_-5px_hsl(220_20%_20%/0.15),0_12px_30px_-8px_hsl(220_20%_20%/0.1)]",
          "hover:border-border hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-[0_2px_8px_-2px_hsl(220_20%_20%/0.1)]",
          "dark:border-white/10 dark:bg-card/90 dark:backdrop-blur-xl",
          "dark:shadow-[0_8px_32px_-8px_hsl(0_0%_0%/0.5),inset_0_1px_0_hsl(0_0%_100%/0.05)]",
          "dark:hover:border-primary/30 dark:hover:shadow-[0_12px_40px_-8px_hsl(0_0%_0%/0.6),0_0_30px_hsl(var(--primary)/0.15)]",
        ],
        glass: [
          "bg-card/60 backdrop-blur-xl border-white/20",
          "shadow-[0_4px_24px_-4px_hsl(220_20%_20%/0.1),inset_0_1px_0_hsl(0_0%_100%/0.5)]",
          "dark:bg-card/40 dark:border-white/10 dark:backdrop-blur-2xl",
          "dark:shadow-[0_8px_32px_-8px_hsl(0_0%_0%/0.5),inset_0_1px_0_hsl(0_0%_100%/0.1)]",
        ],
        ghost: [
          "bg-transparent border-transparent",
          "hover:bg-muted/50 hover:border-border/50",
          "dark:hover:bg-muted/30 dark:hover:border-white/10",
        ],
        outline: [
          "bg-transparent border-border",
          "hover:bg-card/50",
          "dark:border-white/20 dark:hover:bg-card/30",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-display text-2xl font-bold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
