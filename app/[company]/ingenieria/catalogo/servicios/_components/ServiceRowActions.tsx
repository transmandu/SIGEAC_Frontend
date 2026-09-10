"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { ServiceDialog } from "@/components/dialogs/mantenimiento/catalogo/ServiceDialog";
import { useDeleteCatalogService } from "@/actions/mantenimiento/catalogo/servicios/actions";
import { useAuth } from "@/contexts/AuthContext";
import { CatalogService } from "@/types/maintenanceCatalog";

const itemBase =
  "group relative flex items-center justify-center size-9 rounded-xl transition-all duration-200 ease-out hover:bg-muted hover:shadow-sm active:scale-95";
const iconBase = "size-[18px] transition-all duration-200 ease-out group-hover:scale-110";

export function ServiceRowActions({ service, company }: { service: CatalogService; company: string }) {
  const { user } = useAuth();
  const { deleteCatalogService } = useDeleteCatalogService();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const base = `/${company}/ingenieria/catalogo/servicios/${service.id}`;

  // Eliminar es sanear un dato que nunca debió existir: un servicio que solo
  // dejó de aplicar se retira con SUPERSEDED, y eso sí lo hace Ingeniería.
  const isSuperUser = user?.roles?.some((role) => role.name === "SUPERUSER");

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
                  <Link href={base} className={itemBase}>
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
            <TooltipContent>Editar servicio</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <Link href={`${base}/tareas`} className={itemBase}>
                    <ClipboardList className={iconBase} />
                  </Link>
                </DropdownMenuItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Administrar tareas</TooltipContent>
          </Tooltip>

          {isSuperUser && (
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
              <TooltipContent>Eliminar servicio</TooltipContent>
            </Tooltip>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ServiceDialog open={openEdit} onOpenChange={setOpenEdit} service={service} />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este servicio/certificado?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{service.name}&quot; con sus tareas y requisitos. Si ya se usó en un Control de
              Mantenimiento o una Orden de Trabajo, el sistema lo rechazará: en ese caso márquelo como superado.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteCatalogService.mutate({ id: service.id, company })}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
