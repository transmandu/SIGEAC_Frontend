import { useDeleteAdministrationArticle } from "@/actions/administracion/articulos/actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useGetAdministrationArticleById } from "@/hooks/administracion/useGetAdministrationArticleById";
import { Boxes, EyeIcon, HandCoins, Loader2, MoreHorizontal, Trash2, } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { SellForm } from "../forms/CreateSellForm";

const AdministrationArticleDropdownActions = ({ id }: { id: string }) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openAdminArticle, setOpenAdminArticle] = useState<boolean>(false);
  const router = useRouter();
  const [openSell, setOpenSell] = useState<boolean>(false);
  const { deleteAdministrationArticle } = useDeleteAdministrationArticle();
  const { data: articleDetails, isLoading } =
    useGetAdministrationArticleById(id);

  const handleDelete = (id: number | string) => {
    deleteAdministrationArticle.mutate(id, {
      onSuccess: () => setOpenDelete(false), // Cierra el modal solo si la eliminación fue exitosa
    });
  };

  const handleViewDetails = () => {
    setOpenAdminArticle(true);
  };

  return (
    <>
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
          {articleDetails && (
            <>
              {articleDetails.status === "VENDIDO" ? (
                <DropdownMenuItem disabled>
                  <span className="text-red-500">Vendido</span>
                </DropdownMenuItem>
              ) : articleDetails.status === "RENTADO" ? (
                <DropdownMenuItem disabled>
                  <span className="text-blue-500">Rentado</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setOpenSell(true)} >
                  <HandCoins className="size-5 text-green-500" />
                </DropdownMenuItem>
              )}
            </>
          )}
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <Trash2 className="size-5 text-red-500" />
          </DropdownMenuItem> 
          <DropdownMenuItem onClick={handleViewDetails}>
            <EyeIcon className="size-5" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/administracion/operaciones/articulos/${id}`);
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar un articulo*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el articulo?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo el
              permiso seleccionado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="submit"
            >
              Cancelar
            </Button>
            <Button
              disabled={deleteAdministrationArticle.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(id)}
            >
              {deleteAdministrationArticle.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para ver el resumen del articulo*/}
      <Dialog open={openAdminArticle} onOpenChange={setOpenAdminArticle}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
          aria-describedby={undefined}  
        >
          <DialogHeader className="text-center font-bold">
          <DialogTitle className="text-center font-bold"> 
              Resumen del Artículo
            </DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : articleDetails ? (
            <div className="relative">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-t-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border">
                    <Boxes className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{articleDetails.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Serial: {articleDetails.serial}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-6 grid gap-6">
                {/* Estado con badge */}
                <div className="mt-2 text-center">
                  <Badge
                    className={
                      articleDetails.status === "EN POSESION"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : articleDetails.status === "RENTADO"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : articleDetails.status === "VENDIDO"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    }
                  >
                    {articleDetails.status}
                  </Badge>
                </div>

                {/* Grid de información */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Precio
                    </h3>
                    <p className="font-medium text-lg">
                      ${articleDetails.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Marca
                    </h3>
                    <p className="font-medium text-lg">
                      {articleDetails.brand || "No especificada"}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Tipo
                    </h3>
                    <p className="font-medium text-lg">
                      {articleDetails.type || "No especificado"}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 pb-6">
                <Button
                  onClick={() => setOpenAdminArticle(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No se pudo cargar la información del artículo
              </p>
              <Button
                onClick={() => setOpenAdminArticle(false)}
                variant="outline"
                className="mt-4"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/*Dialog para registrar una venta*/}
      {articleDetails && (
        <Dialog open={openSell} onOpenChange={setOpenSell}>
          <DialogContent onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}>
            <DialogHeader className="text-center font-bold">
              Registrar Venta
            </DialogHeader>
            <SellForm
              article_id={articleDetails!.id.toString()}
              onClose={() => setOpenSell(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdministrationArticleDropdownActions;
