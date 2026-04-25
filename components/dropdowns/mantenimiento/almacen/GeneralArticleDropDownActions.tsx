import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
    Loader2,
    MoreHorizontal,
    Trash2,
} from "lucide-react";
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
import { useDeleteGeneralArticle } from "@/actions/mantenimiento/inventario/articulos/actions";

interface Props {
    id: string | number;
}

const GeneralArticleDropDownActions = ({ id }: Props) => {
    const { selectedCompany } = useCompanyStore();
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const { deleteGeneralArticle } = useDeleteGeneralArticle();

    const handleDelete = async (id: number | string) => {
        const value = {
            company: selectedCompany!.slug,
            id: id.toString(),
        };
        await deleteGeneralArticle.mutateAsync(value);
        setOpenDelete(false);
    };

    return (
        <>
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="center">
                        <DialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash2 className="size-5 mr-2" />
                                <span>Eliminar</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            ¿Seguro que desea eliminar el reporte?
                        </DialogTitle>
                        <DialogDescription className="text-center p-2">
                            Esta acción es irreversible y eliminará por completo el reporte.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setOpenDelete(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleteGeneralArticle.isPending}
                            onClick={() => handleDelete(id)}
                        >
                            {deleteGeneralArticle.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                "Confirmar"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default GeneralArticleDropDownActions;
