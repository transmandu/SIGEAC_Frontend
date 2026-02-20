import type { ChecklistGroup, ChecklistItem } from "@/app/[company]/control_calidad/incoming/IncomingTypes";
import { FileText, LucideIcon, Package } from "lucide-react";
import type { IncomingChecklistResponse } from "./useGetIncomingInspectionChecks";

const GROUP_ICON: Record<string, LucideIcon> = {
  "Coincidencia física": Package,
  "Documentación": FileText,
  "Otros": Package,
};

function groupFromCode(code: string) {
  const n = Number(code);
  if (n >= 1 && n <= 2) return "Coincidencia física";
  if (n >= 3 && n <= 9) return "Documentación";
  return "Otros";
}

function keyFromCheck(c: IncomingChecklistResponse) {
  return `incoming_check_${c.code}`;
}

export function checksToGroups(
  checks: IncomingChecklistResponse[],
  hasDocumentation: boolean
): ChecklistGroup[] {
  const active = checks.filter((c) => c.active);

  active.sort((a, b) => Number(a.code) - Number(b.code));

  const map = new Map<string, ChecklistItem[]>();

  for (const c of active) {
    const title = groupFromCode(c.code);
    const isDocGroup = title === "Documentación";

    const item: ChecklistItem = {
      id: String(c.id),
      key: keyFromCheck(c),
      label: c.description,
      hint: c.regulation ?? undefined,
      // docs solo requeridos si el artículo declara que aplica documentación
      requiredForAccept: isDocGroup ? (hasDocumentation ? c.is_critical : false) : c.is_critical,
    };

    const arr = map.get(title) ?? [];
    arr.push(item);
    map.set(title, arr);
  }

  return Array.from(map.entries()).map(([title, items]) => ({
    title,
    icon: GROUP_ICON[title] ?? Package,
    items,
  }));
}
