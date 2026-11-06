"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { MyRequisition, Requisition } from "@/types/purchase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  AlertOctagon,
  ClipboardX,
  FileClock,
  FileDown,
  MoreHorizontal,
  Receipt,
  Tag,
  Trash2,
} from "lucide-react";
import { RowAction, RowActionsBar } from "./RowAction";
import DownloadRequisitionPdfDialog from "@/components/dialogs/mantenimiento/compras/DownloadRequisitionPdfDialog";
import RequisitionDropdownDialogs from "@/components/dialogs/mantenimiento/compras/RequisitionDropdownDialogs";
import UpdateRequisitionPriorityDialog from "@/components/dialogs/mantenimiento/compras/UpdateRequisitionPriorityDialog";
import { useOpenQuoteDraftEditor } from "@/components/dialogs/mantenimiento/compras/QuoteDraftEditorProvider";

/**
 * Sirve a las dos familias de listado: el de compras (`Requisition`) y el de
 * "mis solicitudes" (`MyRequisition`), que es más estrecho. Solo usa los campos
 * que ambos comparten —id, número, estado y creador—, así que la unión es el
 * contrato honesto en vez de exigir el tipo ancho a quien no lo recibe.
 *
 * `variant="menu"` es el menú flotante de la fila; `variant="bar"` pone las
 * mismas acciones en una barra delgada de una sola línea (panel lateral).
 */
