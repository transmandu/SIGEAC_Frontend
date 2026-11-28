"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { FolderRestrictionFields } from "@/components/library/FolderRestrictionFields";
import { Dialog } from "@/components/ui/dialog";
import libraryService from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";

interface FolderAccessDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  folderId: string;
  folderName: string;
  departmentId: number;
  onSuccess: () => void | Promise<unknown>;
}

interface Draft {
  restricted: boolean;
  ids: number[];
}

/**
 * Quién ve una carpeta. Sin restringir, la ve todo el departamento; restringida,
 * solo el director del departamento y las personas elegidas (de cualquier
 * departamento). Vale también para todas sus subcarpetas.
 */
export default function FolderAccessDialog({
  open,
  onClose,
  ...form
}: FolderAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <FormDialogContent
        icon={Lock}
        tone="amber"
        title="Accesos"
        description={form.folderName}
        className="sm:max-w-xl"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre con lo guardado. */}
        <FolderAccessForm onClose={onClose} {...form} />
      </FormDialogContent>
    </Dialog>
  );
}

function FolderAccessForm({
  onClose,
  company,
  folderId,
  departmentId,
  onSuccess,
}: Omit<FolderAccessDialogProps, "open" | "folderName"> & {
  folderName?: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["library-folder-access", company, departmentId, folderId],
    queryFn: () =>
      libraryService.getFolderAccess(company, folderId, departmentId),
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
      await libraryService.updateFolderAccess(company, folderId, {
        department_id: departmentId,
        restricted,
        employee_ids: restricted ? ids : [],
      });
      toast.success(
        restricted
          ? "Acceso de la carpeta actualizado"
          : "La carpeta vuelve a ser visible para todo el departamento",
      );
      await onSuccess();
      onClose();
    } catch (err) {
      notifyError(err, { action: "guardar el acceso de la carpeta" });
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
        No se pudo cargar el acceso de la carpeta.
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
    >
      <FolderRestrictionFields
        idPrefix="library-folder-access"
        restricted={restricted}
        onRestrictedChange={(next) => setDraft({ restricted: next, ids })}
        memberIds={ids}
        onMemberIdsChange={(next) => setDraft({ restricted, ids: next })}
        access={data}
        loading={false}
        description="Si está apagado, la ve todo el departamento. Aplica también a las subcarpetas."
      />
    </ArticleFormShell>
  );
}
