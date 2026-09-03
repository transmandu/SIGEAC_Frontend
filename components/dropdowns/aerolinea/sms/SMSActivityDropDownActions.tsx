import {
  useCloseSMSActivity,
  useDeleteSMSActivity,
  useOpenSMSActivity, // Importado
} from "@/actions/sms/sms_actividades/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SMSActivity } from "@/types";
import {
  ClipboardPen,
  EyeIcon,
  Link,
  Loader2,
  LockKeyhole,
  LockOpen, // Icono para reabrir
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
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddToSMSActivity } from "@/components/forms/aerolinea/sms/AddToSMSActivityForm";
import { useCompanyStore } from "@/stores/CompanyStore";
import { startOfDay } from "date-fns";
import { AddSMSActivityAttendanceForm } from "@/components/forms/aerolinea/sms/AddSMSActivityAttendanceForm";
import { LinkBulletinToActivityForm } from "@/components/forms/aerolinea/sms/LinkBulletinToActivityForm";

const SMSActivityDropDownActions = ({
  smsActivity,
}: {
  smsActivity: SMSActivity;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { selectedCompany } = useCompanyStore();
  const [openAdd, setOpenAdd] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const [closeActivity, setCloseActivity] = useState(false);
  const [openReopen, setOpenReopen] = useState(false); // Estado para reabrir
  const [openLink, setOpenLink] = useState(false); // Estado para vincular boletín

  const { deleteSMSActivity } = useDeleteSMSActivity();
  const { closeSMSActivity } = useCloseSMSActivity();
  const { openSMSActivity } = useOpenSMSActivity(); // Hook para reabrir

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

  const handleReopenActivity = async () => {
    await openSMSActivity.mutateAsync(smsActivity.id.toString());
    setOpenReopen(false);
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

        <DropdownMenuContent
          align="center"
          className="flex flex-row gap-2 p-2"
        >
          <TooltipProvider>
            {smsActivity.status !== "CERRADO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                    <Trash2 className="size-4 text-red-500" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>
            )}

            {smsActivity.status !== "CERRADO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(
                        `/${selectedCompany?.slug}/sms/promocion/actividades/editar/${smsActivity.activity_number}`,
                      );
                    }}
                  >
                    <ClipboardPen className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(
                      `/${selectedCompany?.slug}/sms/promocion/actividades/${smsActivity.activity_number}`
                    );
                  }}
                >
                  <EyeIcon className="size-4" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Ver</TooltipContent>
            </Tooltip>

            {smsActivity.status === "CERRADO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenReopen(true)}>
                    <LockOpen className="size-4 text-green-600" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Reabrir Actividad</TooltipContent>
              </Tooltip>
            )}

            {smsActivity.status === "ABIERTO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenAdd(true)}>
                    <Plus className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Agregar personas</TooltipContent>
              </Tooltip>
            )}

            {ActivityDate <= realNow && smsActivity.status === "ABIERTO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenAttendance(true)}>
                    <UserCheck className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Asistencia</TooltipContent>
              </Tooltip>
            )}

            {smsActivity.activity_name === "BOLETÍN" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setOpenLink(true)}>
                    <Link className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Linkear</TooltipContent>
              </Tooltip>
            )}

            {realNow >= ActivityDate && smsActivity.status === "ABIERTO" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem onClick={() => setCloseActivity(true)}>
                    <LockKeyhole className="size-4" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Finalizar Actividad</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
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

      {/* DIALOGO DE ADD FORM */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center font-light">
              Agregar o eliminar personas
            </DialogTitle>
            <AddToSMSActivity
              initialData={smsActivity}
              onClose={() => setOpenAdd(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* DIALOGO DE ASISTENCIA */}
      <Dialog open={openAttendance} onOpenChange={setOpenAttendance}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center font-light">
              Asistencia
            </DialogTitle>
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
              Esta acción cerrará la actividad y limitará su edición.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setCloseActivity(false)}
            >
              Cancelar
            </Button>

            <Button
              disabled={closeSMSActivity.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleCloseActivity()}
            >
              {closeSMSActivity.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGO PARA REABRIR UNA ACTIVIDAD */}
      <Dialog open={openReopen} onOpenChange={setOpenReopen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Desea reabrir la actividad?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Al reabrirla, podrás volver a editar la información, gestionar la asistencia y
              agregar personas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpenReopen(false)}
            >
              Cancelar
            </Button>

            <Button
              disabled={openSMSActivity.isPending}
              className="bg-green-600 hover:bg-green-700 text-white transition-all"
              onClick={() => handleReopenActivity()}
            >
              {openSMSActivity.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar Reapertura</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGO PARA VINCULAR BOLETÍN */}
      <Dialog open={openLink} onOpenChange={setOpenLink}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle className="text-center font-light">
              Vincular Boletín a Actividad
            </DialogTitle>
            <LinkBulletinToActivityForm
              initialData={smsActivity}
              onClose={() => setOpenLink(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SMSActivityDropDownActions;
