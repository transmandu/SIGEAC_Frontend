"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  FileText,
  FileUp,
  Tags,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axios";
import libraryService, { FolderNode } from "@/lib/libraryService";
import { notifyError } from "@/lib/notify-error";
import { ALLOWED_EXTENSIONS, MAX_FILE_BYTES } from "@/lib/Library/upload-rules";
import { useTourContext } from "@/components/tour/TourProvider";
import { bibliotecaUploadSteps } from "@/components/tour/steps/general/biblioteca/biblioteca-upload";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import {
  PanelSection,
  PanelStaticLabel,
  SwitchRow,
} from "@/components/forms/PanelSection";
import { DateField } from "@/components/misc/DateField";
import { FilePickerField } from "@/components/misc/FilePickerField";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UploadModalProps {
  company: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departmentId: number | null;
  folders: FolderNode[];
  /** Carpeta que se está viendo: es el destino por defecto ("" = raíz). */
  currentFolderPath?: string;
  /** Archivo soltado sobre el panel: el formulario se abre ya con él elegido. */
  initialFile?: File | null;
}

// Lo que admite la biblioteca al subir; el servidor aplica las mismas reglas.
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ROOT = "/";

const flattenFolders = (
  nodes: FolderNode[],
  prefix = "",
): { id: string; label: string }[] =>
  nodes.flatMap((node) => [
    { id: node.path, label: `${prefix}${node.name}` },
    ...flattenFolders(node.children, `${prefix}${node.name} / `),
  ]);

export default function UploadModal({
  company,
  isOpen,
  onClose,
  onSuccess,
  departmentId,
  folders,
  currentFolderPath = "",
  initialFile = null,
}: UploadModalProps) {
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (isOpen) {
      registerTour(
        "biblioteca-upload",
        "Subir Documento",
        bibliotecaUploadSteps,
        { onlyVisible: true },
      );
    }
    return () => unregisterTour("biblioteca-upload");
  }, [isOpen, registerTour, unregisterTour]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FormDialogContent
        icon={UploadCloud}
        title="Subir documento"
        description="El archivo queda como la primera versión del documento."
        tourId="biblioteca-upload-title"
        className="sm:max-w-xl"
      >
        {/* El formulario vive dentro del diálogo: al cerrarlo se desmonta y
            la próxima vez que se abre parte limpio. */}
        <UploadForm
          company={company}
          onClose={onClose}
          onSuccess={onSuccess}
          departmentId={departmentId}
          folders={folders}
          currentFolderPath={currentFolderPath}
          initialFile={initialFile}
        />
      </FormDialogContent>
    </Dialog>
  );
}

