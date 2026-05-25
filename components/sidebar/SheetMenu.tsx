"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { Menu } from "@/components/sidebar/Menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import CompanySelect from "../selects/CompanySelect";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/misc/Logo";

export function SheetMenu() {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button
          variant="outline"
          size="icon"
          className="
            h-8 w-8
            rounded-lg
            bg-background
            border border-border/60
            text-muted-foreground
            hover:text-foreground
            hover:bg-muted/40
            transition-all duration-200
          "
        >
          <MenuIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="sm:max-w-72 px-3 h-full flex flex-col"
      >
        {/* HEADER / LOGO SECTION */}
        <SheetHeader>
          <div className="flex justify-center items-center mt-4 mb-2 px-4 py-4 bg-background rounded-md">
            <Button
              variant="link"
              asChild
              className="w-full flex justify-center items-center"
            >
              <Link
                href={`/${selectedCompany?.slug ?? ""}/dashboard`}
                className="flex items-center justify-center"
              >
                <Logo width={120} height={120} />
              </Link>
            </Button>
          </div>
        </SheetHeader>

        {/* COMPANY SELECT */}
        <div className="mt-2">
          <CompanySelect />
        </div>

        {/* MENU / ESTADO */}
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