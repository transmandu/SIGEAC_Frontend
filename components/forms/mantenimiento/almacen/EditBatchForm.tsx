"use client";

import SelectBatchCategory from "@/components/selects/SelectBatchCategory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Batch } from "@/types";
import { useState } from "react";
import { CreateBatchForm } from "./CreateBatchForm";

interface EditBatchFormProps {
  onClose: () => void;
  onSuccess: (batchName: string) => void;
}

export function EditBatchForm({ onClose, onSuccess }: EditBatchFormProps) {
  const [batchToEdit, setBatchToEdit] = useState<Batch | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditBatch = (batch: Batch) => {
    if (isEditDialogOpen) return; // evita abrir múltiples modales
    setBatchToEdit(batch);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setBatchToEdit(null);
  };

  const handleEditSuccess = (batchName: string) => {
    onSuccess(batchName);
    handleCloseEditDialog();
  };

  return (
    <div className="space-y-4">
      {/* Selector de batch para editar */}

      <SelectBatchCategory isEditing={true} onEditBatch={handleEditBatch} />

      {/* Acciones */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>

      {/* Diálogo para editar batch */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Batch: {batchToEdit?.name || `ID: ${batchToEdit?.id}`}
            </DialogTitle>
          </DialogHeader>

          {batchToEdit && (
            <CreateBatchForm
              isEditing={true}
              initialData={batchToEdit}
              onClose={handleCloseEditDialog}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
