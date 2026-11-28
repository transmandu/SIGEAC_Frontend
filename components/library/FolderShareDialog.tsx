"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
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
import { DialogButton } from "@/components/misc/DialogButton";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import libraryService from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";
import { cn } from "@/lib/utils";

interface FolderShareDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  folderId: string;
  folderName: string;
  departmentId: number;
  /** Quien es DIP o administrador recibe el enlace al instante; el resto, una solicitud. */
  onDone?: () => void;
}

const DURATIONS = [
  { hours: 24, label: "24 horas" },
  { hours: 72, label: "3 días" },
  { hours: 168, label: "7 días" },
];

/** Pide (o genera, si es DIP) un enlace externo de solo lectura a una carpeta y a lo que contiene. */
export default function FolderShareDialog({
  open,
  onClose,
  ...form
}: FolderShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <FormDialogContent
        icon={Link2}
        title="Compartir carpeta"
        description={form.folderName}
        className="sm:max-w-lg"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre sin solicitud previa. */}
        <FolderShareForm onClose={onClose} {...form} />
      </FormDialogContent>
    </Dialog>
  );
}

function FolderShareForm({
  onClose,
  company,
  folderId,
  departmentId,
  onDone,
}: Omit<FolderShareDialogProps, "open" | "folderName"> & {
  folderName?: string;
}) {
  const [sharedWith, setSharedWith] = useState("");
  const [reason, setReason] = useState("");
  const [hours, setHours] = useState(72);
  const [readOnly, setReadOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canSave = reason.trim().length >= 10;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      const res = await libraryService.createFolderShare(company, {
        department_id: departmentId,
        folder_id: folderId,
        shared_with_name: sharedWith.trim() || undefined,
        reason: reason.trim(),
        expires_at: hours,
        read_only: readOnly,
      });
      onDone?.();
      if (res.data.share_url) {
        setLink(res.data.share_url);
      } else {
        toast.success("Solicitud enviada al Director DIP");
        onClose();
      }
    } catch (error) {
      notifyError(error, { action: "compartir la carpeta" });
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Enlace copiado");
    } catch (error) {
      notifyError(error, { action: "copiar el enlace" });
    }
  };

  if (link) {
    return (
      <div className="flex flex-col gap-5">
        <PanelSection icon={Link2} title="Enlace generado" compact>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              El enlace da acceso a la carpeta y a sus subcarpetas (menos las
              restringidas).
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={link}
                aria-label="Enlace"
                className={fieldClass}
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copy}
                aria-label="Copiar enlace"
                className="size-10 shrink-0"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </PanelSection>

        <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t bg-linear-to-t from-slate-50 to-background px-4 py-3 sm:-mx-6 sm:px-6 sm:py-4 dark:from-slate-900/40 max-sm:[&>button]:w-full">
          <DialogButton tone="secondary" onClick={onClose} className="min-w-35">
            Cerrar
          </DialogButton>
        </div>
      </div>
    );
  }

  return (
    <ArticleFormShell
      onSubmit={handleSubmit}
      onCancel={onClose}
      busy={saving}
      canSave={canSave}
      submitLabel="Enviar solicitud"
    >
      <p className="text-sm text-muted-foreground">
        Comparte la carpeta y todo lo que contiene con alguien sin cuenta. Las
        subcarpetas restringidas nunca se incluyen. El Director DIP debe
        aprobarlo.
      </p>

      <PanelSection icon={Link2} title="Solicitud" compact>
        <div className="space-y-4">
          <div>
            <PanelStaticLabel>Para quién</PanelStaticLabel>
            <Input
              value={sharedWith}
              onChange={(event) => setSharedWith(event.target.value)}
              maxLength={255}
              placeholder="Ej. Auditor externo (opcional)"
              className={fieldClass}
            />
          </div>

          <div>
            <PanelStaticLabel>Motivo *</PanelStaticLabel>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Mínimo 10 caracteres"
              className={textareaClass}
            />
          </div>

          <div>
            <PanelStaticLabel>Vigencia</PanelStaticLabel>
            <div role="radiogroup" className="grid grid-cols-3 gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.hours}
                  type="button"
                  role="radio"
                  aria-checked={hours === duration.hours}
                  onClick={() => setHours(duration.hours)}
                  className={cn(
                    "h-10 rounded-lg border text-sm font-medium outline-hidden motion-safe:transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
                    hours === duration.hours
                      ? "border-primary/60 bg-primary/5 text-primary"
                      : "border-slate-300/70 text-slate-600 hover:bg-muted/50 dark:border-slate-600/60 dark:text-slate-300",
                  )}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          <SwitchRow
            id="library-folder-share-readonly"
            checked={readOnly}
            onCheckedChange={setReadOnly}
            label="Solo lectura"
            description="Si está apagado, quien tenga el enlace podrá descargar los documentos."
          />
        </div>
      </PanelSection>
    </ArticleFormShell>
  );
}
