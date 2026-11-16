"use client";

import { useMemo, useRef, useState } from "react";
import { Building2, MapPinned, Network } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import {
  useCreateDepartment,
  useUpdateDepartment,
} from "@/actions/ajustes/departamento/actions";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import {
  fieldClass,
  hintClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import { PanelFieldLabel, PanelSection } from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { Dialog } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { suggestAcronym } from "@/lib/departments";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department, DepartmentType } from "@/types";

const NONE = "none";
const NAME_MAX = 150;
const DESCRIPTION_MAX = 500;

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  acronym: "Siglas",
  department_type_id: "Tipo",
  department_parent_id: "Depende de",
  description: "Descripción",
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

const buildSchema = (existing: Department[], current?: Department | null) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, "Ingrese el nombre del departamento.")
      .max(NAME_MAX, `No puede superar los ${NAME_MAX} caracteres.`),
    acronym: z
      .string()
      .regex(
        /^[A-Z]{2,6}$/,
        "De 2 a 6 letras mayúsculas (A-Z), sin espacios ni números.",
      )
      .refine(
        (value) =>
          !existing.some(
            (department) =>
              department.id !== current?.id && department.acronym === value,
          ),
        "Ya existe un departamento con esas siglas.",
      ),
    department_type_id: z.string(),
    department_parent_id: z.string(),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX, `No puede superar los ${DESCRIPTION_MAX} caracteres.`),
  });

type DepartmentFormValues = z.infer<ReturnType<typeof buildSchema>>;

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
  // Radix solo desmonta el contenido del diálogo, no al componente que lo
  // envuelve: el formulario conservaría lo de la apertura anterior. Cada
  // apertura toma su propia sesión (clave nueva) con el departamento de ese
  // momento, que además no cambia mientras el diálogo se cierra.
  const [session, setSession] = useState({ id: 0, department, defaultParentId });
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSession((current) => ({ id: current.id + 1, department, defaultParentId }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DepartmentFormContent
        key={session.id}
        onClose={() => onOpenChange(false)}
        department={session.department}
        defaultParentId={session.defaultParentId}
        types={types}
        departments={departments}
      />
    </Dialog>
  );
}

