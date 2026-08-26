"use client";

import { Route } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { CheckboxCard } from "@/components/forms/mantenimiento/almacen/_components/CheckboxCard";
import { FormSection } from "@/components/forms/mantenimiento/almacen/_components/form-theme";

/**
 * Desvíos del camino normal del artículo.
 *
 * Cierra el formulario, como última decisión antes de crear: a dónde va el
 * artículo no tiene relación con qué papeles lo acompañan, así que no puede
 * vivir dentro de la sección de documentación.
 *
 * Sin marcar nada el artículo queda en recepción y pasa luego a inspección.
 * Son excluyentes: marcar una desmarca la otra, porque un artículo cuyo dueño
 * aún no se conoce no puede entrar al inventario.
 */
export const DestinationChecks = ({
    form,
    disabled,
}: {
    form: UseFormReturn<any>;
    disabled?: boolean;
}) => {
    const destinationUnknown = form.watch("destination_unknown");
    const goesToInventory = form.watch("goes_to_inventory");

    const setExclusive = (field: "destination_unknown" | "goes_to_inventory") =>
        (checked: boolean) => {
            const other =
                field === "destination_unknown" ? "goes_to_inventory" : "destination_unknown";

            form.setValue(field, checked, { shouldDirty: true });
            if (checked) form.setValue(other, false, { shouldDirty: true });
        };

    return (
        <FormSection
            icon={Route}
            title="Destino del artículo"
            hint="Sin marcar nada, el artículo pasará a un estado de RECEPCIÓN para pasarlo a INCOMING."
        >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <CheckboxCard
                    id="destination-unknown"
                    checked={destinationUnknown}
                    onCheckedChange={setExclusive("destination_unknown")}
                    label="Destino indeterminado"
                    description="Compras confirmará si el artículo pertenece a la estación actual."
                    disabled={disabled}
                />

                <CheckboxCard
                    id="goes-to-inventory"
                    checked={goesToInventory}
                    onCheckedChange={setExclusive("goes_to_inventory")}
                    label="Pasa directo al inventario"
                    description="Omite la recepción: el artículo pasará a CHECKING por parte de Ingenería."
                    disabled={disabled}
                />
            </div>
        </FormSection>
    );
};
