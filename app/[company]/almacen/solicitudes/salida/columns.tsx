import DispatchArticlesDialog from '@/components/dialogs/mantenimiento/almacen/DispatchArticlesDialog';
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { DispatchGroupRow } from './page';

export const columns: ColumnDef<DispatchGroupRow>[] = [
  {
    id: 'expand',
    header: () => null,
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => row.toggleExpanded()}>
        {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="N° solicitud" />,
    cell: ({ row }) => <p className="text-center font-semibold">{row.original.id}</p>,
  },
  {
    accessorKey: 'created_by',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Creado Por" />,
    cell: ({ row }) => <p className="text-center font-medium">{row.original.created_by}</p>,
  },
    {
    accessorKey: 'requested_by',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Solicitado Por" />,
    cell: ({ row }) => <p className="text-center font-medium">{row.original.requested_by}</p>,
  },
    {
    accessorKey: 'work_order',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orden de Trabajo" />,
    cell: ({ row }) => (
      <p className="text-center font-medium">{row.original.work_order ?? "-"}</p>
    ),
  },
      {
    accessorKey: 'aircraft.acronym',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Aeronave/Departamento" />,
    cell: ({ row }) => (
      <p className="text-center font-medium">
        {row.original.aircraft?.acronym ??
        row.original.department?.name ??
        "—"}
      </p>
    ),
  },
  {
    accessorKey: 'submission_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    cell: ({ row }) => {
      const raw = row.original.submission_date;
      if (!raw) return <p className="text-center text-muted-foreground">—</p>;

      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return <p className="text-center text-muted-foreground">—</p>;

      return (
        <p className="text-center text-muted-foreground">
          {format(d, 'PPP', { locale: es })}
        </p>
      );
    },
  },
  {
    id: 'items',
    header: () => <p className="text-center">Ítems</p>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Package className="h-4 w-4" />
        <span className="font-medium text-foreground">{row.original.articles?.length ?? 0}</span>
      </div>
    ),
  },
  {
    id: 'people',
    header: () => <p className="text-center">Detalles</p>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DispatchArticlesDialog articles={row.original.articles} work_order={row.original.work_order}/>
      </div>
    ),
  },
];
