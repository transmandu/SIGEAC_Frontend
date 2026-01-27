"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Article, Batch } from "@/types";
import { useState } from "react";
import CreateConsumableForm from "./RegisterConsumableForm";
import CreateToolForm from "./RegisterToolForm";
import CreateComponentForm from "./RegisterComponentForm";
import CreatePartForm from "./RegisterPartForm";
import CreateGeneralArticleForm from "@/components/forms/mantenimiento/almacen/CreateGeneralArticleForm";


export interface EditingArticle extends Article {
  batches: Batch;
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
    caducate_date?: string | null;
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
    shelft_life_unit?: string;
  };
  consumable?: {
    lot_number?: string;
    caducate_date: string;
    fabrication_date: string | null;
    min_quantity?: number | string;
    quantity?: number;
    is_managed?: boolean | string | number;
    shelf_life?: number;
    shelft_life_unit?: string;
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
    initialData?.batches.category.toUpperCase() ?? "COMPONENTE"
  );
  function handleTypeSelect(data: string) {
    setType(data);
  }
  return (
    <div className="space-y-3 mb-4">
      <h1 className="font-bold text-3xl">
        {isEditing ? "Edicion de Articulo" : "Ingreso de Inventario"}
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
          <SelectItem value="COMPONENTE">COMPONENTE</SelectItem>
          <SelectItem value="HERRAMIENTA">HERRAMIENTA</SelectItem>
          <SelectItem value="PARTE">PARTE</SelectItem>
          <SelectItem value="GENERAL">GENERAL</SelectItem>
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
      {
        type === "GENERAL" && (
          <CreateGeneralArticleForm />
        )
      }
    </div>
  );
};
export default RegisterArticleForm;
