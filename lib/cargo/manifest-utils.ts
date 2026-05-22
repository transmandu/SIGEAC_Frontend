import { CargoManifestItem } from "@/types";

/**
 * Peso por unidad (Ratio) de un ítem del manifiesto
 */
export function getRatio(item: CargoManifestItem): number {
  const sItem = (item as any).shipment_item || item.shipmentItem;
  if (sItem) return sItem.weight / sItem.units;
  return item.weight_in_manifest / item.units_in_manifest;
}

/**
 * Peso máximo disponible para un ítem (incluyendo lo ya asignado en este manifiesto)
 */
export function getAvailableWeight(item: CargoManifestItem): number {
  const sItem = (item as any).shipment_item || item.shipmentItem;
  if (!sItem) return Math.max(0, Number(item.weight_in_manifest));
  return Math.max(0, Number(sItem.weight_available ?? sItem.weight));
}

/**
 * Unidades máximas disponibles para un ítem
 */
export function getAvailableUnits(item: CargoManifestItem): number {
  const sItem = (item as any).shipment_item || item.shipmentItem;
  if (!sItem) return Math.max(0, Number(item.units_in_manifest));
  return Math.max(0, Number(sItem.units_available ?? sItem.units));
}

/**
 * Descripción del ítem con fallback seguro
 */
export function getItemDescription(item: CargoManifestItem): string {
  const sItem = (item as any).shipment_item || item.shipmentItem;
  return sItem?.product_description ?? `Ítem #${item.cargo_shipment_item_id}`;
}
