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
  const { user } = useAuth();

  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
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