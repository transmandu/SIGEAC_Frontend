"use client";

import { useMemo } from "react";
import {
  useUpdateCargoManifest,
  ManifestItemUpdatePayload,
} from "@/actions/cargo/manifestActions";
import { useGetAvailableShipments } from "@/hooks/operaciones/cargo/useGetAvailableShipments";
import { useManifestEditor } from "@/hooks/operaciones/cargo/useManifestEditor";
import { useNewItemSelector } from "@/hooks/operaciones/cargo/useNewItemSelector";
import { CargoManifest } from "@/types";
import { Loader2 } from "lucide-react";

// Subcomponentes
import { ExistingShipmentGroup } from "@/app/[company]/operaciones/cargo/manifiestos/_components/ExistingShipmentGroup";
import { AvailableShipmentGroup } from "@/app/[company]/operaciones/cargo/manifiestos/_components/AvailableShipmentGroup";
import { ManifestFormFooter } from "@/app/[company]/operaciones/cargo/manifiestos/_components/ManifestFormFooter";

interface Props {
  manifest: CargoManifest;
  company: string;
  onSuccess?: () => void;
}

interface ShipmentItemAvailable {
  id: number;
  cargo_shipment_id: number;
  product_description: string;
  units: number;
  weight: number;
  weight_dispatched: number;
  units_dispatched: number;
  weight_available: number;
  units_available: number;
}

interface ShipmentAvailable {
  id: number;
  guide_number: string;
  manifest_status: string;
  client?: { name: string };
  aircraft?: { acronym: string };
  external_aircraft?: string;
  items: ShipmentItemAvailable[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-muted text-muted-foreground" },
  partial: { label: "Parcial", className: "bg-yellow-100 text-yellow-800" },
  modified: { label: "Modificado", className: "bg-orange-100 text-orange-800" },
  manifested: {
    label: "Manifestado",
    className: "bg-green-100 text-green-800",
  },
};

export default function UpdateCargoManifestForm({
  manifest,
  company,
  onSuccess,
}: Props) {
  const { updateCargoManifest } = useUpdateCargoManifest(company);

  // Hook para controlar los ítems del manifiesto actual (Sección arriba)
  const editor = useManifestEditor(manifest);

  // Hook para controlar las nuevas adiciones (Sección abajo)
  const selector = useNewItemSelector();

  // Guías de carga con productos libres en el mes
  const { data: availableShipments, isLoading: loadingAvailable } =
    useGetAvailableShipments(company, manifest.month, manifest.year);

  // Filtro: IDs de ítems que ya están en el manifiesto actual
  const existingItemIds = useMemo(
    () =>
      new Set(
        manifest.items?.map((i) => Number(i.cargo_shipment_item_id)) ?? [],
      ),
    [manifest.items],
  );

  // Guías disponibles filtradas (excluyendo lo ya manifestado)
  const filteredAvailableShipments = useMemo(() => {
    return ((availableShipments as any as ShipmentAvailable[]) ?? [])
      .map((shipment) => ({
        ...shipment,
        items: shipment.items.filter(
          (item) =>
            !existingItemIds.has(Number(item.id)) && item.weight_available > 0,
        ),
      }))
      .filter((shipment) => shipment.items.length > 0);
  }, [availableShipments, existingItemIds]);

  // Totales acumulados (Existentes activos + Nuevos seleccionados)
  const totals = useMemo(() => {
    let totalWeight = 0;
    let totalUnits = 0;
    let activeCount = 0;

    editor.itemStates.forEach((state) => {
      if (!state.removed) {
        totalWeight += state.weight;
        totalUnits += state.units;
        activeCount++;
      }
    });

    selector.newSelections.forEach((sel) => {
      totalWeight += sel.weight;
      totalUnits += sel.units;
      activeCount++;
    });

    return { totalWeight, totalUnits, activeCount };
  }, [editor.itemStates, selector.newSelections]);

  const hasChanges = editor.hasChanges || selector.newSelections.size > 0;
  const hasErrors = editor.errors.size > 0 || selector.hasNewErrors;

  const handleSubmit = () => {
    if (hasErrors) return;

    const items: ManifestItemUpdatePayload[] = [];

    // Payload de ítems existentes
    editor.itemStates.forEach((state, shipment_item_id) => {
      const originalItem = manifest.items?.find(
        (i) => Number(i.cargo_shipment_item_id) === shipment_item_id,
      );
      items.push({
        shipment_id: originalItem?.cargo_shipment_id || 0,
        shipment_item_id,
        weight_in_manifest: state.removed ? 0 : state.weight,
        units_in_manifest: state.removed ? 0 : state.units,
      });
    });

    // Payload de ítems nuevos agregados
    selector.newSelections.forEach((sel, shipment_item_id) => {
      items.push({
        shipment_id: sel.shipment_id,
        shipment_item_id,
        weight_in_manifest: sel.weight,
        units_in_manifest: sel.units,
      });
    });

    updateCargoManifest.mutate(
      { id: manifest.id, data: { items } },
      { onSuccess },
    );
  };

  if (
    (!manifest.items || manifest.items.length === 0) &&
    filteredAvailableShipments.length === 0
  ) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay ítems en este manifiesto ni guías disponibles para agregar.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── SECCIÓN SUPERIOR: ITEMS ACTUALES EN EL MANIFIESTO ── */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {editor.shipmentGroups.map(([shipmentId, group]) => (
          <ExistingShipmentGroup
            key={shipmentId}
            shipmentId={shipmentId}
            group={group}
            itemStates={editor.itemStates}
            errors={editor.errors}
            onUpdateWeight={editor.updateWeight}
            onUpdateUnits={editor.updateUnits}
            onToggleRemove={editor.toggleRemove}
          />
        ))}
      </div>

      {/* ── SEPARADOR ESTÉTICO ── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-dashed border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            Agregar productos disponibles
          </span>
        </div>
      </div>

      {/* ── SECCIÓN INFERIOR: PRODUCTOS DISPONIBLES PARA AGREGAR ── */}
      {loadingAvailable ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      ) : filteredAvailableShipments.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground py-4 italic">
          No hay más guías con productos disponibles para agregar.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredAvailableShipments.map((shipment) => (
            <AvailableShipmentGroup
              key={shipment.id}
              shipment={shipment}
              newSelections={selector.newSelections}
              newErrors={selector.newErrors}
              statusConfig={statusConfig}
              onToggleNewItem={selector.toggleNewItem}
              onUpdateNewWeight={selector.updateNewWeight}
              onUpdateNewUnits={selector.updateNewUnits}
            />
          ))}
        </div>
      )}

      {/* ── FOOTER: TOTALES Y ENVÍO ── */}
      <ManifestFormFooter
        totalWeight={totals.totalWeight}
        totalUnits={totals.totalUnits}
        activeCount={totals.activeCount}
        hasErrors={hasErrors}
        hasChanges={hasChanges}
        isPending={updateCargoManifest.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
