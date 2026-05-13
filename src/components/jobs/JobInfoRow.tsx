import React from "react";

interface JobInfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}

export function InfoRow({ icon: Icon, label, value, color }: JobInfoRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`p-2 rounded-lg ${color || 'bg-muted/50'}`}>
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
