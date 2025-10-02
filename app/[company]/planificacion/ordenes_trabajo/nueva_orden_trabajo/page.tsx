import { ContentLayout } from '@/components/layout/ContentLayout';
import NonServiceWorkOrderForm from './_components/NonServiceWorkOrderForm';
export default function WorkOrderPage() {
  return (
    <ContentLayout title='Creacion de WO'>
      {/* <ServiceWorkOrderForm /> */}
      <NonServiceWorkOrderForm />
    </ContentLayout>
  );
}
