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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useDeleteUniformArticleType } from "@/actions/sms/uniforms/actions";
import { UniformArticleType } from "@/hooks/sms/useGetUniforms";
import { getUniformTypeIcon } from "@/components/sms/uniform-meta";

interface Handlers {
  onEdit: (type: UniformArticleType) => void;
}

const ArticleTypeRowActions = ({
  type,
  onEdit,
}: {
  type: UniformArticleType;
  onEdit: (type: UniformArticleType) => void;
}) => {
  const { selectedCompany } = useCompanyStore();
  const deleteType = useDeleteUniformArticleType();
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
          <DropdownMenuItem onClick={() => onEdit(type)}>
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
            <AlertDialogTitle>¿Eliminar tipo de artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Sólo se puede eliminar un tipo sin artículos asociados. Si ya tiene
              artículos, desactívelo en su lugar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deleteType.mutate({
                  company: selectedCompany!.slug,
                  id: type.id,
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

export const getArticleTypesColumns = (
  handlers: Handlers
): ColumnDef<UniformArticleType>[] => [
  {
    accessorKey: "name",
    header: "Tipo de artículo",
    cell: ({ row }) => {
      const Icon = getUniformTypeIcon(undefined, row.original.name);
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <span className="font-semibold uppercase text-foreground">
            {row.original.name}
          </span>
        </div>
      );
    },
  },
  {
    id: "sizes",
    header: "Tallas",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.sizes.map((s) => (
          <Badge key={s} variant="outline" className="font-mono text-[11px]">
            {s}
          </Badge>
        ))}
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
        <Badge className="bg-green-600 hover:bg-green-600">Activo</Badge>
      ) : (
        <Badge variant="secondary">Inactivo</Badge>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <ArticleTypeRowActions type={row.original} onEdit={handlers.onEdit} />
    ),
  },
];
