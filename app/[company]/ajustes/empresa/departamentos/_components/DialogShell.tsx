"use client";

import type { LucideIcon } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Dialog } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  /** Registro sobre el que se actúa; va antes de la descripción. */
  eyebrow?: string;
  description: string;
  className?: string;
  /** Pie fijo, para los diálogos cuyo cuerpo no es un formulario. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Diálogo de la pantalla: el molde de formulario del sistema con un contexto opcional. */
export function DialogShell({
  open,
  onOpenChange,
  icon,
  title,
  eyebrow,
  description,
  className = "sm:max-w-xl",
  footer,
  children,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={icon}
        title={title}
        description={
          eyebrow ? (
            <>
              <span className="font-medium text-foreground/80">{eyebrow}</span>
              {" · "}
              {description}
            </>
          ) : (
            description
          )
        }
        className={className}
        footer={footer}
      >
        {children}
      </FormDialogContent>
    </Dialog>
  );
}
