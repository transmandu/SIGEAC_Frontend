"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import {
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import libraryService from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";

interface RenameDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doc: { id: number; title?: string | null };
  company: string;
  onSuccess: () => Promise<void> | void;
}

export function RenameDocumentDialog({
  isOpen,
  onClose,
  ...form
}: RenameDocumentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormDialogContent
        icon={FileText}
        title="Renombrar documento"
        description="Solo cambia el nombre: el archivo y sus versiones se mantienen."
        className="sm:max-w-md"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre con el título vigente. */}
        <RenameDocumentForm onClose={onClose} {...form} />
      </FormDialogContent>
    </Dialog>
  );
}

function RenameDocumentForm({
  onClose,
  doc,
  company,
  onSuccess,
}: Omit<RenameDocumentDialogProps, "isOpen">) {
  const [title, setTitle] = useState(doc.title ?? "");
  const [saving, setSaving] = useState(false);

  const trimmed = title.trim();
  const canSave = trimmed !== "" && trimmed !== (doc.title ?? "").trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      await libraryService.renameDocument(company, doc.id, trimmed);
      toast.success("Documento renombrado");
      await onSuccess();
      onClose();
    } catch (error) {
      notifyError(error, { action: "renombrar el documento" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ArticleFormShell
      onSubmit={handleSubmit}
      onCancel={onClose}
      busy={saving}
      canSave={canSave}
      submitLabel="Guardar cambios"
    >
      <PanelSection icon={FileText} title="Nombre" compact>
        <PanelStaticLabel>Nuevo nombre *</PanelStaticLabel>
        <Input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={255}
          className={fieldClass}
        />
      </PanelSection>
    </ArticleFormShell>
  );
}
