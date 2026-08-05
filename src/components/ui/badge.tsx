import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        // Gamification variants
        xp: "border-success/30 bg-success/20 text-success dark:border-success/50 dark:text-[hsl(142,70%,60%)]",
        coins: "border-warning/30 bg-warning/20 text-[hsl(45,100%,35%)] dark:border-warning/50 dark:text-warning",
        streak: "border-primary/30 bg-primary/20 text-primary dark:border-primary/50",
        gold: "rank-gold text-white border-0",
        silver: "rank-silver text-white border-0",
        bronze: "rank-bronze text-white border-0",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
      animated: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "xp",
        animated: true,
        className: "animate-pulse-soft",
      },
      {
        variant: "coins",
        animated: true,
        className: "coin-shine",
      },
      {
        variant: "streak",
        animated: true,
        className: "streak-fire",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      animated: false,
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  animated?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, animated, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, animated }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
