import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  children?: React.ReactNode;
}

export function LabelWithTooltip({ label, tooltip, required, children }: LabelWithTooltipProps) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="block text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-zinc-400 hover:text-(--lumilee-gold) cursor-help transition-colors" />
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-800 text-zinc-50 border-zinc-700 max-w-xs">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {children}
    </div>
  );
}
