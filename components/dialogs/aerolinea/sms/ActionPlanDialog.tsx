"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface ActionStep {
  title: string;
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-gray-900">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {actionSteps.map((step, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Número del paso */}
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>

                    {/* Contenido del paso */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>

                      <ol className="space-y-2">
                        {step.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex items-start text-gray-700"
                          >
                            <span className="text-blue-500 mr-3 mt-1 font-semibold">
                              {itemIndex + 1}.
                            </span>
                            <span className="text-sm leading-relaxed">
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
