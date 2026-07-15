"use client";

import { useState } from "react";
import { ThirdParty } from "@/types";

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

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import ThirdPartyDropdownDialogs from "@/components/dialogs/general/ThirdPartyDropdownDialogs";

const iconBase =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110";

const itemBase = `
  group
  relative
  flex
  items-center
  justify-center
  size-9
  rounded-xl
  transition-all
  duration-200
  ease-out
  hover:bg-muted
  hover:shadow-sm
  active:scale-95
`;

interface Props {
  thirdParty: ThirdParty;
}

const ThirdPartyDropdownActions = ({ thirdParty }: Props) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

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
              data-tour="terceros-actions"
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
                      <Pencil className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Editar tercero</TooltipContent>
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
                    >
                      <Trash2 className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Eliminar tercero</TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThirdPartyDropdownDialogs
          thirdParty={thirdParty}
          openEdit={openEdit}
          setOpenEdit={setOpenEdit}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
        />
      </>
    </TooltipProvider>
  );
};

export default ThirdPartyDropdownActions;
