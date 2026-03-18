'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Requisition } from "@/types";
import { CreateQuoteForm } from "@/components/forms/mantenimiento/compras/CreateQuoteForm";

interface GenerateQuoteDialogProps {
  req: Requisition;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const GenerateQuoteDialog = ({
  req,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: GenerateQuoteDialogProps) => {
  const [open, setOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;

  const handleOpenChange = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange!(value);
    } else {
      setOpen(value);
    }
  };

  return (
    <Dialog open={isControlled ? controlledOpen : open} onOpenChange={handleOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className={cn(
                  "h-9 w-9",
                  "transition-all duration-200",
                  "hover:scale-105 active:scale-95"
                )}
              >
                <Receipt className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            Generar Cotización
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="flex flex-col items-center text-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            <Receipt className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">
            Generar cotización
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Complete la información necesaria para generar la cotización de la requisición.
          </p>
        </DialogHeader>

        <CreateQuoteForm req={req} onClose={() => handleOpenChange(false)} />

        <DialogFooter className="flex gap-2 sm:justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateQuoteDialog;