import {
  useDeleteCourse,
  useFinishCourse,
  useReopenCourse,
} from "@/actions/general/cursos/actions";
import { AddCourseAttendanceForm } from "@/components/forms/aerolinea/sms/AddCourseAtendanceForm";
import { AddToCourseForm } from "@/components/forms/aerolinea/sms/AddToCourseForm";
import { CreateCourseForm } from "@/components/forms/aerolinea/sms/CreateCourseForm";
import { CreateExamForm } from "@/components/forms/aerolinea/sms/CreateExamForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Course } from "@/types";
import { startOfDay } from "date-fns";
import {
  ClipboardPenLine,
  EyeIcon,
  FilePlus,
  FileText,
  Loader2,
  LockKeyholeOpen,
  LockOpen,
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
  const { reopenCourse } = useReopenCourse();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const [openReopen, setOpenReopen] = useState(false);
  const [openExam, setOpenExam] = useState(false);

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

  const handleReopenCourse = async () => {
    await reopenCourse.mutateAsync({
      id: course.id.toString(),
      company: selectedCompany!.slug,
    });
    setOpenReopen(false);
  };

  const realnow = startOfDay(new Date());
  const CourseDate = startOfDay(course.end_date);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" data-tour="cursos-actions">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-auto p-2 flex flex-row gap-2">
              {course.status !== "CERRADO" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenDelete(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Eliminar</TooltipContent>
                  </Tooltip>
                </Button>
              )}

              {course.status !== "CERRADO" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenEdit(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ClipboardPenLine className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Editar</TooltipContent>
                  </Tooltip>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  router.push(
                    `/${selectedCompany?.slug}/general/cursos/${course.id}`,
                  );
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <EyeIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Ver</TooltipContent>
                </Tooltip>
              </Button>

              {course.status === "ABIERTO" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenAdd(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Plus className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Agregar personas</TooltipContent>
                  </Tooltip>
                </Button>
              )}

              {course.status !== "CERRADO" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenAttendance(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <UserCheck className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Asistencia</TooltipContent>
                  </Tooltip>
                </Button>
              )}

              {course.status !== "CERRADO" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenExam(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FilePlus className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Agregar Examen</TooltipContent>
                  </Tooltip>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  router.push(
                    `/${selectedCompany?.slug}/general/cursos/${course.id}/examenes`,
                  );
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FileText className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Gestionar Examenes</TooltipContent>
                </Tooltip>
              </Button>

              {CourseDate <= realnow && course.status !== "CERRADO" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenStatus(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <LockKeyholeOpen className="h-4 w-4 text-green-400" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Finalizar</TooltipContent>
                  </Tooltip>
                </Button>
              )}

              {course.status === "CERRADO" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenReopen(true)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <LockOpen className="h-4 w-4 text-blue-400" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Reabrir</TooltipContent>
                  </Tooltip>
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </TooltipProvider>

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

        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle className="text-center font-bold">
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

      <Dialog open={openReopen} onOpenChange={setOpenReopen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea reabrir el curso?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción cambiará el estatus del curso a{" "}
              <span className="font-semibold text-green-400">ABIERTO</span>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenReopen(false)}
              type="button"
            >
              Cancelar
            </Button>

            <Button
              disabled={reopenCourse.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleReopenCourse()}
            >
              {reopenCourse.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openExam} onOpenChange={setOpenExam}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">
              Agregar Examen al Curso
            </DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
          </DialogHeader>
          <CreateExamForm
            courseId={course.id.toString()}
            onClose={() => setOpenExam(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseDropdownActions;
