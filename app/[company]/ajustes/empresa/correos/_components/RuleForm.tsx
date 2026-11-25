"use client";

import { useMemo } from "react";
import { ListChecks, Mail, MessageSquareText } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import {
  useCreateMailRecipientRule,
  useUpdateMailRecipientRule,
} from "@/actions/ajustes/correos/actions";
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
import {
  TARGET_TYPES,
  useRecipientTargetOptions,
} from "@/components/forms/recipients/recipient-targets";
import {
  PanelFieldLabel,
  PanelSection,
  PanelStaticLabel,
  SwitchRow,
} from "@/components/forms/PanelSection";
import { ChoiceButton } from "@/components/forms/recipients/ChoiceButton";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
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
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  MailNotice,
  MailRecipientRule,
  MailRecipientRulePayload,
  MailTargetType,
} from "@/types/mail-recipients";

const INSTRUCTION_MAX = 1000;
const LABEL_MAX = 120;

const FIELD_LABELS: Record<string, string> = {
  target: "Destinatario",
  email: "Correo",
  label: "Nombre",
  stages: "Etapas",
  instruction: "Texto del correo",
};

/** El servidor nombra el destino por su columna; el formulario lo tiene en un solo campo. */
const SERVER_TARGET_FIELDS = [
  "user_id",
  "employee_id",
  "department_id",
  "role_name",
];

const TARGET_REQUIRED: Record<Exclude<MailTargetType, "EMAIL">, string> = {
  ROLE: "Seleccione el rol.",
  USER: "Seleccione el usuario.",
  EMPLOYEE: "Seleccione el empleado.",
  DEPARTMENT: "Seleccione el departamento.",
};

const schema = z
  .object({
    target_type: z.enum(["ROLE", "USER", "EMPLOYEE", "DEPARTMENT", "EMAIL"]),
    target: z.string(),
    email: z.string().trim().max(190),
    label: z
      .string()
      .trim()
      .max(LABEL_MAX, {
        message: `No puede superar los ${LABEL_MAX} caracteres.`,
      }),
    stages: z.array(z.string()),
    instruction: z
      .string()
      .trim()
      .max(INSTRUCTION_MAX, {
        message: `No puede superar los ${INSTRUCTION_MAX} caracteres.`,
      }),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.target_type === "EMAIL") {
      if (!values.email) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Ingrese el correo.",
        });
      } else if (!z.string().email().safeParse(values.email).success) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "El correo no es válido.",
        });
      }

      return;
    }

    if (!values.target) {
      ctx.addIssue({
        code: "custom",
        path: ["target"],
        message: TARGET_REQUIRED[values.target_type],
      });
    }
  });

type RuleFormValues = z.infer<typeof schema>;

const targetOf = (rule: MailRecipientRule): string => {
  switch (rule.target_type) {
    case "ROLE":
      return rule.role_name ?? "";
    case "USER":
      return rule.user_id ? String(rule.user_id) : "";
    case "EMPLOYEE":
      return rule.employee_id ? String(rule.employee_id) : "";
    case "DEPARTMENT":
      return rule.department_id ? String(rule.department_id) : "";
    default:
      return "";
  }
};

const toPayload = (values: RuleFormValues): MailRecipientRulePayload => {
  const { target_type: type, target } = values;

  return {
    target_type: type,
    user_id: type === "USER" ? Number(target) : null,
    employee_id: type === "EMPLOYEE" ? Number(target) : null,
    department_id: type === "DEPARTMENT" ? Number(target) : null,
    role_name: type === "ROLE" ? target : null,
    email: type === "EMAIL" ? values.email.toLowerCase() : null,
    label: type === "EMAIL" ? values.label || null : null,
    stages: values.stages.length > 0 ? values.stages : null,
    instruction: values.instruction || null,
    is_active: values.is_active,
  };
};

const sameValue = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

