"use client";

import { Loader2, Lock } from "lucide-react";
import { PanelSection, SwitchRow } from "@/components/forms/PanelSection";
import FolderMemberPicker from "@/components/library/FolderMemberPicker";
import type { FolderAccess } from "@/lib/libraryService";

interface FolderRestrictionFieldsProps {
  /** Para que el interruptor tenga un id propio en cada diálogo. */
  idPrefix: string;
  restricted: boolean;
  onRestrictedChange: (restricted: boolean) => void;
  memberIds: number[];
  onMemberIdsChange: (ids: number[]) => void;
  /** A quién se puede dar acceso; llega tras consultar al servidor. */
  access: Pick<FolderAccess, "candidates" | "inherited_from"> | undefined;
  loading: boolean;
  /** Texto bajo el interruptor. */
  description: string;
  /** `data-tour` del interruptor y de la lista, para los tours que los señalan. */
  tourIds?: { switch?: string; members?: string };
}

/**
 * Quién ve una carpeta: el interruptor «solo personas seleccionadas» y, si
 * está activo, la lista para elegirlas. Lo comparten crear carpeta y accesos.
 */
export function FolderRestrictionFields({
  idPrefix,
  restricted,
  onRestrictedChange,
  memberIds,
  onMemberIdsChange,
  access,
  loading,
  description,
  tourIds,
}: FolderRestrictionFieldsProps) {
  return (
    <PanelSection icon={Lock} title="Acceso" compact>
      <div className="space-y-4">
        <div data-tour={tourIds?.switch}>
          <SwitchRow
            id={`${idPrefix}-restricted`}
            checked={restricted}
            onCheckedChange={onRestrictedChange}
            label="Solo personas seleccionadas"
            description={description}
          />
        </div>

        {restricted &&
          (loading || !access ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Cargando...
            </div>
          ) : (
            <div className="space-y-3">
              {access.inherited_from && (
                <p className="text-[13px] text-amber-700 dark:text-amber-400">
                  Está dentro de una carpeta restringida (
                  {access.inherited_from.path}): solo puede elegir entre quienes
                  ya tienen acceso a ella.
                </p>
              )}
              <div data-tour={tourIds?.members}>
                <FolderMemberPicker
                  candidates={access.candidates}
                  value={memberIds}
                  onChange={onMemberIdsChange}
                />
              </div>
            </div>
          ))}
      </div>
    </PanelSection>
  );
}
