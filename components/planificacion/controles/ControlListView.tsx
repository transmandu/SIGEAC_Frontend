"use client";

import { Segmented } from "@/components/planificacion/auditoria/Segmented";

export type ControlListView = "active" | "retired";

const OPTIONS: { key: ControlListView; label: string }[] = [
  { key: "active", label: "Vigentes" },
  { key: "retired", label: "Dados de baja" },
];

export function ControlListViewToggle({
  value,
  onChange,
}: {
  value: ControlListView;
  onChange: (value: ControlListView) => void;
}) {
  return (
    <Segmented
      ariaLabel="Controles"
      value={value}
      options={OPTIONS}
      onChange={onChange}
    />
  );
}
