import { ContentLayout } from '@/components/layout/ContentLayout';
import ServiceWorkOrderForm from './_components/ServiceWorkOrderForm';
export default function WorkOrderPage() {
  return (
    <ContentLayout title='Creacion de WO'>
      <ServiceWorkOrderForm />
      {/* <NonServiceWorkOrderForm /> */}
    </ContentLayout>
  );
}
