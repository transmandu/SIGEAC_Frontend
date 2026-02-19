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
import CreateToolForm from "@/app/[company]/almacen/ingresar_inventario/_components/RegisterToolForm";
import CreateComponentForm from "@/app/[company]/almacen/ingresar_inventario/_components/RegisterComponentForm";
import CreatePartForm from "@/app/[company]/almacen/ingresar_inventario/_components/RegisterPartForm";
import CreateConsumableForm from "@/app/[company]/almacen/ingresar_inventario/_components/RegisterConsumableForm";

export interface EditingArticle extends Article {
  batch: Batch;
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
  part_component?: {
    id: number;
    article_id: string;
    expiration_date?: string | null;
    fabrication_date: string | null;
    hour_date: string | null;
    cycle_date: string | null;
    calendary_date: string | null;
    life_limit_part_calendar?: string;
    life_limit_part_hours?: string | number;
    life_limit_part_cycles?: string | number;

    hard_time_calendar?: string;
    hard_time_hours?: string | number;
    hard_time_cycles?: string | number;

    shelf_life?: number;
    shelf_life_unit?: string;
  };
  consumable?: {
    lot_number?: string;
    expiration_date: string;
    fabrication_date: string | null;
    min_quantity?: number | string;
    quantity?: number;
    is_managed?: boolean | string | number;
    shelf_life?: string | null;
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
    initialData?.batch.category.toUpperCase() ?? "COMPONENTE"
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
          <SelectItem value="CONSUMIBLE">CONSUMIBLE</SelectItem>
          <SelectItem value="HERRAMIENTA">HERRAMIENTA</SelectItem>
          <SelectItem value="COMPONENTE">COMPONENTE</SelectItem>
          <SelectItem value="PARTE">PARTE</SelectItem>
        </SelectContent>
      </Select>
      {type === "CONSUMIBLE" && (
        <CreateConsumableForm isEditing={isEditing} initialData={initialData} />
      )}
      {type === "HERRAMIENTA" && (
        <CreateToolForm isEditing={isEditing} initialData={initialData} />
      )}
      {type === "COMPONENTE" && (
        <CreateComponentForm isEditing={isEditing} initialData={initialData} />
      )}
      {type === "PARTE" && (
        <CreatePartForm isEditing={isEditing} initialData={initialData} />
      )}
    </div>
  );
};
export default RegisterArticleForm;
