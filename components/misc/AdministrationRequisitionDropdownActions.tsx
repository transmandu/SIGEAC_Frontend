'use client';

import { useDeleteRequisition, useUpdateRequisitionStatus } from "@/actions/compras/requisiciones/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AdministrationRequisition } from "@/types";
import { ClipboardCheck, ClipboardX, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { CreateAdministrationQuoteForm } from "../forms/CreateAdministrationQuoteForm";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import LoadingPage from "./LoadingPage";
import { description } from "./TestChart";

function transformAdministrationApiData(apiData: AdministrationRequisition) {
  return {
    justification: apiData.justification,
    submission_date: apiData.submission_date,
    sub_total: 0, // To be calculated
    total: 0, // To be calculated
    location_id: "", // To be selected
    req_id: apiData.id.toString(),
    vendor_id: "", // To be selected
    articles: apiData.batch.map(batch => ({
      description: batch.batch_articles.description,
      quantity: batch.batch_articles.quantity,
      unit_price: 0, // To be filled
      amount: 0, // To be calculated (quantity * unit_price)
      serial: "" // Optional
    }))
  };
}

const AdministrationRequisitionsDropdownActions = ({ req }: { req: AdministrationRequisition }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [openReject, setOpenReject] = useState<boolean>(false);

  const { deleteRequisition } = useDeleteRequisition();
  const { updateStatusRequisition } = useUpdateRequisitionStatus();
  const { selectedCompany } = useCompanyStore();

  const userRoles = user?.roles?.map(role => role.name) || [];
  const initialData = transformAdministrationApiData(req);

  if (!selectedCompany) {
    return <LoadingPage />;
  }

  const handleDelete = async (id: number, company: string) => {
    await deleteRequisition.mutateAsync({
      id,
      company
    });
    setOpenDelete(false);
  };

  const handleReject = async (id: number, updated_by: string, status: string, company: string) => {
    const data = {
      status,
      updated_by,
      company,
    };
    await updateStatusRequisition.mutateAsync({
      id,
      data
    });
    setOpenReject(false);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          {(userRoles.includes("ANALISTA_COMPRAS")) || (userRoles.includes("SUPERUSER")) && (
            <>
              {(req.status !== 'aprobada' && req.status !== 'cotizado') && (
                <DropdownMenuItem
                  disabled={req.status === 'aprobado' || req.status === 'rechazado'}
                  className="cursor-pointer"
                  onClick={() => setOpenConfirm(true)}
                >
                  <ClipboardCheck className='size-5' />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                disabled={req.status === 'rechazado'}
                onClick={() => setOpenReject(true)}
                className="cursor-pointer"
              >
                <ClipboardX className="size-5" />
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={() => setOpenDelete(true)} className="cursor-pointer">
            <Trash2 className="size-5 text-red-500" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">¿Eliminar Requisición?</DialogTitle>
            <DialogDescription className="text-center">
              Esta acción no se puede deshacer. ¿Estás seguro de eliminar esta requisición?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant={"destructive"} onClick={() => setOpenDelete(false)}>Cancelar</Button>
            <Button
              onClick={() => handleDelete(req.id, selectedCompany.split(" ").join(""))}
              disabled={deleteRequisition.isPending}
              className="bg-primary text-white"
            >
              {deleteRequisition.isPending ? <Loader2 className="animate-spin size-4" /> : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">Generar Cotización Administrativa</DialogTitle>
            <DialogDescription className="text-center">
              Ingrese la información necesaria para generar la cotización.
            </DialogDescription>
          </DialogHeader>
          <CreateAdministrationQuoteForm
            req={req}
            initialData={initialData}
            onClose={() => setOpenConfirm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">Rechazar Requisición</DialogTitle>
            <DialogDescription className="text-center">
              ¿Estás seguro de rechazar esta requisición?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => handleReject(
                req.id,
                `${user?.first_name} ${user?.last_name}`,
                "rechazado",
                selectedCompany.split(" ").join("")
              )}
              disabled={updateStatusRequisition.isPending}
              className="bg-primary text-white"
            >
              {updateStatusRequisition.isPending ? <Loader2 className="animate-spin size-4" /> : "Confirmar"}
            </Button>
            <Button type="button" variant={"destructive"} onClick={() => setOpenReject(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdministrationRequisitionsDropdownActions;
