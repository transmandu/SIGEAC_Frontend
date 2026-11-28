"use client";

import { useEffect, useState } from "react";
import { FileText, FileUp, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  fieldClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import {
  PanelSection,
  PanelStaticLabel,
  SwitchRow,
} from "@/components/forms/PanelSection";
import { DateField } from "@/components/misc/DateField";
import { FilePickerField } from "@/components/misc/FilePickerField";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaUploadVersionSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-upload-version";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import { ALLOWED_EXTENSIONS, MAX_FILE_BYTES } from "@/lib/Library/upload-rules";

interface UploadVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any;
  company: string;
  onSuccess?: () => Promise<void> | void;
}

// Lo que admite la biblioteca al subir; el servidor aplica las mismas reglas.
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const UploadVersionDialog = ({
  isOpen,
  onClose,
  ...rest
}: UploadVersionDialogProps) => {
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (isOpen) {
      registerTour(
        "biblioteca-upload-version",
        "Subir Nueva Versión",
        bibliotecaUploadVersionSteps,
        { onlyVisible: true },
      );
    }
    return () => unregisterTour("biblioteca-upload-version");
  }, [isOpen, registerTour, unregisterTour]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormDialogContent
        icon={UploadCloud}
        title="Subir nueva versión"
        description={
          <>
            La versión nueva pasa a ser la vigente de{" "}
            <span className="font-medium text-foreground">
              {rest.doc?.title}
            </span>
            .
          </>
        }
        tourId="biblioteca-version-title"
        className="sm:max-w-xl"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre limpio. */}
        <UploadVersionForm onClose={onClose} {...rest} />
      </FormDialogContent>
    </Dialog>
  );
};

function UploadVersionForm({
  onClose,
  doc,
  company,
  onSuccess,
}: Omit<UploadVersionDialogProps, "isOpen">) {
  // La naturaleza del documento actual decide si la versión nueva parte con vencimiento.
  const status = String(doc?.expiry_status || "")
    .toLowerCase()
    .trim();
  const originalHasExpiry =
    status === "vigente" ||
    status === "vencido" ||
    doc?.requires_expiry === 1 ||
    doc?.latest_version?.requires_expiry === 1;

  const [file, setFile] = useState<File | undefined>();
  const [changeLog, setChangeLog] = useState("");
  const [versionLabel, setVersionLabel] = useState("");
  const [requiresExpiry, setRequiresExpiry] = useState(originalHasExpiry);
  const [expirationDate, setExpirationDate] = useState("");
  const [uploading, setUploading] = useState(false);

  const canSave =
    !!file &&
    changeLog.trim() !== "" &&
    (!requiresExpiry || expirationDate !== "");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave || !file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("change_log", changeLog.trim());
    if (versionLabel.trim())
      formData.append("version_label", versionLabel.trim());
    formData.append("requires_expiry", requiresExpiry ? "1" : "0");
    if (requiresExpiry && expirationDate) {
      formData.append("expiration_date", expirationDate);
    }

    setUploading(true);
    try {
      await axiosInstance.post(
        `/${company}/library/documents/${doc.id}/versions`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Nueva versión cargada");
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error) {
      notifyError(error, { action: "subir la versión" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ArticleFormShell
      onSubmit={handleSubmit}
      onCancel={onClose}
      busy={uploading}
      canSave={canSave}
      submitLabel="Subir versión"
      submitTourId="biblioteca-version-submit"
    >
      <PanelSection icon={FileUp} title="Archivo" compact>
        <div data-tour="biblioteca-version-dropzone">
          <FilePickerField
            file={file}
            onChange={setFile}
            acceptedTypes={ACCEPTED_TYPES}
            acceptedExtensions={ALLOWED_EXTENSIONS}
            typesLabel="PDF o Excel"
            maxBytes={MAX_FILE_BYTES}
            emptyLabel="Seleccionar el archivo nuevo"
          />
        </div>
      </PanelSection>

      <PanelSection icon={FileText} title="Datos de la versión" compact>
        <div className="space-y-4">
          <div data-tour="biblioteca-version-justificacion">
            <PanelStaticLabel>Justificación del cambio *</PanelStaticLabel>
            <Textarea
              value={changeLog}
              onChange={(event) => setChangeLog(event.target.value)}
              placeholder="Ej. Actualización de procedimientos por auditoría"
              rows={3}
              className={textareaClass}
            />
          </div>

          <div data-tour="biblioteca-version-label">
            <PanelStaticLabel>Etiqueta de versión</PanelStaticLabel>
            <Input
              value={versionLabel}
              onChange={(event) => setVersionLabel(event.target.value)}
              placeholder="Ej. Rev A, Borrador, Final"
              maxLength={100}
              className={fieldClass}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection icon={FileText} title="Vigencia" compact>
        <div className="space-y-4" data-tour="biblioteca-version-vigencia">
          <SwitchRow
            id="library-version-expiry"
            checked={requiresExpiry}
            onCheckedChange={(checked) => {
              setRequiresExpiry(checked);
              if (!checked) setExpirationDate("");
            }}
            label="Tiene vencimiento"
            description="Sin vencimiento, la versión queda como permanente."
          />

          {requiresExpiry && (
            <div data-tour="biblioteca-version-expiry">
              <PanelStaticLabel>Nueva fecha de vencimiento *</PanelStaticLabel>
              <DateField
                value={expirationDate}
                onChange={setExpirationDate}
                clearable={false}
              />
            </div>
          )}
        </div>
      </PanelSection>
    </ArticleFormShell>
  );
}
