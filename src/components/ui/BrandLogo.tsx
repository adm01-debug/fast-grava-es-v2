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
    sm: { icon: 30, fontMain: "text-[13px]", fontSub: "text-[8px]", gap: "gap-2" },
    md: { icon: 36, fontMain: "text-[15px]", fontSub: "text-[9px]", gap: "gap-2.5" },
    lg: { icon: 64, fontMain: "text-3xl", fontSub: "text-[12px]", gap: "gap-3" },
    xl: { icon: 120, fontMain: "text-5xl", fontSub: "text-base", gap: "gap-4" },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex items-center select-none min-w-0", currentSize.gap, className)}>
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

      {/* Text Content */}
      {!collapsed && (
        <div className="flex flex-col leading-none min-w-0 flex-1">
          <h1 className={cn("font-black tracking-tight text-white uppercase truncate", currentSize.fontMain)}>
            FAST GRAVAÇÕES
          </h1>
          {showSubtitle && (
            <p className={cn("font-bold tracking-[0.18em] text-zinc-500 uppercase mt-1 truncate", currentSize.fontSub)}>
              QUALIDADE + VELOCIDADE
            </p>
          )}
        </div>
      )}
    </div>
  );
};
