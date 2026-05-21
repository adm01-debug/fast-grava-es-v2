import React from 'react';
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className, 
  collapsed = false, 
  size = 'md',
  showSubtitle = true 
}) => {
  const sizes = {
    sm: { icon: 32, fontMain: "text-sm", fontSub: "text-[10px]", gap: "gap-2.5" },
    md: { icon: 44, fontMain: "text-lg", fontSub: "text-[11px]", gap: "gap-3" },
    lg: { icon: 72, fontMain: "text-4xl", fontSub: "text-sm", gap: "gap-4" },
    xl: { icon: 140, fontMain: "text-6xl", fontSub: "text-xl", gap: "gap-5" },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex flex-col select-none min-w-0", className)}>
      <div className={cn("flex items-center", currentSize.gap)}>
        {/* Icon "F" */}
        <div
          className="relative flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10"
          style={{
            width: currentSize.icon,
            height: currentSize.icon,
            background: "linear-gradient(135deg, #FF5A1F 0%, #E84D15 100%)"
          }}
        >
          <span className="text-white font-black leading-none" style={{ fontSize: currentSize.icon * 0.58 }}>F</span>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/25 to-transparent pointer-events-none" />
        </div>

        {/* Title */}
        {!collapsed && (
          <h1 className={cn("font-black tracking-tighter text-white uppercase truncate leading-none", currentSize.fontMain)}>
            FAST GRAVAÇÕES
          </h1>
        )}
      </div>

      {/* Tagline - Below the Logo */}
      {!collapsed && showSubtitle && (
        <div className="flex flex-col mt-2">
          <p className={cn("font-black tracking-[0.2em] text-zinc-500 uppercase truncate leading-none", currentSize.fontSub)}>
            QUALIDADE + VELOCIDADE
          </p>
        </div>
      )}
    </div>
  );
};