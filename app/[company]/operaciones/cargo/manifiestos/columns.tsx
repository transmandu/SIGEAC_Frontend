"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CargoManifest } from "@/types";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Printer,
  Trash,
  MoreHorizontal,
  Check,
  X,
  FileDown,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  useDeleteCargoManifest,
  useReprintCargoManifest,
  downloadManifestPdf,
} from "@/actions/cargo/manifestActions";

const ActionsCell = ({ row, company }: { row: any; company: string }) => {
  const manifest = row.original as CargoManifest;
  const [openDelete, setOpenDelete] = useState(false);
  const router = useRouter();
  const { deleteCargoManifest: deleteMutation } =
    useDeleteCargoManifest(company);
  const { reprintCargoManifest: reprintMutation } =
    useReprintCargoManifest(company);

  return (
    <>
      <div className="flex justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => downloadManifestPdf(company, manifest.id)}
            >
              <FileDown className="mr-2 h-4 w-4" /> Descargar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                router.push(
                  `/${company}/operaciones/cargo/manifiestos/${manifest.id}`,
                )
              }
            >
              <FileText className="mr-2 h-4 w-4" /> Ver
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                router.push(
                  `/${company}/operaciones/cargo/manifiestos/${manifest.id}/update`,
                )
              }
            >
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Manifiesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente el manifiesto{" "}
              <b className="text-primary">{manifest.manifest_number}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate(manifest.id, {
                  onSuccess: () => setOpenDelete(false),
                })
              }
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

export const getManifestColumns = (
  company: string,
): ColumnDef<CargoManifest>[] => [
  {
    accessorKey: "manifest_number",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Nº Manifiesto"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="font-semibold text-primary text-center">
        {row.original.manifest_number}
      </div>
    ),
  },
  {
    accessorKey: "aircraft",
    header: "Aeronave",
    cell: ({ row }) => {
      const manifest = row.original;
      const aircraftLabel =
        (manifest as any).aircraft?.acronym ??
        (manifest as any).external_aircraft ??
        "N/A";
      return <span className="text-sm">{aircraftLabel}</span>;
    },
  },
  {
    id: "items_count",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Guías incluidas"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      const uniqueShipments = new Set(
        (row.original.items ?? []).map((i) => i.cargo_shipment_id),
      );
      return <div className="text-center">{uniqueShipments.size}</div>;
    },
  },
  {
    accessorKey: "total_weight",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Peso Total"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.total_weight} kg</div>
    ),
  },
  {
    accessorKey: "total_units",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Unidades"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.total_units}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: any) => <ActionsCell row={row} company={company} />,
  },
];
