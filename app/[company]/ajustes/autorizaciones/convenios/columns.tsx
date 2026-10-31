"use client";

import { useState } from "react";
import {
  Eye,
  History,
  PauseCircle,
  PlayCircle,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { ConfirmActionDialog } from "@/components/dialogs/shared/ConfirmActionDialog";
import { TagBadge } from "@/components/misc/TagBadge";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CompanyLoanScopesDialog } from "@/components/dialogs/ajustes/CompanyLoanScopesDialog";
import { LoanAudienceDialog } from "@/components/dialogs/ajustes/loan-audience/LoanAudienceDialog";
import { LoanHistoryDialog } from "@/components/dialogs/ajustes/LoanHistoryDialog";
import { LoanPersonnelDialog } from "@/components/dialogs/ajustes/LoanPersonnelDialog";
import { useSetCompanyLoanActive } from "@/actions/ajustes/convenios/actions";
import type {
  CompanyLoanAgreement,
  CompanyLoanScope,
} from "@/hooks/ajustes/convenios/types";

/** Una fila por sentido: lo que esta empresa otorga o lo que recibe. */
export type LoanRow = CompanyLoanAgreement & {
  direction: "granted" | "received";
  otherName: string;
};

const center = "flex justify-center w-full";

const DIRECTION_LABELS: Record<LoanRow["direction"], string> = {
  granted: "Puede usar nuestros módulos",
  received: "Podemos usar sus módulos",
};

/**
 * Resumen de una línea: el primer alcance y cuántos más hay. La lista completa
 * vive en el popover, así la fila no crece con el catálogo. En los convenios
 * recibidos cada alcance del popover abre la elección de personal.
 */
function ScopesCell({ row, slug }: { row: LoanRow; slug?: string }) {
  const [audienceScope, setAudienceScope] = useState<CompanyLoanScope | null>(
    null,
  );
  const open = row.scopes.filter((s) => s.is_active);
  const received = row.direction === "received";

  if (open.length === 0) {
    return (
      <div className={center}>
        <span className="text-sm text-muted-foreground">
          {received
            ? `${row.lender_company_name} no ha abierto alcances`
            : "Sin alcances abiertos"}
        </span>
      </div>
    );
  }

  const extra = open.length - 1;

  return (
    <div className={center}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Ver alcances"
          >
            <span className="truncate">{open[0].label}</span>
            {extra > 0 && (
              <span className="shrink-0 rounded-full border px-1.5 text-xs">
                +{extra}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-1" align="center">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {received
              ? "Elija quién usa cada alcance"
              : `Alcances abiertos (${open.length})`}
          </p>
          <ul>
            {open.map((s) => (
              <li key={s.scope}>
                {received ? (
                  <button
                    type="button"
                    className="group flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
                    onClick={() => setAudienceScope(s)}
                    aria-label={`Elegir personal para ${s.label}`}
                  >
                    <span>
                      <span className="block text-sm font-medium">
                        {s.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {s.module}
                      </span>
                    </span>
                    <UserPlus className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </button>
                ) : (
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.module}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      {audienceScope && (
        <LoanAudienceDialog
          agreement={row}
          scope={audienceScope}
          companySlug={slug}
          open
          onOpenChange={(next) => {
            if (!next) setAudienceScope(null);
          }}
        />
      )}
    </div>
  );
}

function ActionsCell({ row, slug }: { row: LoanRow; slug?: string }) {
  const [openPersonnel, setOpenPersonnel] = useState(false);
  const [openScopes, setOpenScopes] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const setActive = useSetCompanyLoanActive(slug);

  const granted = row.direction === "granted";

  // El historial lo ven las dos empresas; ver personal, configurar y suspender
  // son del otorgante.
  const actions: RowAction[] = [
    ...(granted
      ? [
          {
            key: "view",
            label: "Ver personal autorizado",
            icon: Eye,
            onSelect: () => setOpenPersonnel(true),
          },
          {
            key: "scopes",
            label: "Configurar alcances",
            icon: SlidersHorizontal,
            tone: "blue" as const,
            onSelect: () => setOpenScopes(true),
          },
        ]
      : []),
    {
      key: "history",
      label: "Ver historial",
      icon: History,
      onSelect: () => setOpenHistory(true),
    },
    // Un convenio no se borra: se suspende y se puede reanudar.
    ...(granted
      ? [
          row.is_active
            ? {
                key: "suspend",
                label: "Suspender convenio",
                icon: PauseCircle,
                tone: "red" as const,
                onSelect: () => setOpenToggle(true),
              }
            : {
                key: "resume",
                label: "Reanudar convenio",
                icon: PlayCircle,
                tone: "blue" as const,
                onSelect: () => setOpenToggle(true),
              },
        ]
      : []),
  ];

  return (
    <div className={center}>
      <SettingsRowActions actions={actions} tourId="convenios-actions" />

      <LoanHistoryDialog
        agreement={row}
        companySlug={slug}
        open={openHistory}
        onOpenChange={setOpenHistory}
      />

      {granted && (
        <>
          <LoanPersonnelDialog
            agreement={row}
            companySlug={slug}
            open={openPersonnel}
            onOpenChange={setOpenPersonnel}
          />

          <CompanyLoanScopesDialog
            agreement={row}
            companySlug={slug}
            open={openScopes}
            onOpenChange={setOpenScopes}
          />

          <ConfirmActionDialog
            open={openToggle}
            onOpenChange={setOpenToggle}
            title={row.is_active ? "Suspender convenio" : "Reanudar convenio"}
            entityName={row.otherName}
            icon={row.is_active ? PauseCircle : PlayCircle}
            tone={row.is_active ? "amber" : "primary"}
            confirmLabel={row.is_active ? "Suspender" : "Reanudar"}
            isPending={setActive.isPending}
            onConfirm={() =>
              setActive.mutateAsync({ id: row.id, isActive: !row.is_active })
            }
          >
            {row.is_active ? (
              <>
                {row.otherName} no podrá hacer operaciones nuevas desde hoy. Lo
                registrado hasta ayer sigue pudiendo editarse, y los alcances y
                el personal elegido se conservan para reanudarlo cuando quiera.
              </>
            ) : (
              <>
                {row.otherName} volverá a poder operar con los alcances y el
                personal que tenía elegidos.
              </>
            )}
          </ConfirmActionDialog>
        </>
      )}
    </div>
  );
}

export const getColumns = (slug?: string): AppColumnDef<LoanRow>[] => [
  {
    accessorKey: "otherName",
    size: 220,
    meta: { title: "Empresa" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Empresa" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={`${center} items-center gap-2`}>
        <span className="text-sm font-semibold">{row.original.otherName}</span>
        {!row.original.is_active && (
          <TagBadge tone="amber">Suspendido</TagBadge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "direction",
    size: 240,
    meta: { title: "Sentido" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Sentido" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span className="text-sm text-muted-foreground">
          {DIRECTION_LABELS[row.original.direction]}
        </span>
      </div>
    ),
  },
  {
    id: "scopes",
    size: 320,
    meta: { title: "Alcances" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Alcances" />
      </div>
    ),
    cell: ({ row }) => <ScopesCell row={row.original} slug={slug} />,
  },
  {
    id: "actions",
    size: 140,
    meta: { title: "Acciones" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    cell: ({ row }) => <ActionsCell row={row.original} slug={slug} />,
  },
];