interface Props {
  notice: MailNotice;
  /** Con regla, el formulario edita en lugar de agregar. */
  rule?: MailRecipientRule;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RuleForm({ notice, rule, onSuccess, onCancel }: Props) {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;
  const { createRule } = useCreateMailRecipientRule();
  const { updateRule } = useUpdateMailRecipientRule();
  const mutation = rule ? updateRule : createRule;

  const { options, loading } = useRecipientTargetOptions();

  const initial = useMemo<RuleFormValues>(
    () => ({
      target_type: rule?.target_type ?? "EMPLOYEE",
      target: rule ? targetOf(rule) : "",
      email: rule?.email ?? "",
      label: rule?.label ?? "",
      stages: rule?.stages ?? [],
      instruction: rule?.instruction ?? "",
      is_active: rule?.is_active ?? true,
    }),
    [rule],
  );

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });

  const type = useWatch({ control: form.control, name: "target_type" });
  const stages = useWatch({ control: form.control, name: "stages" });
  const instruction =
    useWatch({ control: form.control, name: "instruction" }) ?? "";

  const hasStages = notice.stages.length > 0;
  const activeType = TARGET_TYPES.find((item) => item.type === type)!;

  const toggleStage = (key: string) => {
    const next = stages.includes(key)
      ? stages.filter((stage) => stage !== key)
      : [...stages, key];

    // Todas marcadas es lo mismo que "todas las etapas": se guarda sin etapas
    // para que una etapa nueva del aviso también les llegue.
    form.setValue("stages", next.length === notice.stages.length ? [] : next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: RuleFormValues) => {
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
            ([key, value]) =>
              typeChanged ||
              !sameValue(value, before[key as keyof typeof before]),
          ),
        ) as MailRecipientRulePayload;

        if (Object.keys(data).length > 0) {
          await updateRule.mutateAsync({ company, id: rule.id, data });
        }
      } else {
        await createRule.mutateAsync({
          company,
          data: { ...payload, notice_key: notice.key },
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
        submitLabel={rule ? "Guardar cambios" : "Agregar destinatario"}
        onCancel={onCancel}
        onSubmit={(event) => {
          event.stopPropagation();
          form.handleSubmit(onSubmit, invalidFormHandler(FIELD_LABELS))(event);
        }}
      >
        <PanelSection
          icon={Mail}
          title="Destinatario"
          hint="A quién le llega este aviso."
        >
          <div className="space-y-4">
            <div>
              <PanelStaticLabel>Tipo de destinatario</PanelStaticLabel>
              <div
                role="radiogroup"
                aria-label="Tipo de destinatario"
                className="grid grid-cols-2 gap-2 sm:grid-cols-5"
              >
                {TARGET_TYPES.map(({ type: value, label, icon: Icon }) => {
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
                        form.setValue("target_type", value, {
                          shouldDirty: true,
                        });
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

            {type === "EMAIL" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <PanelFieldLabel>
                        Correo
                        <RequiredIndicator invalid={!!fieldState.error} />
                      </PanelFieldLabel>
                      <FormControl>
                        <Input
                          type="email"
                          inputMode="email"
                          autoComplete="off"
                          placeholder="almacen@empresa.com"
                          maxLength={190}
                          className={fieldClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <PanelFieldLabel>Nombre (opcional)</PanelFieldLabel>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          placeholder="Ej: Almacén PZO"
                          maxLength={LABEL_MAX}
                          className={fieldClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
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
            )}
          </div>
        </PanelSection>

        {hasStages && (
          <PanelSection
            icon={ListChecks}
            title="Etapas"
            hint="En qué momentos del aviso recibe correo este destinatario."
          >
            <div className="flex flex-wrap gap-2">
              <ChoiceButton
                size="chip"
                selected={stages.length === 0}
                aria-pressed={stages.length === 0}
                onClick={() =>
                  form.setValue("stages", [], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                Todas las etapas
              </ChoiceButton>

              {notice.stages.map((stage) => {
                const selected = stages.includes(stage.key);

                return (
                  <ChoiceButton
                    key={stage.key}
                    size="chip"
                    selected={selected}
                    aria-pressed={selected}
                    onClick={() => toggleStage(stage.key)}
                  >
                    {stage.label}
                  </ChoiceButton>
                );
              })}
            </div>
          </PanelSection>
        )}

        <PanelSection
          icon={MessageSquareText}
          title="Nota para este destinatario"
          hint="Se muestra en el correo como un subtexto discreto, solo a quien recibe por esta regla. Úsela para un recordatorio breve, no para el contenido del aviso."
        >
          <FormField
            control={form.control}
            name="instruction"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Recuerde generar la OT de este servicio en el sistema. (opcional)"
                    rows={4}
                    maxLength={INSTRUCTION_MAX}
                    className={textareaClass}
                    {...field}
                  />
                </FormControl>
                <FormDescription className={`${hintClass} text-right`}>
                  {instruction.length}/{INSTRUCTION_MAX}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </PanelSection>

        {rule && (
          <PanelSection compact title="Estado">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <SwitchRow
                  id="mail-rule-active"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    form.setValue("is_active", checked, { shouldDirty: true })
                  }
                  label="Regla activa"
                  description="Desactivada, no recibe correos pero se conserva para volver a activarla."
                />
              )}
            />
          </PanelSection>
        )}
      </ArticleFormShell>
    </Form>
  );
}
