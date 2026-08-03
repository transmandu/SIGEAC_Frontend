import { ContentLayout } from '@/components/layout/ContentLayout';
import NonServiceWorkOrderForm from './_components/NonServiceWorkOrderForm';
import ServiceWorkOrderForm from './_components/ServiceWorkOrderForm';
import { PageHeader } from "@/components/layout/PageHeader";
export default function WorkOrderPage() {
  return (
    <ContentLayout title='Creacion de WO'>
      <PageHeader />

      {/* <ServiceWorkOrderForm /> */}
      <NonServiceWorkOrderForm />
    </ContentLayout>
  );
}
