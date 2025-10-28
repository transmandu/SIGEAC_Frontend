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


export interface EditingArticle extends Article {
  batches: Batch;
  tool?: {
    id: number;
    serial: string;
    isSpecial: boolean;
    needs_calibration: boolean;
    last_calibration_date?: string;
    next_calibration?: string | number;
    article_id: number;
  };
  component?: {
    serial: string;
    hard_time: {
      hour_date: string;
      cycle_date: string;
      calendar_date: string;
    };
    shell_time: {
      caducate_date: string;
      fabrication_date: string;
      calendar_date: string;
    };
  };
  consumable?: {
    lot_number?: string;
    caducate_date: string;
    fabrication_date: string;
  };
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
