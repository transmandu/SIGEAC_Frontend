"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Layers, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ChoiceCard } from "@/components/library/ChoiceCard";
import { LibraryDialogActions } from "@/components/library/LibraryDialogActions";
import { VersionSelect } from "@/components/library/VersionSelect";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaEliminarSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-eliminar";
import { Dialog } from "@/components/ui/dialog";
import { useGetDocumentVersions } from "@/hooks/general/archivos/useGetDocumentVersions";
import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";

interface DeleteProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  company: string;
  onSuccess: () => Promise<void>;
  /** Carpeta desde la que se borra: si es una réplica, solo se desvincula esa. */
  folderPath?: string;
}

export const DeleteDocumentDialog = ({
  isOpen,
  onClose,
  ...rest
}: DeleteProps) => {
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (isOpen) {
      registerTour(
        "biblioteca-eliminar",
        "Eliminar Documento",
        bibliotecaEliminarSteps,
        { onlyVisible: true },
      );
    }
    return () => unregisterTour("biblioteca-eliminar");
  }, [isOpen, registerTour, unregisterTour]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormDialogContent
        icon={Trash2}
        tone="rose"
        title="Eliminar"
        description={
          <>
            Elija qué desea quitar de{" "}
            <span className="font-medium text-foreground">
              {rest.doc?.title}
            </span>
            .
          </>
        }
        tourId="biblioteca-delete-title"
        className="sm:max-w-lg"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre sin elección previa. */}
        <DeleteDocumentForm onClose={onClose} {...rest} />
      </FormDialogContent>
    </Dialog>
  );
};

function DeleteDocumentForm({
  onClose,
  doc,
  company,
  onSuccess,
  folderPath,
}: Omit<DeleteProps, "isOpen">) {
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<"document" | "version">("document");
  const [versionId, setVersionId] = useState("");

  const { versions, isFetching: loadingVersions } = useGetDocumentVersions({
    company,
    documentId: doc?.id,
    action: "obtener el historial de versiones",
  });

  // Con una sola versión no hay nada que borrar por separado: el backend
  // rechaza dejar el documento sin archivo y devuelve 422.
  const removable = useMemo(
    () => (versions.length > 1 ? versions : []),
    [versions],
  );

  // Borrar desde una réplica solo la desvincula de esta carpeta: el original
  // y sus versiones se quedan donde están.
  const clean = (p?: string | null) => (p || "").replace(/[\\/]+$/, "") || "/";
  const isReplicaHere =
    (doc?.folder_paths?.length ?? 0) > 1 &&
    !!folderPath &&
    !!doc?.folder_path &&
    clean(folderPath) !== clean(doc.folder_path);

  const canConfirm =
    mode === "document" || (!!versionId && removable.length > 0);

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      if (mode === "document") {
        await axiosInstance.delete(`/${company}/library/documents/${doc.id}`, {
          ...(folderPath != null
            ? { data: { source_folder_path: folderPath } }
            : {}),
        });
        toast.success(
          isReplicaHere
            ? "Documento quitado de la carpeta"
            : "Documento enviado a la papelera",
        );
      } else {
        await axiosInstance.delete(`/${company}/library/versions/${versionId}`);
        toast.success("Versión eliminada");
      }
    } catch (error) {
      notifyError(error, { action: "eliminar el documento" });
      setProcessing(false);
      return;
    }

    setProcessing(false);
    try {
      await onSuccess();
    } finally {
      onClose();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="radiogroup" className="space-y-3">
        <ChoiceCard
          tour="biblioteca-delete-version"
          selected={mode === "version"}
          onSelect={() => setMode("version")}
          tone="amber"
          icon={Layers}
          title="Eliminar una versión"
          description="El documento sigue activo con la versión anterior. La versión se borra para siempre."
        >
          <VersionSelect
            tour="biblioteca-delete-version-select"
            versions={removable}
            value={versionId}
            onChange={setVersionId}
            loading={loadingVersions}
            disabled={processing}
            emptyLogLabel="Sin descripción"
            noVersionsLabel="No hay versiones adicionales para eliminar"
          />
        </ChoiceCard>

        <ChoiceCard
          tour="biblioteca-delete-document"
          selected={mode === "document"}
          onSelect={() => setMode("document")}
          tone="rose"
          icon={FileText}
          title={
            isReplicaHere
              ? "Quitar de esta carpeta"
              : "Enviar el documento a la papelera"
          }
          description={
            isReplicaHere
              ? "Es una réplica: solo se desvincula de esta carpeta. El original y su historial se mantienen."
              : "Deja de verse en la biblioteca y en sus enlaces. Puede restaurarlo desde la papelera."
          }
        />
      </div>

      <LibraryDialogActions
        onCancel={onClose}
        onSubmit={handleConfirm}
        busy={processing}
        busyLabel="Procesando..."
        disabled={!canConfirm}
        destructive={mode === "document"}
        submitLabel="Confirmar"
        cancelTourId="biblioteca-delete-cancel"
        submitTourId="biblioteca-delete-submit"
      />
    </div>
  );
}
