"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { cn } from "@/lib/utils";
import { initialsOf as personInitials, formalName } from "@/lib/person-name";

export type AvatarEmployee = {
  id?: number | string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  second_last_name?: string | null;
  dni?: string | null;
  dni_type?: string | null;
  photo_url?: string | null;
  photo_url_lg?: string | null;
};

export const employeeFullName = (
  employee: Pick<
    AvatarEmployee,
    "first_name" | "middle_name" | "last_name" | "second_last_name"
  >,
) => formalName(employee);

const initialsOf = (
  employee: Pick<AvatarEmployee, "first_name" | "last_name">,
) => personInitials(employee).toUpperCase() || "?";

/**
 * Foto del empleado en la fila. Con foto, al pulsarla se abre ampliada (y
 * SUPERUSER puede descargarla, que era lo que hacía el antiguo "Img. Carnet");
 * sin ella, sus iniciales. Corta el clic para no expandir la fila.
 */
export function EmployeeAvatar({
  employee,
  className,
}: {
  employee: AvatarEmployee;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const isSuperuser = useIsSuperuser();
  const name = employeeFullName(employee);

  const base = cn(
    "grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border bg-muted text-xs font-semibold text-muted-foreground",
    className,
  );

  if (!employee.photo_url || failed) {
    return (
      <span className={base} aria-hidden="true">
        {initialsOf(employee)}
      </span>
    );
  }

  const largeSrc = employee.photo_url_lg || employee.photo_url;

  const download = async () => {
    try {
      const response = await fetch(largeSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `carnet-${employee.dni ?? employee.id ?? "empleado"}.webp`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Sin red o sin permiso: no hay nada útil que decirle al usuario.
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Ver la foto de ${name}`}
        className={cn(
          base,
          "transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada del servidor de archivos, fuera del optimizador */}
        <img
          src={employee.photo_url}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(event) => event.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>
              {employee.dni
                ? employee.dni_type
                  ? `${employee.dni_type}-${employee.dni}`
                  : `DNI ${employee.dni}`
                : "Sin cédula registrada"}
            </DialogDescription>
          </DialogHeader>

          <div
            className="overflow-hidden rounded-lg border bg-muted"
            onContextMenu={(event) => event.preventDefault()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada del servidor de archivos */}
            <img
              src={largeSrc}
              alt={`Foto de ${name}`}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>

          {isSuperuser && (
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={download}>
                <Download className="mr-2 size-4" />
                Descargar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
