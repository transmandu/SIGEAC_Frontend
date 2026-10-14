"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Condition } from "@/types";

import { useDeleteCondition } from "@/actions/aerolinea/almacen/condiciones_articulos/actions";
import UpdateConditionForm from "@/components/forms/ajustes/UpdateConditionForm";

type Props = {
  condition: Condition;

  openEdit: boolean;
  setOpenEdit: (open: boolean) => void;

  openDelete: boolean;
  setOpenDelete: (open: boolean) => void;
};

const dialogClass =
  "sm:max-w-[390px] rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0";

const ConditionDropdownDialogs = ({
  condition,
  openEdit,
  setOpenEdit,
  openDelete,
  setOpenDelete,
}: Props) => {
  const { deleteCondition } = useDeleteCondition();

  const handleDelete = async () => {
    try {
      await deleteCondition.mutateAsync(condition.id);
      setOpenDelete(false);
    } catch {
      // El aviso lo muestra la mutación; el diálogo queda abierto.
    }
  };

  return (
    <>
      {/* =========================
          EDIT CONDITION
      ========================= */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Editar condición</DialogTitle>
            <DialogDescription>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">
                {condition.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <UpdateConditionForm
            condition={condition}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* =========================
          DELETE CONDITION
      ========================= */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className={dialogClass}>
          <DialogHeader className="px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3">
            <div
              className="
                flex items-center justify-center
                size-12 rounded-2xl
                border border-red-500/15
                bg-red-500/8
              "
            >
              <AlertTriangle className="size-5 text-red-600" />
            </div>

            <DialogTitle className="text-[16px] font-semibold tracking-tight">
              Eliminar condición
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
              Vas a eliminar la condición{" "}
              <span className="font-medium text-foreground">
                {condition.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mx-6 mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-600 flex gap-2 leading-relaxed">
            <AlertTriangle className="size-4 mt-0.5" />
            <div>
              Esta acción es <b>irreversible</b> y eliminará permanentemente el
              registro del sistema.
            </div>
          </div>

          <div className="px-6 pb-6 pt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              className="
                rounded-xl
                border border-border/60
                bg-background
                hover:bg-muted
                text-muted-foreground
                hover:text-foreground
              "
            >
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCondition.isPending}
              className="
                rounded-xl
                bg-red-600/90
                hover:bg-red-600
              "
            >
              {deleteCondition.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConditionDropdownDialogs;
