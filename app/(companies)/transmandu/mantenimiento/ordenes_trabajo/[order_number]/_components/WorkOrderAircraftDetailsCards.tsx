import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from '@/components/ui/use-toast'
import axiosInstance from '@/lib/axios'
import { cn } from '@/lib/utils'
import { WorkOrder } from '@/types'
import axios from 'axios'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarFold, Clock3, Eye, FileCheck2, MapPin, PencilLine, Printer, RefreshCw, User } from 'lucide-react'
import Link from 'next/link'

const WorkOrderAircraftDetailsCards = ({ work_order }: { work_order: WorkOrder }) => {

  const handlePrint = async () => {
    try {
      const response = await axiosInstance.get(`/hangar74/work-order-pdf/${work_order.order_number}`, {
        responseType: 'blob', // Importante para manejar archivos binarios
      });

      // Crear URL del blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `WO-${work_order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Limpieza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar el PDF. Por favor intente nuevamente.",
      });
      console.error('Error al descargar el PDF:', error);
    }
  };

  return (
    <div className='flex gap-4 justify-center w-full'>
      {/* Detalles de Orden de Trabajo */}
      <Card className="w-1/2">
        <CardHeader className='flex justify-center text-center'>
          <CardTitle>WO - {work_order!.order_number}</CardTitle>
          <CardDescription>{work_order?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {
            work_order && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className='flex flex-col items-center'>
                  <p className="text-sm text-gray-600 flex gap-1 items-center">Fecha de Orden <CalendarFold className='size-4' /></p>
                  <p className="font-medium">{format(work_order.date, "PPP", { locale: es })}</p>
                </div>
                <div className='flex flex-col items-center'>
                  <p className="text-sm text-gray-600 flex gap-1
                     items-center">Elaborado Por <PencilLine className='size-4' /></p>
                  <p className="font-medium">{work_order.elaborated_by}</p>
                </div>
                <div className='flex flex-col items-center'>
                  <p className="text-sm text-gray-600 flex gap-1
                     items-center">Revisado Por <Eye className='size-4' /></p>
                  <p className="font-medium">{work_order.reviewed_by}</p>
                </div>
                <div className='flex flex-col items-center'>
                  <p className="text-sm text-gray-600 flex gap-1
                     items-center">Aprobado Por <FileCheck2 className='size-4' /></p>
                  <p className="font-medium">{work_order.approved_by}</p>
                </div>
                <div className='flex flex-col items-center'>
                  <p className="text-sm text-gray-600 flex gap-1
                     items-center">Cliente</p>
                  <p className="font-medium">{work_order.aircraft.client.name}</p>
                </div>
                <div className='flex flex-col items-center'>
                  <p className="text-sm text-gray-600 flex gap-1
                     items-center">Número de Tareas</p>
                  <p className="font-medium">{work_order.work_order_tasks.length} tarea(s)</p>
                </div>
              </div>
            )
          }
        </CardContent>
        <CardFooter className="flex flex-col justify-between space-y-10">
          <Badge className={cn("scale-125 cursor-pointer hover:scale-150 transition-all ease-in", work_order.status === "ABIERTO" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600")}>{work_order?.status}</Badge>
          <Button onClick={handlePrint}><Printer /></Button>
        </CardFooter>
      </Card>
      {/* Detalles de Aeronave*/}
      <Card className="w-1/3">
        <CardHeader className='text-center'>
          <CardTitle>Aeronave - {work_order?.aircraft.acronym}</CardTitle>
          <CardDescription>{work_order?.aircraft.comments}</CardDescription>
        </CardHeader>
        <CardContent>
          {
            work_order && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className='flex flex-col justify-center text-center'>
                  <p className="text-sm text-gray-600 flex justify-center items-center gap-1">Horas de Vuelo <Clock3 className='size-4' /> </p>
                  <p className="font-medium">{work_order.aircraft.flight_hours}</p>
                </div>
                <div className='flex flex-col justify-center text-center'>
                  <p className="text-sm text-gray-600 flex justify-center items-center gap-1">Ciclos de Vuelo <RefreshCw className='size-4' /></p>
                  <p className="font-medium">{work_order.aircraft.flight_cycles}</p>
                </div>
                <div className='flex flex-col justify-center text-center'>
                  <p className="text-sm text-gray-600 flex justify-center items-center gap-1">Cliente <User className='size-4' /></p>
                  <p className="font-medium">{work_order.aircraft.client.name}</p>
                </div>
                <div className='flex flex-col justify-center text-center'>
                  <p className="text-sm text-gray-600 flex justify-center items-center gap-1">Ubicación <MapPin className='size-4' /></p>
                  <p className="font-medium">Puerto Ordaz</p>
                </div>
                {
                  work_order.aircraft.aircraft_parts.map((part) => (
                    <div className='flex flex-col justify-center text-center' key={part.part_number}>
                      <p className="text-sm text-gray-600">{part.part_name}</p>
                      <p className="font-medium">{part.part_hours} hrs. - {part.part_cycles} cyc.</p>
                    </div>
                  ))
                }
              </div>
            )
          }
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href={`/hangar74/planificacion/aeronaves/${work_order?.aircraft.acronym}`}>
            <Button>Ver Aeronave</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default WorkOrderAircraftDetailsCards
