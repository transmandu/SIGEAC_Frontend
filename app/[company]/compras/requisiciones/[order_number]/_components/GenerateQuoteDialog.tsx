'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import {
  CreateQuoteForm,
  QuoteableRequisition,
} from "@/components/forms/mantenimiento/compras/CreateQuoteForm";
import { DialogTrigger } from "@radix-ui/react-dialog";

interface GenerateQuoteDialogProps {
  req: QuoteableRequisition;
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
          <TooltipContent>Generar cotización</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">
                Generar cotización
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Req. <span className="font-mono">{req.order_number}</span>
                {" · "}
                {req.requested_by}
              </p>
            </div>
          </div>
        </DialogHeader>

        <CreateQuoteForm
          req={req}
          onClose={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GenerateQuoteDialog;
