"use client";

import { AlertTriangle, LifeBuoy } from "lucide-react";
import { Control } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  CONTROL_ITEM_FLAG_LABELS,
  CONTROL_ITEM_FLAGS,
} from "@/lib/controlItemFlags";
import { ControlItemFlag } from "@/types";

const FLAG_ICONS: Record<ControlItemFlag, React.ReactNode> = {
  HAZARDOUS: <AlertTriangle className="size-3.5 text-amber-500" />,
  EMERGENCY_EQUIPMENT: <LifeBuoy className="size-3.5 text-red-500" />,
};

/** Casillas de las banderas del ítem; el valor del campo es la lista de códigos marcados. */
export function ControlItemFlagsField({
  control,
  name,
}: {
  control: Control<any>;
  name: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: ControlItemFlag[] = field.value ?? [];

        return (
          <FormItem className="space-y-0">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {CONTROL_ITEM_FLAGS.map((flag) => (
                <label
                  key={flag}
                  className="flex w-fit cursor-pointer select-none items-center gap-2 text-sm"
                >
                  <FormControl>
                    <Checkbox
                      checked={selected.includes(flag)}
                      onCheckedChange={(checked) =>
                        field.onChange(
                          checked
                            ? [...selected, flag]
                            : selected.filter((current) => current !== flag),
                        )
                      }
                    />
                  </FormControl>
                  <span className="flex items-center gap-1">
                    {FLAG_ICONS[flag]}
                    {CONTROL_ITEM_FLAG_LABELS[flag]}
                  </span>
                </label>
              ))}
            </div>
          </FormItem>
        );
      }}
    />
  );
}
