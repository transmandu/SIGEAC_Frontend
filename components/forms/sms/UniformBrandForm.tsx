"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  useCreateUniformBrand,
  useUpdateUniformBrand,
} from "@/actions/sms/uniforms/actions";
import { UniformBrand } from "@/hooks/sms/useGetUniforms";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  /** When provided the form edits the brand; otherwise it creates one. */
  brand?: UniformBrand;
  /** Fires with the new brand id after a successful creation. */
  onCreated?: (brandId: number) => void;
}

export const UniformBrandForm = ({ onClose, brand, onCreated }: Props) => {
  const { selectedCompany } = useCompanyStore();
  const createBrand = useCreateUniformBrand();
  const updateBrand = useUpdateUniformBrand();
  const isEdit = !!brand;

  const [name, setName] = useState(brand?.name ?? "");
  const [active, setActive] = useState(brand?.active ?? true);

  const pending = createBrand.isPending || updateBrand.isPending;

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }

    const company = selectedCompany!.slug;

    if (isEdit) {
      updateBrand.mutate(
        { company, id: brand!.id, data: { name: name.trim(), active } },
        { onSuccess: () => onClose() }
      );
    } else {
      createBrand.mutate(
        { company, data: { name: name.trim(), active } },
        {
          onSuccess: (res: any) => {
            const newId = res?.data?.data?.id;
            if (newId) onCreated?.(newId);
            onClose();
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="brand-name">Nombre de la marca</Label>
        <Input
          id="brand-name"
          placeholder="Ej: Nike, Yale, Genérica..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label>Activa</Label>
          <p className="text-xs text-muted-foreground">
            Las marcas inactivas no aparecen al crear nuevos artículos.
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
            Crear marca
          </>
        )}
      </Button>
    </div>
  );
};
