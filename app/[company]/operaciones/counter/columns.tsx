"use client";

import { useState } from "react";
import { type AppColumnDef } from "@/lib/table";
import { type FlightStatus, PaxFlight } from "@/types";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileDown,
  Trash,
  MoreHorizontal,
  Edit,
  Eye,
  Plane,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  Send,
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
  useDeletePaxFlight,
  useMarkInFlight,
  useFinalizeFlight,
  downloadPaxFlightPdf,
} from "@/actions/counter/actions";

const ActionsCell = ({
  row,
  company,
  canWrite,
}: {
  row: { original: PaxFlight };
  company: string;
  canWrite: boolean;
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const deleteMutation = useDeletePaxFlight(company);
  const markInFlightMutation = useMarkInFlight(company);
  const finalizeMutation = useFinalizeFlight(company);
  const flight = row.original;
  const status = flight.status as FlightStatus;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(flight.id);
      setIsDeleting(false);
    } catch {
      // Manejado en la mutación
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadPaxFlightPdf(company, flight.id, flight.flight_code);
    setIsDownloading(false);
  };

  return (
    <>
      <div className="flex items-center gap-1 justify-end">
        {/* Botón Marcar En Vuelo — solo en BORRADOR */}
        {canWrite && status === "BORRADOR" && (
          <Button
            variant="ghost"
            size="icon"
            title="Marcar como En Vuelo"
            onClick={() => markInFlightMutation.mutate(flight.id)}
            disabled={markInFlightMutation.isPending}
          >
            <Send className="h-4 w-4 text-blue-500" />
          </Button>
        )}

        {/* Botón Finalizar — solo en EN_VUELO */}
        {canWrite && status === "EN_VUELO" && (
          <Button
            variant="ghost"
            size="icon"
            title="Finalizar Manifiesto"
            onClick={() => finalizeMutation.mutate(flight.id)}
            disabled={finalizeMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </Button>
        )}

        {/* Botón PDF — solo en FINALIZADO */}
        {status === "FINALIZADO" && (
          <Button
            variant="ghost"
            size="icon"
            title="Descargar PDF"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <FileDown className="h-4 w-4 text-primary" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/${company}/operaciones/counter/${flight.id}`)
              }
            >
              <Eye className="h-4 w-4 mr-2" /> Ver Detalle
            </DropdownMenuItem>

            {status === "FINALIZADO" && (
              <DropdownMenuItem
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <FileDown className="h-4 w-4 mr-2" /> Descargar PDF
              </DropdownMenuItem>
            )}

            {canWrite && status === "BORRADOR" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/${company}/operaciones/counter/${flight.id}/update`,
                    )
                  }
                >
                  <Edit className="h-4 w-4 mr-2" /> Editar Vuelo
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleting(true)}
                >
                  <Trash className="h-4 w-4 mr-2" /> Eliminar Vuelo
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar este manifiesto de vuelo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el manifiesto{" "}
              <strong>{flight.flight_code}</strong> y la lista de sus pasajeros
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const getCounterColumns = (
  company: string,
  canWrite: boolean,
): AppColumnDef<PaxFlight>[] => [
  {
    accessorKey: "flight_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vuelo" />
    ),
    cell: ({ row }) => (
      <div className="font-bold text-primary flex items-center gap-1.5">
        <FileText className="h-4 w-4 text-muted-foreground" />
        {row.original.flight_code}
      </div>
    ),
  },
  {
    accessorKey: "flight_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => row.original.flight_date || "N/A",
  },
  {
    accessorKey: "route",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ruta" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.route}
      </Badge>
    ),
  },
  {
    accessorKey: "aircraft_label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aeronave" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">{row.original.aircraft_label}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.aircraft_model}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "flight_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Vuelo" />
    ),
    cell: ({ row }) => {
      const type = row.original.flight_type;
      if (type === "PAX") {
        return (
          <Badge className="bg-sky-500/10 text-sky-600 border-sky-300 dark:border-sky-800 flex items-center gap-1 w-fit">
            <Plane className="h-3 w-3" /> Pasajeros (PAX)
          </Badge>
        );
      }
      if (type === "CARGO_ONLY") {
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-800 flex items-center gap-1 w-fit">
            <Package className="h-3 w-3" /> Solo Carga
          </Badge>
        );
      }
      return (
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-300 dark:border-purple-800 flex items-center gap-1 w-fit">
          <Layers className="h-3 w-3" /> Híbrido
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.original.status as FlightStatus;
      if (status === "BORRADOR") {
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:border-yellow-800 flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" /> Borrador
          </Badge>
        );
      }
      if (status === "EN_VUELO") {
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-800 flex items-center gap-1 w-fit">
            <Send className="h-3 w-3" /> En Vuelo
          </Badge>
        );
      }
      return (
        <Badge className="bg-green-500/10 text-green-700 border-green-300 dark:border-green-800 flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3 w-3" /> Finalizado
        </Badge>
      );
    },
  },
  {
    id: "passengers_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pasajeros" />
    ),
    cell: ({ row }) => {
      if (row.original.flight_type === "CARGO_ONLY") {
        return (
          <span className="text-muted-foreground text-xs italic">
            (Solo Carga)
          </span>
        );
      }
      const count = row.original.passengers?.length || 0;
      return <span className="font-medium">{count} pasajeros</span>;
    },
  },
  {
    accessorKey: "captain_label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capitán" />
    ),
    cell: ({ row }) => (
      <span className="text-xs">{row.original.captain_label}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell row={row} company={company} canWrite={canWrite} />
    ),
  },
];
