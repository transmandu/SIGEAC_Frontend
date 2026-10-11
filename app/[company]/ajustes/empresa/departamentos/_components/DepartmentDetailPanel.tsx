"use client";

import {
  useDeleteDepartment,
  useMoveDepartment,
  useSetDepartmentActive,
} from "@/actions/ajustes/departamento/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  collectSubtreeIds,
  findDepartmentPath,
  flattenTreeWithDepth,
} from "@/lib/departments";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import {
  Building2,
  ChevronRight,
  History,
  Landmark,
  MapPin,
  MoreHorizontal,
  Network,
  Pencil,
  Users,
} from "lucide-react";
import { useState } from "react";
import { DepartmentHistoryTab } from "./DepartmentHistoryTab";
import { DepartmentLocationsEditor } from "./DepartmentLocationsEditor";
import { DepartmentMembersTab } from "./DepartmentMembersTab";
import { MergeDepartmentDialog } from "./MergeDepartmentDialog";
import { listRowClass, tabTriggerClass } from "./theme";
import { toneFor } from "./tones";

const ROOT = "root";

interface Props {
  department: Department;
  tree: Department[];
  onEdit: (department: Department) => void;
  onGone: () => void;
  onSelect: (id: number) => void;
}

export function DepartmentDetailPanel({ department, tree, onEdit, onGone, onSelect }: Props) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const { moveDepartment } = useMoveDepartment();
  const { setDepartmentActive } = useSetDepartmentActive();
  const { deleteDepartment } = useDeleteDepartment();

  const [mergeOpen, setMergeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const flat = flattenTreeWithDepth(tree);
  const subtree = new Set(collectSubtreeIds(department));
  const allDepartments = flat.map((entry) => entry.department);
  const moveTargets = flat.filter(({ department: candidate }) => !subtree.has(candidate.id));

  const children = department.children ?? [];
  const path = findDepartmentPath(tree, department.id).slice(0, -1);
  const tone = toneFor(department.department_type_id);
  const Icon = path.length === 0 ? Landmark : children.length ? Network : Building2;

  return (
    <div className="space-y-4">
      <header className="flex items-start gap-3">
        <span className={cn("grid size-11 shrink-0 place-content-center rounded-xl", tone.tile)}>
          <Icon className="size-5.5" />
        </span>

        <div className="min-w-0 flex-1">
          {path.length > 0 && (
            <p className="text-muted-foreground mb-0.5 truncate text-xs">
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

          <h2 className="text-lg leading-tight font-semibold">{department.full_name}</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {[department.acronym, department.type?.name, department.is_active ? null : "Inactivo"]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {department.description && (
            <p className="text-muted-foreground mt-2 text-sm">{department.description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ActionTriggerButton className="h-9" onClick={() => onEdit(department)}>
            <Pencil className="size-4" />
            Editar
          </ActionTriggerButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="size-9 bg-white/80 dark:bg-slate-900/60"
                aria-label="Más acciones"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={setDepartmentActive.isPending}
                onClick={() =>
                  slug &&
                  setDepartmentActive.mutate({
                    company: slug,
                    id: department.id,
                    is_active: !department.is_active,
                  })
                }
              >
                {department.is_active ? "Desactivar" : "Activar"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMergeOpen(true)}>Fusionar en otro…</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Tabs defaultValue="estructura">
        <TabsList className="mb-1 grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-0">
          <TabsTrigger value="estructura" className={tabTriggerClass}>
            <Network className="size-4" />
            Estructura
          </TabsTrigger>
          <TabsTrigger value="sedes" className={tabTriggerClass}>
            <MapPin className="size-4" />
            Sedes
          </TabsTrigger>
          <TabsTrigger value="personal" className={tabTriggerClass}>
            <Users className="size-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="historial" className={tabTriggerClass}>
            <History className="size-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estructura" className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Depende de</label>
            <Select
              value={String(department.department_parent_id ?? ROOT)}
              onValueChange={(value) =>
                slug &&
                moveDepartment.mutate({
                  company: slug,
                  id: department.id,
                  department_parent_id: value === ROOT ? null : Number(value),
                })
              }
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROOT}>Raíz del organigrama</SelectItem>
                {moveTargets.map(({ department: candidate, depth }) => (
                  <SelectItem key={candidate.id} value={String(candidate.id)}>
                    {"— ".repeat(depth)}
                    {candidate.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">También puedes arrastrarlo en el árbol.</p>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Dependientes</label>
            {children.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {children.map((child) => (
                  <li key={child.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(child.id)}
                      className={cn(listRowClass, "flex w-full items-center gap-2.5 p-2.5 text-left")}
                    >
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          toneFor(child.department_type_id).dot,
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{child.full_name}</span>
                        <span className="text-muted-foreground font-mono text-xs">{child.acronym}</span>
                      </span>
                      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No tiene departamentos dependientes.</p>
            )}
          </div>

          <p className="text-muted-foreground text-xs">
            Registrado por {department.registered_by}
            {department.updated_by && ` · última edición de ${department.updated_by}`}
          </p>
        </TabsContent>

        <TabsContent value="sedes" className="pt-3">
          <DepartmentLocationsEditor department={department} />
        </TabsContent>

        <TabsContent value="personal" className="pt-3">
          <DepartmentMembersTab department={department} departments={allDepartments} />
        </TabsContent>

        <TabsContent value="historial" className="pt-3">
          <DepartmentHistoryTab department={department} />
        </TabsContent>
      </Tabs>

      <MergeDepartmentDialog
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        source={department}
        candidates={allDepartments.filter((candidate) => !subtree.has(candidate.id))}
        onMerged={onSelect}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &quot;{department.full_name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Solo se puede eliminar un departamento sin dependientes ni registros asociados. Si ya
              tiene historia, desactívalo o fusiónalo con otro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!slug) return;
                await deleteDepartment.mutateAsync({ company: slug, id: department.id });
                onGone();
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
