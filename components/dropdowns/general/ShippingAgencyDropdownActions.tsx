"use client";

import { useState } from "react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ShippingAgency } from "@/types";

import {
  useUpdateShippingAgency,
  useDeleteShippingAgency,
} from "@/actions/ajustes/globales/agencias_envio/actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit3, Trash2, Loader2 } from "lucide-react";

import ShippingAgencyDropdownDialogs from "@/components/dialogs/general/ShippingAgencyDropdownDialogs";

const iconBase =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110";

const itemBase = `
  group
  flex items-center justify-center
  size-9
  rounded-xl
  transition-all duration-200 ease-out
  hover:bg-muted hover:shadow-sm
  active:scale-95
`;

const ShippingAgencyDropdownActions = ({
  agency,
}: {
  agency: ShippingAgency;
}) => {
  const { selectedCompany } = useCompanyStore();

  const updateMutation = useUpdateShippingAgency(selectedCompany?.slug);
  const deleteMutation = useDeleteShippingAgency(selectedCompany?.slug);

  const [openDropdown, setOpenDropdown] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  if (!selectedCompany) return null;

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(agency.id);
    setOpenDelete(false);
  };

  const handleUpdate = async (data: any) => {
    await updateMutation.mutateAsync({
      ...data,
      id: agency.id,
    });
    setOpenEdit(false);
  };

  const isDeleting = deleteMutation.status === "pending";

  return (
    <TooltipProvider delayDuration={120}>
      <>
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
                hover:shadow-sm
                data-[state=open]:bg-muted
              "
              data-tour="agencias-envio-actions"
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
              animate-in fade-in zoom-in-95 duration-200
              overflow-visible
            "
          >
            {/* EDIT */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem
                    asChild
                    className="p-0 focus:bg-transparent"
                  >
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        setOpenEdit(true);
                      }}
                      className={`${itemBase} text-blue-600`}
                    >
                      <Edit3 className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Editar agencia</TooltipContent>
            </Tooltip>

            {/* DELETE */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem
                    asChild
                    className="p-0 focus:bg-transparent"
                  >
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        setOpenDelete(true);
                      }}
                      className={`${itemBase} text-red-600`}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className={`${iconBase} animate-spin`} />
                      ) : (
                        <Trash2 className={iconBase} />
                      )}
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Eliminar agencia</TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dialogs separados (igual patrón base) */}
        <ShippingAgencyDropdownDialogs
          agency={agency}
          openEdit={openEdit}
          setOpenEdit={setOpenEdit}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
        />
      </>
    </TooltipProvider>
  );
};

export default ShippingAgencyDropdownActions;
