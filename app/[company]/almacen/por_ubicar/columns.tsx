"use client";

import WaitingToLocateArticleDropdownActions from "@/components/dropdowns/mantenimiento/almacen/WaitingToLocateArticleDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { ColumnDef } from "@tanstack/react-table";
import { Barcode, Hash, Package, Settings, Tags, Wrench } from "lucide-react";
import { IncomingArticle } from "../../control_calidad/incoming/IncomingTypes";

const Header = ({
  column,
  title,
  Icon,
  filter,
}: {
  column: any;
  title: string;
  Icon: React.ElementType;
  filter?: boolean;
}) => (
  <div className="flex items-center justify-center gap-2">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <DataTableColumnHeader filter={filter} column={column} title={title} />
  </div>
);

export const columns: ColumnDef<IncomingArticle>[] = [
  {
    accessorKey: "batch.name",
    header: ({ column }) => <Header column={column} title="Descripción" Icon={Package} />,
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <span className="max-w-[280px] truncate font-semibold">
          {row.original.batch?.name ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "part_number",
    header: ({ column }) => <Header column={column} title="Nro. Parte" Icon={Hash} />,
    meta: { title: "Nro. Parte" },
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <span className="rounded-md border bg-muted/30 px-2 py-1 text-xs font-mono font-semibold">
          {row.original.part_number}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "alternative_part_number",
    header: ({ column }) => (
      <Header column={column} title="Alternativos" Icon={Tags} />
    ),
    meta: { title: "Nro. Parte Alternativo" },
    cell: ({ row }) => {
      const alts = row.original.alternative_part_number ?? [];
      const first = alts[0];
      const rest = alts.length - 1;

      return (
        <div className="flex items-center justify-center gap-2">
          {alts.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <>
              <span className="text-xs text-muted-foreground italic">
                {first}
              </span>
              {rest > 0 && (
                <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                  +{rest}
                </span>
              )}
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "serial",
    header: ({ column }) => <Header column={column} title="Nro. Serie" Icon={Barcode} />,
    meta: { title: "Nro. Serie" },
    cell: ({ row }) => {
      const serial = row.original.serial;
      return (
        <div className="flex items-center justify-center">
          {serial ? (
            <span className="rounded-full border bg-background px-3 py-1 text-xs font-mono">
              {serial}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "ata_code",
    header: ({ column }) => (
      <Header column={column} title="Cod. ATA" Icon={Wrench} filter />
    ),
    meta: { title: "Cod. ATA" },
    cell: ({ row }) => {
      const ata = row.original.ata_code;
      return (
        <div className="flex items-center justify-center">
          {ata ? (
            <span className="rounded-md border px-2 py-1 text-xs font-medium">
              {ata}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
    {
    accessorKey: "actions",
    header: ({ column }) => (
      <Header column={column} title="Acciones" Icon={Settings} />
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <WaitingToLocateArticleDropdownActions id={row.original.id} />
      </div>
    )
  },
];
