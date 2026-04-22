"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";
import { useParams } from "next/navigation";
import { PackagePlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateExternalCargoPage() {
  const params = useParams();
  const name = decodeURIComponent(params.name as string);

  return (
    <ContentLayout title="Nuevo Registro">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <PackagePlus className="text-muted-foreground mr-1 size-7" />
            Nuevo Registro De Carga (Externa)
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete el formulario para aperturar un nuevo control de carga
            (manifiesto).
          </p>
        </div>
      </div>

      <Card className="border-none shadow-none md:border md:shadow-sm md:bg-card text-center">
        <CardHeader className="hidden md:flex px-6 pt-6 pb-2">
          <CardTitle>Registro para {name}</CardTitle>
          <CardDescription>
            Complete el formulario para registrar carga en esta aeronave externa
          </CardDescription>
        </CardHeader>
        <CardContent className="md:px-6 md:pb-6 p-0">
          <CreateCargoShipmentForm />
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
