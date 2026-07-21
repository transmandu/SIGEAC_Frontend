"use client";

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
import { useCompanyStore } from "@/stores/CompanyStore";
import { useUpdateUniformItem } from "@/actions/sms/uniforms/actions";
import { UniformItem } from "@/hooks/sms/useGetUniforms";

interface Props {
  item: UniformItem;
  onEdit: (item: UniformItem) => void;
  onRegisterMovement: (item: UniformItem) => void;
  onRequestDelete: (item: UniformItem) => void;
}

export const InventoryRowActions = ({
  item,
  onEdit,
  onRegisterMovement,
  onRequestDelete,
}: Props) => {
  const { selectedCompany } = useCompanyStore();
  const updateItem = useUpdateUniformItem();

  const company = selectedCompany?.slug ?? "";

  // Toggling `active` refetches the list, which can drop this row while the
  // menu is still closing. Defer a frame so Radix unmounts its portal first.
  const toggleActive = () => {
    requestAnimationFrame(() =>
      updateItem.mutate({
        company,
        id: item.id,
        data: { active: !item.active },
      })
    );
  };

  return (
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
          onClick={() => onRequestDelete(item)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
