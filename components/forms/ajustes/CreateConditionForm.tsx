"use client";
import { useCreateCondition } from "@/actions/aerolinea/almacen/condiciones_articulos/actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { zodResolver } from "@/lib/zod-resolver";
import { Condition } from "@/types";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ConditionFormFields } from "./ConditionFormFields";
import { buildConditionSchema, ConditionFormValues } from "./conditionSchema";

interface FormProps {
  onClose: () => void;
  onSuccess?: (condition: Condition) => void;
}

export function CreateConditionForm({ onClose, onSuccess }: FormProps) {
  const { data: conditions, isLoading: isConditionsLoading } =
    useGetConditions();
  const { createCondition } = useCreateCondition();

  const schema = useMemo(() => buildConditionSchema(conditions), [conditions]);

  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      excluded_from_cost: false,
    },
  });

  // El nombre se valida contra el catálogo: si este llega después de que el
  // usuario ya escribió, hay que volver a validarlo.
  useEffect(() => {
    if (!isConditionsLoading && conditions) {
      form.trigger("name");
    }
  }, [conditions, isConditionsLoading, form]);

  const onSubmit = async (data: ConditionFormValues) => {
    try {
      const condition = await createCondition.mutateAsync(data);
      onSuccess?.(condition);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      {/* stopPropagation: este form se renderiza dentro de otros formularios
          (ej. cotización). React propaga el submit por su árbol aunque el
          Dialog viva en un portal, y dispararía el submit del form padre. */}
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col space-y-3"
      >
        <ConditionFormFields control={form.control} />
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button
          className="bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={createCondition.isPending}
          type="submit"
        >
          {createCondition.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>Crear</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
