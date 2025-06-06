import {
  useCloseReport,
  useDeleteMitigationPlan,
} from "@/actions/sms/planes_de_mitigation/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MitigationTable } from "@/types";
import {
  ClipboardList,
  ClipboardPenLine,
  Eye,
  EyeIcon,
  FilePenLine,
  Loader2,
  LockOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateAnalysisForm from "../forms/CreateAnalysisForm";
import CreateMitigationPlanForm from "../forms/CreateMitigationPlanForm";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import CreateMitigationMeasureForm from "../forms/CreateMitigationMeasureForm";
import { useTheme } from "next-themes";
import { getResult } from "@/lib/utils";

const MitigationTableDropdownActions = ({
  mitigationTable,
}: {
  mitigationTable: MitigationTable;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const { deleteMitigationPlan } = useDeleteMitigationPlan();
  const [openCreateDangerIdentification, setOpenCreateDangerIdentification] =
    useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openCreatePlan, setOpenCreatePlan] = useState<boolean>(false);
  const [openCreateMeasure, setOpenCreateMeasure] = useState<boolean>(false);
  const [closeReport, setCloseReport] = useState<boolean>(false);
  const [openEditPlan, setOpenEditPlan] = useState<boolean>(false);
  const [openEditAnalyses, setOpenEditAnalyses] = useState<boolean>(false);
  const [openCreateAnalysis, setOpenCreateAnalysis] = useState<boolean>(false);
  const { closeReportByMitigationId } = useCloseReport();

  const { theme } = useTheme();

  interface closeReportData {
    mitigation_id: number | string;
    result: string;
  }

  const handleDelete = async (id: number | string) => {
    await deleteMitigationPlan.mutateAsync(id);
    setOpenDelete(false);
  };

  const handleCloseReport = async (id: number | string, result: string) => {
    const data: closeReportData = {
      mitigation_id: id,
      result: result,
    };
    await closeReportByMitigationId.mutateAsync(data);
    setCloseReport(false);
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
            {!mitigationTable.mitigation_plan ? (
              <DropdownMenuItem onClick={() => setOpenCreatePlan(true)}>
                <ClipboardList className="size-5" />
                <p className="pl-2">Crear Plan</p>
              </DropdownMenuItem>
            ) : mitigationTable.mitigation_plan &&
              !mitigationTable.mitigation_plan.analysis ? (
              <DropdownMenuItem onClick={() => setOpenEditPlan(true)}>
                <FilePenLine className="size-5" />
                <p className="pl-2">Editar Plan</p>
              </DropdownMenuItem>
            ) : null}

            {mitigationTable.mitigation_plan && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                  <Trash2 className="size-5 text-red-500" />
                  <p className="pl-2">Eliminar</p>
                </DropdownMenuItem>
              </DialogTrigger>
            )}

            {mitigationTable.mitigation_plan?.id &&
            mitigationTable.mitigation_plan?.analysis === null &&
            mitigationTable.mitigation_plan.measures.length > 0 ? (
              <DropdownMenuItem onClick={() => setOpenCreateAnalysis(true)}>
                <ClipboardPenLine className="size-5" />
                <p className="pl-2">Crear analisis</p>
              </DropdownMenuItem>
            ) : mitigationTable.mitigation_plan?.analysis ? (
              mitigationTable.voluntary_report?.status !== "CERRADO" &&
              mitigationTable.obligatory_report?.status !== "CERRADO" && (
                <DropdownMenuItem onClick={() => setOpenEditAnalyses(true)}>
                  <Pencil className="size-5" />
                  <p className="pl-2">Editar analisis</p>
                </DropdownMenuItem>
              )
            ) : null}

            {mitigationTable.mitigation_plan?.id &&
              mitigationTable.mitigation_plan?.analysis === null && (
                <DropdownMenuItem onClick={() => setOpenCreateMeasure(true)}>
                  <Plus
                    className={`size-5 ${
                      theme === "light" ? "text-black" : "text-white"
                    }`}
                  />
                  <p className="pl-2">Crear Medida</p>
                </DropdownMenuItem>
              )}

            {!mitigationTable.id && (
              <DropdownMenuItem
                onClick={() => setOpenCreateDangerIdentification(true)}
              >
                <ClipboardPenLine className="size-5" />
              </DropdownMenuItem>
            )}

            {mitigationTable.mitigation_plan?.id &&
              mitigationTable.mitigation_plan.analysis !== null &&
              getResult(mitigationTable.mitigation_plan.analysis.result) ===
                "ACEPTABLE" &&
              mitigationTable.voluntary_report?.status !== "CERRADO" &&
              mitigationTable.obligatory_report?.status !== "CERRADO" && (
                <DropdownMenuItem onClick={() => setCloseReport(true)}>
                  <LockOpen className="size-5" />
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
              <DialogTitle>Analisis Post Mitigacion</DialogTitle>
              <DialogDescription>Analisis Post Mitigacion</DialogDescription>
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
                Editar Analisis Post Mitigacion
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
      </Dialog>
    </>
  );
};

export default MitigationTableDropdownActions;
