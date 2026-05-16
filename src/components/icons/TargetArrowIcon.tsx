import { SVGProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Ícone de alvo com flecha (bullseye + arrow).
 * Compatível com a API do lucide-react: aceita className, size, strokeWidth, color.
 */
interface TargetArrowIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  size?: number | string;
  strokeWidth?: number;
}

export const TargetArrowIcon = forwardRef<SVGSVGElement, TargetArrowIconProps>(
  ({ className, size = 24, strokeWidth = 2, color = 'currentColor', ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide', className)}
      {...props}
    >
      {/* Anel externo (aberto onde a flecha entra) */}
      <path d="M21.5 10.5A10 10 0 1 1 13.5 2.5" />
      {/* Anel intermediário */}
      <path d="M18 11.5a6.5 6.5 0 1 1-5.5-6.4" />
      {/* Anel interno */}
      <path d="M14.5 12a3 3 0 1 1-3-3" />
      {/* Haste da flecha (do centro até a ponta) */}
      <path d="m12 12 7.5-7.5" />
      {/* Cabeça da flecha (formato de bandeira) */}
      <path d="M16 4.5 19.5 4l.5 3.5L23 8l-4 4-3.5-.5-.5-3.5z" />
    </svg>
  )
);

TargetArrowIcon.displayName = 'TargetArrowIcon';

export default TargetArrowIcon;
