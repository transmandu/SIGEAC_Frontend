"use client";

import { User } from "lucide-react";
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

interface Props {
  photoUrl?: string | null;
}

export function CarnetCell({ photoUrl }: Props) {
  const hasPhoto = typeof photoUrl === "string" && photoUrl.length > 0;

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
                  onClick={(e) => e.stopPropagation()} // 🔴 FIX CLAVE
                  className={cn(
                    "flex items-center justify-center hover:scale-105 transition"
                  )}
                >
                  <User className="w-5 h-5 text-foreground" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>

            <TooltipContent>
              Presione para ver imagen
            </TooltipContent>
          </Tooltip>

          <PopoverContent className="p-2 w-44 h-44 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={photoUrl}
                alt="Carnet del empleado"
                fill
                className="rounded-md object-contain bg-white p-1"
                unoptimized
              />
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  );
}