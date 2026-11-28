"use client";

import { selectTriggerClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LibraryDocumentVersion } from "@/hooks/general/archivos/useGetDocumentVersions";

interface VersionSelectProps {
  versions: LibraryDocumentVersion[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  /** Texto de la bitácora cuando una versión no trae descripción. */
  emptyLogLabel: string;
  noVersionsLabel: string;
  tour?: string;
}

/** Elegir una versión del historial de un documento, con su etiqueta y su bitácora. */
export function VersionSelect({
  versions,
  value,
  onChange,
  loading = false,
  disabled = false,
  emptyLogLabel,
  noVersionsLabel,
  tour,
}: VersionSelectProps) {
  const empty = !loading && versions.length === 0;

  return (
    <div data-tour={tour}>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || loading || empty}
      >
        <SelectTrigger className={selectTriggerClass} aria-label="Versión">
          <SelectValue
            placeholder={
              loading
                ? "Cargando versiones..."
                : empty
                  ? noVersionsLabel
                  : "Seleccione la versión"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version.id} value={String(version.id)}>
              {version.version_label || version.version_number} —{" "}
              {version.change_log || emptyLogLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
