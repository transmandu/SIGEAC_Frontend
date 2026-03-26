'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { ClipboardX, Loader2 } from "lucide-react";
import { useUpdateRequisitionStatus } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

interface RejectableRequisition {
  id: number;
  order_number: string;
  status: string;
}

interface Props {
  req: RejectableRequisition;
  userRoles: string[];
  userName: string;
}

const RejectRequisitionDialog = ({ req, userRoles, userName }: Props) => {
  const { selectedCompany } = useCompanyStore();
  const { updateStatusRequisition } = useUpdateRequisitionStatus();

  const allowed =
    userRoles.includes("ANALISTA_COMPRAS") ||
    userRoles.includes("SUPERUSER");

  if (!allowed) return null;

  const disabled =
    req.status === "RECHAZADO" || req.status === "APROBADO";

  const handleReject = async () => {
    await updateStatusRequisition.mutateAsync({
      id: req.id,
      data: {
        status: "RECHAZADO",
        updated_by: userName
      },
      company: selectedCompany!.slug
    });
  };

  return (
    <TooltipProvider>
      <Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <span>
                <Button
                  size="icon"
                  variant="secondary"
                  disabled={disabled}
                  className="h-9 w-9"
                >
                  <ClipboardX className="size-4" />
                </Button>
              </span>
            </DialogTrigger>
          </TooltipTrigger>

          <TooltipContent>
            {req.status === "APROBADO"
              ? "No se puede rechazar"
              : req.status === "RECHAZADO"
              ? "Ya rechazada"
              : "Rechazar solicitud"}
          </TooltipContent>
        </Tooltip>

        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-col items-center text-center gap-3">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
              <ClipboardX className="size-6" />
            </div>

            <h2 className="text-xl font-semibold">
              Rechazar requisición
            </h2>

            <p className="text-sm text-muted-foreground max-w-sm">
              La requisición <span className="font-medium">{req.order_number}</span> será marcada como rechazada.
            </p>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:justify-center mt-4">
            <Button variant="outline">Cancelar</Button>

            <Button
              onClick={handleReject}
              disabled={updateStatusRequisition.isPending || disabled}
              className="min-w-[140px]"
            >
              {updateStatusRequisition.isPending && (
                <Loader2 className="animate-spin size-4 mr-2" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default RejectRequisitionDialog;
