import { ContentLayout } from '@/components/layout/ContentLayout';
import NonServiceWorkOrderForm from './_components/NonServiceWorkOrderForm';
import { PageHeader } from "@/components/layout/PageHeader";
export default function WorkOrderPage() {
  return (
    <ContentLayout title="Nueva Orden de Trabajo">
      <PageHeader className="mb-6" />

      <NonServiceWorkOrderForm />
    </ContentLayout>
  );
}
