import DispatchArticlesDialog from '@/components/dialogs/mantenimiento/almacen/DispatchArticlesDialog';
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Package,
  Plane,
  Users,
  Wrench,
  Calendar,
  MapPin,
} from 'lucide-react';
import { DispatchGroupRow } from './page';

function safeDateLabel(raw?: string | null) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  // Más compacto para tabla; si quieres PPP, cambia la línea de abajo.
  return format(d, 'dd MMM yyyy', { locale: es });
}

export const columns: ColumnDef<DispatchGroupRow>[] = [
  {
    id: 'expand',
    header: () => null,
    cell: ({ row }) => {
      const expanded = row.getIsExpanded();
      return (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => row.toggleExpanded()}
          aria-label={expanded ? 'Contraer fila' : 'Expandir fila'}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },

  {
    accessorKey: 'request_number',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Solicitud"
        icon={FileText}
        filter
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center font-semibold tabular-nums">
        {row.original.request_number}
      </p>
    ),
    size: 110,
  },

  {
    accessorKey: 'created_by',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Creado por"
        icon={Users}
        filter
        align="left"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center font-medium">{row.original.created_by}</p>
    ),
    size: 180,
  },

  {
    accessorKey: 'requested_by',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Solicitante"
        icon={Users}
        filter
        align="left"
      />
    ),
    cell: ({ row }) => {
      const { requested_by, authorized_employee } = row.original;

      if (requested_by) {
        return <p className="text-center font-medium">{requested_by}</p>;
      }

      if (authorized_employee) {
        return (
          <div className="text-center leading-tight">
            <p className="font-medium text-center">{authorized_employee.full_name}</p>
            <p className="text-xs text-muted-foreground uppercase">
              {authorized_employee.from_company_db}
            </p>
          </div>
        );
      }

      return <p className="text-center text-muted-foreground">—</p>;
    },
    size: 220,
  },

  {
    accessorKey: 'work_order',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="OT"
        icon={Wrench}
        filter
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center font-medium tabular-nums">
        {row.original.work_order ?? '—'}
      </p>
    ),
    size: 90,
  },

  {
    id: 'destination',
    accessorFn: (row) => row.aircraft?.acronym ?? row.department?.name ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Destino"
        icon={MapPin}
        filter
        align="center"
      />
    ),
    cell: ({ row }) => {
      const aircraft = row.original.aircraft?.acronym;
      const dept = row.original.department?.name;

      if (aircraft) {
        return (
          <div className="flex flex-col items-center justify-center leading-tight">
            <p className="font-medium flex items-center gap-1">
              <Plane className="h-4 w-4 opacity-70" />
              {aircraft}
            </p>
            <p className="text-xs text-muted-foreground text-center">Aeronave</p>
          </div>
        );
      }

      if (dept) {
        return (
          <div className="text-left leading-tight flex flex-col items-center justify-center">
            <p className="font-medium">{dept}</p>
            <p className="text-xs text-muted-foreground">Departamento</p>
          </div>
        );
      }

      return <p className="text-left text-muted-foreground">—</p>;
    },
    size: 200,
  },

  {
    accessorKey: 'submission_date',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Fecha"
        icon={Calendar}
        align="center"
      />
    ),
    cell: ({ row }) => {
      const label = safeDateLabel(row.original.submission_date);
      if (!label) return <p className="text-center text-muted-foreground">—</p>;

      return (
        <p className="text-center text-muted-foreground tabular-nums">
          {label}
        </p>
      );
    },
    size: 130,
  },

  {
    id: 'articles',
    header: () => (
      <div className="flex items-center justify-center gap-2">
        <Package className="h-4 w-4 opacity-80" />
        <span>Artículos</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DispatchArticlesDialog
          articles={row.original.articles}
          work_order={row.original.work_order}
        />
      </div>
    ),
    enableSorting: false,
    size: 110,
  },
];
