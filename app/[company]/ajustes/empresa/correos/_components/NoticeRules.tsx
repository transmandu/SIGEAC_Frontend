"use client";

import { useState } from "react";
import { MailCheck, MailX, Pencil, Plus, Trash2 } from "lucide-react";

import {
  useDeleteMailRecipientRule,
  useUpdateMailRecipientRule,
} from "@/actions/ajustes/correos/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { PanelSection } from "@/components/forms/PanelSection";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  RuleFilterBar,
  RuleFilterEmpty,
  useRuleFilters,
} from "@/components/forms/recipients/RuleFilterBar";
import { TARGET_TYPES } from "@/components/forms/recipients/recipient-targets";
import type { MailNoticeRow, MailRecipientRule } from "@/types/mail-recipients";

import { PreviewDialog } from "./PreviewDialog";
import { RuleForm } from "./RuleForm";

const MAX_STAGE_TAGS = 3;

function StageTags({
  rule,
  notice,
}: {
  rule: MailRecipientRule;
  notice: MailNoticeRow;
}) {
  if (notice.stages.length === 0) return null;

  if (!rule.stages?.length) {
    return <TagBadge tone="slate">Todas las etapas</TagBadge>;
  }

  const labels = rule.stages.map(
    (key) => notice.stages.find((stage) => stage.key === key)?.label ?? key,
  );

  return (
    <>
      {labels.slice(0, MAX_STAGE_TAGS).map((label) => (
        <TagBadge key={label} tone="blue">
          {label}
        </TagBadge>
      ))}
      {labels.length > MAX_STAGE_TAGS && (
        <TagBadge tone="slate">+{labels.length - MAX_STAGE_TAGS}</TagBadge>
      )}
    </>
  );
}

function RuleRow({
  rule,
  notice,
  onEdit,
  onDelete,
}: {
  rule: MailRecipientRule;
  notice: MailNoticeRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const { updateRule } = useUpdateMailRecipientRule();
  const type = TARGET_TYPES.find((item) => item.type === rule.target_type)!;
  const Icon = type.icon;

  const actions: RowAction[] = [
    {
      key: "edit",
      label: "Editar destinatario",
      icon: Pencil,
      tone: "blue",
      onSelect: onEdit,
    },
    {
      key: "delete",
      label: "Eliminar destinatario",
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

        <div className="flex flex-wrap items-center gap-1.5">
          <StageTags rule={rule} notice={notice} />
        </div>

        {rule.instruction && (
          <p className="line-clamp-2 text-[13px] text-slate-600 dark:text-slate-300">
            {rule.instruction}
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
 * Panel de un aviso: quién lo recibe, con qué texto y en qué etapas. Un aviso
 * sin reglas activas no se envía a nadie, y la pantalla lo dice sin rodeos.
 */
export function NoticeRules({ notice }: { notice: MailNoticeRow }) {
  const { selectedCompany } = useCompanyStore();
  const { deleteRule } = useDeleteMailRecipientRule();
  const ruleFilters = useRuleFilters(notice.rules);

  // "new" abre el formulario vacío; una regla, el de edición.
  const [editing, setEditing] = useState<MailRecipientRule | "new" | null>(
    null,
  );
  // La regla se conserva al cerrar el diálogo: si se vaciara al cerrar, el
  // nombre desaparecería del texto mientras el diálogo todavía se desvanece.
  const [deleting, setDeleting] = useState<MailRecipientRule | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  return (
    <div>
      <PanelSection
        icon={MailCheck}
        title="Destinatarios"
        hint="Quién recibe este aviso por correo y con qué texto."
        flush
        action={
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionTriggerButton
                  type="button"
                  size="sm"
                  className="max-sm:h-10"
                  aria-label="Quién recibe hoy"
                  onClick={() => setPreviewing(true)}
                >
                  <MailCheck className="size-4 xl:mr-2" />
                  <span className="max-xl:hidden">Quién recibe hoy</span>
                </ActionTriggerButton>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="px-2 py-1 text-xs xl:hidden"
              >
                Quién recibe hoy
              </TooltipContent>
            </Tooltip>
            <ActionTriggerButton
              type="button"
              size="sm"
              className="max-sm:h-10"
              onClick={() => setEditing("new")}
            >
              <Plus className="mr-2 size-4" />
              Agregar
            </ActionTriggerButton>
          </div>
        }
      >
        {notice.rules.length === 0 ? (
          <EmptyState
            icon={MailX}
            title="Este aviso no se envía a nadie"
            description="Agregue un rol, usuario, empleado, departamento o correo para que lo reciba."
            className="py-8"
          />
        ) : (
          <>
            <RuleFilterBar rules={notice.rules} state={ruleFilters} />

            {ruleFilters.visible.length === 0 ? (
              <RuleFilterEmpty onReset={ruleFilters.reset} />
            ) : (
              <ul className="divide-y divide-border/60 overflow-hidden rounded-b-xl">
                {ruleFilters.visible.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    notice={notice}
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
            icon={MailCheck}
            title={
              editing === "new" ? "Agregar destinatario" : "Editar destinatario"
            }
            description={
              <>
                Quién recibe{" "}
                <span className="font-medium text-foreground">
                  {notice.label}
                </span>
                .
              </>
            }
            className="sm:max-w-2xl"
          >
            <RuleForm
              notice={notice}
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
        title="Eliminar destinatario"
        entityName={deleting?.target_label}
        warning="Dejará de recibir este aviso por correo."
        isPending={deleteRule.isPending}
        onConfirm={() =>
          deleteRule.mutateAsync({
            company: selectedCompany!.slug,
            id: deleting!.id,
          })
        }
      />

      <PreviewDialog
        notice={notice}
        open={previewing}
        onOpenChange={setPreviewing}
      />
    </div>
  );
}
