"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CopyPartNumberButtonProps {
  value?: string | null;
  label?: string;
  className?: string;
}

const CopyPartNumberButton = ({
  value,
  label = "P/N",
  className,
}: CopyPartNumberButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const trimmed = value?.trim();
  if (!trimmed) return null;

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Los P/N viven dentro de celdas y tarjetas clicables: el copiado no debe
    // abrir el detalle ni disparar el ordenamiento de la tabla.
    event.stopPropagation();
    event.preventDefault();

    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar", {
        description: "Copie el número de parte manualmente.",
      });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copiar ${label} ${trimmed}`}
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
            copied && "text-emerald-600 dark:text-emerald-400",
            className,
          )}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {copied ? "Copiado" : `Copiar ${label}`}
      </TooltipContent>
    </Tooltip>
  );
};

export default CopyPartNumberButton;
