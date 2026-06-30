"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal, Pencil, Tag, Trash2 } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useDeleteUniformBrand } from "@/actions/sms/uniforms/actions";
import { UniformBrand } from "@/hooks/sms/useGetUniforms";

interface Handlers {
  onEdit: (brand: UniformBrand) => void;
}

const BrandRowActions = ({
  brand,
  onEdit,
}: {
  brand: UniformBrand;
  onEdit: (brand: UniformBrand) => void;
}) => {
  const { selectedCompany } = useCompanyStore();
  const deleteBrand = useDeleteUniformBrand();
  const [confirmOpen, setConfirmOpen] = useState(false);

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
          <DropdownMenuItem onClick={() => onEdit(brand)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
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
            <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Sólo se puede eliminar una marca sin artículos asociados. Si ya
              tiene artículos, desactívela en su lugar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deleteBrand.mutate({
                  company: selectedCompany!.slug,
                  id: brand.id,
                })
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

export const getBrandsColumns = (
  handlers: Handlers
): ColumnDef<UniformBrand>[] => [
  {
    accessorKey: "name",
    header: "Marca",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Tag className="size-4" />
        </span>
        <span className="font-semibold uppercase text-foreground">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "items_count",
    header: "Artículos",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.items_count ?? 0}
      </span>
    ),
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ row }) =>
      row.original.active ? (
        <Badge className="bg-green-600 hover:bg-green-600">Activa</Badge>
      ) : (
        <Badge variant="secondary">Inactiva</Badge>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <BrandRowActions brand={row.original} onEdit={handlers.onEdit} />
    ),
  },
];
