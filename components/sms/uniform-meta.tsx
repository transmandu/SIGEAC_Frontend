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

const UNIFORM_TYPE_ICONS = {
  shirt: Shirt,
  footwear: Footprints,
  headwear: HardHat,
  other: Package,
} satisfies Record<string, LucideIcon>;

const uniformTypeKey = (
  type?: string,
  label?: string,
): keyof typeof UNIFORM_TYPE_ICONS => {
  const key = `${type ?? ""} ${label ?? ""}`.toLowerCase();
  if (/camis|shirt|franel|chemi|chalec|vest/.test(key)) return "shirt";
  if (/bota|boot|calzad|zapat/.test(key)) return "footwear";
  if (/casco|helmet|gorra|cap/.test(key)) return "headwear";
  return "other";
};

/**
 * Icono representativo de un tipo de uniforme. Cae en un paquete neutro para
 * que un tipo desconocido no rompa nada.
 *
 * Es un componente y no una función que devuelve un icono: guardar ese icono en
 * una variable dentro de otro componente creaba un tipo de componente nuevo en
 * cada render, y React lo desmontaba y volvía a montar cada vez.
 */
export const UniformTypeIcon = ({
  type,
  label,
  className,
}: {
  type?: string;
  label?: string;
  className?: string;
}) => {
  const Icon = UNIFORM_TYPE_ICONS[uniformTypeKey(type, label)];

  return <Icon className={className} />;
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
