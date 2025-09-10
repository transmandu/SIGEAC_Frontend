import {
  useDeleteCourse,
  useFinishCourse,
} from "@/actions/general/cursos/actions";
import { AddCourseAttendanceForm } from "@/components/forms/aerolinea/sms/AddCourseAtendanceForm";
import { AddToCourseForm } from "@/components/forms/aerolinea/sms/AddToCourseForm";
import { CreateCourseForm } from "@/components/forms/aerolinea/sms/CreateCourseForm";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Course } from "@/types";
import { startOfDay } from "date-fns";
import {
  ClipboardPenLine,
  EyeIcon,
  Loader2,
  LockKeyholeOpen,
  MoreHorizontal,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CourseDropdownActions = ({ course }: { course: Course }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const { selectedCompany } = useCompanyStore();
  const { deleteCourse } = useDeleteCourse();
  const { finishCourse } = useFinishCourse();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);

  const router = useRouter();
  const handleDelete = async () => {
    await deleteCourse.mutateAsync({
      id: course.id.toString(),
      company: selectedCompany!.slug,
    });
    setOpenDelete(false);
  };

  const handleCloseCourse = async () => {
    await finishCourse.mutateAsync({
      id: course.id.toString(),
      company: selectedCompany!.slug,
    });
    setOpenStatus(false);
  };

  const realNow = startOfDay(new Date());
  const CourseDate = startOfDay(course.end_date);

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
            {course.status !== "CERRADO" && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                  <Trash2 className="size-5 text-red-500" />
                  <p className="pl-2">Eliminar</p>
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {course.status !== "CERRADO" && (
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                <ClipboardPenLine className="size-5" />
                <p className="pl-2">Editar</p>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => {
                router.push(
                  `/${selectedCompany?.slug}/general/cursos/${course.id}`
                );
              }}
            >
              <EyeIcon className="size-5" />
              <p className="pl-2">Ver</p>
            </DropdownMenuItem>

            {CourseDate <= realNow && course.status === "ABIERTO" && (
              <DropdownMenuItem onClick={() => setOpenAdd(true)}>
                <Plus className="size-5" />
                <p className="pl-2">Agregar personas</p>
              </DropdownMenuItem>
            )}

            {CourseDate <= realNow && course.status === "ABIERTO" && (
              <DropdownMenuItem onClick={() => setOpenAttendance(true)}>
                <UserCheck className="size-5" />
                <p className="pl-2">Asistencia</p>
              </DropdownMenuItem>
            )}

            {CourseDate <= realNow && course.status !== "CERRADO" && (
              <DropdownMenuItem onClick={() => setOpenStatus(true)}>
                <LockKeyholeOpen className="size-5 text-green-400" />
                <p className="pl-2">Finalizar</p>
              </DropdownMenuItem>
            )}
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
                disabled={finishCourse.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() => handleDelete()}
              >
                {finishCourse.isPending ? (
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
              isEditing={true}
              initialData={course}
            />
          </DialogContent>
        </Dialog>
        {/* DIALOGO DE ADD FORM */}
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle className="text-center font-light">
                Agregar o eliminar personas
              </DialogTitle>
              <DialogDescription className="text-center"></DialogDescription>
              <AddToCourseForm
                initialData={course}
                onClose={() => setOpenAdd(false)}
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Dialog>

      <Dialog open={openAttendance} onOpenChange={setOpenAttendance}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center font-light">
              Asistencia de personas
            </DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
            <AddCourseAttendanceForm
              initialData={course}
              onClose={() => setOpenAttendance(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={openStatus} onOpenChange={setOpenStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea finalizar el curso??
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría finalizando el curso
              seleccionado.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenStatus(false)}
              type="submit"
            >
              Cancelar
            </Button>

            <Button
              disabled={deleteCourse.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleCloseCourse()}
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
    </>
  );
};

export default CourseDropdownActions;
