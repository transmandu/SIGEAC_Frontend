"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Checkbox } from "@/components/ui/checkbox";

export interface AuthorizedEmployee {
  id: number;
  dni_employee: string;
  from_company_db: string; // empresa que autoriza
  to_company_db: string;   // empresa autorizada
  employee_name: string;
}

export const columns: ColumnDef<AuthorizedEmployee>[] = [
  // Selección
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // DNI
  {
    accessorKey: "dni_employee",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="DNI" />
    ),
    cell: ({ row }) => (
      <span className="flex justify-center font-medium">
        V-{row.original.dni_employee}
      </span>
    ),
  },

  // Nombre completo
  {
    accessorKey: "employee_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <span className="flex justify-center font-semibold">{row.original.employee_name}</span>
    ),
  },

  // // Base de datos ORIGEN (empresa que autoriza)
  // {
  //   accessorKey: "from_company_db",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader filter column={column} title="Base Origen" />
  //   ),
  //   cell: ({ row }) => (
  //     <span className="flex justify-center text-muted-foreground">
  //       {row.original.from_company_db}
  //     </span>
  //   ),
  // },

  // Base de datos DESTINO (empresa autorizada)
  {
    accessorKey: "to_company_db",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Empresa a Autorizar" />
    ),
    cell: ({ row }) => (
      <span className="flex justify-center uppercase">
        {row.original.to_company_db}
      </span>
    ),
  },
];