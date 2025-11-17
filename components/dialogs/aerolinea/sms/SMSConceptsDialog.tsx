"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Concept {
  title: string;
  concept: string;
}

interface SMSConceptsDialogProps {
  concepts: Concept[];
  title: string;
  description: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SMSConceptsDialog({
  concepts,
  title,
  description,
  open,
  onOpenChange,
}: SMSConceptsDialogProps) {
  // Estado interno solo si no se proveen las props controladas
  const [internalOpen, setInternalOpen] = useState(false);

  // Usa el estado controlado si se pasan las props, sino usa el interno
  const isOpen = open !== undefined ? open : internalOpen;

  // Función para manejar el cambio de estado
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  // Colores sutiles para las cards (alternando)
  const cardColors = [
    "border-l-4 border-l-blue-200 dark:bg-blue-950/10 dark:border-l-blue-800",
    "border-l-4 border-l-green-200  dark:bg-green-950/10 dark:border-l-green-800",
    "border-l-4 border-l-purple-200  dark:bg-purple-950/10 dark:border-l-purple-800",
    "border-l-4 border-l-amber-200  dark:bg-amber-950/10 dark:border-l-amber-800",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2x">{title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {concepts.map((concept, index) => (
            <Card
              key={index}
              className={cn(
                "hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
                cardColors[index % cardColors.length] // Alterna colores
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {concept.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 text-justify leading-relaxed">
                  {concept.concept}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
