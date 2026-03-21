import { ContentLayout } from '@/components/layout/ContentLayout';
import NonServiceWorkOrderForm from './_components/NonServiceWorkOrderForm';
import ServiceWorkOrderForm from './_components/ServiceWorkOrderForm';
export default function WorkOrderPage() {
  return (
    <ContentLayout title='Creacion de WO'>
      {/* <ServiceWorkOrderForm /> */}
      <NonServiceWorkOrderForm />
    </ContentLayout>
  );
}
