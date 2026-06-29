"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: 1 | 2;
  step1Label?: string;
  step2Label?: string;
}

export function StepIndicator({
  currentStep,
  step1Label = "Datos de la Actividad",
  step2Label = "Contenido Asociado",
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      <div className="flex items-center">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold border",
            currentStep >= 1
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {currentStep > 1 ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          ) : (
            "1"
          )}
        </div>
        <span
          className={cn(
            "ml-2 text-xs font-medium whitespace-nowrap",
            currentStep >= 1
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {step1Label}
        </span>
      </div>

      <div
        className={cn(
          "w-16 h-px mx-3",
          currentStep >= 2 ? "bg-primary" : "bg-border"
        )}
      />

      <div className="flex items-center">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold border",
            currentStep >= 2
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {currentStep > 2 ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          ) : (
            "2"
          )}
        </div>
        <span
          className={cn(
            "ml-2 text-xs font-medium whitespace-nowrap",
            currentStep >= 2
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {step2Label}
        </span>
      </div>
    </div>
  );
}