function DepartmentFormContent({
  onClose,
  department,
  defaultParentId = null,
  types,
  departments,
}: Omit<Props, "open" | "onOpenChange"> & { onClose: () => void }) {
  const { selectedCompany } = useCompanyStore();
  const { createDepartment } = useCreateDepartment();
  const { updateDepartment } = useUpdateDepartment();

  const isEdit = !!department;
  const mutation = isEdit ? updateDepartment : createDepartment;
  const acronymTouched = useRef(isEdit);

  const schema = useMemo(
    () => buildSchema(departments, department),
    [departments, department],
  );

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: department?.name ?? "",
      acronym: department?.acronym ?? "",
      department_type_id: department?.department_type_id
        ? String(department.department_type_id)
        : NONE,
      department_parent_id: String(
        department?.department_parent_id ?? defaultParentId ?? NONE,
      ),
      description: department?.description ?? "",
    },
  });

  const [name, typeId, description] = useWatch({
    control: form.control,
    name: ["name", "department_type_id", "description"],
  });

  const type = types.find((candidate) => String(candidate.id) === typeId);
  const base = name.trim();
  const preview = base
    ? type
      ? [type.name, type.connector, base].filter(Boolean).join(" ")
      : base
    : "";
  const repeatsType = !!type && normalize(name).startsWith(normalize(type.name));

  const typeOptions = useMemo(
    () => [
      { id: NONE, label: "Sin tipo" },
      ...types.map((option) => ({ id: String(option.id), label: option.name })),
    ],
    [types],
  );
  const parentOptions = useMemo(
    () => [
      { id: NONE, label: "Raíz del organigrama" },
      ...departments.map((option) => ({
        id: String(option.id),
        label: option.full_name,
      })),
    ],
    [departments],
  );

  const onSubmit = async (values: DepartmentFormValues) => {
    const company = selectedCompany?.slug;
    if (!company) return;

    const departmentTypeId =
      values.department_type_id === NONE ? null : Number(values.department_type_id);

    try {
      if (department) {
        // Solo lo que cambió; el servidor deja intacto lo que no llega.
        const data: Parameters<typeof updateDepartment.mutateAsync>[0] = {
          company,
          id: department.id,
        };
        if (values.name !== department.name) data.name = values.name;
        if (values.acronym !== department.acronym) data.acronym = values.acronym;
        if (departmentTypeId !== department.department_type_id) {
          data.department_type_id = departmentTypeId;
        }
        if (values.description !== (department.description ?? "")) {
          data.description = values.description || null;
        }

        if (Object.keys(data).length > 2) await updateDepartment.mutateAsync(data);
      } else {
        await createDepartment.mutateAsync({
          company,
          name: values.name,
          acronym: values.acronym,
          description: values.description || null,
          department_type_id: departmentTypeId,
          department_parent_id:
            values.department_parent_id === NONE
              ? null
              : Number(values.department_parent_id),
        });
      }

      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) applyServerFieldErrors(form.setError, errors, FIELD_LABELS);
    }
  };

  return (
    <FormDialogContent
      icon={Building2}
      title={isEdit ? "Editar departamento" : "Nuevo departamento"}
      description="El nombre va sin el tipo: «Mantenimiento» con tipo «Dirección» se muestra como «Dirección de Mantenimiento»."
      className="sm:max-w-xl"
    >
      <Form {...form}>
        <ArticleFormShell
          busy={mutation.isPending}
          canSave={isEdit ? form.formState.isDirty : true}
          isEditing={isEdit}
          submitLabel={isEdit ? "Guardar cambios" : "Crear departamento"}
          onCancel={onClose}
          onSubmit={(event) => {
            event.stopPropagation();
            form.handleSubmit(onSubmit, invalidFormHandler(FIELD_LABELS))(event);
          }}
        >
          <PanelSection
            icon={Network}
            title="Departamento"
            hint="Cómo se llama y cómo se identifica."
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="department_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <PanelFieldLabel preventClick>Tipo</PanelFieldLabel>
                      <OptionCombobox
                        value={field.value}
                        onChange={field.onChange}
                        options={typeOptions}
                        placeholder="Sin tipo"
                        searchPlaceholder="Buscar tipo..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acronym"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <PanelFieldLabel>
                        Siglas
                        <RequiredIndicator invalid={!!fieldState.error} />
                      </PanelFieldLabel>
                      <FormControl>
                        <Input
                          className={fieldClass}
                          placeholder="Ej: DIP"
                          autoComplete="off"
                          maxLength={6}
                          {...field}
                          onChange={(event) => {
                            acronymTouched.current = true;
                            field.onChange(
                              event.target.value.toUpperCase().replace(/[^A-Z]/g, ""),
                            );
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
                render={({ field, fieldState }) => (
                  <FormItem>
                    <PanelFieldLabel>
                      Nombre
                      <RequiredIndicator invalid={!!fieldState.error} />
                    </PanelFieldLabel>
                    <FormControl>
                      <Input
                        className={fieldClass}
                        placeholder="Ej: Tecnología de la Información y Publicaciones"
                        autoComplete="off"
                        maxLength={NAME_MAX}
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);
                          // Siglas sugeridas al crear, mientras no se hayan tocado a mano.
                          if (!acronymTouched.current) {
                            form.setValue(
                              "acronym",
                              suggestAcronym(event.target.value),
                              { shouldValidate: false },
                            );
                          }
                        }}
                      />
                    </FormControl>
                    {preview && (
                      <FormDescription className={hintClass}>
                        Se mostrará como:{" "}
                        <span className="font-medium text-foreground">
                          {preview}
                        </span>
                      </FormDescription>
                    )}
                    {repeatsType && (
                      <p className="text-[13px] text-amber-600 dark:text-amber-400">
                        El nombre ya empieza con el tipo; escríbalo sin él para
                        no duplicarlo.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <PanelFieldLabel>Descripción</PanelFieldLabel>
                    <FormControl>
                      <Textarea
                        className={textareaClass}
                        rows={3}
                        maxLength={DESCRIPTION_MAX}
                        placeholder="Qué hace este departamento (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className={`${hintClass} text-right`}>
                      {description.length}/{DESCRIPTION_MAX}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </PanelSection>

          {!isEdit && (
            <PanelSection
              icon={MapPinned}
              title="Lugar en el organigrama"
              hint="De quién depende. Después puede arrastrarlo para moverlo."
            >
              <FormField
                control={form.control}
                name="department_parent_id"
                render={({ field }) => (
                  <FormItem>
                    <PanelFieldLabel preventClick>Depende de</PanelFieldLabel>
                    <OptionCombobox
                      value={field.value}
                      onChange={field.onChange}
                      options={parentOptions}
                      placeholder="Raíz del organigrama"
                      searchPlaceholder="Buscar departamento..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </PanelSection>
          )}
        </ArticleFormShell>
      </Form>
    </FormDialogContent>
  );
}
