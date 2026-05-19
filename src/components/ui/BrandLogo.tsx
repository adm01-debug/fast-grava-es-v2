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
    sm: { icon: 32, fontMain: "text-lg", fontSub: "text-[8px]" },
    md: { icon: 44, fontMain: "text-xl", fontSub: "text-[10px]" },
    lg: { icon: 64, fontMain: "text-3xl", fontSub: "text-[12px]" },
    xl: { icon: 120, fontMain: "text-5xl", fontSub: "text-base" },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Icon "F" */}
      <div 
        className="relative flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-lg"
        style={{ 
          width: currentSize.icon, 
          height: currentSize.icon,
          background: "linear-gradient(135deg, #FF5A1F 0%, #E84D15 100%)"
        }}
      >
        <span className="text-white font-black" style={{ fontSize: currentSize.icon * 0.6 }}>F</span>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
      </div>

      {/* Text Content */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <h1 className={cn("font-black tracking-tighter text-white whitespace-nowrap uppercase", currentSize.fontMain)}>
            FAST GRAVAÇÕES
          </h1>
          {showSubtitle && (
            <p className={cn("font-bold tracking-[0.2em] text-zinc-500 uppercase mt-1", currentSize.fontSub)}>
              SISTEMA DE PRODUÇÃO
            </p>
          )}
        </div>
      )}
    </div>
  );
};
