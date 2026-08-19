"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Employee } from "@/types";

interface AgreementItemProps {
  form: UseFormReturn<any>;
  index: number;
  employees: Employee[];
  onRemove: () => void;
}

export function AgreementItem({ form, index, employees, onRemove }: AgreementItemProps) {
  const isExternal = form.watch(`agreements.${index}.is_external`);

  const employeeOptions = employees.map((e) => ({
    value: String(e.id),
    label: `${e.first_name} ${e.last_name}`.trim(),
  }));

  return (
    <div className="flex flex-col gap-3 p-3 border border-border/30 rounded-md">
      <div className="flex items-center justify-between">
        <FormField
          control={form.control}
          name={`agreements.${index}.is_external`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-xs font-medium text-muted-foreground cursor-pointer">
                Responsable externo
              </FormLabel>
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={onRemove}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      <FormField
        control={form.control}
        name={`agreements.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
              Descripción
            </FormLabel>
            <FormControl>
              <Textarea placeholder="Acuerdo..." className="min-h-[60px]" {...field} />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {!isExternal ? (
        <ComboboxField
          form={form}
          name={`agreements.${index}.responsible_employee_id`}
          label="Responsable"
          placeholder="Seleccionar empleado..."
          options={employeeOptions}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={`agreements.${index}.responsible_name`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                  Nombre
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`agreements.${index}.responsible_job_title`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                  Cargo
                </FormLabel>
                <FormControl>
                  <Input placeholder="Cargo" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
