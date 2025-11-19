"use client";

import { useState } from "react";
// Asumiendo que estos son los imports correctos de tus componentes shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface ActionStep {
  title: string;
  role: string;
  items: string[];
}

interface ActionPlanDialogProps {
  title: string;
  actionSteps: ActionStep[];
  children: React.ReactNode;
}

export default function ActionPlanDialog({
  title,
  actionSteps,
  children,
}: ActionPlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Componente que activa el dialog */}
      <div onClick={() => setIsOpen(true)} className="cursor-pointer w-full">
        {children}
      </div>

      {/* Dialog con pasos de acción */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* Ajuste de Contenido del Diálogo: Ancho completo en móvil y scroll vertical */}
        <DialogContent className="w-[98vw] max-h-[85vh] overflow-y-auto m-2 p-2 md:max-w-2xl lg:max-w-4xl md:p-6">
          <DialogHeader>
            <DialogTitle className="text-md md:text-2xl text-center text-gray-900 p-5">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {actionSteps.map((step, index) => (
              <Card
                key={index}
                className="border-l-4 border-l-blue-500 shadow-md"
              >
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-start gap-2 md:gap-4">
                    {/* Círculo del número de paso (fijo) */}
                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm md:text-base">
                      {index + 1}
                    </div>


                    <div className="flex-1 min-w-0">

                      <h3 className="text-sx sm:text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-3 leading-tight">
                        {step.title}
                      </h3>

                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                        {step.role}
                      </span>

                      <ol className="space-y-2">
                        {step.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}

                            className="flex items-start text-gray-700 text-xs md:text-base"
                          >
                            {/* Número de ítem (fijo) */}
                            <span className="text-blue-500 mr-2 mt-0.5 font-bold flex-shrink-0">
                              {itemIndex + 1}.
                            </span>
                            <span className="leading-relaxed w-full break-words whitespace-normal">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
