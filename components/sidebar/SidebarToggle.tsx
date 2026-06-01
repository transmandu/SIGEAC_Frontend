"use client";

import { PanelLeft } from "lucide-react";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen?: () => void;
}

export function SidebarToggle({
  isOpen,
  setIsOpen,
}: SidebarToggleProps) {
  return (
    <div className="hidden lg:flex absolute top-3 -right-3 z-20">
      <motion.button
        whileHover={{
          scale: 1.04,
          y: -1,
        }}
        whileTap={{
          scale: 0.94,
        }}
        transition={{
          duration: 0.18,
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={() => setIsOpen?.()}
        aria-label="Toggle sidebar"
        className={cn(
          "relative flex items-center justify-center",
          "h-8 w-8 rounded-lg",
          "bg-background",
          "border border-border/70",
          "text-foreground/75",
          "hover:text-foreground",
          "hover:bg-muted/60",
          "hover:border-border",
          "shadow-sm",
          "transition-colors duration-200"
        )}
      >
        <motion.div
          animate={{
            rotate: isOpen === false ? 180 : 0,
            scale: isOpen === false ? 0.92 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
        >
          <PanelLeft className="h-4 w-4" />
        </motion.div>
      </motion.button>
    </div>
  );
}