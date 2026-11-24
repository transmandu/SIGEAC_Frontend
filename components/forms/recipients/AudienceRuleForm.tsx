"use client";

import { useMemo } from "react";
import { Eye } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { hintClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import {
  PanelFieldLabel,
  PanelSection,
  PanelStaticLabel,
  SwitchRow,
} from "@/components/forms/PanelSection";
import type {
  AudienceApi,
  AudienceCopy,
  AudiencePayload,
  AudienceRule,
  AudienceSubject,
  AudienceTargetType,
} from "@/components/forms/recipients/audience-types";
import {
  TARGET_TYPES,
  useRecipientTargetOptions,
} from "@/components/forms/recipients/recipient-targets";
import { ChoiceButton } from "@/components/forms/recipients/ChoiceButton";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";

/** Aquí el destino es gente del sistema: no admite una dirección de correo libre. */
const AUDIENCE_TYPES = TARGET_TYPES.filter((item) => item.type !== "EMAIL");

const FIELD_LABELS: Record<string, string> = { target: "Destino" };

/** El servidor nombra el destino por su columna; el formulario lo tiene en un solo campo. */
const SERVER_TARGET_FIELDS = [
  "user_id",
  "employee_id",
  "department_id",
  "role_name",
];

const TARGET_REQUIRED: Record<AudienceTargetType, string> = {
  ROLE: "Seleccione el rol.",
  USER: "Seleccione el usuario.",
  EMPLOYEE: "Seleccione el empleado.",
  DEPARTMENT: "Seleccione el departamento.",
};

const schema = z
  .object({
    target_type: z.enum(["ROLE", "USER", "EMPLOYEE", "DEPARTMENT"]),
    target: z.string(),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.target) {
      ctx.addIssue({
        code: "custom",
        path: ["target"],
        message: TARGET_REQUIRED[values.target_type],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const targetOf = (rule: AudienceRule): string => {
  switch (rule.target_type) {
    case "ROLE":
      return rule.role_name ?? "";
    case "USER":
      return rule.user_id ? String(rule.user_id) : "";
    case "EMPLOYEE":
      return rule.employee_id ? String(rule.employee_id) : "";
    case "DEPARTMENT":
      return rule.department_id ? String(rule.department_id) : "";
  }
};

const toPayload = (values: FormValues): AudiencePayload => ({
  target_type: values.target_type,
  user_id: values.target_type === "USER" ? Number(values.target) : null,
  employee_id: values.target_type === "EMPLOYEE" ? Number(values.target) : null,
  department_id:
    values.target_type === "DEPARTMENT" ? Number(values.target) : null,
  role_name: values.target_type === "ROLE" ? values.target : null,
  is_active: values.is_active,
});

const sameValue = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

interface Props {
  subject: AudienceSubject;
  api: AudienceApi;
  copy: AudienceCopy;
  /** Con regla, el formulario edita en lugar de agregar. */
  rule?: AudienceRule;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Agrega o edita un destino de una audiencia: a quién se le muestra una alerta
 * o a quién le llega una notificación in-app. Cada configuración le pasa su API
 * y sus textos; el formulario no sabe de cuál se trata.
 */
export function AudienceRuleForm({
  subject,
  api,
  copy,
  rule,
  onSuccess,
  onCancel,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const createRule = api.useCreate();
  const updateRule = api.useUpdate();
  const mutation = rule ? updateRule : createRule;

  const { options, loading } = useRecipientTargetOptions();

  const initial = useMemo<FormValues>(
    () => ({
      target_type: rule?.target_type ?? "ROLE",
      target: rule ? targetOf(rule) : "",
      is_active: rule?.is_active ?? true,
    }),
    [rule],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });

  const type = useWatch({ control: form.control, name: "target_type" });
  const activeType = AUDIENCE_TYPES.find((item) => item.type === type)!;

  const onSubmit = async (values: FormValues) => {
    const company = selectedCompany?.slug;
    if (!company) return;

    const payload = toPayload(values);

    try {
      if (rule) {
        // Solo lo que cambió; si cambia el tipo de destino viaja completo,
        // porque el servidor descarta los datos del tipo anterior.
        const before = toPayload(initial);
        const typeChanged = values.target_type !== rule.target_type;
        const data = Object.fromEntries(
          Object.entries(payload).filter(
            ([key, value]) => typeChanged || !sameValue(value, before[key]),
          ),
        ) as AudiencePayload;

        if (Object.keys(data).length > 0) {
          await updateRule.mutateAsync({ company, id: rule.id, data });
        }
      } else {
        await createRule.mutateAsync({
          company,
          data: { ...payload, [api.keyField]: subject.key },
        });
      }

      onSuccess?.();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (!errors) return;

      const mapped: Record<string, string[]> = {};
      for (const [field, messages] of Object.entries(errors)) {
        mapped[SERVER_TARGET_FIELDS.includes(field) ? "target" : field] =
          messages;
      }
      applyServerFieldErrors(form.setError, mapped, FIELD_LABELS);
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={mutation.isPending}
        canSave={rule ? form.formState.isDirty : true}
        isEditing={!!rule}
        submitLabel={rule ? "Guardar cambios" : "Agregar"}
        onCancel={onCancel}
        onSubmit={(event) => {
          event.stopPropagation();
          form.handleSubmit(onSubmit, invalidFormHandler(FIELD_LABELS))(event);
        }}
      >
        <PanelSection
          icon={Eye}
          title={copy.formSectionTitle}
          hint={copy.formSectionHint}
        >
          <div className="space-y-4">
            <div>
              <PanelStaticLabel>Tipo</PanelStaticLabel>
              <div
                role="radiogroup"
                aria-label="Tipo de destino"
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {AUDIENCE_TYPES.map(({ type: value, label, icon: Icon }) => {
                  const selected = value === type;

                  return (
                    <ChoiceButton
                      key={value}
                      size="field"
                      selected={selected}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        if (selected) return;
                        form.setValue(
                          "target_type",
                          value as AudienceTargetType,
                          { shouldDirty: true },
                        );
                        form.setValue("target", "");
                        form.clearErrors();
                      }}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </ChoiceButton>
                  );
                })}
              </div>
              <p className={cn(hintClass, "mt-1.5")}>{activeType.hint}</p>
            </div>

            <FormField
              control={form.control}
              name="target"
              render={({ field, fieldState }) => (
                <FormItem>
                  <PanelFieldLabel preventClick>
                    {activeType.label}
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <OptionCombobox
                    value={field.value}
                    onChange={(value) =>
                      form.setValue("target", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    options={options[type]}
                    loading={loading[type]}
                    invalid={!!fieldState.error}
                    placeholder="Seleccione..."
                    searchPlaceholder="Buscar..."
                    emptyText="Sin resultados"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </PanelSection>

        {rule && (
          <PanelSection compact title="Estado">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <SwitchRow
                  id="audience-rule-active"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    form.setValue("is_active", checked, { shouldDirty: true })
                  }
                  label="Regla activa"
                  description={copy.inactiveHint}
                />
              )}
            />
          </PanelSection>
        )}
      </ArticleFormShell>
    </Form>
  );
}
