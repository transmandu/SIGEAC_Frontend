"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, PackagePlus, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  useDeleteUniformItem,
  useUpdateUniformItem,
} from "@/actions/sms/uniforms/actions";
import { UniformItem } from "@/hooks/sms/useGetUniforms";

interface Props {
  item: UniformItem;
  onEdit: (item: UniformItem) => void;
  onRegisterMovement: (item: UniformItem) => void;
}

export const InventoryRowActions = ({
  item,
  onEdit,
  onRegisterMovement,
}: Props) => {
  const { selectedCompany } = useCompanyStore();
  const updateItem = useUpdateUniformItem();
  const deleteItem = useDeleteUniformItem();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const company = selectedCompany?.slug ?? "";

  const toggleActive = () => {
    updateItem.mutate({
      company,
      id: item.id,
      data: { active: !item.active },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onRegisterMovement(item)}>
            <PackagePlus className="mr-2 h-4 w-4" />
            Registrar movimiento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar stock mínimo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleActive}>
            <Power className="mr-2 h-4 w-4" />
            {item.active ? "Desactivar" : "Activar"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Sólo se puede eliminar un artículo sin movimientos registrados. Si
              ya tiene historial, desactívelo en su lugar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deleteItem.mutate({ company, id: item.id })
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
