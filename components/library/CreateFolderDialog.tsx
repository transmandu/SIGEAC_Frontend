"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import {
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import { FolderRestrictionFields } from "@/components/library/FolderRestrictionFields";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useResettingState } from "@/hooks/useResettingState";
import libraryService, { FolderNode } from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  company: string;
  departmentId: number | null;
  departmentName: string | null;
  departments: { id: number; name: string }[];
  folders: FolderNode[];
  selectedFolderPath?: string | null;
  isSuperUser: boolean;
  onSuccess: (deptId: number) => void | Promise<unknown>;
}

function findFolderByPath(
  nodes: FolderNode[],
  targetPath: string,
): FolderNode | undefined {
  for (const node of nodes) {
    if (node.path === targetPath) return node;
    if (node.children.length > 0) {
      const found = findFolderByPath(node.children, targetPath);
      if (found) return found;
    }
  }
  return undefined;
}

const ROOT = "root";

const flattenFolders = (
  nodes: FolderNode[],
  prefix = "",
): { id: string; label: string }[] =>
  nodes.flatMap((node) => [
    { id: node.id, label: `${prefix}${node.name}` },
    ...flattenFolders(node.children, `${prefix}${node.name} / `),
  ]);

export default function CreateFolderDialog({
  open,
  onClose,
  ...form
}: CreateFolderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <FormDialogContent
        icon={FolderPlus}
        title="Nueva carpeta"
        description="Se crea dentro del departamento y de la carpeta que elija."
        className="sm:max-w-xl"
      >
        {/* Dentro del diálogo: al cerrarlo se desmonta y reabre parado en la carpeta que se está viendo. */}
        <CreateFolderForm onClose={onClose} {...form} />
      </FormDialogContent>
    </Dialog>
  );
}

function CreateFolderForm({
  onClose,
  company,
  departmentId,
  departments,
  folders,
  selectedFolderPath,
  isSuperUser,
  onSuccess,
}: Omit<CreateFolderDialogProps, "open" | "departmentName">) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(() =>
    !selectedFolderPath || selectedFolderPath === "/"
      ? ROOT
      : (findFolderByPath(folders, selectedFolderPath)?.id ?? ROOT),
  );
  const [selectedDeptId, setSelectedDeptId] = useState(
    departmentId
      ? String(departmentId)
      : departments.length === 1
        ? String(departments[0].id)
        : "",
  );
  const [saving, setSaving] = useState(false);

  // Dónde nace la carpeta decide a quién se puede dar acceso: al cambiarlo, la
  // restricción y la lista elegida parten de cero.
  const [restricted, setRestricted] = useResettingState(false, [
    selectedDeptId,
    parentId,
  ]);
  const [memberIds, setMemberIds] = useResettingState<number[]>(
    [],
    [selectedDeptId, parentId],
  );

  const { data: access, isLoading: loadingAccess } = useQuery({
    queryKey: [
      "library-folder-access",
      company,
      selectedDeptId,
      parentId,
      "child",
    ],
    queryFn: () =>
      libraryService.getFolderAccess(
        company,
        parentId,
        Number(selectedDeptId),
        true,
      ),
    enabled: restricted && !!selectedDeptId,
    staleTime: 0,
  });

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ id: String(d.id), label: d.name })),
    [departments],
  );
  const folderOptions = useMemo(
    () => [
      { id: ROOT, label: "Raíz" },
      // Las carpetas recibidas son las del departamento abierto: con otro
      // departamento elegido no valen (su árbol no está cargado aquí).
      ...(departmentId && selectedDeptId === String(departmentId)
        ? flattenFolders(folders)
        : []),
    ],
    [folders, selectedDeptId, departmentId],
  );

  const trimmed = name.trim();
  const canSave = trimmed !== "" && !!selectedDeptId;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      const deptId = Number(selectedDeptId);
      await libraryService.createFolder(company, {
        department_id: deptId,
        name: trimmed,
        parent_id: parentId === ROOT ? undefined : parentId,
        ...(restricted ? { restricted: true, employee_ids: memberIds } : {}),
      });
      toast.success("Carpeta creada");
      await onSuccess(deptId);
      onClose();
    } catch (error) {
      notifyError(error, { action: "crear la carpeta" });
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
      submitLabel="Crear carpeta"
      submitTourId="biblioteca-folder-create-submit"
    >
      <PanelSection icon={FolderPlus} title="Carpeta" compact>
        <div className="space-y-4">
          <div data-tour="biblioteca-folder-create-name">
            <PanelStaticLabel>Nombre de la carpeta *</PanelStaticLabel>
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Manuales 2026"
              maxLength={120}
              className={fieldClass}
            />
          </div>

          {/* Solo si hay más de un departamento entre los que elegir. */}
          {(isSuperUser || departments.length > 1) && (
            <div data-tour="biblioteca-folder-create-depto">
              <PanelStaticLabel>Departamento *</PanelStaticLabel>
              <OptionCombobox
                value={selectedDeptId}
                onChange={(value) => {
                  setSelectedDeptId(value);
                  setParentId(ROOT);
                }}
                options={departmentOptions}
                placeholder="Seleccione..."
                searchPlaceholder="Buscar departamento..."
              />
            </div>
          )}

          <div data-tour="biblioteca-folder-create-parent">
            <PanelStaticLabel>Carpeta padre</PanelStaticLabel>
            <OptionCombobox
              value={parentId}
              onChange={setParentId}
              options={folderOptions}
              searchPlaceholder="Buscar carpeta..."
              disabled={!selectedDeptId}
            />
          </div>
        </div>
      </PanelSection>

      <FolderRestrictionFields
        idPrefix="library-folder-create"
        restricted={restricted}
        onRestrictedChange={setRestricted}
        memberIds={memberIds}
        onMemberIdsChange={setMemberIds}
        access={access}
        loading={loadingAccess}
        description="Si está apagado, la ve todo el departamento."
      />
    </ArticleFormShell>
  );
}
