'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BackButtonProps {
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "link";
  iconOnly?: boolean;
  tooltip?: string;
  fallbackHref?: string;
  className?: string;
}

export default function BackButton({
  label = "Volver",
  variant = "secondary", // más visible que ghost
  iconOnly = false,
  tooltip,
  fallbackHref = "/",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  const button = (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon" : "default"}
      onClick={handleBack}
      className={`flex items-center justify-center gap-2 rounded-full shadow-sm transition-all duration-200 ease-in-out ${className}`}
    >
      <ArrowLeft className={iconOnly ? "h-5 w-5" : "h-4 w-4"} />
      {!iconOnly && label}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}