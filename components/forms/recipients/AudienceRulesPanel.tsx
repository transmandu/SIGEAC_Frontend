"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { PanelSection } from "@/components/forms/PanelSection";
import { AudienceRuleForm } from "@/components/forms/recipients/AudienceRuleForm";
import type {
  AudienceApi,
  AudienceCopy,
  AudienceRule,
  AudienceSubject,
} from "@/components/forms/recipients/audience-types";
import {
  RuleFilterBar,
  RuleFilterEmpty,
  useRuleFilters,
} from "@/components/forms/recipients/RuleFilterBar";
import { TARGET_TYPES } from "@/components/forms/recipients/recipient-targets";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

function AudienceRow({
  rule,
  api,
  onEdit,
  onDelete,
}: {
  rule: AudienceRule;
  api: AudienceApi;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const updateRule = api.useUpdate();
  const type = TARGET_TYPES.find((item) => item.type === rule.target_type)!;
  const Icon = type.icon;

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      tone: "blue",
      onSelect: onEdit,
    },
    {
      key: "delete",
      label: "Quitar",
      icon: Trash2,
      tone: "red",
      onSelect: onDelete,
    },
  ];

  return (
    <li
      className={cn(
        "flex items-start gap-3 px-4 py-3 max-sm:flex-wrap",
        !rule.is_active && "bg-muted/20",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
          !rule.is_active && "opacity-60",
        )}
      >
        <Icon className="size-4" />
      </span>

      <div
        className={cn(
          "min-w-0 flex-1 space-y-1.5",
          !rule.is_active && "opacity-70",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
            {rule.target_label}
          </p>
          <TagBadge tone="sky">{type.label}</TagBadge>
          {!rule.is_active && <TagBadge tone="amber">Desactivada</TagBadge>}
        </div>

        {rule.target_detail && (
          <p className="text-[13px] text-muted-foreground wrap-anywhere">
            {rule.target_detail}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 max-sm:ml-auto">
        <Switch
          aria-label={rule.is_active ? "Desactivar regla" : "Activar regla"}
          checked={rule.is_active}
          disabled={updateRule.isPending}
          onCheckedChange={(checked) => {
            if (!selectedCompany) return;
            updateRule.mutate({
              company: selectedCompany.slug,
              id: rule.id,
              data: { is_active: checked },
              silent: true,
            });
          }}
        />
        <SettingsRowActions actions={actions} />
      </div>
    </li>
  );
}

/**
 * La audiencia de una alerta crítica o de una notificación in-app: lista de a
 * quién le toca, con alta, edición, activar/desactivar y quitar. Sin reglas
 * activas nadie la recibe (salvo el superusuario) y el panel lo dice sin
 * rodeos. Cada configuración le pasa su API y sus textos.
 */
export function AudienceRulesPanel({
  subject,
  rules,
  api,
  copy,
}: {
  subject: AudienceSubject;
  rules: AudienceRule[];
  api: AudienceApi;
  copy: AudienceCopy;
}) {
  const { selectedCompany } = useCompanyStore();
  const deleteRule = api.useDelete();
  const ruleFilters = useRuleFilters(rules);

  // "new" abre el formulario vacío; una regla, el de edición.
  const [editing, setEditing] = useState<AudienceRule | "new" | null>(null);
  // La regla se conserva al cerrar el diálogo: si se vaciara al cerrar, el
  // nombre desaparecería del texto mientras el diálogo todavía se desvanece.
  const [deleting, setDeleting] = useState<AudienceRule | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <>
      <PanelSection
        icon={Eye}
        title={copy.panelTitle}
        hint={copy.panelHint}
        flush
        action={
          <ActionTriggerButton
            type="button"
            size="sm"
            className="max-sm:h-10"
            onClick={() => setEditing("new")}
          >
            <Plus className="mr-2 size-4" />
            Agregar
          </ActionTriggerButton>
        }
      >
        {rules.length === 0 ? (
          <EmptyState
            icon={EyeOff}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            className="py-8"
          />
        ) : (
          <>
            <RuleFilterBar rules={rules} state={ruleFilters} />

            {ruleFilters.visible.length === 0 ? (
              <RuleFilterEmpty onReset={ruleFilters.reset} />
            ) : (
              <ul className="divide-y divide-border/60 overflow-hidden rounded-b-xl">
                {ruleFilters.visible.map((rule) => (
                  <AudienceRow
                    key={rule.id}
                    rule={rule}
                    api={api}
                    onEdit={() => setEditing(rule)}
                    onDelete={() => {
                      setDeleting(rule);
                      setConfirmingDelete(true);
                    }}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </PanelSection>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing !== null && (
          <FormDialogContent
            icon={Eye}
            title={editing === "new" ? copy.formTitleNew : copy.formTitleEdit}
            description={copy.formIntro(subject.label)}
            className="sm:max-w-xl"
          >
            <AudienceRuleForm
              subject={subject}
              api={api}
              copy={copy}
              rule={editing === "new" ? undefined : editing}
              onSuccess={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          </FormDialogContent>
        )}
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title={copy.removeTitle}
        entityName={deleting?.target_label}
        warning={copy.removeWarning}
        confirmLabel="Quitar"
        isPending={deleteRule.isPending}
        onConfirm={() =>
          deleteRule.mutateAsync({
            company: selectedCompany!.slug,
            id: deleting!.id,
          })
        }
      />
    </>
  );
}
