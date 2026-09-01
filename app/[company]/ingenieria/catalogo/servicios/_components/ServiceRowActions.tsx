"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Eye, MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ServiceDialog } from "@/components/dialogs/mantenimiento/catalogo/ServiceDialog";
import { CatalogService } from "@/types/maintenanceCatalog";

const itemBase =
  "group relative flex items-center justify-center size-9 rounded-xl transition-all duration-200 ease-out hover:bg-muted hover:shadow-sm active:scale-95";
const iconBase = "size-[18px] transition-all duration-200 ease-out group-hover:scale-110";

export function ServiceRowActions({ service, company }: { service: CatalogService; company: string }) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const base = `/${company}/ingenieria/catalogo/servicios/${service.id}`;

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
        </DropdownMenuContent>
      </DropdownMenu>

      <ServiceDialog open={openEdit} onOpenChange={setOpenEdit} service={service} />
    </TooltipProvider>
  );
}
