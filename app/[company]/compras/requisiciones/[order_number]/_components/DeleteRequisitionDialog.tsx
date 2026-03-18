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
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteRequisitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  status?: string;
}

const DeleteRequisitionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
  status
}: DeleteRequisitionDialogProps) => {

  if (status === "APROBADO") return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className={cn(
                  "h-9 w-9",
                  "transition-all duration-200",
                  "hover:scale-105 active:scale-95"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>

          <TooltipContent>
            Eliminar Orden de Compra
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center gap-3">

          <div className="bg-red-100 text-red-600 p-3 rounded-full">
            <Trash2 className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-semibold">
            Eliminar requisición
          </h2>

          <p className="text-sm text-muted-foreground max-w-sm">
            Esta acción no se puede deshacer. La requisición será eliminada permanentemente.
          </p>

        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:justify-center mt-4">

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            variant="destructive"
            className="min-w-[120px]"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin size-4 mr-2" />}
            Eliminar
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRequisitionDialog;