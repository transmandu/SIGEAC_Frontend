"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  useCreateUniformArticleType,
  useUpdateUniformArticleType,
} from "@/actions/sms/uniforms/actions";
import { UniformArticleType } from "@/hooks/sms/useGetUniforms";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  /** When provided the form edits the type; otherwise it creates one. */
  articleType?: UniformArticleType;
}

export const UniformArticleTypeForm = ({ onClose, articleType }: Props) => {
  const { selectedCompany } = useCompanyStore();
  const createType = useCreateUniformArticleType();
  const updateType = useUpdateUniformArticleType();
  const isEdit = !!articleType;

  const [name, setName] = useState(articleType?.name ?? "");
  const [sizes, setSizes] = useState<string[]>(articleType?.sizes ?? []);
  const [active, setActive] = useState(articleType?.active ?? true);
  const [sizeInput, setSizeInput] = useState("");

  const pending = createType.isPending || updateType.isPending;

  const addSize = () => {
    const value = sizeInput.trim().toUpperCase();
    if (!value) return;
    if (sizes.some((s) => s.toUpperCase() === value)) {
      toast.error("Esa talla ya está en la lista.");
      return;
    }
    setSizes((prev) => [...prev, value]);
    setSizeInput("");
  };

  const removeSize = (value: string) => {
    setSizes((prev) => prev.filter((s) => s !== value));
  };

  const onSizeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSize();
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    if (sizes.length === 0) {
      toast.error("Debe indicar al menos una talla.");
      return;
    }

    const company = selectedCompany!.slug;

    if (isEdit) {
      updateType.mutate(
        { company, id: articleType!.id, data: { name: name.trim(), sizes, active } },
        { onSuccess: () => onClose() }
      );
    } else {
      createType.mutate(
        { company, data: { name: name.trim(), sizes, active } },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="article-type-name">Nombre del tipo</Label>
        <Input
          id="article-type-name"
          placeholder="Ej: Camisas, Chemise reflectiva, Botas..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="article-type-size">Tallas</Label>
        <div className="flex gap-2">
          <Input
            id="article-type-size"
            placeholder="Ej: XS, S, M... o 38, 40..."
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={onSizeKeyDown}
          />
          <Button type="button" variant="outline" onClick={addSize} className="gap-1">
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Escriba una talla y presione Enter. Estas serán las tallas válidas al
          crear artículos de este tipo.
        </p>
        {sizes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sizes.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="flex items-center gap-1 font-mono"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSize(s)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground">
            Aún no hay tallas agregadas.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label>Activo</Label>
          <p className="text-xs text-muted-foreground">
            Los tipos inactivos no aparecen al crear nuevos artículos.
          </p>
        </div>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="bg-primary mt-2 gap-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isEdit ? (
          "Guardar cambios"
        ) : (
          <>
            <Plus className="size-4" />
            Crear tipo
          </>
        )}
      </Button>
    </div>
  );
};
