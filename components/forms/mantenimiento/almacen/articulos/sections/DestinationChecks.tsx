"use client";

import type { UseFormReturn } from "react-hook-form";

import { CheckboxCard } from "../../_components/CheckboxCard";

/**
 * Desvíos del camino normal del artículo.
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
        <div className="space-y-3">
            <CheckboxCard
                id="destination-unknown"
                checked={destinationUnknown}
                onCheckedChange={setExclusive("destination_unknown")}
                label="Destino indeterminado"
                description="Compras confirmará si el artículo pertenece a la empresa."
                disabled={disabled}
            />

            <CheckboxCard
                id="goes-to-inventory"
                checked={goesToInventory}
                onCheckedChange={setExclusive("goes_to_inventory")}
                label="Pasa directo al inventario"
                description="Omite la recepción: el artículo ya viene verificado."
                disabled={disabled}
            />
        </div>
    );
};
