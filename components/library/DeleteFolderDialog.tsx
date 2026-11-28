"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import libraryService from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";

interface DeleteFolderDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  folderId: string;
  folderName: string;
  departmentId: number;
  onSuccess: () => void | Promise<unknown>;
}

export default function DeleteFolderDialog({
  open,
  onClose,
  company,
  folderId,
  folderName,
  departmentId,
  onSuccess,
}: DeleteFolderDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await libraryService.deleteFolder(company, folderId, departmentId);
      toast.success("Carpeta eliminada");
      await onSuccess();
    } catch (error) {
      notifyError(error, { action: "eliminar la carpeta" });
      // El diálogo solo se cierra si la confirmación resuelve.
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Eliminar carpeta"
      entityName={folderName}
      warning="Solo se puede eliminar si no contiene documentos. Esta acción no se puede deshacer."
      isPending={deleting}
      onConfirm={handleConfirm}
    />
  );
}
