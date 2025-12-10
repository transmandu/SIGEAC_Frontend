"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ToolArticle } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface DialogProps {
  tools?: {
    article: ToolArticle;
    serial: string;
  }[];
  name: string;
}

const ToolBoxToolsDialog = ({ tools, name }: DialogProps) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Ver Herramientas</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="mx-auto w-full max-w-md">
          <DialogHeader className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <DialogTitle>Herramientas para: {name}</DialogTitle>
              <DialogDescription>
                Aquí puede ver las herramientas para:{" "}
                <span className="italic font-bold">
                  {name.toLocaleLowerCase()}
                </span>
                .
              </DialogDescription>
            </div>
            <Image
              src={"/LOGO_TRD.png"}
              className="w-[70px] h-[70px]"
              width={70}
              height={70}
              alt="logo"
            />
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {tools?.map((tool) => (
              <div key={tool.serial} className="flex flex-col items-center">
                <h1 className="text-lg font-bold">
                  {tool.article.batches?.name}
                </h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-muted-foreground italic cursor-pointer hover:text-black">
                        PN: {tool.article.part_number} - {tool.article.serial}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      {tool.article.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/${tool.article.image}`}
                          alt="Imagen de articulo"
                          width={100}
                          height={100}
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm italic">
                          No hay imagen disponible...
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolBoxToolsDialog;
