"use client";

import {
  useMoveDepartment,
  useReorderDepartments,
} from "@/actions/ajustes/departamento/actions";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  sectionClass,
  SectionTitle,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDepartmentTree } from "@/hooks/ajustes/departamento/useGetDepartmentTree";
import { useGetDepartmentTypes } from "@/hooks/ajustes/departamento/useGetDepartmentTypes";
import {
  collectSubtreeIds,
  findDepartmentNode,
  flattenTreeWithDepth,
} from "@/lib/departments";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Network, Plus, Tags } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DepartmentDetailPanel } from "./_components/DepartmentDetailPanel";
import { DepartmentFormDialog } from "./_components/DepartmentFormDialog";
import { DepartmentTree, ROOT_DROP_ID } from "./_components/DepartmentTree";
import { DepartmentTypesDialog } from "./_components/DepartmentTypesDialog";
import { toneFor } from "./_components/tones";

const idFrom = (value: string | number, prefix: string): number | null => {
  const text = String(value);
  return text.startsWith(prefix) ? Number(text.slice(prefix.length)) : null;
};

const DepartmentPage = () => {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const { data: tree, isPending, isError } = useGetDepartmentTree(slug);
  const { data: types } = useGetDepartmentTypes(slug);
  const { moveDepartment } = useMoveDepartment();
  const { reorderDepartments } = useReorderDepartments();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<{
    department: Department | null;
    parentId: number | null;
  } | null>(null);
  const [typesOpen, setTypesOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const roots = tree ?? [];
  const flat = flattenTreeWithDepth(roots).map((entry) => entry.department);
  const selected = selectedId !== null ? findDepartmentNode(roots, selectedId) : null;
  const dragging = draggingId !== null ? findDepartmentNode(roots, draggingId) : null;

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);

    const movedId = idFrom(event.active.id, "dept-");
    const overId = event.over?.id;

    if (movedId === null || overId === undefined || !slug) return;

    const moved = findDepartmentNode(roots, movedId);
    if (!moved) return;

    const newParentId = overId === ROOT_DROP_ID ? null : idFrom(overId, "drop-");

    if (overId !== ROOT_DROP_ID && newParentId === null) return;
    if (newParentId === movedId || newParentId === moved.department_parent_id) return;

    if (newParentId !== null && collectSubtreeIds(moved).includes(newParentId)) {
      toast.error("Movimiento no permitido", {
        description: "Un departamento no puede depender de sí mismo ni de uno de sus dependientes.",
      });
      return;
    }

    moveDepartment.mutate({ company: slug, id: movedId, department_parent_id: newParentId });
  };

  const handleReorder = (parentId: number | null, orderedIds: number[]) => {
    if (!slug) return;
    reorderDepartments.mutate({ company: slug, parent_id: parentId, ordered_ids: orderedIds });
  };

  return (
    <ContentLayout title="Departamentos">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold tracking-tight">Organigrama</h1>
            <p className="text-muted-foreground text-sm">
              Estructura de la empresa, con las sedes, los correos y el personal de cada
              departamento.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ActionTriggerButton onClick={() => setTypesOpen(true)}>
              <Tags className="size-4" />
              Tipos
            </ActionTriggerButton>
            <ActionTriggerButton onClick={() => setFormState({ department: null, parentId: null })}>
              <Plus className="size-4" />
              Nuevo departamento
            </ActionTriggerButton>
          </div>
        </div>

        {isPending && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar los departamentos.
            </p>
          </div>
        )}

        {tree && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <section className={sectionClass}>
              <SectionTitle
                icon={Network}
                title="Estructura"
                hint="Arrastra un departamento sobre otro para cambiar de quién depende."
                action={
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {flat.length} {flat.length === 1 ? "departamento" : "departamentos"}
                  </span>
                }
              />

              {roots.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  Aún no hay departamentos. Crea el primero para empezar el organigrama.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  onDragStart={(event) => setDraggingId(idFrom(event.active.id, "dept-"))}
                  onDragCancel={() => setDraggingId(null)}
                  onDragEnd={handleDragEnd}
                >
                  <DepartmentTree
                    nodes={roots}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onAddChild={(parentId) => setFormState({ department: null, parentId })}
                    onReorder={handleReorder}
                  />

                  <DragOverlay>
                    {dragging ? (
                      <div className="bg-card flex items-center gap-2.5 rounded-xl border px-3 py-2 shadow-lg">
                        <span
                          className={`size-2.5 rounded-full ${toneFor(dragging.department_type_id).dot}`}
                        />
                        <span className="text-sm font-medium">{dragging.full_name}</span>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </section>

            <section className={`${sectionClass} lg:sticky lg:top-4`}>
              {selected ? (
                <DepartmentDetailPanel
                  key={selected.id}
                  department={selected}
                  tree={roots}
                  onEdit={(department) =>
                    setFormState({ department, parentId: department.department_parent_id })
                  }
                  onGone={() => setSelectedId(null)}
                  onSelect={setSelectedId}
                />
              ) : (
                <p className="text-muted-foreground py-20 text-center text-sm">
                  Selecciona un departamento del árbol.
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      <DepartmentFormDialog
        open={formState !== null}
        onOpenChange={(open) => !open && setFormState(null)}
        department={formState?.department}
        defaultParentId={formState?.parentId ?? null}
        types={types ?? []}
        departments={flat}
      />

      <DepartmentTypesDialog open={typesOpen} onOpenChange={setTypesOpen} />
    </ContentLayout>
  );
};

export default DepartmentPage;
