"use client";
import { useState } from "react";
import { useDeleteCargoShipment } from "@/actions/cargo/actions";
import { ColumnDef } from "@tanstack/react-table";
import { CargoShipment } from "@/types";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, FileText, Trash, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ActionsCell = ({ row, isCurrentMonth, company, canWrite }: any) => {
  const shipment = row.original;
  const [openDelete, setOpenDelete] = useState(false);
  const { deleteCargoShipment: deleteMutation } =
    useDeleteCargoShipment(company);

  const handleDelete = () => {
    deleteMutation.mutate(shipment.id, {
      onSuccess: () => setOpenDelete(false),
    });
  };

  return (
    <>
      <div className="flex justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/${company}/operaciones/cargo/guia/${shipment.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver detalles</span>
              </Link>
            </DropdownMenuItem>

            {canWrite && isCurrentMonth && (
              <>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href={`/${company}/operaciones/cargo/guia/${shipment.id}/update`}
                  >
                    <Edit className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Editar</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setOpenDelete(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Guía de Carga?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se borrará permanentemente la
              Guía <b className="text-primary">{shipment.guide_number}</b> y
              todos sus productos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const getColumns = (
  isCurrentMonth: boolean,
  company: string,
  canWrite: boolean = true,
): ColumnDef<CargoShipment>[] => [
  {
    accessorKey: "guide_number",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="N° de Guía"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="font-semibold text-primary text-center">
        {row.original.guide_number}
      </div>
    ),
  },
  {
    accessorKey: "registration_date",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Fecha"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      const dateStr = row.original.registration_date;
      const date = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
      return <div className="text-center">{format(date, "dd/MM/yyyy")}</div>;
    },
  },
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Cliente"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.client?.name || "No Asignado"}
      </div>
    ),
  },
  {
    accessorKey: "carrier",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Transportista"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.carrier
          ? `${row.original.carrier.name} ${row.original.carrier.last_name}`
          : "Sin asignar"}
      </div>
    ),
  },
  {
    accessorKey: "aircraft",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Aeronave"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      const { aircraft, external_aircraft } = row.original;
      return (
        <div className="text-center">
          {aircraft?.acronym || external_aircraft || "Sin asignar"}
        </div>
      );
    },
  },
  {
    accessorKey: "total_units",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Und."
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.total_units}</div>
    ),
  },
  {
    accessorKey: "total_weight",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Peso"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.total_weight} kg</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: any) => (
      <ActionsCell
        row={row}
        isCurrentMonth={isCurrentMonth}
        company={company}
        canWrite={canWrite}
      />
    ),
  },
];
