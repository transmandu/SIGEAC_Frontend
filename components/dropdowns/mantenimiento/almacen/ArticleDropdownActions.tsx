import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { FileText, History, Loader2, MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ArticleStatusHistoryDialog from "@/components/misc/ArticleStatusHistoryDialog";
import ArticleDocumentsDialog from "@/components/misc/ArticleDocumentsDialog";
import { canModifyArticle } from "@/lib/warehouse/statuses";

const ArticleDropdownActions = ({
  id,
  status,
  hasDocumentation,
  partNumber,
}: {
  id: string | number;
  status?: string | null;
  /** Si el artículo declara documentación, se ofrece verla. */
  hasDocumentation?: boolean;
  partNumber?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openHistory, setOpenHistory] = useState<boolean>(false);
  const [openDocuments, setOpenDocuments] = useState<boolean>(false);
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { deleteArticle } = useDeleteArticle();
  const { user } = useAuth();

 const roles = user?.roles?.map((r) => r.name) ?? [];
  const isSuperUser = roles.includes("SUPERUSER");
  const canModify = canModifyArticle(status, isSuperUser);

  const handleDelete = (id: number | string) => {
    deleteArticle.mutate(
      { id, company: selectedCompany!.slug },
      {
        onSuccess: () => setOpen(false), // Cierra el modal solo si la eliminación fue exitosa
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="flex gap-2 justify-center"
          >
            {canModify && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      router.push(
                        `/${selectedCompany?.slug}/almacen/inventario_articulos/editar/${id}`,
                      );
                    }}
                  >
                    <SquarePen className="size-5" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Editar artículo</TooltipContent>
              </Tooltip>
            )}

            {hasDocumentation && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => setOpenDocuments(true)}
                  >
                    <FileText className="size-5" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Ver documentación</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setOpenHistory(true)}
                >
                  <History className="size-5" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Historial de estados</TooltipContent>
            </Tooltip>

            {canModify &&
            (isSuperUser || roles.includes("JEFE_ALMACEN")) ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <DropdownMenuItem className="cursor-pointer">
                      <Trash2 className="size-5 text-red-500" />
                    </DropdownMenuItem>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Eliminar artículo</TooltipContent>
              </Tooltip>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            ¿Seguro que desea eliminar el articulo?
          </DialogTitle>
          <DialogDescription className="text-center p-2 mb-0 pb-0">
            Esta acción es irreversible y estaría eliminando por completo el
            articulo seleccionado.
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
            disabled={deleteArticle.isPending}
            className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
            onClick={() => handleDelete(id)}
          >
            {deleteArticle.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <p>Confirmar</p>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      {/* Hermano del diálogo de borrado, no hijo: son dos diálogos independientes. */}
      <ArticleStatusHistoryDialog
        articleId={id}
        open={openHistory}
        onOpenChange={setOpenHistory}
      />

      {hasDocumentation && (
        <ArticleDocumentsDialog
          articleId={id}
          partNumber={partNumber}
          open={openDocuments}
          onOpenChange={setOpenDocuments}
        />
      )}
    </>
  );
};

export default ArticleDropdownActions;