const RequisitionDropdownActions = ({
  req,
  variant = "menu",
}: {
  req: Requisition | MyRequisition;
  variant?: "menu" | "bar";
}) => {
  const { user } = useAuth();
  const inBar = variant === "bar";

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCascadeDelete, setOpenCascadeDelete] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [openPriority, setOpenPriority] = useState(false);
  const [openPdf, setOpenPdf] = useState(false);

  const userRoles = user?.roles?.map((role) => role.name) || [];
  const isOwnRequisition = req.created_by?.id === user?.id;
  const canChangePriority = ["JEFE_ALMACEN", "SUPERUSER"].some((role) =>
    userRoles.includes(role),
  );
  const canSeeAllOptions = [
    "JEFE_COMPRAS",
    "ANALISTA_COMPRAS",
    "ASISTENTE_COMPRAS",
    "SUPERUSER",
  ].some((role) => userRoles.includes(role));
  // JEFE_ALMACEN puede eliminar cualquier solicitud de almacén, pero no
  // cotizar ni rechazar (eso queda reservado a compras).
  const canDeleteAny = ["JEFE_ALMACEN", "SUPERUSER"].some((role) =>
    userRoles.includes(role),
  );
  // ANALISTA_ALMACEN es de solo lectura: únicamente puede eliminar sus
  // propias solicitudes, nada más.
  const isReadOnlyWarehouseAnalyst =
    userRoles.includes("ANALISTA_ALMACEN") &&
    !canDeleteAny &&
    !canSeeAllOptions;
  const isSuperUser = userRoles.includes("SUPERUSER");

  // Una solicitud no aprobada esta cerrada: el motivo del rechazo vive en su
  // observacion y debe perdurar. Solo queda el PDF; cambiarle la prioridad no
  // hace nada y borrarla se llevaria la constancia de por que se rechazo.
  const isRejected = req.status === "REJECTED";

  // Solo se borra mientras la solicitud es asunto de quien la creo. Desde
  // EN PROCESO ya hay compras trabajando sobre ella (y posibles cotizaciones
  // colgando), asi que sacarla de circulacion deja de ser decision del usuario
  // ordinario. REJECTED tampoco entra: queda como constancia.
  const isDeletableStatus =
    req.status === "CREATED" || req.status === "RECEIVED";

  const canDelete =
    isDeletableStatus &&
    (canDeleteAny || (isReadOnlyWarehouseAnalyst && isOwnRequisition));

  const canQuote =
    canSeeAllOptions && !(req.status === "APPROVED" || isRejected);

  // Borrador propio sin emitir en esta solicitud: cambia la acción de cotizar
  // por la de continuarlo. Solo lo trae el listado de compras, así que en "mis
  // solicitudes" queda undefined y el dropdown se comporta como siempre.
  const openDraftEditor = useOpenQuoteDraftEditor();

  // Sin editor montado (este dropdown también se usa en "mis solicitudes", que
  // no provee uno) la acción de editar borrador no se ofrece: mejor el botón de
  // cotizar de siempre que uno que no hace nada al pulsarlo.
  const ownDraft = openDraftEditor
    ? ((req as Requisition).my_quote_draft ?? null)
    : null;
  const canReject =
    canSeeAllOptions && !(isRejected || req.status === "APPROVED");
  const canChangePriorityStatus = !(
    req.status === "APPROVED" ||
    req.status === "QUOTED" ||
    isRejected
  );

  const run = (action: () => void) => () => {
    setOpenDropdown(false);
    action();
  };

  // Generar cotización · o editar borrador si ya hay uno abierto. Son la misma
  // ranura a propósito: con un borrador en curso no se puede empezar otra
  // cotización hasta emitirlo o descartarlo, así que ofrecer ambas acciones a
  // la vez solo invitaría al error.
  const actions = (
    <>
      {canQuote && (
        <RowAction
          inBar={inBar}
          icon={ownDraft ? FileClock : Receipt}
          tone={ownDraft ? "text-amber-600" : "text-emerald-600"}
          title="Generar cotización"
          hint={
            ownDraft
              ? "Editar borrador de cotización. Ya tiene uno abierto en esta solicitud: emítalo o descártelo para poder crear otra cotización."
              : undefined
          }
          onSelect={run(() => {
            if (ownDraft && openDraftEditor) {
              openDraftEditor(ownDraft.id);
              return;
            }
            setOpenConfirm(true);
          })}
        />
      )}

      {canReject && (
        <RowAction
          inBar={inBar}
          icon={ClipboardX}
          tone="text-orange-600"
          title="Rechazar solicitud"
          onSelect={run(() => setOpenReject(true))}
        />
      )}

      <RowAction
        inBar={inBar}
        icon={FileDown}
        tone="text-blue-600"
        title="Descargar PDF"
        onSelect={run(() => setOpenPdf(true))}
      />

      {canChangePriority && canChangePriorityStatus && (
        <RowAction
          inBar={inBar}
          icon={Tag}
          tone="text-amber-600"
          title="Cambiar prioridad"
          onSelect={run(() => setOpenPriority(true))}
        />
      )}

      {canDelete && (
        <RowAction
          inBar={inBar}
          icon={Trash2}
          tone="text-red-600"
          title="Eliminar solicitud"
          onSelect={run(() => setOpenDelete(true))}
        />
      )}

      {isSuperUser && (
        <RowAction
          inBar={inBar}
          icon={AlertOctagon}
          tone="text-red-700"
          title="Eliminar en cascada (SuperUser)"
          hint="Eliminar en cascada (SuperUser)"
          onSelect={run(() => setOpenCascadeDelete(true))}
        />
      )}
    </>
  );

  return (
    <TooltipProvider delayDuration={120}>
      <>
        {inBar ? (
          <RowActionsBar>{actions}</RowActionsBar>
        ) : (
          <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="
                  size-8
                  rounded-xl
                  border border-transparent
                  transition-all duration-200
                  hover:bg-muted/70
                  hover:border-border/50
                  hover:shadow-xs
                  data-[state=open]:bg-muted
                "
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="center"
              sideOffset={3}
              className="
                flex items-center justify-center gap-1.5
                rounded-2xl
                border border-border/50
                bg-background/90
                backdrop-blur-xl
                shadow-xl
                p-1.5
                overflow-visible
                animate-in fade-in zoom-in-95 duration-200
              "
            >
              {actions}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <RequisitionDropdownDialogs
          req={req}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openCascadeDelete={openCascadeDelete}
          setOpenCascadeDelete={setOpenCascadeDelete}
          openConfirm={openConfirm}
          setOpenConfirm={setOpenConfirm}
          openReject={openReject}
          setOpenReject={setOpenReject}
        />

        <DownloadRequisitionPdfDialog
          req={req}
          open={openPdf}
          onOpenChange={setOpenPdf}
        />

        {canChangePriority && (
          <UpdateRequisitionPriorityDialog
            req={req}
            open={openPriority}
            setOpen={setOpenPriority}
          />
        )}
      </>
    </TooltipProvider>
  );
};

export default RequisitionDropdownActions;
