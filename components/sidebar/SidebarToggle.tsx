import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen?: () => void;
}

export function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <button
      onClick={() => setIsOpen?.()}
      className={cn(
        "absolute top-3 -right-3 z-20",
        "flex items-center justify-center",
        "h-8 w-8 rounded-lg",
        "bg-background border border-border/60",
        "text-muted-foreground",
        "hover:text-foreground hover:bg-muted/40",
        "transition-all duration-200"
      )}
      aria-label="Toggle sidebar"
    >
      <PanelLeft
        className={cn(
          "h-4 w-4 transition-transform duration-300",
          isOpen === false && "rotate-180"
        )}
      />
    </button>
  );
}