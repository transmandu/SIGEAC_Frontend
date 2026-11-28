"use client";

import { useState } from "react";
import { Folder } from "lucide-react";
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

interface RenameFolderDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  folderId: string;
  currentName: string;
  departmentId: number;
  /** Recibe la ruta nueva de la carpeta renombrada. */
  onSuccess: (newPath?: string) => void | Promise<unknown>;
}

export default function RenameFolderDialog({
  open,
  onClose,
  ...form
}: RenameFolderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <FormDialogContent
        icon={Folder}
        title="Renombrar carpeta"
        description="Los documentos que contiene se mantienen en ella."
        className="sm:max-w-md"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre con el nombre vigente. */}
        <RenameFolderForm onClose={onClose} {...form} />
      </FormDialogContent>
    </Dialog>
  );
}

function RenameFolderForm({
  onClose,
  company,
  folderId,
  currentName,
  departmentId,
  onSuccess,
}: Omit<RenameFolderDialogProps, "open">) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  const trimmed = name.trim();
  const canSave = trimmed !== "" && trimmed !== currentName;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      const res = await libraryService.updateFolder(company, folderId, {
        department_id: departmentId,
        name: trimmed,
      });
      toast.success("Carpeta renombrada");
      await onSuccess(res?.folder?.path);
      onClose();
    } catch (error) {
      notifyError(error, { action: "renombrar la carpeta" });
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
      <PanelSection icon={Folder} title="Nombre" compact>
        <PanelStaticLabel>Nuevo nombre *</PanelStaticLabel>
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          className={fieldClass}
        />
      </PanelSection>
    </ArticleFormShell>
  );
}
