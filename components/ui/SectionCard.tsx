import type { LucideIcon } from "lucide-react";

import { sectionClass, SectionTitle } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  /** Aclara de qué trata la sección; se muestra bajo el título. */
  hint?: string;
  /** Sin icono explícito, la sección se dibuja con la viñeta neutra. */
  icon?: LucideIcon;
  /** Acción alineada a la derecha del encabezado. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Sección de formulario con el mismo cristal que el resto del almacén.
 *
 * La usan los formularios de artículo por lote; su aspecto sale de
 * `form-theme` para no volver a divergir entre las tres familias.
 */
export function SectionCard({
  title,
  hint,
  icon,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <section className={cn(sectionClass, className)}>
      <SectionTitle icon={icon} title={title} hint={hint} action={action} />
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
