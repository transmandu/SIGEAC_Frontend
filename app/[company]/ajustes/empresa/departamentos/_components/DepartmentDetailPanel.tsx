"use client";

import { memo, useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  GitMerge,
  History,
  Landmark,
  MapPin,
  Network,
  Pencil,
  Power,
  Trash2,
  Users,
} from "lucide-react";

import {
  useDeleteDepartment,
  useMoveDepartment,
  useSetDepartmentActive,
} from "@/actions/ajustes/departamento/actions";
import { ConfirmActionDialog } from "@/components/dialogs/shared/ConfirmActionDialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { hintClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import { PanelStaticLabel } from "@/components/forms/PanelSection";
import { SettingsRowActions, type RowAction } from "@/components/dropdowns/SettingsRowActions";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { TagBadge } from "@/components/misc/TagBadge";
import {
  collectSubtreeIds,
  findDepartmentPath,
  flattenTreeWithDepth,
} from "@/lib/departments";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import { DepartmentHistoryTab } from "./DepartmentHistoryTab";
import { DepartmentLocationsEditor } from "./DepartmentLocationsEditor";
import { DepartmentMembersTab } from "./DepartmentMembersTab";
import { MergeDepartmentDialog } from "./MergeDepartmentDialog";
import { listRowClass } from "./theme";
import { toneFor } from "./tones";

const ROOT = "root";

interface Props {
  department: Department;
  tree: Department[];
  onEdit: (department: Department) => void;
  onGone: () => void;
  onSelect: (id: number) => void;
}

