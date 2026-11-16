"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useDeleteChangeRequest } from "@/actions/sms/aeronautical/gestion_de_cambio/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { ChangeRequest } from "@/types/sms/aeronautical/change-request";

export function AeronauticalChangeRequestActions({
  changeRequest,
}: {
  changeRequest: ChangeRequest;
}) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { deleteChangeRequest } = useDeleteChangeRequest();
  const [openDelete, setOpenDelete] = useState(false);

  const company = selectedCompany?.slug;
  const basePath = `/${company}/sms/aseguramiento_calidad/gestion_de_cambio`;

  const handleDelete = async () => {
    if (!company) return;
    try {
      await deleteChangeRequest.mutateAsync({
        company,
        id: changeRequest.id,
      });
      setOpenDelete(false);
    } catch {
      // El hook ya notifica el error.
    }
  };

  return (
    <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() =>
              router.push(`${basePath}/${changeRequest.request_number}`)
            }
          >
            <Eye className="mr-2 size-4" />
            Ver detalle
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              router.push(`${basePath}/${changeRequest.request_number}/editar`)
            }
          >
            <Pencil className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              router.push(
                `${basePath}/${changeRequest.request_number}/evaluacion`,
              )
            }
          >
            <ShieldAlert className="mr-2 size-4" />
            Evaluar peligros
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={(event) => {
              event.preventDefault();
              setOpenDelete(true);
            }}
          >
            <Trash2 className="mr-2 size-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar esta solicitud de cambio?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará permanentemente la solicitud{" "}
            <span className="font-semibold">
              {changeRequest.request_number}
            </span>
            . Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteChangeRequest.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteChangeRequest.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleteChangeRequest.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
