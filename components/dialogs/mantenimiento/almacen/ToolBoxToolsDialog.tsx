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
import {
  INDIVIDUAL_STATUS_LABEL,
  type ToolBoxIndividual,
} from "@/types/general-article-individual";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface DialogProps {
  tools?: {
    article: ToolArticle;
    serial: string;
  }[];
  /** Herramientas de ferretería identificadas que guarda la caja. */
  individuals?: ToolBoxIndividual[];
  name: string;
}

const ToolBoxToolsDialog = ({ tools, individuals, name }: DialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
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
              className="w-17.5 h-17.5"
              width={70}
              height={70}
              alt="logo"
            />
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {tools?.map((tool, index) => (
              <div
                key={tool.article.id ?? `${tool.serial}-${index}`}
                className="flex flex-col items-center"
              >
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
          {individuals && individuals.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 border-t pt-3">
              <p className="text-center text-sm font-semibold">
                Herramientas de ferretería
              </p>
              {individuals.map((piece) => (
                <div key={piece.id} className="flex flex-col items-center">
                  <p className="text-sm font-medium">
                    {piece.general_article?.description}
                  </p>
                  <p className="text-muted-foreground italic">
                    {piece.identifier}
                    {piece.status !== "INTOOLBOX" &&
                      ` · ${INDIVIDUAL_STATUS_LABEL[piece.status]}`}
                  </p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolBoxToolsDialog;
