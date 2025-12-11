"use client";

import { Article, Batch, Convertion } from "@/types";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import CreateComponentForm from "@/app/[company]/almacen/ingresar_inventario/_components/RegisterComponentForm";
import CreateConsumableForm from "@/app/[company]/almacen/ingresar_inventario/_components/RegisterConsumableForm";
import CreateToolForm from "@/app/[company]/almacen/ingresar_inventario/_components/RegisterToolForm";

export interface EditingArticle extends Article {
  batches: Batch;
  certificate_8130?: string;
  certificate_vendor?: string;
  certificate_fabricant?: string;
  tool?: {
    id: number;
    serial: string;
    isSpecial: boolean;
    needs_calibration: boolean;
    calibration_date?: string;
    next_calibration?: string | number;
    article_id: number;
  };
  component?: {
    id: number;
    article_id: string;
    caducate_date: string | null;
    fabrication_date: string | null;
    hour_date: string | null;
    cycle_date: string | null;
    calendary_date: string | null;
  };
  consumable?: {
    lot_number?: string;
    caducate_date: string;
    fabrication_date: string;
    min_quantity?: number | string;
    quantity?: number;
    is_managed?: boolean | string | number;
  };
  has_documentation?: boolean;
}

interface IRegisterArticleProps {
  isEditing?: boolean;
  initialData?: EditingArticle;
  category?: string;
}

const RegisterArticleForm = ({
  isEditing = false,
  initialData,
}: IRegisterArticleProps) => {
  const [type, setType] = useState(
    initialData?.batches.category.toLowerCase() ?? "componente"
  );
  function handleTypeSelect(data: string) {
    setType(data);
  }
  return (
    <div className="space-y-3 mb-4">
      <h1 className="font-bold text-3xl">
        {isEditing ? "Edicion de Articulo" : "Carga de Articulo"}
      </h1>
      {!isEditing && (
        <p className="text-sm text-muted-foreground">
          Seleccione el tipo de articulo a registrar:
        </p>
      )}
      <Select
        disabled={isEditing}
        value={type}
        onValueChange={handleTypeSelect}
      >
        <SelectTrigger className="w-[230px]">
          <SelectValue placeholder="Seleccionar..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="consumible">Consumible</SelectItem>
          <SelectItem value="herramienta">Herramienta</SelectItem>
          <SelectItem value="componente">Componente</SelectItem>
        </SelectContent>
      </Select>
      {type === "consumible" && (
        <CreateConsumableForm isEditing={isEditing} initialData={initialData} />
      )}
      {type === "herramienta" && (
        <CreateToolForm isEditing={isEditing} initialData={initialData} />
      )}
      {type === "componente" && (
        <CreateComponentForm isEditing={isEditing} initialData={initialData} />
      )}
    </div>
  );
};
export default RegisterArticleForm;
