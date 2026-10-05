"use client";

import {
  ControlRecordType,
  useRestoreControlRecord,
  useRetireControlRecord,
} from "@/actions/mantenimiento/planificacion/control_bajas/actions";
import {
  ConfirmedReason,
  ReasonConfirmDialog,
} from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  Archive,
  ArchiveRestore,
  type LucideIcon,
  MoreHorizontal,
  SquarePen,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

const iconBase =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110";

const itemBase =
  "group relative flex items-center justify-center size-9 rounded-xl transition-all duration-200 ease-out hover:bg-muted hover:shadow-sm active:scale-95";

type Pending = "retire" | "restore" | "delete" | null;

interface ControlRecordDropdownActionsProps {
  recordType: ControlRecordType;
  recordId: number;
  /** "control de mantenimiento", "control de componentes"... */
  noun: string;
  editHref: string;
  retiredAt?: string | null;
  deleteDescription: ReactNode;
  onDelete: (reason: ConfirmedReason) => Promise<unknown>;
}

export function ControlRecordDropdownActions({
  recordType,
  recordId,
  noun,
  editHref,
  retiredAt,
  deleteDescription,
  onDelete,
}: ControlRecordDropdownActionsProps) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const { selectedCompany } = useCompanyStore();
  const { retireControlRecord } = useRetireControlRecord();
  const { restoreControlRecord } = useRestoreControlRecord();
  const company = selectedCompany!.slug;

  const open = (action: Pending) => {
    setOpenDropdown(false);
    setPending(action);
  };

  return (
    <TooltipProvider delayDuration={120}>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl border border-transparent transition-all duration-200 hover:border-border/50 hover:bg-muted/70 hover:shadow-sm data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          sideOffset={3}
          className="flex items-center justify-center gap-1.5 overflow-visible rounded-2xl border border-border/50 bg-background/90 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        >
          {!retiredAt && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem
                    asChild
                    className="p-0 focus:bg-transparent"
                  >
                    <Link
                      href={editHref}
                      className={`${itemBase} text-primary`}
                    >
                      <SquarePen className={iconBase} />
                    </Link>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Editar {noun}</TooltipContent>
            </Tooltip>
          )}

          {retiredAt ? (
            <StripButton
              icon={ArchiveRestore}
              tone="text-emerald-600"
              label={`Reactivar ${noun}`}
              onClick={() => open("restore")}
            />
          ) : (
            <StripButton
              icon={Archive}
              tone="text-amber-600"
              label={`Dar de baja ${noun}`}
              onClick={() => open("retire")}
            />
          )}

          <StripButton
            icon={Trash2}
            tone="text-red-600"
            label={`Eliminar ${noun}`}
            onClick={() => open("delete")}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <ReasonConfirmDialog
        open={pending === "retire"}
        onOpenChange={(next) => !next && setPending(null)}
        title={`Dar de baja el ${noun}`}
        description={
          <>
            Sale del cálculo, de las alertas y del calendario, pero el control y
            todo su historial de cumplimientos se conservan. Puede reactivarse
            después.
          </>
        }
        confirmLabel="Dar de baja"
        onConfirm={(reason) =>
          retireControlRecord.mutateAsync({
            company,
            type: recordType,
            id: recordId,
            reason,
          })
        }
      />

      <ReasonConfirmDialog
        open={pending === "restore"}
        onOpenChange={(next) => !next && setPending(null)}
        title={`Reactivar el ${noun}`}
        description="Vuelve al cálculo, a las alertas y al calendario."
        confirmLabel="Reactivar"
        onConfirm={(reason) =>
          restoreControlRecord.mutateAsync({
            company,
            type: recordType,
            id: recordId,
            reason,
          })
        }
      />

      <ReasonConfirmDialog
        open={pending === "delete"}
        onOpenChange={(next) => !next && setPending(null)}
        title={`Eliminar el ${noun}`}
        description={deleteDescription}
        confirmLabel="Eliminar"
        destructive
        onConfirm={onDelete}
      />
    </TooltipProvider>
  );
}

function StripButton({
  icon: Icon,
  tone,
  label,
  onClick,
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
            <button
              type="button"
              onClick={onClick}
              className={`${itemBase} ${tone}`}
            >
              <Icon className={iconBase} />
            </button>
          </DropdownMenuItem>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
