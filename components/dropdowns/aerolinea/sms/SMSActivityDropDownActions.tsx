import {
  useCloseSMSActivity,
  useDeleteSMSActivity,
} from "@/actions/sms/sms_actividades/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SMSActivity } from "@/types";
import {
  ClipboardPen,
  EyeIcon,
  Loader2,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CreateSMSActivityForm from "@/components/forms/aerolinea/sms/CreateSMSActivityForm";
import { AddToSMSActivity } from "@/components/forms/aerolinea/sms/AddToSMSActivityForm";
import { useCompanyStore } from "@/stores/CompanyStore";
import { startOfDay } from "date-fns";
import { AddSMSActivityAttendanceForm } from "@/components/forms/aerolinea/sms/AddSMSActivityAttendanceForm";

const SMSActivityDropDownActions = ({
  smsActivity,
}: {
  smsActivity: SMSActivity;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const { selectedCompany } = useCompanyStore();

  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const [openAdd, setOpenAdd] = useState(false);

  const [openAttendance, setOpenAttendance] = useState(false);

  const [closeActivity, setCloseActivity] = useState(false);

  const { deleteSMSActivity } = useDeleteSMSActivity();

  const { closeSMSActivity } = useCloseSMSActivity();

  const realNow = startOfDay(new Date());

  const ActivityDate = startOfDay(smsActivity.end_date);

  const router = useRouter();

  const handleDelete = async () => {
    const value = {
      company: selectedCompany!.slug,
      id: smsActivity.id.toString(),
    };
    await deleteSMSActivity.mutateAsync(value);
    setOpenDelete(false);
  };

  const handleCloseActivity = async () => {
    await closeSMSActivity.mutateAsync(smsActivity.id.toString());
    setCloseActivity(false);
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
          className="flex-col gap-2 justify-center"
        >
          {smsActivity.status !== "CERRADO" && (
            <DropdownMenuItem onClick={() => setOpenDelete(true)}>
              <Trash2 className="size-5 text-red-500" />
              <p className="pl-2">Eliminar</p>
            </DropdownMenuItem>
          )}

          {smsActivity.status !== "CERRADO" && (
            <DropdownMenuItem onClick={() => setOpenEdit(true)}>
              <ClipboardPen className="size-5" />
              <p className="pl-2">Editar</p>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => {
              router.push(
                `/transmandu/sms/planificacion/actividades/${smsActivity.id}`
              );
            }}
          >
            <EyeIcon className="size-5" />
            <p className="pl-2">Ver</p>
          </DropdownMenuItem>

          {smsActivity.status === "ABIERTO" && (
            <DropdownMenuItem onClick={() => setOpenAdd(true)}>
              <Plus className="size-5" />
              <p className="pl-2">Agregar personas</p>
            </DropdownMenuItem>
          )}

          {ActivityDate <= realNow && smsActivity.status === "ABIERTO" && (
            <DropdownMenuItem onClick={() => setOpenAttendance(true)}>
              <UserCheck className="size-5" />
              <p className="pl-2">Asistencia</p>
            </DropdownMenuItem>
          )}

          {realNow >= ActivityDate && smsActivity.status === "ABIERTO" && (
            <DropdownMenuItem onClick={() => setCloseActivity(true)}>
              <LockKeyhole className="size-5" />
              <p className="pl-2">Finalizar Actividad</p>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIALOGO DE ELIMINAR */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar la actividad?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo la
              actividad seleccionada.
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
              disabled={deleteSMSActivity.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete()}
            >
              {deleteSMSActivity.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGO DE EDITAR */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center">
              Edicion de Actividad
            </DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
            <CreateSMSActivityForm
              initialData={smsActivity}
              isEditing={true}
              onClose={() => setOpenEdit(false)}
            />
          </DialogHeader>
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
            <AddToSMSActivity
              initialData={smsActivity}
              onClose={() => setOpenAdd(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={openAttendance} onOpenChange={setOpenAttendance}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center font-light">
              Asistencia
            </DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
            <AddSMSActivityAttendanceForm
              initialData={smsActivity}
              onClose={() => setOpenAttendance(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* DIALOGO PARA CERRAR UNA ACTIVIDAD */}
      <Dialog open={closeActivity} onOpenChange={setCloseActivity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea cerrar la actividad?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría cerrando la actividad
              seleccionada.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setCloseActivity(false)}
              type="submit"
            >
              Cancelar
            </Button>

            <Button
              disabled={deleteSMSActivity.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleCloseActivity()}
            >
              {deleteSMSActivity.isPending ? (
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

export default SMSActivityDropDownActions;
