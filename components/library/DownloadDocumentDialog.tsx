"use client";

import { useEffect, useState } from "react";
import { Clock, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ChoiceCard } from "@/components/library/ChoiceCard";
import { LibraryDialogActions } from "@/components/library/LibraryDialogActions";
import { VersionSelect } from "@/components/library/VersionSelect";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaDescargaSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-descarga";
import { Dialog } from "@/components/ui/dialog";
import { useGetDocumentVersions } from "@/hooks/general/archivos/useGetDocumentVersions";
import { downloadDocumentFile } from "@/lib/Library/download-helper";
import { notifyError } from "@/lib/notify-error";

interface DownloadProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  company: string;
}

export const DownloadDocumentDialog = ({
  isOpen,
  onClose,
  ...rest
}: DownloadProps) => {
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (isOpen) {
      registerTour(
        "biblioteca-descarga",
        "Descargar Documento",
        bibliotecaDescargaSteps,
        { onlyVisible: true },
      );
    }
    return () => unregisterTour("biblioteca-descarga");
  }, [isOpen, registerTour, unregisterTour]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormDialogContent
        icon={Download}
        title="Descargar"
        description={
          <>
            Elija qué versión de{" "}
            <span className="font-medium text-foreground">
              {rest.doc?.title}
            </span>{" "}
            desea descargar.
          </>
        }
        tourId="biblioteca-download-title"
        lockOutside={false}
        className="sm:max-w-lg"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre sin elección previa. */}
        <DownloadDocumentForm onClose={onClose} {...rest} />
      </FormDialogContent>
    </Dialog>
  );
};

function DownloadDocumentForm({
  onClose,
  doc,
  company,
}: Omit<DownloadProps, "isOpen">) {
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<"document" | "version">("document");
  const [versionId, setVersionId] = useState("");

  const { versions, isFetching: loadingVersions } = useGetDocumentVersions({
    company,
    documentId: doc?.id,
    action: "obtener el historial para la descarga",
  });

  const canConfirm =
    mode === "document" || (!!versionId && versions.length > 0);

  const handleDownload = async () => {
    setProcessing(true);
    try {
      const isCurrent = mode === "document";
      const url = isCurrent
        ? `/${company}/library/documents/${doc.id}/download`
        : `/${company}/library/versions/${versionId}/download`;

      const version = versions.find((v) => String(v.id) === versionId);
      const label = isCurrent
        ? "VIGENTE"
        : version?.version_label || version?.version_number || "VERSION";

      // La extensión sale del archivo real: forzar .pdf dejaba los Excel sin abrir.
      const source = isCurrent
        ? (doc.latest_version?.file_path ?? doc.document ?? doc.file_path)
        : version?.file_path;
      const ext = String(source ?? "")
        .split(".")
        .pop()
        ?.toLowerCase();
      const safeExt = ["pdf", "xlsx", "xls"].includes(ext || "") ? ext : "pdf";
      const safeTitle = String(doc.title ?? "documento").replace(/\s+/g, "_");

      await downloadDocumentFile(url, `${safeTitle}_${label}.${safeExt}`);
      toast.success("Descarga iniciada");
      onClose();
    } catch (error) {
      notifyError(error, { action: "descargar el documento" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="radiogroup" className="space-y-3">
        <ChoiceCard
          tour="biblioteca-download-current"
          selected={mode === "document"}
          onSelect={() => setMode("document")}
          icon={FileText}
          title="Documento vigente"
          description="Descarga el archivo más reciente registrado en el sistema."
        />

        <ChoiceCard
          tour="biblioteca-download-version"
          selected={mode === "version"}
          onSelect={() => setMode("version")}
          icon={Clock}
          title="Versión del historial"
          description="Elija una versión anterior de la trazabilidad."
        >
          <VersionSelect
            tour="biblioteca-download-version-select"
            versions={versions}
            value={versionId}
            onChange={setVersionId}
            loading={loadingVersions}
            disabled={processing}
            emptyLogLabel="Carga inicial"
            noVersionsLabel="No hay versiones disponibles"
          />
        </ChoiceCard>
      </div>

      <LibraryDialogActions
        onCancel={onClose}
        onSubmit={handleDownload}
        busy={processing}
        busyLabel="Descargando..."
        disabled={!canConfirm}
        icon={<Download className="size-4" />}
        submitLabel="Descargar"
        cancelTourId="biblioteca-download-cancel"
        submitTourId="biblioteca-download-submit"
      />
    </div>
  );
}
