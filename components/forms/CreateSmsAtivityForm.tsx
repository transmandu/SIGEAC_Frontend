"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormLabel
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";



import {
  useCreateAnalysis,
  useUpdateAnalyses,
} from "@/actions/sms/analisis/actions";
import { Analysis } from "@/types";
import { Separator } from "@radix-ui/react-select";

const FormSchema = z.object({
  severity: z.string(),
  probability: z.string(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  id: string | number;
  onClose: () => void;
  initialData?: Analysis;
  isEditing?: boolean;
}

export default function CreateSmsActivityForm({
  onClose,
  id,
  isEditing,
  initialData,
}: FormProps) {
  const { createAnalysis } = useCreateAnalysis();
  const { updateAnalyses } = useUpdateAnalyses();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData
      ? {
          probability: initialData.probability,
          severity: initialData.severity,
        }
      : {},
  });

  const onSubmit = async (data: FormSchemaType) => {
    if (isEditing && initialData) {
      const value = {
        ...data,
        id: initialData.id,
        result: data.probability + data.severity,
      };
      await updateAnalyses.mutateAsync(value);
    } 
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center m-2"></FormLabel>

       

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button>Enviar</Button>
      </form>
    </Form>
  );
}
