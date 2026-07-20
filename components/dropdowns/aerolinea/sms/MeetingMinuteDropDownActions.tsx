import {
  useDeleteMeetingMinute,
  useDownloadMeetingMinutePdf,
} from "@/actions/general/minutas_reunion/actions";
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
import { MeetingMinutes } from "@/types";
import { ClipboardPen, Download, Eye, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { CreateMeetingMinuteForm } from "@/components/forms/general/CreateMeetingMinuteForm";

const MeetingMinuteDropDownActions = ({
  meetingMinute,
}: {
  meetingMinute: MeetingMinutes;
}) => {
  const { selectedCompany } = useCompanyStore();
  const { company } = useParams<{ company: string }>();
  const router = useRouter();

  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const { deleteMeetingMinute } = useDeleteMeetingMinute();
  const { downloadMeetingMinutePdf } = useDownloadMeetingMinutePdf();

  const handleDelete = async () => {
    await deleteMeetingMinute.mutateAsync({
      company: selectedCompany!.slug,
      id: meetingMinute.id,
    });
    setOpenDelete(false);
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadMeetingMinutePdf.mutateAsync({
        company: selectedCompany!.slug,
        id: meetingMinute.id,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${meetingMinute.minute_number ?? meetingMinute.id}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      // error handled by the hook
    }
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

        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem onClick={handleDownloadPdf}>
                  <Download className="size-5" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Descargar PDF</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/${company}/sms/promocion/minutas_reunion/${meetingMinute.id}`)
                  }
                >
                  <Eye className="size-5" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Ver</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                  <ClipboardPen className="size-5" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                  <Trash2 className="size-5 text-red-500" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Eliminar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIALOGO DE ELIMINAR */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar la minuta?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo la
              minuta de reunión seleccionada.
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
              disabled={deleteMeetingMinute.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete()}
            >
              {deleteMeetingMinute.isPending ? (
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
        <DialogContent className="w-[98vw] max-w-3xl max-h-[90vh] overflow-y-auto p-2 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-center"></DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0"></DialogDescription>
          </DialogHeader>

          <CreateMeetingMinuteForm
            key={openEdit ? meetingMinute.id : "closed"}
            isEditing={true}
            initialData={meetingMinute}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeetingMinuteDropDownActions;
