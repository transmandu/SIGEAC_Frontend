"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { GuestMenu } from "@/components/sidebar/GuestMenu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

export function GuestSheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-[40px]"
            variant="link"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Image src={"/logo.png"} width={150} height={150} alt="Logo" />
            </Link>
          </Button>
        </SheetHeader>
        <GuestMenu isOpen />
      </SheetContent>
    </Sheet>
  );
}