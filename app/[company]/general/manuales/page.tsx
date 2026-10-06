"use client";

import { useCallback, useMemo, useState } from "react";
import { Plane, PlusCircle } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { ManualDialog } from "@/components/dialogs/mantenimiento/catalogo/ManualDialog";
import { DataTableSearchInput } from "@/components/tables/DataTableSearchInput";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useCanManageCatalog } from "@/hooks/mantenimiento/catalogo/useCanManageCatalog";
import { useGetCatalogManual } from "@/hooks/mantenimiento/catalogo/useGetCatalogManual";
import { useGetCatalogManuals } from "@/hooks/mantenimiento/catalogo/useGetCatalogManuals";
import { useGetCatalogServices } from "@/hooks/mantenimiento/catalogo/useGetCatalogServices";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/maintenanceCatalogLabels";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  emptyManualFilters,
  emptyServiceFilters,
  isFilteringServices,
  matchesManualFilters,
  matchesService,
  type ManualFilters,
  type ServiceFilters,
} from "./_components/catalog-filters";
import { FilterMenu } from "./_components/FilterMenu";
import { HorizontalScroller } from "./_components/HorizontalScroller";
import {
  ManualList,
  NO_MANUAL_ID,
  type ManualAction,
} from "./_components/ManualList";
import { ManualPanel } from "./_components/ManualPanel";

const enumOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

const ManualsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;
  const canManage = useCanManageCatalog();
  const isSuperuser = useIsSuperuser();

  const [aircraftId, setAircraftId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [serviceFilters, setServiceFilters] =
    useState<ServiceFilters>(emptyServiceFilters);
  const [manualFilters, setManualFilters] =
    useState<ManualFilters>(emptyManualFilters);
  const [request, setRequest] = useState<{
    id: number;
    kind: ManualAction;
  } | null>(null);
  const clearRequest = useCallback(() => setRequest(null), []);

  const { data: aircrafts = [] } = useGetMaintenanceAircrafts(company);
  const { data: rawManuals = [], isLoading: loadingManuals } =
    useGetCatalogManuals(company, { aircraftId: aircraftId ?? undefined });

  // Los servicios sin manual no cuelgan de ninguno, así que ni el listado ni el
  // detalle de manuales los alcanzan: se piden aparte y se muestran como un
  // grupo más para que no se pierdan.
  const { data: rawUnassigned = [], isLoading: loadingUnassigned } =
    useGetCatalogServices(company, {
      withoutManual: true,
      withTasks: true,
      aircraftId: aircraftId ?? undefined,
    });

  // Buscar o filtrar servicios exige verlos todos (con sus tareas, para
  // alcanzar ATA y número de tarea): la consulta solo se hace mientras hay un
  // filtro activo, el resto del tiempo basta con el manual abierto.
  const filteringServices = isFilteringServices(serviceFilters);
  const { data: allServices = [], isLoading: loadingAllServices } =
    useGetCatalogServices(company, {
      aircraftId: aircraftId ?? undefined,
      withTasks: true,
      enabled: filteringServices,
    });

  const matched = useMemo(
    () =>
      filteringServices
        ? allServices.filter((service) =>
            matchesService(service, serviceFilters),
          )
        : null,
    [filteringServices, allServices, serviceFilters],
  );
  const matchedIds = useMemo(
    () => (matched ? new Set(matched.map((service) => service.id)) : null),
    [matched],
  );
  // Coincidencias por manual; el grupo sin manual cuenta bajo NO_MANUAL_ID.
  const matchCounts = useMemo(() => {
    if (!matched) return null;
    const counts = new Map<number, number>();
    for (const service of matched) {
      const key = service.maintenance_catalog_manual_id ?? NO_MANUAL_ID;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [matched]);

  // Vigentes primero: los superados son historia y no deben tapar al manual
  // con el que se trabaja hoy.
  const manuals = useMemo(
    () =>
      rawManuals
        .filter((manual) => matchesManualFilters(manual, manualFilters))
        .filter((manual) => !matchCounts || matchCounts.has(manual.id))
        .sort(
          (a, b) =>
            Number(a.status === "SUPERSEDED") -
            Number(b.status === "SUPERSEDED"),
        ),
    [rawManuals, manualFilters, matchCounts],
  );
  const unassignedServices = matched
    ? matched.filter((service) => service.maintenance_catalog_manual_id == null)
    : rawUnassigned;
  const hasUnassigned = unassignedServices.length > 0;

  // La selección vive como id y se valida contra lo visible: al filtrar, al
  // borrar el manual o al cargar por primera vez, cae al primero en vez de
  // apuntar a algo que ya no está.
  const activeId =
    selectedId === NO_MANUAL_ID && hasUnassigned
      ? NO_MANUAL_ID
      : selectedId != null && manuals.some((manual) => manual.id === selectedId)
        ? selectedId
        : (manuals[0]?.id ?? (hasUnassigned ? NO_MANUAL_ID : null));
  const unassignedActive = activeId === NO_MANUAL_ID;

  const { data: manual, isLoading: loadingManual } = useGetCatalogManual(
    company,
    unassignedActive ? undefined : (activeId ?? undefined),
  );

  const sortedAircrafts = useMemo(
    () => [...aircrafts].sort((a, b) => a.acronym.localeCompare(b.acronym)),
    [aircrafts],
  );
  const aircraftAcronym =
    sortedAircrafts.find((aircraft) => aircraft.id === aircraftId)?.acronym ??
    null;

  const loadingFilters = filteringServices && loadingAllServices;
  const anyFilter =
    aircraftId != null ||
    filteringServices ||
    manualFilters.status.length > 0 ||
    manualFilters.support.length > 0;

  const clearFilters = () => {
    setAircraftId(null);
    setServiceFilters(emptyServiceFilters);
  };

  // Una revisión anterior puede quedar fuera de lo filtrado: al saltar a ella
  // se limpia todo.
  const jumpToManual = (id: number) => {
    clearFilters();
    setManualFilters(emptyManualFilters);
    setSelectedId(id);
  };

  return (
    <ContentLayout title="Manuales de Mtto.">
      {/* En escritorio el área de trabajo ocupa exactamente lo que queda bajo el
          navbar (3.5rem) y el margen del layout (py-6 = 3rem): el encabezado
          mide lo que mida y la rejilla toma el resto, así ninguna columna
          depende de adivinar cuánto hay encima. */}
      <div className="flex flex-col gap-6 lg:h-[calc(100vh-7rem)]">
        <PageHeader />

        <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Manuales de Mtto.
            </h1>
            <p className="text-sm text-muted-foreground">
              Los manuales (AMM, MPD, CMM, directivas y boletines) con los
              servicios, certificados y tareas que declara cada uno.
            </p>
          </div>
          {canManage && (
            <ActionTriggerButton
              type="button"
              onClick={() => setOpenCreate(true)}
              className="shrink-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Manual
            </ActionTriggerButton>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          {sortedAircrafts.length > 0 && (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Aeronave
              </span>
              {/* Una sola fila: si no caben, se desplaza en horizontal. El
                  w-max evita que el contenido se parta; el padding inferior
                  deja sitio a la barra sin pisar los badges. */}
              <HorizontalScroller className="min-w-0 flex-1">
                <div className="flex w-max items-center gap-2 p-1 pb-3">
                  {[{ id: null, acronym: "Todas" }, ...sortedAircrafts].map(
                    (aircraft) => {
                      const selected = aircraft.id === aircraftId;

                      return (
                        <button
                          key={aircraft.id ?? "all"}
                          type="button"
                          onClick={() => setAircraftId(aircraft.id)}
                          aria-pressed={selected}
                          className={cn(
                            "flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold tracking-wide outline-none transition-all duration-200",
                            "focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-95",
                            selected
                              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                              : "border-slate-400/50 bg-linear-to-br from-background/70 to-background/40 text-foreground/80 backdrop-blur-md hover:border-primary/40 hover:text-primary hover:shadow-sm dark:border-slate-600/50",
                          )}
                        >
                          {aircraft.id !== null && (
                            <Plane className="size-3.5" />
                          )}
                          {aircraft.acronym}
                        </button>
                      );
                    },
                  )}
                </div>
              </HorizontalScroller>
            </div>
          )}

          {/* Búsqueda y filtros de servicios: encuentran en cualquier manual y
              la lista de la izquierda se reduce a donde hay coincidencias. */}
          <div className="flex shrink-0 items-center gap-2 lg:ml-auto">
            <DataTableSearchInput
              value={serviceFilters.search}
              onChange={(search) =>
                setServiceFilters({ ...serviceFilters, search })
              }
              placeholder="Buscar servicio, ATA o tarea..."
              className="w-full sm:w-72"
            />
            <FilterMenu
              groups={[
                {
                  title: "Categoría",
                  options: enumOptions(CATEGORY_LABELS),
                  selected: serviceFilters.category,
                  onChange: (category) =>
                    setServiceFilters({ ...serviceFilters, category }),
                },
                {
                  title: "Estado del servicio",
                  options: enumOptions(STATUS_LABELS),
                  selected: serviceFilters.status,
                  onChange: (status) =>
                    setServiceFilters({ ...serviceFilters, status }),
                },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(16rem,1fr)_4fr] lg:grid-rows-[minmax(0,1fr)]">
          <ManualList
            manuals={manuals}
            unassignedCount={unassignedServices.length}
            loading={loadingManuals || loadingFilters}
            selectedId={activeId}
            onSelect={setSelectedId}
            onAction={(id, kind) => {
              setSelectedId(id);
              setRequest({ id, kind });
            }}
            canManage={canManage}
            filters={manualFilters}
            onFiltersChange={setManualFilters}
            matchCounts={matchCounts}
            filtered={anyFilter}
          />
          <div className="min-w-0 lg:min-h-0">
            <ManualPanel
              manual={unassignedActive ? undefined : manual}
              unassignedServices={unassignedActive ? unassignedServices : null}
              isLoading={
                loadingManuals ||
                loadingFilters ||
                (unassignedActive
                  ? loadingUnassigned
                  : activeId != null && loadingManual)
              }
              aircraftId={aircraftId}
              aircraftAcronym={aircraftAcronym}
              matchedIds={matchedIds}
              canManage={canManage}
              isSuperuser={isSuperuser}
              onSelectManual={jumpToManual}
              onManualDeleted={() => setSelectedId(null)}
              onClearFilters={clearFilters}
              request={request}
              onRequestHandled={clearRequest}
            />
          </div>
        </div>
      </div>

      <ManualDialog open={openCreate} onOpenChange={setOpenCreate} />
    </ContentLayout>
  );
};

export default ManualsPage;
