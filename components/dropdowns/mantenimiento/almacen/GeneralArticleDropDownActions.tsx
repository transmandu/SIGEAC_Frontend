import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
    ClipboardPen,
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
} from "@/components/ui/dialog";
import { useDeleteGeneralArticle } from "@/actions/mantenimiento/inventario/articulos/actions";
import CreateGeneralArticleForm from "@/components/forms/mantenimiento/almacen/CreateGeneralArticleForm";
import type { GeneralArticle } from "@/types";

interface Props {
    article: GeneralArticle;
}

const GeneralArticleDropDownActions = ({ article }: Props) => {
    const { selectedCompany } = useCompanyStore();
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const { deleteGeneralArticle } = useDeleteGeneralArticle();

    const handleDelete = async () => {
        const value = {
            company: selectedCompany!.slug,
            id: article.id,
        };
        await deleteGeneralArticle.mutateAsync(value);
        setOpenDelete(false);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                        <ClipboardPen className="size-5 mr-2" />
                        <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setOpenDelete(true)}
                    >
                        <Trash2 className="size-5 mr-2" />
                        <span>Eliminar</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-4xl max-h-[calc(100vh-4rem)] overflow-auto">
                    <CreateGeneralArticleForm
                        initialData={article}
                        isEditing={true}
                        onlyDescription={true}
                        onClose={() => setOpenEdit(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            ¿Seguro que desea eliminar el artículo?
                        </DialogTitle>
                        <DialogDescription className="text-center p-2">
                            Esta acción es irreversible y eliminará por completo el artículo.
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
                            onClick={() => handleDelete()}
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
