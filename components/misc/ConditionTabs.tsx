"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { conditionOptions } from "@/lib/warehouse/conditions";
import { useMemo } from "react";

export const ALL_CONDITIONS = "all";

interface ConditionTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/**
 * Pestañas de condición de componentes y partes. Salen de la tabla
 * `conditions` de la compañía: cada una tiene las suyas, y una lista fija en
 * el frontend filtraba por nombres que en algunas no existen.
 */
export function ConditionTabs({
  value,
  onValueChange,
  className,
}: ConditionTabsProps) {
  const { data: conditions } = useGetConditions();
  const options = useMemo(() => conditionOptions(conditions), [conditions]);

  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList
        className="flex flex-wrap justify-center h-auto gap-1"
        aria-label="Condición"
      >
        <TabsTrigger value={ALL_CONDITIONS}>Todos</TabsTrigger>
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
