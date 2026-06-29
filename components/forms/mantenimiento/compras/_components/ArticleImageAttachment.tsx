"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Paperclip, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MAX_IMAGE_SIZE_BYTES = 2048 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

interface Props {
  article: any;
  onChangeImage: (file: File | undefined) => void;
}

export const ArticleImageAttachment = ({ article, onChangeImage }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (!article.image) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato de imagen inválido. Solo se permiten archivos JPG o PNG.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("La imagen excede el límite de 2MB. Por favor, selecciona una más ligera.");
      e.target.value = "";
      return;
    }

    onChangeImage(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    onChangeImage(undefined);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      {article.image ? (
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                  >
                    <Paperclip className="size-3.5 text-primary" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                Ver / Cambiar imagen
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <PopoverContent className="w-[220px] p-3 space-y-2">
            <div className="relative w-full h-40">
              <Image
                src={article.image instanceof File ? URL.createObjectURL(article.image) : article.image}
                alt="Preview"
                fill
                className="rounded-md object-contain"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="destructive" onClick={handleRemoveImage}>
                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
              </Button>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                Cambiar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground"
                onClick={handleButtonClick}
              >
                <Paperclip className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Adjuntar imagen
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
};