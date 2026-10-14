"use client";

import { useUpdateCondition } from "@/actions/aerolinea/almacen/condiciones_articulos/actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { zodResolver } from "@/lib/zod-resolver";
import { Condition } from "@/types";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { ConditionFormFields } from "./ConditionFormFields";
import { buildConditionSchema, ConditionFormValues } from "./conditionSchema";

interface FormProps {
  condition: Condition;
  onClose: () => void;
}

export default function UpdateConditionForm({ condition, onClose }: FormProps) {
  const { data: conditions } = useGetConditions();
  const { updateCondition } = useUpdateCondition();

  const schema = useMemo(
    () => buildConditionSchema(conditions, condition.id),
    [conditions, condition.id],
  );

  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: condition.name,
      description: condition.description ?? "",
      excluded_from_cost: condition.excluded_from_cost ?? false,
    },
  });

  const onSubmit = async (values: ConditionFormValues) => {
    try {
      await updateCondition.mutateAsync({ id: condition.id, data: values });
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col space-y-3"
      >
        <ConditionFormFields control={form.control} />
        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={updateCondition.isPending}
          type="submit"
        >
          {updateCondition.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>Actualizar</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
