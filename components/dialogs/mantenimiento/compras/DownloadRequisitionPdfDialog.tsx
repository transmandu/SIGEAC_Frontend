"use client";

import { PanelSection } from "@/components/forms/PanelSection";
import { useMemo } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { SearchableSelect } from "@/components/misc/SearchableSelect";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useAuth } from "@/contexts/AuthContext";
import { useMyEmployee } from "@/hooks/sistema/usuario/useMyEmployee";
import { useDownloadRequisitionPdf } from "@/hooks/mantenimiento/compras/useDownloadRequisitionPdf";
import {
  useGetRequisitionPdfReceivers,
  type RequisitionPdfReceiver,
} from "@/hooks/mantenimiento/compras/useGetRequisitionPdfReceivers";
import { notifyError } from "@/lib/notify-error";
import { useResettingState } from "@/hooks/useResettingState";

/**
 * Personal de compras: recibe sus propias requisiciones, así que no elige a
 * nadie en el select — firma con su propia ficha aunque esté afiliada a otra
 * compañía distinta a la de la requisición.
 */
const SELF_RECEIVER_ROLES = [
  "JEFE_COMPRAS",
  "ANALISTA_COMPRAS",
  "ASISTENTE_COMPRAS",
];

type Props = {
  req: {
    id: number;
    order_number: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Diálogo de descarga del formato "REQUISICION" (PDF generado en el backend).
 * Pide seleccionar el empleado del departamento receptor (Compras,
 * Administración o RRHH), que se imprime en la sección "DEPARTAMENTO
 * RECEPTOR" y firma en "Recibe conforme".
 */
export default function DownloadRequisitionPdfDialog({
  req,
  open,
  onOpenChange,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  // La selección no se conserva entre aperturas: cada descarga debe elegir
  // conscientemente al receptor.
  const [receiverId, setReceiverId] = useResettingState<string>("", [open]);

  const userRoles = user?.roles?.map((role) => role.name) ?? [];
  const isSelfReceiver = SELF_RECEIVER_ROLES.some((role) =>
    userRoles.includes(role),
  );

  const { data: myEmployee, isLoading: isMyEmployeeLoading } = useMyEmployee();

  const { data: receivers, isLoading: isReceiversLoading } =
    useGetRequisitionPdfReceivers(
      open && !isSelfReceiver ? selectedCompany?.slug : undefined,
    );

  const { mutateAsync: downloadPdf, isPending } = useDownloadRequisitionPdf();

  // Agrupados por departamento para el select
  const receiversByDepartment = useMemo(() => {
    const groups = new Map<string, RequisitionPdfReceiver[]>();
    for (const receiver of receivers ?? []) {
      const department = receiver.department?.name ?? "Sin departamento";
      groups.set(department, [...(groups.get(department) ?? []), receiver]);
    }
    return Array.from(groups.entries());
  }, [receivers]);

  const canDownload = isSelfReceiver ? !!myEmployee : !!receiverId;

  const handleDownload = async () => {
    if (!selectedCompany?.slug || !canDownload || isPending) return;

    try {
      const blob = await downloadPdf({
        company: selectedCompany.slug,
        requisitionId: req.id,
        ...(isSelfReceiver
          ? ({ receiverSelf: true } as const)
          : { receiverEmployeeId: Number(receiverId) }),
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${req.order_number}.pdf`;
      // El ancla debe estar en el documento: Firefox ignora el click sobre un
      // elemento suelto y la descarga no ocurre.
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Revocar en el mismo tick puede cancelar la descarga en algunos
      // navegadores.
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success(`Requisición ${req.order_number} generada`);
      onOpenChange(false);
    } catch (error) {
      notifyError(error, { action: "generar el PDF de la requisición" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        className="sm:max-w-lg"
        icon={FileText}
        title="Descargar requisición"
        description={
          <>
            <span
              className="mb-1 inline-flex max-w-full items-center rounded-md border bg-background px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-muted-foreground"
              title={req.order_number}
            >
              <span className="truncate">{req.order_number}</span>
            </span>
            <span className="block">
              {isSelfReceiver
                ? "El documento lo incluye a usted en la sección “Departamento Receptor” y su firma en “Recibe conforme”."
                : "El documento incluye al receptor seleccionado en la sección “Departamento Receptor” y su firma en “Recibe conforme”."}
            </span>
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              className="min-w-37.5 gap-2"
              onClick={handleDownload}
              disabled={!canDownload || isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {isPending ? "Generando..." : "Descargar PDF"}
            </Button>
          </>
        }
      >
        <PanelSection
          icon={UserCheck}
          title="Departamento receptor"
          hint={
            isSelfReceiver
              ? undefined
              : "Personal de Compras, Administración o RRHH que recibirá la solicitud."
          }
          compact
        >
          <div className="space-y-2.5">
            {isSelfReceiver ? (
              <>
                <p className="text-[13px] text-muted-foreground">
                  Usted recibe esta solicitud y firma en &ldquo;Recibe
                  conforme&rdquo;.
                </p>

                {isMyEmployeeLoading ? (
                  <div
                    className="
                      flex h-10 items-center gap-2
                      text-sm text-muted-foreground
                    "
                  >
                    <Loader2 className="size-4 animate-spin" />
                    Cargando sus datos...
                  </div>
                ) : myEmployee ? (
                  <div className="rounded-xl border bg-muted/30 px-3.5 py-3">
                    <p className="text-sm font-medium wrap-anywhere">
                      {myEmployee.first_name} {myEmployee.last_name}
                    </p>
                    {(myEmployee.job_title?.name ||
                      myEmployee.department?.name) && (
                      <p className="text-[13px] text-muted-foreground">
                        {[
                          myEmployee.job_title?.name,
                          myEmployee.department?.name,
                        ]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-destructive">
                    Su usuario no tiene una ficha de empleado activa, por lo que
                    no puede firmar como receptor.
                  </p>
                )}
              </>
            ) : (
              <SearchableSelect
                value={receiverId}
                onChange={setReceiverId}
                loading={isReceiversLoading}
                placeholder="Seleccionar empleado"
                searchPlaceholder="Buscar empleado..."
                emptyText="No hay empleados disponibles"
                triggerClassName="h-10 max-sm:text-base"
                options={receiversByDepartment.flatMap(
                  ([department, employees]) =>
                    employees.map((employee) => ({
                      value: String(employee.id),
                      label: `${employee.first_name} ${employee.last_name}`,
                      description: employee.job_title?.name,
                      group: department,
                    })),
                )}
              />
            )}
          </div>
        </PanelSection>
      </FormDialogContent>
    </Dialog>
  );
}
