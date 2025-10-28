import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useUpdateArticleStatus } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { BadgeCheck, Loader2, MoreHorizontal, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CheckingArticleDropdownActions = ({ id }: { id: string | number }) => {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { updateArticleStatus } = useUpdateArticleStatus();

  const handleConfirm = (id: number ) => {
    updateArticleStatus.mutate(
      { id, status: "stored" },
      {
        onSuccess: () => setOpen(false), // Cierra el modal solo si la eliminación fue exitosa
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="flex gap-2 justify-center"
        >
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              router.push(
                `/${selectedCompany?.slug}/ingenieria/confirmar_inventario/editar_articulo/${id}`
              );
            }}
          >
            <SquarePen className="size-5" />
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem className="cursor-pointer">
              <BadgeCheck className="size-5 text-green-600/80" />
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            Confirmar Registro de Artículo
          </DialogTitle>
          <DialogDescription className="text-center p-2 mb-0 pb-0">
            La información del artículo será verificada y registrada en el sistema. ¿Desea
            continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button
            className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
            onClick={() => setOpen(false)}
            type="submit"
          >
            Cancelar
          </Button>
          <Button
            disabled={updateArticleStatus.isPending}
            className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
            onClick={() => handleConfirm(Number(id))}
          >
            {updateArticleStatus.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <p>Confirmar</p>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckingArticleDropdownActions;
