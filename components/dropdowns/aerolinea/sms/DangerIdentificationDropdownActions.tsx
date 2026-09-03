import { useDeleteDangerIdentification } from "@/actions/sms/peligros_identificados/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { DangerIdentification } from "@/types";
import {
  ClipboardPen,
  ClipboardPenLine,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import CreateAnalysisForm from "@/components/forms/aerolinea/sms/CreateAnalysisForm";
import CreateDangerIdentificationForm from "@/components/forms/aerolinea/sms/CreateIdentificationForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DangerIdentificationDropdownActions = ({
  dangerIdentification,
}: {
  dangerIdentification: DangerIdentification;
}) => {
  const { selectedCompany } = useCompanyStore();
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openEditAnalyses, setOpenEditAnalyses] = useState<boolean>(false);

  const { deleteDangerIdentification } = useDeleteDangerIdentification();
  const [openCreateAnalysis, setOpenCreateAnalysis] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const router = useRouter();

  const handleDelete = async (id: number | string) => {
    const value = {
      company: selectedCompany!.slug,
      id: id.toString(),
    };
    if (value.company) {
      await deleteDangerIdentification.mutateAsync(value);
    }
    setOpenDelete(false);
  };

  const status =
    dangerIdentification.voluntary_report?.status ||
    dangerIdentification.obligatory_report?.status;

  const id =
    dangerIdentification.voluntary_report?.id ||
    dangerIdentification.obligatory_report?.id ||
    "";

  const reportType = dangerIdentification.voluntary_report ? "RVP" : "ROS";

  const canEdit = status === "ABIERTO";
  const canDelete = status === "ABIERTO";
  const canCreateAnalysis = dangerIdentification && !dangerIdentification.analysis;
  const canEditAnalysis =
    dangerIdentification && dangerIdentification.analysis && status !== "CERRADO";

  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const tooltipHandler = (name: string) => ({
    onMouseEnter: () => setHoveredTooltip(name),
    onMouseLeave: () => setHoveredTooltip((prev) => (prev === name ? null : prev)),
  });

  const renderTooltipIcon = (
    name: string,
    label: string,
    children: ReactNode
  ) => (
    <Tooltip open={hoveredTooltip === name}>
      <TooltipTrigger
        asChild
        {...tooltipHandler(name)}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <>
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-auto p-1.5 border-border/60"
          >
              <div className="flex items-center gap-0.5">
                {canEdit &&
                  renderTooltipIcon(
                    "edit",
                    "Editar",
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setOpenEdit(true)}
                    >
                      <ClipboardPen className="size-4" />
                    </Button>
                  )}

                {canDelete &&
                  renderTooltipIcon(
                    "delete",
                    "Eliminar",
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setOpenDelete(true)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  )}

                {renderTooltipIcon(
                  "view",
                  "Ver",
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      router.push(
                        `/transmandu/sms/gestion_reportes/peligros_identificados/${dangerIdentification.id}`
                      );
                    }}
                  >
                    <EyeIcon className="size-4" />
                  </Button>
                )}

                {canCreateAnalysis &&
                  renderTooltipIcon(
                    "create-analysis",
                    "Crear Analisis",
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setOpenCreateAnalysis(true)}
                    >
                      <ClipboardPenLine className="size-4" />
                    </Button>
                  )}

                {canEditAnalysis &&
                  renderTooltipIcon(
                    "edit-analysis",
                    "Editar Analisis",
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setOpenEditAnalyses(true)}
                    >
                      <ClipboardPenLine className="size-4" />
                    </Button>
                  )}
              </div>
          </PopoverContent>
        </Popover>
      </div>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el reporte??
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo la
              identificacion seleccionado.
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
              disabled={deleteDangerIdentification.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(dangerIdentification.id)}
            >
              {deleteDangerIdentification.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openCreateAnalysis} onOpenChange={setOpenCreateAnalysis}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <CreateAnalysisForm
            onClose={() => setOpenCreateAnalysis(false)}
            id={dangerIdentification.id}
            name={"identification"}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openEditAnalyses} onOpenChange={setOpenEditAnalyses}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <CreateAnalysisForm
            onClose={() => setOpenEditAnalyses(false)}
            id={dangerIdentification.id}
            name={"identification"}
            isEditing={true}
            initialData={dangerIdentification.analysis}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="flex flex-col max-w-3xl m-2 max-h-[calc(100vh-10rem)] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-center"></DialogTitle>
            <CreateDangerIdentificationForm
              onClose={() => setOpenEdit(false)}
              id={id}
              initialData={dangerIdentification}
              isEditing={true}
              reportType={reportType}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DangerIdentificationDropdownActions;
