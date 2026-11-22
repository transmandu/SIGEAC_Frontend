"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, FileWarning, Loader2, PackageCheck } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Button } from "@/components/ui/button";
import { CheckboxCard } from "@/components/forms/mantenimiento/almacen/_components/CheckboxCard";
import CopyPartNumberButton from "@/components/misc/CopyPartNumberButton";
import { FilePickerField } from "@/components/misc/FilePickerField";
import { TagBadge } from "@/components/misc/TagBadge";
import { PanelSection } from "@/components/forms/PanelSection";
import {
  useConsignRequirementDocuments,
  type RequirementConsignment,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { cn } from "@/lib/utils";
import type { TransitArticle } from "@/types/purchase";

interface Props {
  article: TransitArticle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se ejecuta cuando toda la documentación pendiente quedó consignada. */
  onCompleted: () => void | Promise<void>;
}

type ConsignmentState = Record<number, { file?: File; isPhysical: boolean }>;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * Bloqueo documental del pase a recepción: muestra los requerimientos
 * (heredados desde la requisición) que aún no tienen documento consignado y
 * exige subir el archivo — o marcar la recepción física — de cada uno antes
 * de permitir la transición TRANSIT → RECEPTION.
 */
export function PendingDocumentsDialog({
  article,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { consignRequirementDocuments } = useConsignRequirementDocuments();

  const [consignments, setConsignments] = useState<ConsignmentState>({});

  const pendingRequirements = (article.document_requirements ?? []).filter(
    (req) => (req.documents ?? []).length === 0,
  );

  const setFile = (requirementId: number, file?: File) =>
    setConsignments((prev) => ({
      ...prev,
      [requirementId]: {
        ...prev[requirementId],
        isPhysical: prev[requirementId]?.isPhysical ?? false,
        file,
      },
    }));

  const setPhysical = (requirementId: number, isPhysical: boolean) =>
    setConsignments((prev) => ({
      ...prev,
      [requirementId]: { ...prev[requirementId], isPhysical },
    }));

  const isResolved = (requirementId: number) => {
    const entry = consignments[requirementId];
    return !!entry?.file || !!entry?.isPhysical;
  };

  const resolvedCount = pendingRequirements.filter((req) =>
    isResolved(req.id),
  ).length;
  const allResolved = resolvedCount === pendingRequirements.length;

  const busy = consignRequirementDocuments.isPending;

  // Lo elegido a medias no debe sobrevivir a un cierre: al reabrir se parte limpio.
  const handleOpenChange = (next: boolean) => {
    if (!next) setConsignments({});
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (!selectedCompany?.slug || !allResolved) return;

    const payload: RequirementConsignment[] = pendingRequirements.map(
      (req) => ({
        requirementId: req.id,
        file: consignments[req.id]?.file,
        isPhysical: consignments[req.id]?.isPhysical ?? false,
      }),
    );

    try {
      await consignRequirementDocuments.mutateAsync({
        company: selectedCompany.slug,
        consignments: payload,
      });
    } catch {
      // El aviso lo muestra la mutación; el diálogo sigue abierto para reintentar.
      return;
    }

    toast.success("Documentación consignada", {
      description:
        "Los documentos requeridos fueron registrados correctamente.",
    });

    handleOpenChange(false);
    await onCompleted();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <FormDialogContent
        className="sm:max-w-lg"
        icon={FileWarning}
        tone="amber"
        title="Documentación requerida pendiente"
        description={
          <>
            El artículo{" "}
            <span className="inline-flex items-center gap-1 align-middle">
              <span className="font-mono font-medium">
                {article.part_number}
              </span>
              <CopyPartNumberButton value={article.part_number} />
            </span>{" "}
            no puede pasar a recepción hasta consignar la documentación exigida
            en la requisición. Suba cada documento o marque su recepción en
            físico.
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={busy || !allResolved}
              onClick={handleConfirm}
              className="min-w-35 gap-2"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PackageCheck className="size-4" />
              )}
              Consignar y recibir
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p
            aria-live="polite"
            className="text-[13px] text-muted-foreground tabular-nums"
          >
            {resolvedCount} de {pendingRequirements.length} documento
            {pendingRequirements.length === 1 ? "" : "s"} resuelto
            {pendingRequirements.length === 1 ? "" : "s"}
          </p>

          {pendingRequirements.map((req) => {
            const entry = consignments[req.id];
            const resolved = isResolved(req.id);

            return (
              <PanelSection
                key={req.id}
                icon={FileWarning}
                title={req.document_type?.name ?? "Documento"}
                hint={req.document_type?.regulation ?? undefined}
                compact
                className={cn(
                  "transition-colors duration-200",
                  resolved &&
                    "border-emerald-300/70 dark:border-emerald-700/40",
                )}
                action={
                  resolved ? (
                    <TagBadge tone="emerald" icon={Check}>
                      Listo
                    </TagBadge>
                  ) : undefined
                }
              >
                <div className="space-y-3">
                  <FilePickerField
                    file={entry?.file}
                    onChange={(file) => setFile(req.id, file)}
                    acceptedTypes={ACCEPTED_TYPES}
                    typesLabel="PDF o imagen"
                    maxBytes={MAX_FILE_BYTES}
                    disabled={busy}
                  />

                  <CheckboxCard
                    id={`physical-${req.id}`}
                    checked={entry?.isPhysical ?? false}
                    onCheckedChange={(checked) => setPhysical(req.id, checked)}
                    disabled={busy}
                    label="Documento recibido en físico"
                    description="Sirve como constancia cuando no hay archivo que subir."
                  />
                </div>
              </PanelSection>
            );
          })}
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
