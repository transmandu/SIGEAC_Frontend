"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import CreateErrorReportDialog from "@/components/dialogs/sistema/CreateErrorReportDialog";
import { ERROR_REPORT_VISIBLE_TO_NORMAL_USERS } from "@/lib/errorReportModules";

export default function ErrorReportTrigger() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const isSuperUser = user?.roles?.some((role) => role.name === "SUPERUSER");

  if (!isSuperUser && !ERROR_REPORT_VISIBLE_TO_NORMAL_USERS) {
    return null;
  }

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
            <motion.button
              initial="rest"
              whileHover="hover"
              onClick={handleClick}
              aria-label="Reportar un problema"
              className={cn(
                "glass-control",
                "relative flex items-center justify-center",
                "size-9 rounded-full",
                "border",
                "text-foreground/90",
                "hover:text-foreground",
                "active:scale-95",
                open && "bg-muted/60"
              )}
            >
              <motion.span
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.12, rotate: -8 },
                }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex"
              >
                <HeartHandshake className="size-4" />
              </motion.span>
            </motion.button>
          </TooltipTrigger>

          <TooltipContent side="bottom" className="z-1001">
            {isSuperUser ? "Gestión de reportes de SIGEAC" : "Reportar un problema a IT"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CreateErrorReportDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
