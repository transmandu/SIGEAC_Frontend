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
    accessorKey: 'request_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="N° solicitud" />,
    cell: ({ row }) => <p className="text-center font-semibold">{row.original.request_number}</p>,
  },
  {
    accessorKey: 'created_by',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Creado Por" />,
    cell: ({ row }) => <p className="text-center font-medium">{row.original.created_by}</p>,
  },
  {
    accessorKey: 'requested_by',
    header: ({ column }) => ( <DataTableColumnHeader column={column} title="Solicitado Por" /> ),
    cell: ({ row }) => { const { requested_by, authorized_employee } = row.original;
      // Caso 1: viene requested_by normal
      if (requested_by) {
        return ( <p className="text-center font-medium"> {requested_by} </p> );
      }
      // Caso 2: no viene requested_by pero existe authorized_employee
      if (authorized_employee) {
        return (
        <div className="text-center leading-tight">
          <p className="font-medium"> {authorized_employee.full_name} </p> <p className="text-xs text-muted-foreground uppercase"> - {authorized_employee.from_company_db} </p>
         </div> );
      }
      // Caso 3: ninguno existe
      return ( <p className="text-center text-muted-foreground"> — </p> );
    },
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
    id: 'people',
    header: () => <p className="text-center">Detalles</p>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DispatchArticlesDialog articles={row.original.articles} work_order={row.original.work_order}/>
      </div>
    ),
  },
];
