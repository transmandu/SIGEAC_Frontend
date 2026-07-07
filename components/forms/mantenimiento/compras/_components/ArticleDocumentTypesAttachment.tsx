"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetArticleDocumentTypes } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDocumentTypes";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Check, FileBadge } from "lucide-react";

interface Props {
  selectedIds?: number[];
  onChange: (ids: number[]) => void;
  invalid?: boolean;
}

/**
 * Selector compacto (icono + popover) de los tipos de documento que deben
 * solicitarse al vendedor para un ítem de requisición. Solo registra la
 * expectativa de compra: aquí no se suben archivos.
 */
export const ArticleDocumentTypesAttachment = ({ selectedIds, onChange, invalid = false }: Props) => {
  const { selectedCompany } = useCompanyStore();
  const { data: documentTypes, isLoading } = useGetArticleDocumentTypes(selectedCompany?.slug);

  const ids = selectedIds ?? [];

  const toggle = (typeId: number) => {
    onChange(
      ids.includes(typeId)
        ? ids.filter((id) => id !== typeId)
        : [...ids, typeId]
    );
  };

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isLoading}
                className={cn(
                  "h-7 w-7 shrink-0 relative",
                  ids.length > 0
                    ? "text-primary"
                    : invalid
                      ? "text-destructive"
                      : "text-muted-foreground"
                )}
              >
                <FileBadge className="size-3.5" />
                {ids.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                    {ids.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs px-2 py-1">
            {invalid
              ? "Documentos a solicitar al vendedor (obligatorio: seleccione al menos uno)"
              : "Documentos a solicitar al vendedor"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Buscar tipo de documento..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Cargando..." : "No se encontraron tipos de documento"}
            </CommandEmpty>
            <CommandGroup heading="Documentación requerida del vendedor">
              {documentTypes?.map((type) => (
                <CommandItem
                  key={type.id}
                  value={type.name}
                  onSelect={() => toggle(type.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      ids.includes(type.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs">{type.name}</span>
                    {type.regulation && (
                      <span className="text-[10px] text-muted-foreground">
                        {type.regulation}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
