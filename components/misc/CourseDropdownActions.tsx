import { useDeleteCourse } from "@/actions/cursos/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Course } from "@/types";
import {
  ClipboardPenLine,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { CreateCourseForm } from "../forms/CreateCourseForm";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useRouter } from "next/navigation";

const CourseDropdownActions = ({ course }: { course: Course }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const { selectedCompany } = useCompanyStore();
  const { deleteCourse } = useDeleteCourse();
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const router = useRouter();
  const handleDelete = async (id: string, company: string | null) => {
    const value = {
      id: id,
      company: company,
    };
    await deleteCourse.mutateAsync(value);
    setOpenDelete(false);
  };
  return (
    <>
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
            className="flex-col gap-2 justify-center"
          >
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                <Trash2 className="size-5 text-red-500" />
                <p className="pl-2">Eliminar</p>
              </DropdownMenuItem>
            </DialogTrigger>

            {
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                <ClipboardPenLine className="size-5" />
                <p className="pl-2">Editar</p>
              </DropdownMenuItem>
            }
            <DropdownMenuItem
              onClick={() => {
                router.push(`/${selectedCompany}/general/cursos/${course.id}`);
              }}
            >
              <EyeIcon className="size-5" />
              <p className="pl-2">Ver</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar el curso??
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y estaría eliminando por completo el
                curso seleccionado.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
              <Button
                className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
                onClick={() => setOpenDelete(false)}
                type="submit"
              >
                Cancelar
              </Button>

              <Button
                disabled={deleteCourse.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() =>
                  handleDelete(course.id.toString(), selectedCompany)
                }
              >
                {deleteCourse.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Confirmar</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <CreateCourseForm
              onClose={() => setOpenEdit(false)}
              initialData={course}
            />
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};

export default CourseDropdownActions;
