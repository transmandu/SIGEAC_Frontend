"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  /** Línea de contexto bajo el título, en el color de la marca. */
  eyebrow?: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Diálogo con la cabecera de los de /compras: degradado suave, icono en
 * recuadro y cuerpo con scroll propio.
 */
export function DialogShell({
  open,
  onOpenChange,
  icon: Icon,
  title,
  eyebrow,
  description,
  className,
  children,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[85vh] w-[95vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
          className,
        )}
      >
        <div className="from-primary/5 via-background to-background relative shrink-0 bg-linear-to-br px-4 pt-6 pb-4 sm:px-6">
          <DialogHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="bg-background flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border shadow-xs">
                <Icon className="text-primary h-6 w-6" />
              </div>

              <div className="min-w-0 space-y-1 text-left">
                <DialogTitle className="text-xl leading-none font-bold tracking-tight">
                  {title}
                </DialogTitle>
                {eyebrow && <p className="text-primary text-sm font-medium">{eyebrow}</p>}
                <DialogDescription className="text-sm leading-relaxed">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
