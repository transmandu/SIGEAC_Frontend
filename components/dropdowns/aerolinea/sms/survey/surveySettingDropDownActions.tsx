import {
  useDeleteSurvey,
  useUpdateSurveySetting,
} from "@/actions/sms/survey/actions";
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
import {
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
  QrCode,
  Hammer,
  ShieldCheck,
  NotebookPen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SettingType = "OMA_QUIZ" | "SMS_QUIZ" | "SMS_SURVEY";

const SurveySettingDropdownActions = ({
  surveyData,
}: {
  surveyData: Survey;
}) => {
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const { updateSurveySetting } = useUpdateSurveySetting();
  const [configDialog, setConfigDialog] = useState(false);
  const [currentSetting, setCurrentSetting] = useState<SettingType | null>(
    null
  );

  const router = useRouter();

  const handleUpdate = async () => {
    if (!currentSetting) return;

    const value = {
      company: selectedCompany?.slug,
      id: surveyData.id,
      setting: currentSetting,
    };

    await updateSurveySetting.mutateAsync(value);
    setConfigDialog(false);
    setCurrentSetting(null);
  };

  const openConfigDialog = (setting: SettingType) => {
    setCurrentSetting(setting);
    setConfigDialog(true);
  };

  const getDialogConfig = (setting: SettingType | null) => {
    if (!setting) return { title: "", description: "" };

    const configs = {
      OMA_QUIZ: {
        title: "¿Configurar como Trivia OMA?",
        description:
          "Esta acción configurará esta trivia para ser respondida en la plataforma OMA y removerá la configuración de cualquier otra trivia que esté usando OMA.",
      },
      SMS_QUIZ: {
        title: "¿Configurar como Trivia SMS?",
        description:
          "Esta acción configurará esta trivia para ser respondida via SMS y removerá la configuración de cualquier otra trivia que esté usando SMS.",
      },
      SMS_SURVEY: {
        title: "¿Configurar como Encuesta SMS?",
        description:
          "Esta acción configurará esta encuesta para ser respondida via SMS y removerá la configuración de cualquier otra encuesta que esté usando SMS.",
      },
    };

    return configs[setting];
  };

  const dialogConfig = getDialogConfig(currentSetting);

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
            {/* Opción Ver */}
            <DropdownMenuItem
              onClick={() => {
                router.push(
                  `/${selectedCompany?.slug}/sms/gestion_encuestas/${surveyData.survey_number}`
                );
              }}
            >
              <EyeIcon className="size-5" />
              <p className="pl-2">Ver</p>
            </DropdownMenuItem>

            {/* Trivia OMA - Solo para QUIZ sin setting */}
            {surveyData.type === "QUIZ" && surveyData.setting === null && (
              <DropdownMenuItem onClick={() => openConfigDialog("OMA_QUIZ")}>
                <Hammer className="size-5" />
                <p className="pl-2">Trivia OMA</p>
              </DropdownMenuItem>
            )}

            {/* Trivia SMS - Solo para QUIZ sin setting */}
            {surveyData.type === "QUIZ" && surveyData.setting === null && (
              <DropdownMenuItem onClick={() => openConfigDialog("SMS_QUIZ")}>
                <NotebookPen className="size-5" />
                <p className="pl-2">Trivia SMS</p>
              </DropdownMenuItem>
            )}

            {/* Encuesta SMS - Solo para SURVEY sin setting */}
            {surveyData.type === "SURVEY" && surveyData.setting === null && (
              <DropdownMenuItem onClick={() => openConfigDialog("SMS_SURVEY")}>
                <NotebookPen className="size-5" />
                <p className="pl-2">Encuesta SMS</p>
              </DropdownMenuItem>
            )}

            {/* Opción QR */}
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setOpenQR(true)}>
                <QrCode className="size-5" />
                <p className="pl-2">QR</p>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

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

        {/* Dialog de confirmación único y reutilizable */}
        <Dialog open={configDialog} onOpenChange={setConfigDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                {dialogConfig.title}
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                {dialogConfig.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
              <Button
                className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
                onClick={() => {
                  setConfigDialog(false);
                  setCurrentSetting(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                disabled={updateSurveySetting.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={handleUpdate}
              >
                {updateSurveySetting.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Confirmar</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};

export default SurveySettingDropdownActions;
