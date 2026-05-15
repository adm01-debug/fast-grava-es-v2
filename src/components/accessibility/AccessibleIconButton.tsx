import * as React from "react";
import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function VisuallyHidden({ children, as: Component = "span" }: VisuallyHiddenProps): JSX.Element {
  return <Component className="sr-only">{children}</Component>;
}

interface AccessibleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  showLabel?: boolean;
}

export const AccessibleIconButton = React.forwardRef<HTMLButtonElement, AccessibleIconButtonProps>(
  ({ icon, label, showLabel = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "rounded-md p-2",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {icon}
        {showLabel ? <span>{label}</span> : <VisuallyHidden>{label}</VisuallyHidden>}
      </button>
    );
  }
);

AccessibleIconButton.displayName = "AccessibleIconButton";
