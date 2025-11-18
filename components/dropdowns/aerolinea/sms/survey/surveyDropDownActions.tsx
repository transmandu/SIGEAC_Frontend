import { useDeleteSurvey } from "@/actions/sms/survey/actions";
import QRGenerator from "@/components/misc/QRGenerator";
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
import { Survey } from "@/types";
import { EyeIcon, Loader2, MoreHorizontal, Trash2, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SurveyDropdownActions = ({ surveyData }: { surveyData: Survey }) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openQR, setOpenQR] = useState<boolean>(false);

  const { deleteSurvey } = useDeleteSurvey();
  const router = useRouter();

  const handleDelete = async () => {
    const value = {
      company: selectedCompany!.slug,
      location_id: selectedStation,
      survey_number: surveyData.survey_number,
    };
    await deleteSurvey.mutateAsync(value);
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
            className="flex flex-col gap-2 justify-center"
          >
            {/* Opción Eliminar */}
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                <Trash2 className="size-5 text-red-500" />
                <p className="pl-2">Eliminar</p>
              </DropdownMenuItem>
            </DialogTrigger>

            {/* Resultados de encuesta  */}
            <DropdownMenuItem
              onClick={() => {
                router.push(
                  `/${selectedCompany?.slug}/sms/gestion_encuestas/${surveyData.survey_number}/resultados`
                );
              }}
            >
              <EyeIcon className="size-5" />
              <p className="pl-2">Resultados</p>
            </DropdownMenuItem>

            {/* Opción QR */}
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setOpenQR(true)}>
                <QrCode className="size-5" />
                <p className="pl-2">QR</p>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dialog para Eliminar */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar la encuesta?
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y eliminará por completo la
                encuesta.
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
                disabled={deleteSurvey.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() => handleDelete()}
              >
                {deleteSurvey.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Confirmar</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para QR */}
        <Dialog open={openQR} onOpenChange={setOpenQR}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                Código QR de la Encuesta
              </DialogTitle>
            </DialogHeader>

            <div className="flex justify-center">
              <QRGenerator
                value={`https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms/encuesta/${surveyData.survey_number}`}
                fileName={`encuesta-${surveyData.survey_number}`}
                bgColor="#3088FF"
                showLink={true}
                showDownloadButton={true}
                size={200}
              />
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};

export default SurveyDropdownActions;
