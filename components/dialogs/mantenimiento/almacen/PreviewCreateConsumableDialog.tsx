"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { parseISO, format } from "date-fns";

interface PreviewValues {
  part_number: string;
  alternative_part_number?: string[];
  batch_name?: string;
  condition_name?: string;
  manufacturer_name?: string;
  zone?: string;
  fabrication_date?: string | Date | null;
  caducate_date?: string | Date | null;
  quantity?: number;
  min_quantity?: number;
  secondarySelected?: { label: string };
  description?: string;
  has_documentation?: boolean;
  image?: { name?: string };
  certificate_8130?: { name?: string };
  certificate_fabricant?: { name?: string };
  certificate_vendor?: { name?: string };
}

interface PreviewProps {
  open: boolean;
  onClose: () => void;
  values: PreviewValues | null;
  onConfirm: (vals: PreviewValues) => void;
}

export default function PreviewCreateConsumableDialog({
  open,
  onClose,
  values,
  onConfirm,
}: PreviewProps) {
  if (!values) return null;

  const formatDate = (d?: string | Date | null) =>
    d ? format(typeof d === "string" ? parseISO(d) : d, "yyyy-MM-dd") : "No aplica";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Vista Previa del Consumible</DialogTitle>
          <DialogDescription>
            Verifique que toda la información sea correcta antes de registrar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Identificación principal */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-1">Identificación principal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PreviewRow label="Nro. de parte" value={values.part_number} />
              <PreviewRow label="Nro. de parte alternativo" value={values.alternative_part_number?.length ? values.alternative_part_number.join(", ") : "—"} />
              <PreviewRow label="Descripción del consumible" value={values.batch_name || "—"} />
            </div>
          </section>

          {/* Propiedades */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-1">Propiedades</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PreviewRow label="Condición" value={values.condition_name || "—"} />
              <PreviewRow label="Fabricante" value={values.manufacturer_name || "—"} />
              <PreviewRow label="Ubicación interna" value={values.zone || "—"} />
            </div>
          </section>

          {/* Fechas */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-1">Fechas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PreviewRow label="Fabricación" value={formatDate(values.fabrication_date)} />
              <PreviewRow label="Shelf-Life" value={formatDate(values.caducate_date)} />
            </div>
          </section>

          {/* Ingreso y cantidad */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-1">Ingreso y cantidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PreviewRow label="Método de ingreso" value={values.secondarySelected?.label || "—"} />
              <PreviewRow label="Cantidad" value={values.quantity ?? "—"} />
              <PreviewRow label="Cantidad mínima" value={values.min_quantity ?? "—"} />
            </div>
          </section>

          {/* Observaciones */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-1">Observaciones</h3>
            <div className="p-3 rounded-md bg-white border border-gray-200 text-sm whitespace-pre-wrap">
              {values.description || "—"}
            </div>
          </section>

          {/* Documentación */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-1">Documentación</h3>
            <PreviewRow label="¿Incluye documentación?" value={values.has_documentation ? "Sí" : "No"} />
            {values.has_documentation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <PreviewRow label="Imagen" value={values.image?.name || "Ninguna"} />
                <PreviewRow label="Certificado 8130" value={values.certificate_8130?.name || "Ninguno"} />
                <PreviewRow label="Certificado fabricante" value={values.certificate_fabricant?.name || "Ninguno"} />
                <PreviewRow label="Certificado vendedor" value={values.certificate_vendor?.name || "Ninguno"} />
              </div>
            )}
          </section>

        </div>

        <DialogFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Volver</Button>
          <Button className="bg-primary text-white hover:bg-blue-900" onClick={() => onConfirm(values)}>
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col p-2 rounded-md bg-white shadow-sm border border-gray-200">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
