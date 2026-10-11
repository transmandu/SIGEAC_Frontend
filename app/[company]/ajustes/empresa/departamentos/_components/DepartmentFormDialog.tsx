"use client";

import {
  useCreateDepartment,
  useUpdateDepartment,
} from "@/actions/ajustes/departamento/actions";
import {
  fieldClass,
  hintClass,
  labelClass,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { suggestAcronym } from "@/lib/departments";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department, DepartmentType } from "@/types";
import { Building2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { DialogShell } from "./DialogShell";

const NONE = "none";

const departmentSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  acronym: z
    .string()
    .regex(/^[A-Z]{2,6}$/, "De 2 a 6 letras mayúsculas (A-Z), sin espacios ni números"),
  department_type_id: z.string(),
  department_parent_id: z.string(),
  description: z.string().max(500).optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  defaultParentId?: number | null;
  types: DepartmentType[];
  departments: Department[];
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  defaultParentId = null,
  types,
  departments,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { createDepartment } = useCreateDepartment();
  const { updateDepartment } = useUpdateDepartment();

  const isEdit = !!department;
  const acronymTouched = useRef(false);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      acronym: "",
      department_type_id: NONE,
      department_parent_id: NONE,
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    acronymTouched.current = isEdit;
    form.reset({
      name: department?.name ?? "",
      acronym: department?.acronym ?? "",
      department_type_id: department?.department_type_id
        ? String(department.department_type_id)
        : NONE,
      department_parent_id: String(department?.department_parent_id ?? defaultParentId ?? NONE),
      description: department?.description ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, department?.id, defaultParentId]);

  const [name, typeId] = useWatch({
    control: form.control,
    name: ["name", "department_type_id"],
  });

  const type = types.find((t) => String(t.id) === typeId);

  const preview = useMemo(() => {
    const base = name.trim();
    if (!base) return "";
    return type ? [type.name, type.connector, base].filter(Boolean).join(" ") : base;
  }, [name, type]);

  const repeatsType = !!type && normalize(name).startsWith(normalize(type.name));

  const pending = createDepartment.isPending || updateDepartment.isPending;

  const onSubmit = async (values: DepartmentFormValues) => {
    if (!selectedCompany?.slug) return;

    const departmentTypeId =
      values.department_type_id === NONE ? null : Number(values.department_type_id);

    if (isEdit && department) {
      await updateDepartment.mutateAsync({
        company: selectedCompany.slug,
        id: department.id,
        name: values.name,
        acronym: values.acronym,
        description: values.description || null,
        department_type_id: departmentTypeId,
      });
    } else {
      await createDepartment.mutateAsync({
        company: selectedCompany.slug,
        name: values.name,
        acronym: values.acronym,
        description: values.description || null,
        department_type_id: departmentTypeId,
        department_parent_id:
          values.department_parent_id === NONE ? null : Number(values.department_parent_id),
      });
    }

    onOpenChange(false);
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      icon={Building2}
      title={isEdit ? "Editar departamento" : "Nuevo departamento"}
      eyebrow="Organigrama"
      description="El nombre va sin el tipo: «Mantenimiento» con tipo «Dirección» se muestra como «Dirección de Mantenimiento»."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="department_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Sin tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Sin tipo</SelectItem>
                      {types.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acronym"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Siglas</FormLabel>
                  <FormControl>
                    <Input
                      className={fieldClass}
                      placeholder="Ej: DIP"
                      maxLength={6}
                      {...field}
                      onChange={(event) => {
                        acronymTouched.current = true;
                        field.onChange(event.target.value.toUpperCase().replace(/[^A-Z]/g, ""));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Nombre</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClass}
                    placeholder="Ej: Tecnología de la Información y Publicaciones"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      if (!acronymTouched.current) {
                        form.setValue("acronym", suggestAcronym(event.target.value), {
                          shouldValidate: false,
                        });
                      }
                    }}
                  />
                </FormControl>
                {preview && (
                  <p className={hintClass}>
                    Se mostrará como: <span className="text-foreground font-medium">{preview}</span>
                  </p>
                )}
                {repeatsType && (
                  <p className="text-[13px] text-amber-600">
                    El nombre ya empieza con el tipo; escríbelo sin él para no duplicarlo.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEdit && (
            <FormField
              control={form.control}
              name="department_parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Depende de</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Raíz del organigrama" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Raíz del organigrama</SelectItem>
                      {departments.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Descripción</FormLabel>
                <FormControl>
                  <Textarea className={textareaClass} rows={3} placeholder="Opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="min-w-35">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogShell>
  );
}
