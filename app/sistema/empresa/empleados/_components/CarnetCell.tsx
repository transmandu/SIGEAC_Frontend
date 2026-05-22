"use client";

import { Download, User } from "lucide-react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  photoUrl?: string | null;
}

export function CarnetCell({ photoUrl }: Props) {
  const { user } = useAuth();

  const hasPhoto = typeof photoUrl === "string" && photoUrl.length > 0;

  const roleNames = user?.roles?.map((r) => r.name) || [];

  const isSuperUser = roleNames.includes("SUPERUSER");

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!photoUrl) return;

    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "carnet.jpg";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading image:", err);
    }
  };

  if (!hasPhoto) {
    return (
      <div className="flex justify-center">
        <User className="w-5 h-5 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <TooltipProvider>
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center hover:scale-105 transition"
                >
                  <User className="w-5 h-5 text-foreground" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>

            <TooltipContent>
              Ver carnet
            </TooltipContent>
          </Tooltip>

          <PopoverContent className="p-2 w-44 h-44 flex items-center justify-center relative">
            <div
              className="relative w-full h-full bg-white dark:bg-muted rounded-md overflow-hidden"
              onContextMenu={(e) => e.preventDefault()}
            >
              <Image
                src={photoUrl}
                alt="Carnet del empleado"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {isSuperUser && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleDownload}
                      aria-label="Descargar imagen"
                      className="
                        absolute top-1 right-1
                        flex items-center justify-center
                        w-7 h-7
                        rounded-md
                        border border-border
                        bg-background/80
                        backdrop-blur-md
                        text-foreground
                        shadow-sm
                        hover:bg-muted
                        hover:scale-105
                        active:scale-95
                        transition
                      "
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>

                  <TooltipContent side="top">
                    Descargar imagen
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  );
}