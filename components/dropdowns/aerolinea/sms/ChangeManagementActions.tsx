import {
  useAssignReviewers,
  useDeleteChangeRequest,
  useDownloadChangeRequestPdf,
} from "@/actions/sms/gestion_de_cambio/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetEmployesByDepartment } from "@/hooks/ajustes/empleados/useGetEmployeesByDepartment";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ChangeRequest } from "@/types";
import {
  CheckCircle2,
  Download,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const ChangeManagementActions = ({
  changeManagement,
}: {
  changeManagement: ChangeRequest;
}) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const router = useRouter();
  const { deleteChangeRequest } = useDeleteChangeRequest();
  const { downloadChangeRequestPdf } = useDownloadChangeRequestPdf();
  const { assignReviewers } = useAssignReviewers();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openReview, setOpenReview] = useState<boolean>(false);
  const [reviewedById, setReviewedById] = useState<string>("");
  const [approvedById, setApprovedById] = useState<string>("");

  const { data: smsEmployees, isLoading: isLoadingSmsEmployees } =
    useGetEmployesByDepartment("SMS", selectedStation, selectedCompany?.slug);
  const { data: preEmployees, isLoading: isLoadingPreEmployees } =
    useGetEmployesByDepartment("PRE", selectedStation, selectedCompany?.slug);

  const handleDelete = async () => {
    if (!selectedCompany) return;
    await deleteChangeRequest.mutateAsync({
      company: selectedCompany.slug,
      id: changeManagement.id,
    });
    setOpenDelete(false);
  };

  const handleAssignReviewers = async () => {
    if (!selectedCompany || !reviewedById || !approvedById) return;
    try {
      await assignReviewers.mutateAsync({
        company: selectedCompany.slug,
        id: changeManagement.id,
        data: {
          status: "APROBADO",
          reviewed_by: Number(reviewedById),
          approved_by: Number(approvedById),
        },
      });
      setOpenReview(false);
    } catch {
      // error handled by the hook
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedCompany) return;
    try {
      const blob = await downloadChangeRequestPdf.mutateAsync({
        company: selectedCompany.slug,
        id: changeManagement.id,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `TMD_SOLICITUD_DE_CAMBIO_${changeManagement.id}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      // error handled by the hook
    }
  };

  return (
    <TooltipProvider delayDuration={120}>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" className="flex gap-2">
            <DropdownMenuItem
              onClick={() => {
                router.push(
                  `/${selectedCompany?.slug}/sms/aseguramiento_calidad/gestion_de_cambio/${changeManagement.id}`,
                );
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <EyeIcon className="size-5" />
                </TooltipTrigger>
                <TooltipContent>Ver</TooltipContent>
              </Tooltip>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                router.push(
                  `/${selectedCompany?.slug}/sms/aseguramiento_calidad/gestion_de_cambio/${changeManagement.id}/editar`,
                );
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Pencil className="size-5" />
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleDownloadPdf}
              disabled={downloadChangeRequestPdf.isPending}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  {downloadChangeRequestPdf.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Download className="size-5" />
                  )}
                </TooltipTrigger>
                <TooltipContent>Descargar PDF</TooltipContent>
              </Tooltip>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setReviewedById(
                  changeManagement.reviewed_by?.id?.toString() ?? "",
                );
                setApprovedById(
                  changeManagement.approved_by?.id?.toString() ?? "",
                );
                setOpenReview(true);
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <CheckCircle2 className="size-5 text-emerald-500" />
                </TooltipTrigger>
                <TooltipContent>Revisar y aprobar</TooltipContent>
              </Tooltip>
            </DropdownMenuItem>

            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2 className="size-5 text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>Eliminar</TooltipContent>
                </Tooltip>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
                <Trash2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold leading-tight">
                  Eliminar solicitud de cambio
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Solicitud #{changeManagement.id} —{" "}
                  {changeManagement.department?.acronym}
                </p>
              </div>
            </div>
          </DialogHeader>

          <DialogDescription className="text-sm text-muted-foreground">
            Esta acción es irreversible y eliminará por completo la solicitud de
            cambio seleccionada, incluyendo todos sus ítems, recursos
            financieros, evaluaciones de riesgo y actividades asociadas.
          </DialogDescription>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="button"
            >
              Cancelar
            </Button>

            <Button
              disabled={deleteChangeRequest.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={handleDelete}
              type="button"
            >
              {deleteChangeRequest.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openReview} onOpenChange={setOpenReview}>
        <DialogContent>
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-500 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold leading-tight">
                  Revisión y aprobación
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Solicitud #{changeManagement.id} —{" "}
                  {changeManagement.department?.acronym}
                </p>
              </div>
            </div>
          </DialogHeader>

          <DialogDescription className="text-sm text-muted-foreground">
            Seleccione quien revisará y quien aprobará la solicitud de cambio.
          </DialogDescription>

          <div className="grid gap-4 py-1">
            <div className="space-y-2">
              <Label>Revisado por</Label>
              {isLoadingSmsEmployees ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : (
                <Select value={reviewedById} onValueChange={setReviewedById}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el revisor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {smsEmployees?.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Aprobado por</Label>
              {isLoadingPreEmployees ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : (
                <Select value={approvedById} onValueChange={setApprovedById}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el aprobador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {preEmployees?.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenReview(false)}
              type="button"
            >
              Cancelar
            </Button>

            <Button
              disabled={
                assignReviewers.isPending || !reviewedById || !approvedById
              }
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={handleAssignReviewers}
              type="button"
            >
              {assignReviewers.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default ChangeManagementActions;
