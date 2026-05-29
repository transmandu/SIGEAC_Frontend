"use client";

import { useState } from "react";
import Link from "next/link";

import {
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import { cn } from "@/lib/utils";

import { Menu } from "@/components/sidebar/Menu";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import CompanySelect from "../selects/CompanySelect";

import { useCompanyStore } from "@/stores/CompanyStore";

import Logo from "@/components/misc/Logo";

export function SheetMenu() {
  const { selectedCompany, selectedStation } =
    useCompanyStore();

  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden" asChild>
        <motion.button
          whileTap={{
            scale: 0.92,
          }}
          transition={{
            duration: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "relative flex items-center justify-center",
            "h-9 w-9 rounded-lg",
            "bg-background",
            "border border-border/70",
            "text-foreground/80",
            "hover:text-foreground",
            "hover:bg-muted/60",
            "hover:border-border",
            "transition-colors duration-200",
            "shadow-sm"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="close"
                initial={{
                  opacity: 0,
                  rotate: -90,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  rotate: 90,
                  scale: 0.8,
                }}
                transition={{
                  duration: 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute"
              >
                <PanelLeftClose className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{
                  opacity: 0,
                  rotate: 90,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  rotate: -90,
                  scale: 0.8,
                }}
                transition={{
                  duration: 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="sm:max-w-72 px-3 h-full flex flex-col"
      >
        {/* HEADER */}
        <SheetHeader>
          <div className="flex justify-center items-center mt-4 mb-2 px-4 py-4 bg-background rounded-md">
            <Link
              href={`/${selectedCompany?.slug ?? ""}/dashboard`}
              className="flex items-center justify-center"
            >
              <Logo width={120} height={120} />
            </Link>
          </div>
        </SheetHeader>

        {/* COMPANY SELECT */}
        <div className="mt-2">
          <CompanySelect />
        </div>

        {/* MENU / STATE */}
        {selectedCompany && selectedStation ? (
          <Menu isOpen />
        ) : (
          <p className="text-sm text-muted-foreground text-center mt-10">
            Por favor, seleccione una <strong>Empresa</strong> y una{" "}
            <strong>Estacion</strong>.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}