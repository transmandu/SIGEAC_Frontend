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

interface FeatureCard {
  image: string;
  title: string;
  items: string[];
}

interface FeaturesDialogProps {
  features: FeatureCard[];
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FeaturesDialog({
  features,
  children,
  open,
  onOpenChange,
}: FeaturesDialogProps) {
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
    "border-l-4 border-l-green-200 dark:bg-green-950/10 dark:border-l-green-800",
    "border-l-4 border-l-purple-200 dark:bg-purple-950/10 dark:border-l-purple-800",
    "border-l-4 border-l-amber-200 dark:bg-amber-950/10 dark:border-l-amber-800",
  ];

  return (
    <>
      {/* El div que activa el dialog al hacer click */}
      <div onClick={() => handleOpenChange(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Responsabilidades SMS
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Conozca las responsabilidades del personal en materia de Sistema
              de Gestión de Seguridad
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={cn(
                  "hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full",
                  cardColors[index % cardColors.length]
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-center mb-2">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <CardTitle className="text-center text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                      >
                        <span className="text-blue-500 mr-2 mt-1 flex-shrink-0">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
