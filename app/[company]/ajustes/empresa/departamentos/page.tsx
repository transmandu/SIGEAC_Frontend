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
import { findDepartmentNode, flattenTreeWithDepth } from "@/lib/departments";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { Ban, Network, Plus, Tags } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DepartmentDetailPanel } from "./_components/DepartmentDetailPanel";
import { DepartmentFormDialog } from "./_components/DepartmentFormDialog";
import { DepartmentTree, ROOT_DROP_ID } from "./_components/DepartmentTree";
import { DepartmentTypesDialog } from "./_components/DepartmentTypesDialog";
import {
  applyMove,
  createDropStore,
  DropPreview,
  DropResolution,
  resolveDrop,
  zoneFromPointer,
} from "./_components/dropTarget";
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
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [resolution, setResolution] = useState<DropResolution | null>(null);
  const dropStore = useState(createDropStore)[0];
  const resolutionRef = useRef<DropResolution | null>(null);
  const [formState, setFormState] = useState<{
    department: Department | null;
    parentId: number | null;
  } | null>(null);
  const [typesOpen, setTypesOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const roots = useMemo(() => tree ?? [], [tree]);
  const flat = useMemo(
    () => flattenTreeWithDepth(roots).map((entry) => entry.department),
    [roots],
  );
  const selected = useMemo(
    () => (selectedId !== null ? findDepartmentNode(roots, selectedId) : null),
    [roots, selectedId],
  );
  const dragging = useMemo(
    () => (draggingId !== null ? findDepartmentNode(roots, draggingId) : null),
    [roots, draggingId],
  );

  const blocked = resolution?.status === "invalid";
  const saving = moveDepartment.isPending || reorderDepartments.isPending;

  const resetDrag = () => {
    setDraggingId(null);
    setResolution(null);
    resolutionRef.current = null;
    dropStore.set({ preview: null, blocked: false });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, activatorEvent, delta } = event;
    let next: DropPreview | null = null;

    if (over?.id === ROOT_DROP_ID) {
      next = { targetId: null, zone: "root" };
    } else if (over) {
      const targetId = idFrom(over.id, "drop-");
      const pointerY = (activatorEvent as PointerEvent).clientY + delta.y;
      if (targetId !== null) {
        next = { targetId, zone: zoneFromPointer(pointerY, over.rect.top, over.rect.height) };
      }
    }

    const current = dropStore.get().preview;
    if (current?.targetId === next?.targetId && current?.zone === next?.zone) return;

    const movedId = idFrom(event.active.id, "dept-");
    const outcome = next && movedId !== null ? resolveDrop(roots, movedId, next) : null;

    resolutionRef.current = outcome;
    dropStore.set({ preview: next, blocked: outcome?.status === "invalid" });
    setResolution(outcome);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const movedId = idFrom(event.active.id, "dept-");
    const outcome = resolutionRef.current;
    resetDrag();

    if (movedId === null || !outcome || !slug) return;

    if (outcome.status === "invalid") {
      toast.error("Movimiento no permitido", { description: outcome.reason });
      return;
    }
    if (outcome.status === "noop") return;

    const key = ["departments", slug, "tree"];
    await queryClient.cancelQueries({ queryKey: key });
    const previous = queryClient.getQueryData<Department[]>(key);
    queryClient.setQueryData<Department[]>(
      key,
      applyMove(roots, movedId, outcome.parentId, outcome.position),
    );

    const rollback = { onError: () => queryClient.setQueryData(key, previous) };

    if (outcome.sameParent) {
      reorderDepartments.mutate(
        { company: slug, parent_id: outcome.parentId, ordered_ids: outcome.orderedIds },
        rollback,
      );
    } else {
      moveDepartment.mutate(
        {
          company: slug,
          id: movedId,
          department_parent_id: outcome.parentId,
          position: outcome.position,
        },
        rollback,
      );
    }
  };

  const reorderMutate = reorderDepartments.mutate;
  const handleReorder = useCallback(
    (parentId: number | null, orderedIds: number[]) => {
      if (!slug) return;
      reorderMutate({ company: slug, parent_id: parentId, ordered_ids: orderedIds });
    },
    [slug, reorderMutate],
  );

  const handleAddChild = useCallback(
    (parentId: number) => setFormState({ department: null, parentId }),
    [],
  );
  const handleEdit = useCallback(
    (department: Department) =>
      setFormState({ department, parentId: department.department_parent_id }),
    [],
  );
  const handleGone = useCallback(() => setSelectedId(null), []);

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
                hint="Arrastra por el asa: al centro de otro lo cuelga de él; en su borde superior o inferior lo reubica a su lado."
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
                  collisionDetection={pointerWithin}
                  onDragStart={(event) => setDraggingId(idFrom(event.active.id, "dept-"))}
                  onDragMove={handleDragMove}
                  onDragCancel={resetDrag}
                  onDragEnd={handleDragEnd}
                >
                  <DepartmentTree
                    nodes={roots}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onAddChild={handleAddChild}
                    onReorder={handleReorder}
                    store={dropStore}
                    dragDisabled={saving}
                  />

                  <DragOverlay>
                    {dragging ? (
                      <div
                        className={`bg-card rounded-xl border px-3 py-2 shadow-lg ${blocked ? "border-destructive/60" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`size-2.5 rounded-full ${toneFor(dragging.department_type_id).dot}`}
                          />
                          <span className="text-sm font-medium">{dragging.full_name}</span>
                        </div>
                        {resolution && resolution.status !== "noop" && (
                          <p
                            className={`mt-1 flex max-w-72 items-start gap-1.5 text-xs ${blocked ? "text-destructive" : "text-muted-foreground"}`}
                          >
                            {blocked && <Ban className="mt-0.5 size-3 shrink-0" />}
                            {resolution.status === "invalid" ? resolution.reason : resolution.label}
                          </p>
                        )}
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
                  onEdit={handleEdit}
                  onGone={handleGone}
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
