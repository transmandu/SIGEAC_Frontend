"use client";

import { useScale } from "@/contexts/scale/ScaleContext";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScaleCaptureResult } from "@/lib/scale/scale.types";

interface ScaleButtonProps {
  onCapture: (result: ScaleCaptureResult) => void;
  className?: string;
}

export function ScaleButton({ onCapture, className }: ScaleButtonProps) {
  const { state, captureStableWeight } = useScale();

  const handleClick = () => {
    if (state.status !== "connected") {
      toast.warning("Balanza no conectada", {
        description: "Conecte la balanza antes de capturar el peso.",
      });
      return;
    }

    if (!state.isStable) {
      toast.info("Peso inestable", {
        description: "Espere a que el indicador se ponga verde.",
      });
      return;
    }

    const result = captureStableWeight();
    if (result) {
      onCapture(result);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 transition-colors",
        state.status === "connected" && state.isStable
          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={handleClick}
      title="Capturar peso de balanza"
    >
      <Scale className="h-4 w-4" />
    </Button>
  );
}
