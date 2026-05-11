"use client";

import { useDeleteDispatchRequest } from "@/actions/mantenimiento/almacen/solicitudes/salida/action";
import { DispatchArticle } from "@/app/[company]/almacen/solicitudes/salida/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReturnToWarehouse } from "@/hooks/mantenimiento/almacen/articulos/useReturnToWarehouse";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2, MoreHorizontal, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";

const DispatchRequestDropdownActions = ({
  id,
  category,
  articles,
}: {
  id: string | number;
  category?: string;
  articles: DispatchArticle[];
}) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);

  const { selectedCompany } = useCompanyStore();
  const { deleteDispatchRequest } = useDeleteDispatchRequest();
  const returnToWarehouse = useReturnToWarehouse(selectedCompany?.slug);

  const isHerramienta = category?.toLowerCase() === "herramienta";

  const handleDelete = async () => {
    if (!selectedCompany?.slug) return;
    await deleteDispatchRequest.mutateAsync({ id, company: selectedCompany.slug });
    setOpenDelete(false);
  };

  const handleReturn = async () => {
    if (!selectedCompany?.slug) return;
    for (const article of articles) {
      if (article.id !== null) {
        await returnToWarehouse.mutateAsync(article.id);
      }
    }
    setOpenReturn(false);
  };

  return (
    <>
      {/* Dialog: Devolver a almacén */}
      <Dialog open={openReturn} onOpenChange={setOpenReturn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Devolver la herramienta al almacén?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              El artículo volverá a estar disponible en el inventario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenReturn(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              disabled={returnToWarehouse.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={handleReturn}
              type="button"
            >
              {returnToWarehouse.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Eliminar solicitud */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar esta solicitud de salida?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y repondrá el stock de los artículos asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              disabled={deleteDispatchRequest.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={handleDelete}
              type="button"
            >
              {deleteDispatchRequest.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropdown trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          {isHerramienta && (
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setOpenReturn(true)}
            >
              <Undo2 className="size-5 text-blue-500" />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setOpenDelete(true)}
          >
            <Trash2 className="size-5 text-red-500" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default DispatchRequestDropdownActions;
