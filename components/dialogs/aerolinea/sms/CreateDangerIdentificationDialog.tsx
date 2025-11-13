"use client";
import { Card } from "@/components/ui/card";
import { DangerIdentification } from "@/types";
import CreateDangerIdentificationForm from "@/components/forms/aerolinea/sms/CreateIdentificationForm";

interface FormProps {
  title: string;
  id: number | string;
  initialData?: DangerIdentification;
  isEditing?: boolean;
  reportType: string;
}

export default function CreateDangerIdentificationPage({
  title,
  id,
  isEditing,
  initialData,
  reportType,
}: FormProps) {
  return (
    <Card className="flex flex-col p-4 max-w-6xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <CreateDangerIdentificationForm
        id={id}
        initialData={initialData}
        isEditing={isEditing}
        reportType={reportType}
      />
    </Card>
  );
}
