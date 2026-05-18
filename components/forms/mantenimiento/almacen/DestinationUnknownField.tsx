"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

type DestinationUnknownFieldProps = {
  control: any;
  disabled?: boolean;
};

export function DestinationUnknownField({
  control,
  disabled,
}: DestinationUnknownFieldProps) {
  return (
    <FormField
      control={control}
      name="destination_unknown"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Destino indeterminado</FormLabel>
            <FormDescription>
              Compras confirmará si el artículo pertenece a la empresa.
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
}