function UploadForm({
  company,
  onClose,
  onSuccess,
  departmentId,
  folders,
  currentFolderPath,
  initialFile,
}: Omit<UploadModalProps, "isOpen">) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | undefined>(initialFile ?? undefined);
  const [title, setTitle] = useState("");
  const [versionLabel, setVersionLabel] = useState("");
  const [chosenDepartmentId, setChosenDepartmentId] = useState<string | null>(
    null,
  );
  const [categoryId, setCategoryId] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [folderPath, setFolderPath] = useState(currentFolderPath || ROOT);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [saving, setSaving] = useState(false);

  const { isSuperUser, userDepartmentId } = useMemo(() => {
    const roles = user?.roles ?? [];
    return {
      isSuperUser: roles.some((role) =>
        ["SUPERUSER", "ADMIN", "ADMINISTRADOR"].includes(
          role.name.toUpperCase(),
        ),
      ),
      userDepartmentId: user?.employee?.[0]?.department?.id ?? null,
    };
  }, [user]);

  const departmentsQuery = useQuery({
    queryKey: ["library-departments-list", company],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/${company}/library/departments-list`,
      );
      return (response.data ?? []) as { id: number; name: string }[];
    },
    staleTime: 5 * 60_000,
  });

  // Misma clave y misma forma que la consulta de la página: se comparte.
  const categoriesQuery = useQuery({
    queryKey: ["library-categories", company],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/${company}/library/categories-list`,
      );
      return (response.data || []) as { id: number; name: string }[];
    },
  });

  const loadingData = departmentsQuery.isPending || categoriesQuery.isPending;

  const departments = useMemo(() => {
    const all = departmentsQuery.data ?? [];
    return !isSuperUser && userDepartmentId
      ? all.filter((d) => Number(d.id) === Number(userDepartmentId))
      : all;
  }, [departmentsQuery.data, isSuperUser, userDepartmentId]);

  // Sin elegir nada, el departamento abierto en la biblioteca o el único posible.
  const defaultDepartmentId = departments.some(
    (d) => Number(d.id) === Number(departmentId),
  )
    ? String(departmentId)
    : departments.length === 1
      ? String(departments[0].id)
      : "";
  const selectedDepartmentId = chosenDepartmentId ?? defaultDepartmentId;
  const departmentLocked = !!departmentId || departments.length === 1;

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ id: String(d.id), label: d.name })),
    [departments],
  );
  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((c) => ({
        id: String(c.id),
        label: c.name,
      })),
    [categoriesQuery.data],
  );
  const folderOptions = useMemo(
    () => [
      { id: ROOT, label: "Raíz (sin carpeta)" },
      ...flattenFolders(folders),
    ],
    [folders],
  );

  const trimmedTitle = title.trim();
  const hasCategory = creatingCategory
    ? newCategoryName.trim() !== ""
    : categoryId !== "";
  const canSave =
    !!file &&
    trimmedTitle !== "" &&
    selectedDepartmentId !== "" &&
    hasCategory &&
    (!hasExpiry || expirationDate !== "") &&
    !loadingData;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave || !file) return;

    const selectedDepartment = departments.find(
      (d) => String(d.id) === selectedDepartmentId,
    );

    const data = new FormData();
    data.append("file", file);
    data.append("title", trimmedTitle);
    data.append("department_id", selectedDepartmentId);
    data.append("department_name", selectedDepartment?.name ?? "");
    data.append("category_id", creatingCategory ? "otro" : categoryId);
    if (creatingCategory)
      data.append("new_category_name", newCategoryName.trim());
    if (folderPath !== ROOT) data.append("folder_path", folderPath);
    if (versionLabel.trim()) data.append("version_label", versionLabel.trim());
    data.append("requires_expiry", hasExpiry ? "1" : "0");
    if (hasExpiry && expirationDate)
      data.append("expiration_date", expirationDate);

    setSaving(true);
    try {
      await libraryService.uploadDocument(company, data);
      toast.success("Documento subido");
      // Una categoría creada al subir debe aparecer ya en los filtros y en este
      // mismo selector; comparten la consulta con la página.
      if (creatingCategory) {
        await queryClient.invalidateQueries({
          queryKey: ["library-categories", company],
        });
      }
      await onSuccess();
      onClose();
    } catch (error) {
      notifyError(error, { action: "guardar el documento" });
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
      submitLabel={saving ? "Subiendo..." : "Guardar documento"}
      submitIcon={<UploadCloud />}
      submitTourId="biblioteca-upload-save"
    >
      <PanelSection icon={FileUp} title="Archivo" compact>
        <div data-tour="biblioteca-upload-dropzone">
          <FilePickerField
            file={file}
            onChange={setFile}
            acceptedTypes={ACCEPTED_TYPES}
            acceptedExtensions={ALLOWED_EXTENSIONS}
            typesLabel="PDF o Excel"
            maxBytes={MAX_FILE_BYTES}
            emptyLabel="Seleccionar archivo"
          />
        </div>
      </PanelSection>

      <PanelSection icon={FileText} title="Datos del documento" compact>
        <div className="space-y-4">
          <div data-tour="biblioteca-upload-name">
            <PanelStaticLabel>Nombre del documento *</PanelStaticLabel>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Manual de mantenimiento 2026"
              maxLength={255}
              className={fieldClass}
            />
          </div>

          <div data-tour="biblioteca-upload-version">
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

      <PanelSection icon={Tags} title="Clasificación" compact>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-tour="biblioteca-upload-depto">
            <PanelStaticLabel>Departamento *</PanelStaticLabel>
            <OptionCombobox
              value={selectedDepartmentId}
              onChange={setChosenDepartmentId}
              options={departmentOptions}
              placeholder="Seleccione..."
              loading={departmentsQuery.isPending}
              disabled={departmentLocked}
            />
          </div>

          <div data-tour="biblioteca-upload-categoria">
            <PanelStaticLabel>Categoría *</PanelStaticLabel>
            {creatingCategory ? (
              <div className="space-y-1.5">
                <Input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Nombre de la categoría"
                  maxLength={100}
                  autoFocus
                  className={fieldClass}
                />
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-[13px]"
                  onClick={() => setCreatingCategory(false)}
                >
                  Elegir una existente
                </Button>
              </div>
            ) : (
              <OptionCombobox
                value={categoryId}
                onChange={setCategoryId}
                options={categoryOptions}
                placeholder="Seleccione..."
                searchPlaceholder="Buscar categoría..."
                loading={categoriesQuery.isPending}
                createLabel="Nueva categoría"
                onCreate={() => setCreatingCategory(true)}
              />
            )}
          </div>
        </div>

        {folders.length > 0 && (
          <div className="mt-4" data-tour="biblioteca-upload-carpeta">
            <PanelStaticLabel>Carpeta destino</PanelStaticLabel>
            <OptionCombobox
              value={folderPath}
              onChange={setFolderPath}
              options={folderOptions}
              searchPlaceholder="Buscar carpeta..."
            />
          </div>
        )}
      </PanelSection>

      <PanelSection icon={CalendarClock} title="Vigencia" compact>
        <div className="space-y-4" data-tour="biblioteca-upload-vigencia">
          <SwitchRow
            id="library-upload-expiry"
            checked={hasExpiry}
            onCheckedChange={(checked) => {
              setHasExpiry(checked);
              if (!checked) setExpirationDate("");
            }}
            label="Tiene vencimiento"
            description="Sin vencimiento, el documento queda como permanente."
          />

          {hasExpiry && (
            <div data-tour="biblioteca-upload-expiry">
              <PanelStaticLabel>Fecha de vencimiento *</PanelStaticLabel>
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
