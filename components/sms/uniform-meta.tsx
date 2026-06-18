import {
  ArrowDownRight,
  ArrowUpRight,
  Footprints,
  HardHat,
  type LucideIcon,
  Package,
  Settings2,
  Shirt,
} from "lucide-react";

/**
 * Maps a uniform type to a representative icon. Falls back to a neutral
 * package glyph so unknown types degrade gracefully instead of breaking.
 */
export const getUniformTypeIcon = (type?: string, label?: string): LucideIcon => {
  const key = `${type ?? ""} ${label ?? ""}`.toLowerCase();
  if (/camis|shirt|franel|chemi|chalec|vest/.test(key)) return Shirt;
  if (/bota|boot|calzad|zapat/.test(key)) return Footprints;
  if (/casco|helmet|gorra|cap/.test(key)) return HardHat;
  return Package;
};

/** Shared visual vocabulary for movement types (table badges + form select). */
export const MOVEMENT_TYPE_META: Record<
  string,
  { badgeClass: string; Icon: LucideIcon }
> = {
  ENTRY: {
    badgeClass: "bg-emerald-600 hover:bg-emerald-600",
    Icon: ArrowUpRight,
  },
  ISSUANCE: {
    badgeClass: "bg-blue-600 hover:bg-blue-600",
    Icon: ArrowDownRight,
  },
  ADJUSTMENT: {
    badgeClass: "bg-amber-600 hover:bg-amber-600",
    Icon: Settings2,
  },
};
