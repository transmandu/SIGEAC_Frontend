"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import CreateErrorReportDialog from "@/components/dialogs/sistema/CreateErrorReportDialog";

export default function ErrorReportTrigger() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const isSuperUser = user?.roles?.some((role) => role.name === "SUPERUSER");

  const handleClick = () => {
    if (isSuperUser) {
      router.push("/sistema/reportes");
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              aria-label="Reportar un problema"
              className={cn(
                "relative flex items-center justify-center",
                "h-9 w-9 rounded-full",
                "bg-background",
                "border border-border/80",
                "text-foreground/90",
                "hover:text-foreground",
                "hover:bg-muted/70",
                "hover:border-border",
                "transition-all duration-200",
                "active:scale-95"
              )}
            >
              <TriangleAlert className="h-4 w-4" />
            </button>
          </TooltipTrigger>

          <TooltipContent side="bottom" className="z-[1001]">
            {isSuperUser ? "Gestión de reportes" : "Reportar un problema"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CreateErrorReportDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
