"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSerialInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxSerials?: number;
}

export function MultiSerialInput({
  values = [],
  onChange,
  disabled = false,
  placeholder = "Ej: 05458E1",
  maxSerials = 50, // Límite por defecto de 50 seriales
}: MultiSerialInputProps) {
  const [currentValue, setCurrentValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSerials, setEditingSerials] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Verificar si se alcanzó el límite
  const isLimitReached = values.length >= maxSerials;

  // Función para agregar un serial
  const handleAddSerial = () => {
    if (isLimitReached) return;

    const trimmedValue = currentValue.trim().toUpperCase();
    if (trimmedValue && !values.includes(trimmedValue)) {
      onChange([...values, trimmedValue]);
      setCurrentValue("");
    }
  };

  // Manejar Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isLimitReached) {
        handleAddSerial();
      }
    }
  };

  // Abrir modal con los seriales actuales
  const handleOpenModal = () => {
    setEditingSerials([...values]);
    setIsModalOpen(true);
  };

  // Eliminar un serial del modal
  const handleDeleteSerial = (index: number) => {
    const newSerials = editingSerials.filter((_, i) => i !== index);
    setEditingSerials(newSerials);
  };

  // Iniciar edición de un serial
  const handleStartEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(editingSerials[index]);
  };

  // Guardar edición de un serial
  const handleSaveEdit = () => {
    if (editIndex !== null && editValue.trim()) {
      const newSerials = [...editingSerials];
      newSerials[editIndex] = editValue.trim().toUpperCase();
      setEditingSerials(newSerials);
      setEditIndex(null);
      setEditValue("");
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
  };

  // Guardar cambios del modal
  const handleSaveChanges = () => {
    // Asegurarse de no exceder el límite al guardar
    const serialsToSave = editingSerials.slice(0, maxSerials);
    onChange(serialsToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="flex gap-2 w-full">
      <div className="flex-1 relative">
        <Input
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLimitReached
              ? `Límite alcanzado (${maxSerials})`
              : `${placeholder} (${values.length}/${maxSerials})`
          }
          disabled={disabled || isLimitReached}
          className="pr-10"
        />
        {isLimitReached && (
          <div className="absolute -bottom-6 left-0 text-xs text-amber-600 font-medium">
            Máximo {maxSerials} seriales permitidos
          </div>
        )}
      </div>

      {/* Botón contador (izquierda) */}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn(
          "min-w-[60px] font-semibold relative",
          values.length > 0 && "bg-primary/10 border-primary text-primary",
          isLimitReached && "bg-amber-100 border-amber-300 text-amber-700"
        )}
      >
        {values.length}
        <span className="absolute -top-1 -right-1 text-[10px] bg-muted rounded-full w-4 h-4 flex items-center justify-center">
          {maxSerials}
        </span>
      </Button>

      {/* Botón ver/editar (derecha) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || values.length === 0}
            onClick={handleOpenModal}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Seriales registrados ({editingSerials.length}/{maxSerials})
            </DialogTitle>
            <DialogDescription>
              {isLimitReached ? (
                <span className="text-amber-600 font-medium">
                  Límite máximo de {maxSerials} seriales alcanzado
                </span>
              ) : (
                "Revisa y edita los seriales registrados. Puedes eliminar o modificar cualquier entrada."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {editingSerials.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No hay seriales registrados
              </div>
            ) : (
              editingSerials.map((serial, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm font-medium text-muted-foreground min-w-[30px]">
                    {index + 1}.
                  </span>

                  {editIndex === index ? (
                    <>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveEdit();
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveEdit}
                        variant="default"
                      >
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCancelEdit}
                        variant="ghost"
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <span
                        className="flex-1 font-mono cursor-pointer hover:text-primary"
                        onClick={() => handleStartEdit(index)}
                      >
                        {serial}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleStartEdit(index)}
                        variant="ghost"
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSerial(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {editingSerials.length} de {maxSerials} seriales utilizados
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleSaveChanges}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
