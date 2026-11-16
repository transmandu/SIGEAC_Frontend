"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddToSMSActivity } from "@/components/forms/aerolinea/sms/AddToSMSActivityForm";
import { AddSMSActivityAttendanceForm } from "@/components/forms/aerolinea/sms/AddSMSActivityAttendanceForm";
import {
  useCloseAeronauticalActivity,
  useDeleteAeronauticalActivity,
  useOpenAeronauticalActivity,
} from "@/actions/sms/aeronautical/activities/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AeronauticalActivity } from "@/types/sms/aeronautical/activity";

export function AeronauticalActivityActions({
  activity,
}: {
  activity: AeronauticalActivity;
}) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug ?? "";

  const [openParticipants, setOpenParticipants] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const { deleteAeronauticalActivity } = useDeleteAeronauticalActivity();
  const { closeAeronauticalActivity } = useCloseAeronauticalActivity();
  const { openAeronauticalActivity } = useOpenAeronauticalActivity();

  const baseHref = `/${company}/sms/promocion/actividades`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() =>
              router.push(`${baseHref}/${activity.activity_number}`)
            }
          >
            <Eye className="mr-2 size-4" />
            Ver detalle
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              router.push(`${baseHref}/editar/${activity.activity_number}`)
            }
          >
            <Pencil className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenParticipants(true)}>
            <Users className="mr-2 size-4" />
            Participantes
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenAttendance(true)}>
            <CalendarCheck className="mr-2 size-4" />
            Asistencia
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {activity.status === "CERRADO" ? (
            <DropdownMenuItem
              onClick={() =>
                openAeronauticalActivity.mutate({
                  company,
                  id: String(activity.id),
                })
              }
            >
              <RotateCcw className="mr-2 size-4" />
              Reabrir
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                closeAeronauticalActivity.mutate({
                  company,
                  id: String(activity.id),
                })
              }
            >
              <CheckCircle2 className="mr-2 size-4" />
              Cerrar
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setOpenDelete(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openParticipants} onOpenChange={setOpenParticipants}>
        <DialogContent className="flex max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle className="text-center font-light">
              Agregar o eliminar participantes
            </DialogTitle>
          </DialogHeader>
          <AddToSMSActivity
            initialData={{ activity_number: activity.activity_number }}
            onClose={() => setOpenParticipants(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openAttendance} onOpenChange={setOpenAttendance}>
        <DialogContent className="flex max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle className="text-center font-light">
              Registrar asistencia
            </DialogTitle>
          </DialogHeader>
          <AddSMSActivityAttendanceForm
            initialData={{ activity_number: activity.activity_number }}
            onClose={() => setOpenAttendance(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar la actividad?
            </DialogTitle>
            <DialogDescription className="text-center">
              Esta acción es irreversible y elimina la actividad y su documento
              de la Librería.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteAeronauticalActivity.isPending}
              onClick={() => {
                deleteAeronauticalActivity.mutate(
                  { company, id: String(activity.id) },
                  { onSuccess: () => setOpenDelete(false) },
                );
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
