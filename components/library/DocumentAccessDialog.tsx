"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { FolderRestrictionFields } from "@/components/library/FolderRestrictionFields";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaAccesoDocumentoSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-acceso-documento";
import { Dialog } from "@/components/ui/dialog";
import libraryService from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";

interface DocumentAccessDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  documentId: number;
  documentTitle: string;
  onSuccess: () => void | Promise<unknown>;
}

interface Draft {
  restricted: boolean;
  ids: number[];
}

/**
 * Quién ve un documento. Sin restringir hereda el acceso de su carpeta;
 * restringido, lo ven solo el director del departamento y las personas
 * elegidas (de cualquier departamento), sin importar la carpeta: sirve para
 * dejar fuera a alguien que ve la carpeta o para dar un documento suelto a
 * quien no la ve.
 */
export default function DocumentAccessDialog({
  open,
  onClose,
  ...form
}: DocumentAccessDialogProps) {
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour(
        "biblioteca-acceso-documento",
        "Acceso del Documento",
        bibliotecaAccesoDocumentoSteps,
        { onlyVisible: true },
      );
    }
    return () => unregisterTour("biblioteca-acceso-documento");
  }, [open, registerTour, unregisterTour]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <FormDialogContent
        icon={Lock}
        tone="amber"
        title="Accesos del documento"
        description={form.documentTitle}
        tourId="biblioteca-doc-access-title"
        lockOutside={false}
        className="sm:max-w-xl"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre con lo guardado. */}
        <DocumentAccessForm onClose={onClose} {...form} />
      </FormDialogContent>
    </Dialog>
  );
}

function DocumentAccessForm({
  onClose,
  company,
  documentId,
  onSuccess,
}: Omit<DocumentAccessDialogProps, "open" | "documentTitle"> & {
  documentTitle?: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["library-document-access", company, documentId],
    queryFn: () => libraryService.getDocumentAccess(company, documentId),
    staleTime: 0,
  });

  // Lo que el usuario cambió; mientras no toque nada manda lo guardado.
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const restricted = draft?.restricted ?? data?.restricted ?? false;
  const ids = draft?.ids ?? data?.employee_ids ?? [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await libraryService.updateDocumentAccess(company, documentId, {
        restricted,
        employee_ids: restricted ? ids : [],
      });
      toast.success(
        restricted
          ? "Acceso del documento actualizado"
          : "El documento vuelve al acceso de su carpeta",
      );
      await onSuccess();
      onClose();
    } catch (err) {
      notifyError(err, { action: "guardar el acceso del documento" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="py-6 text-center text-sm text-red-600 dark:text-red-400">
        No se pudo cargar el acceso del documento.
      </p>
    );
  }

  return (
    <ArticleFormShell
      onSubmit={handleSubmit}
      onCancel={onClose}
      busy={saving}
      canSave
      submitLabel="Guardar cambios"
      submitTourId="biblioteca-doc-access-save"
    >
      <FolderRestrictionFields
        idPrefix="library-document-access"
        restricted={restricted}
        onRestrictedChange={(next) => setDraft({ restricted: next, ids })}
        memberIds={ids}
        onMemberIdsChange={(next) => setDraft({ restricted, ids: next })}
        access={{ candidates: data.candidates, inherited_from: null }}
        loading={false}
        tourIds={{
          switch: "biblioteca-doc-access-switch",
          members: "biblioteca-doc-access-members",
        }}
        description="Si está apagado, lo ve quien tenga acceso a su carpeta. Encendido, solo estas personas (y la dirección del departamento), aunque vean o no la carpeta. Vale también para sus réplicas."
      />
    </ArticleFormShell>
  );
}
