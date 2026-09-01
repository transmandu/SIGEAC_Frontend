"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CatalogManual } from "@/types/maintenanceCatalog";
import { useDeleteCatalogManual } from "@/actions/mantenimiento/catalogo/manuales/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ManualDialog } from "@/components/dialogs/mantenimiento/catalogo/ManualDialog";

const itemBase =
  "group relative flex items-center justify-center size-9 rounded-xl transition-all duration-200 ease-out hover:bg-muted hover:shadow-sm active:scale-95";
const iconBase = "size-[18px] transition-all duration-200 ease-out group-hover:scale-110";

export function ManualRowActions({ manual }: { manual: CatalogManual }) {
  const { selectedCompany } = useCompanyStore();
  const { deleteCatalogManual } = useDeleteCatalogManual();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Un manual con servicios ya no se puede borrar (el backend lo rechaza) — no
  // se ofrece la acción en vez de mostrarla y fallar.
  const canDelete = (manual.services_count ?? 0) === 0;

  return (
    <TooltipProvider delayDuration={120}>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 rounded-xl">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          sideOffset={3}
          className="flex items-center justify-center gap-1.5 overflow-visible rounded-2xl border border-border/50 bg-background/90 p-1.5 shadow-xl backdrop-blur-xl"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <Link
                    href={`/${selectedCompany?.slug}/ingenieria/catalogo/manuales/${manual.id}`}
                    className={itemBase}
                  >
                    <Eye className={iconBase} />
                  </Link>
                </DropdownMenuItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Ver detalle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <button
                    onClick={() => {
                      setOpenDropdown(false);
                      setOpenEdit(true);
                    }}
                    className={`${itemBase} text-primary`}
                  >
                    <Pencil className={iconBase} />
                  </button>
                </DropdownMenuItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Editar manual</TooltipContent>
          </Tooltip>

          {canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        setOpenDelete(true);
                      }}
                      className={`${itemBase} text-red-600`}
                    >
                      <Trash2 className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Eliminar manual</TooltipContent>
            </Tooltip>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ManualDialog open={openEdit} onOpenChange={setOpenEdit} manual={manual} />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este manual?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{manual.name}&quot; y su archivo adjunto, si tiene. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteCatalogManual.mutate({ id: manual.id, company: selectedCompany!.slug })}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
