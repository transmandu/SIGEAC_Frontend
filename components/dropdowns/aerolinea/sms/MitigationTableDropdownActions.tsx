import {
  useCloseReport,
  useDeleteMitigationPlan,
  useOpenReport,
} from "@/actions/sms/planes_de_mitigation/actions";
import CreateAnalysisForm from "@/components/forms/aerolinea/sms/CreateAnalysisForm";
import CreateMitigationMeasureForm from "@/components/forms/aerolinea/sms/CreateMitigationMeasureForm";
import CreateMitigationPlanForm from "@/components/forms/aerolinea/sms/CreateMitigationPlanForm";
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
import { getResult } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MitigationTable } from "@/types";
import {
  ClipboardList,
  ClipboardPenLine,
  FilePenLine,
  Loader2,
  LockKeyhole,
  LockKeyholeOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

const MitigationTableDropdownActions = ({
  mitigationTable,
}: {
  mitigationTable: MitigationTable;
}) => {
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState<boolean>(false);
  const { deleteMitigationPlan } = useDeleteMitigationPlan();
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreatePlan, setOpenCreatePlan] = useState(false);
  const [openCreateMeasure, setOpenCreateMeasure] = useState(false);
  const [closeReport, setCloseReport] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openEditPlan, setOpenEditPlan] = useState(false);
  const [openEditAnalyses, setOpenEditAnalyses] = useState(false);
  const [openCreateAnalysis, setOpenCreateAnalysis] = useState(false);
  const { closeReportByMitigationId } = useCloseReport();
  const { openReportByMitigationId } = useOpenReport();
  const { theme } = useTheme();

  const handleDelete = async (id: number | string) => {
    const value = {
      company: selectedCompany!.slug,
      id: id.toString(),
    };
    await deleteMitigationPlan.mutateAsync(value);
    setOpenDelete(false);
  };

  const handleCloseReport = async (id: number | string, result: string) => {
    const value = {
      company: selectedCompany!.slug,
      data: {
        mitigation_id: id,
        result: result,
      },
    };
    await closeReportByMitigationId.mutateAsync(value);
    setCloseReport(false);
  };

  const handleOpenReport = async (id: number | string, result: string) => {
    const value = {
      company: selectedCompany!.slug,
      data: {
        mitigation_id: id,
        result: result,
      },
    };
    await openReportByMitigationId.mutateAsync(value);
    setOpenReport(false);
  };

  const isReportClosed = () => {
    return (
      mitigationTable.voluntary_report?.status === "CERRADO" ||
      mitigationTable.obligatory_report?.status === "CERRADO"
    );
  };

  const isReportOpen = () => {
    return (
      mitigationTable.voluntary_report?.status === "ABIERTO" ||
      mitigationTable.obligatory_report?.status === "ABIERTO"
    );
  };

  const canEditPlan = () => {
    return Boolean(mitigationTable.mitigation_plan && isReportOpen());
  };

  const canCreateAnalysis = () => {
    return Boolean(
      mitigationTable.mitigation_plan?.id &&
        mitigationTable.mitigation_plan?.analysis === null &&
        mitigationTable.mitigation_plan.measures.length > 0
    );
  };

  const canEditAnalysis = () => {
    return Boolean(
      mitigationTable.mitigation_plan?.analysis && !isReportClosed()
    );
  };

  const canCloseReport = () => {
    const result = mitigationTable.mitigation_plan?.analysis?.result;
    return Boolean(
      mitigationTable.mitigation_plan?.id &&
        mitigationTable.mitigation_plan.analysis !== null &&
        result &&
        (getResult(result) === "ACEPTABLE" ||
          getResult(result) === "TOLERABLE") &&
        isReportOpen()
    );
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
            {mitigationTable.mitigation_plan?.id && isReportOpen() && (
              <DropdownMenuItem onClick={() => setOpenCreateMeasure(true)}>
                <Plus
                  className={`size-5 ${
                    theme === "light" ? "text-black" : "text-white"
                  }`}
                />
                <p className="pl-2">Crear Medida</p>
              </DropdownMenuItem>
            )}

            {/* Nueva opción para abrir reporte cuando esté cerrado */}

            {isReportClosed() && (
              <DropdownMenuItem onClick={() => setOpenReport(true)}>
                <LockKeyholeOpen className="size-5" />
                <p className="pl-2">Abrir Reporte</p>
              </DropdownMenuItem>
            )}

            {/* OPCION PARA CREAR Y/O EDIAR UN PLAN DE MITGACION ASOCIADO A LA GESTION DE UN REPROTE */}
            {!mitigationTable.mitigation_plan ? (
              <DropdownMenuItem onClick={() => setOpenCreatePlan(true)}>
                <ClipboardList className="size-5" />
                <p className="pl-2">Crear Plan</p>
              </DropdownMenuItem>
            ) : canEditPlan() ? (
              <DropdownMenuItem onClick={() => setOpenEditPlan(true)}>
                <FilePenLine className="size-5" />
                <p className="pl-2">Editar Plan</p>
              </DropdownMenuItem>
            ) : null}

            {/* OPCION PARA ELIMINAR UN PLAN DE MITIGACION ASOCIADO A UN REPORTE */}
            {mitigationTable.mitigation_plan && isReportOpen() && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                  <Trash2 className="size-5 text-red-500" />
                  <p className="pl-2">Eliminar</p>
                </DropdownMenuItem>
              </DialogTrigger>
            )}

            {/* OPCION PARA CREAR Y/O EDITAR UN ANALISIS ASOCIADO AL PLAN DE MITIGACION DE LA GESTION DE UN REPROTE */}
            {canCreateAnalysis() ? (
              <DropdownMenuItem onClick={() => setOpenCreateAnalysis(true)}>
                <ClipboardPenLine className="size-5" />
                <p className="pl-2">Crear analisis</p>
              </DropdownMenuItem>
            ) : mitigationTable.mitigation_plan?.analysis ? (
              isReportOpen() && (
                <DropdownMenuItem onClick={() => setOpenEditAnalyses(true)}>
                  <Pencil className="size-5" />
                  <p className="pl-2">Editar analisis</p>
                </DropdownMenuItem>
              )
            ) : null}

            {/* OPCION PARA CERRAR LA GESTION DE UN REPROTE */}

            {canCloseReport() && (
              <DropdownMenuItem onClick={() => setCloseReport(true)}>
                <LockKeyhole className="size-5" />
                <p className="pl-2">Cerrar Reporte</p>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar el plan de mitigacion??
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y estaría eliminando por completo el
                plan de mitigacion seleccionado.
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
                disabled={deleteMitigationPlan.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() =>
                  mitigationTable.mitigation_plan?.id
                    ? handleDelete(mitigationTable.mitigation_plan.id)
                    : console.log("El id de mitigation_plan es undefined")
                }
              >
                {deleteMitigationPlan.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Confirmar</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openCreatePlan} onOpenChange={setOpenCreatePlan}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <CreateMitigationPlanForm
              onClose={() => setOpenCreatePlan(false)}
              id={mitigationTable.id}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={openCreateAnalysis} onOpenChange={setOpenCreateAnalysis}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle>Análisis Post Mitigación</DialogTitle>
              <DialogDescription>Análisis Post Mitigación</DialogDescription>
            </DialogHeader>

            {mitigationTable.mitigation_plan?.id !== undefined ? (
              <CreateAnalysisForm
                onClose={() => setOpenCreateAnalysis(false)}
                id={mitigationTable.mitigation_plan?.id}
                name="mitigacion"
              />
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={openEditAnalyses} onOpenChange={setOpenEditAnalyses}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle className="text-center">
                Editar Analisis Post Mitigación
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            {mitigationTable.mitigation_plan?.id !== undefined ? (
              <CreateAnalysisForm
                initialData={mitigationTable.mitigation_plan.analysis}
                isEditing={true}
                onClose={() => setOpenEditAnalyses(false)}
                id={mitigationTable.mitigation_plan?.id}
                name="mitigacion"
              />
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={openCreateMeasure} onOpenChange={setOpenCreateMeasure}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            {mitigationTable.mitigation_plan?.id && (
              <CreateMitigationMeasureForm
                onClose={() => setOpenCreateMeasure(false)}
                id={mitigationTable.mitigation_plan.id} // Ahora es seguro usar .id directamente
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={openEditPlan} onOpenChange={setOpenEditPlan}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            {mitigationTable.mitigation_plan?.id && (
              <CreateMitigationPlanForm
                isEditing={true}
                initialData={mitigationTable.mitigation_plan}
                onClose={() => setOpenEditPlan(false)}
                id={mitigationTable.mitigation_plan.id} // Ahora es seguro usar .id directamente
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={closeReport} onOpenChange={setCloseReport}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea cerrar el reporte??
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y estaría cerrando el reporte
                seleccionado
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
              <Button
                className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
                onClick={() => setCloseReport(false)}
                type="submit"
              >
                Cancelar
              </Button>

              <Button
                disabled={closeReportByMitigationId.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() =>
                  mitigationTable.mitigation_plan?.id
                    ? handleCloseReport(
                        mitigationTable.mitigation_plan.id,
                        mitigationTable.mitigation_plan.analysis.result
                      )
                    : console.log("El id de mitigation_plan es undefined")
                }
              >
                {closeReportByMitigationId.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Confirmar</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openReport} onOpenChange={setOpenReport}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea abrir el reporte??
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y estaría habilitando editar
                información
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
              <Button
                className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
                onClick={() => setCloseReport(false)}
                type="submit"
              >
                Cancelar
              </Button>

              <Button
                disabled={closeReportByMitigationId.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() =>
                  mitigationTable.mitigation_plan?.id
                    ? handleOpenReport(
                        mitigationTable.mitigation_plan.id,
                        mitigationTable.mitigation_plan.analysis.result
                      )
                    : console.log("El id de mitigation_plan es undefined")
                }
              >
                {openReportByMitigationId.isPending ? (
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

export default MitigationTableDropdownActions;
