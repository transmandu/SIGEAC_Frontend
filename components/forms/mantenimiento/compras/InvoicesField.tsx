"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { validateDocumentFile } from "@/lib/warehouse/documents";
import { FileText, ImageIcon, Paperclip, Plus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png";

/**
 * Una factura en edición: `id` presente si ya estaba guardada en el backend,
 * `file` presente si el usuario adjuntó o reemplazó el archivo en esta sesión.
 */
export interface InvoiceEntry {
  /** Clave estable para React — las facturas nuevas aún no tienen id. */
  key: string;
  id?: number;
  invoice_number: string;
  file?: File;
  /** Ruta del archivo ya guardado, cuando la factura viene del backend. */
  file_path?: string;
}

let entryCounter = 0;

export function createInvoiceEntry(): InvoiceEntry {
  // Contador propio en vez de crypto.randomUUID(): esa API no existe fuera de
  // un contexto seguro (p. ej. acceso por IP en HTTP), y solo hace falta una
  // clave estable dentro de este formulario.
  entryCounter += 1;

  return { key: `new-${entryCounter}`, invoice_number: "" };
}

const LABEL_CLS = "select-none text-[10px] leading-none text-muted-foreground uppercase";

const INPUT_CLS =
  "h-9 rounded-lg border-border/50 bg-background/80 text-sm shadow-sm transition-shadow focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:ring-offset-0";

function fileLabel(entry: InvoiceEntry) {
  if (entry.file) return entry.file.name;
  if (entry.file_path) return entry.file_path.split("/").pop() ?? "Archivo adjunto";
  return null;
}

function isPdf(name: string) {
  return name.toLowerCase().endsWith(".pdf");
}

interface InvoiceRowProps {
  entry: InvoiceEntry;
  onChange: (entry: InvoiceEntry) => void;
  onRemove: () => void;
}

function InvoiceRow({ entry, onChange, onRemove }: InvoiceRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const label = fileLabel(entry);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const error = validateDocumentFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    onChange({ ...entry, file });
  };

  return (
    <div className="flex items-end gap-2">
      <input
        type="file"
        ref={fileInputRef}
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="min-w-0 flex-1 space-y-1">
        <span className={LABEL_CLS}>Nro. Factura</span>
        <Input
          placeholder="INV-0001"
          className={INPUT_CLS}
          value={entry.invoice_number}
          onChange={(e) => onChange({ ...entry, invoice_number: e.target.value })}
        />
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "h-9 max-w-[190px] shrink-0 justify-start gap-1.5 rounded-lg border-border/50 bg-background/80 px-3 text-sm shadow-sm",
                label
                  ? "border-teal-500/30 bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 dark:text-teal-300"
                  : "text-muted-foreground"
              )}
            >
              {label ? (
                isPdf(label) ? <FileText className="size-4 shrink-0" /> : <ImageIcon className="size-4 shrink-0" />
              ) : (
                <Paperclip className="size-4 shrink-0" />
              )}
              <span className="truncate">{label ?? "Adjuntar"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label ? "Cambiar archivo" : "Adjuntar factura (imagen o PDF)"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRemove}
              className="h-9 w-9 shrink-0 rounded-lg border-border/50 bg-background/80 text-muted-foreground shadow-sm hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Quitar factura</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

interface InvoicesFieldProps {
  value: InvoiceEntry[];
  onChange: (entries: InvoiceEntry[]) => void;
}

export function InvoicesField({ value, onChange }: InvoicesFieldProps) {
  const updateAt = (index: number, entry: InvoiceEntry) =>
    onChange(value.map((item, i) => (i === index ? entry : item)));

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className={LABEL_CLS}>Facturas</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => onChange([...value, createInvoiceEntry()])}
        >
          <Plus className="size-3.5" />
          Agregar factura
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground">
          Sin facturas. Agregue una por cada factura recibida del proveedor.
        </p>
      ) : (
        <div className="space-y-2">
          {value.map((entry, index) => (
            <InvoiceRow
              key={entry.key}
              entry={entry}
              onChange={(next) => updateAt(index, next)}
              onRemove={() => removeAt(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