export const DepartmentDetailPanel = memo(function DepartmentDetailPanel({
  department,
  tree,
  onEdit,
  onGone,
  onSelect,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const { moveDepartment } = useMoveDepartment();
  const { setDepartmentActive } = useSetDepartmentActive();
  const { deleteDepartment } = useDeleteDepartment();

  const [tab, setTab] = useState("estructura");
  const [mergeOpen, setMergeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeOpen, setActiveOpen] = useState(false);

  const flat = useMemo(() => flattenTreeWithDepth(tree), [tree]);
  const subtree = useMemo(() => new Set(collectSubtreeIds(department)), [department]);
  const allDepartments = useMemo(() => flat.map((entry) => entry.department), [flat]);
  const parentOptions = useMemo(
    () => [
      { id: ROOT, label: "Raíz del organigrama" },
      ...flat
        .filter(({ department: candidate }) => !subtree.has(candidate.id))
        .map(({ department: candidate, depth }) => ({
          id: String(candidate.id),
          label: `${"— ".repeat(depth)}${candidate.full_name}`,
        })),
    ],
    [flat, subtree],
  );
  const mergeCandidates = useMemo(
    () => allDepartments.filter((candidate) => !subtree.has(candidate.id)),
    [allDepartments, subtree],
  );

  const children = department.children ?? [];
  const path = useMemo(
    () => findDepartmentPath(tree, department.id).slice(0, -1),
    [tree, department.id],
  );
  const tone = toneFor(department.department_type_id);
  const Icon = path.length === 0 ? Landmark : children.length ? Network : Building2;

  const actions: RowAction[] = [
    {
      key: "toggle",
      label: department.is_active ? "Desactivar" : "Activar",
      icon: Power,
      tone: "blue",
      onSelect: () => setActiveOpen(true),
    },
    {
      key: "merge",
      label: "Fusionar en otro",
      icon: GitMerge,
      onSelect: () => setMergeOpen(true),
    },
    {
      key: "delete",
      label: "Eliminar",
      icon: Trash2,
      tone: "red",
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <div className="space-y-4">
      <header className="flex items-start gap-3">
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tone.tile)}>
          <Icon className="size-5.5" />
        </span>

        <div className="min-w-0 flex-1">
          {path.length > 0 && (
            <p className="mb-0.5 text-xs text-muted-foreground wrap-anywhere">
              {path.map((ancestor, index) => (
                <span key={ancestor.id}>
                  {index > 0 && " / "}
                  <button
                    type="button"
                    onClick={() => onSelect(ancestor.id)}
                    className="hover:text-foreground hover:underline"
                  >
                    {ancestor.full_name}
                  </button>
                </span>
              ))}
            </p>
          )}

          <h2 className="text-lg leading-tight font-semibold wrap-anywhere">
            {department.full_name}
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <TagBadge tone="slate" className="font-mono">
              {department.acronym}
            </TagBadge>
            {department.type && <TagBadge tone="blue">{department.type.name}</TagBadge>}
            {!department.is_active && <TagBadge tone="amber">Inactivo</TagBadge>}
          </div>

          {department.description && (
            <p className="mt-2 text-sm text-slate-600 wrap-anywhere dark:text-slate-300">
              {department.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ActionTriggerButton className="h-9 max-sm:h-10" onClick={() => onEdit(department)}>
            <Pencil className="size-4" />
            <span className="max-sm:sr-only">Editar</span>
          </ActionTriggerButton>

          <SettingsRowActions actions={actions} />
        </div>
      </header>

      <SegmentedTabs value={tab} onValueChange={setTab}>
        <SegmentedTabsList size="sm">
          <SegmentedTabsTrigger value="estructura">
            <Network className="size-4 max-sm:hidden" />
            Estructura
          </SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="sedes">
            <MapPin className="size-4 max-sm:hidden" />
            Sedes
          </SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="personal">
            <Users className="size-4 max-sm:hidden" />
            Personal
          </SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="historial">
            <History className="size-4 max-sm:hidden" />
            Historial
          </SegmentedTabsTrigger>
        </SegmentedTabsList>

        <SegmentedTabsContent value="estructura" className="space-y-4 pt-4">
          <div>
            <PanelStaticLabel>Depende de</PanelStaticLabel>
            <OptionCombobox
              value={String(department.department_parent_id ?? ROOT)}
              onChange={(value) =>
                slug &&
                value !== String(department.department_parent_id ?? ROOT) &&
                moveDepartment.mutate({
                  company: slug,
                  id: department.id,
                  department_parent_id: value === ROOT ? null : Number(value),
                })
              }
              options={parentOptions}
              disabled={moveDepartment.isPending}
              searchPlaceholder="Buscar departamento..."
            />
            <p className={cn(hintClass, "mt-1.5")}>También puede arrastrarlo en el árbol.</p>
          </div>

          <div>
            <PanelStaticLabel>Dependientes</PanelStaticLabel>
            {children.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {children.map((child) => (
                  <li key={child.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(child.id)}
                      className={cn(
                        listRowClass,
                        "flex w-full items-center gap-2.5 p-2.5 text-left max-sm:min-h-12",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          toneFor(child.department_type_id).dot,
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {child.full_name}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {child.acronym}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tiene departamentos dependientes.</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Registrado por {department.registered_by}
            {department.updated_by && ` · última edición de ${department.updated_by}`}
          </p>
        </SegmentedTabsContent>

        <SegmentedTabsContent value="sedes" className="pt-4">
          <DepartmentLocationsEditor department={department} />
        </SegmentedTabsContent>

        <SegmentedTabsContent value="personal" className="pt-4">
          <DepartmentMembersTab department={department} departments={allDepartments} />
        </SegmentedTabsContent>

        <SegmentedTabsContent value="historial" className="pt-4">
          <DepartmentHistoryTab department={department} />
        </SegmentedTabsContent>
      </SegmentedTabs>

      <MergeDepartmentDialog
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        source={department}
        candidates={mergeCandidates}
        onMerged={onSelect}
      />

      <ConfirmActionDialog
        open={activeOpen}
        onOpenChange={setActiveOpen}
        icon={Power}
        tone={department.is_active ? "amber" : "primary"}
        title={department.is_active ? "Desactivar departamento" : "Activar departamento"}
        entityName={department.full_name}
        confirmLabel={department.is_active ? "Desactivar" : "Activar"}
        isPending={setDepartmentActive.isPending}
        onConfirm={async () => {
          if (!slug) return;
          await setDepartmentActive.mutateAsync({
            company: slug,
            id: department.id,
            is_active: !department.is_active,
          });
        }}
      >
        {department.is_active
          ? "Deja de ofrecerse al crear solicitudes, despachos y empleados. Su historia y su personal se conservan, y puede volver a activarlo."
          : "Vuelve a ofrecerse al crear solicitudes, despachos y empleados."}
      </ConfirmActionDialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar departamento"
        entityName={department.full_name}
        warning="Solo se puede eliminar un departamento sin dependientes ni registros asociados. Si ya tiene historia, desactívelo o fusiónelo con otro."
        isPending={deleteDepartment.isPending}
        onConfirm={async () => {
          if (!slug) return;
          await deleteDepartment.mutateAsync({ company: slug, id: department.id });
          onGone();
        }}
      />
    </div>
  );
});
