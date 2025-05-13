"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { useGetWorkOrderByOrderNumber } from '@/hooks/planificacion/useGetWorkOrderByOrderNumber';
import { useParams } from 'next/navigation';
import WorkOrderAircraftDetailsCards from './_components/WorkOrderAircraftDetailsCards';
import WorkOrderTasksDetails from './_components/WorkOrderTasksDetails';

const WorkOrderPage = () => {
  const { order_number } = useParams<{ order_number: string }>();
  const { data: work_order, isLoading: isWorkOrderLoading, isError: isWorkOrderError } = useGetWorkOrderByOrderNumber(order_number);

  if (isWorkOrderLoading || (work_order && work_order.order_number !== order_number)) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title='Orden de Trabajo'>
      <div className='space-y-6'>
        <h1 className='text-center text-5xl font-bold'>Detalles de WO - <span className='text-blue-600 italic'>{order_number}</span></h1>
        {
          work_order && (
            <>
              <Accordion type="single" collapsible className="w-full" defaultValue="aircraft-details">
                <AccordionItem value="aircraft-details">
                  <AccordionTrigger className="hover:no-underline">
                    <h2 className="text-xl font-semibold">Ver detalles de WO</h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <WorkOrderAircraftDetailsCards work_order={work_order} />
                    {isWorkOrderError && <p className='text-muted-foreground italic'>Ha ocurrido un error al cargar la orden de trabajo...</p>}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <WorkOrderTasksDetails work_order={work_order} />
            </>
          )
        }
      </div>
    </ContentLayout>
  )
}

export default WorkOrderPage
