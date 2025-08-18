'use client'

import ChildrenInfoCard from '@/components/cards/ChildrenInfoCard';
import CertificatesDialog from '@/components/dialogs/mantenimiento/almacen/CertificatesDialog';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from '@/components/ui/textarea';
import { useGetArticle } from '@/hooks/mantenimiento/almacen/articulos/useGetArticle';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ArticlePage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const [date, setDate] = useState<Date>()
  const params = useParams<{ slug: string, serial: string }>();
  const { mutate, data, isPending, isError } = useGetArticle(selectedStation!, params.slug, params.serial, selectedCompany?.slug);

  useEffect(() => {
    if (selectedStation) {
      mutate()
    }
  }, [selectedStation, mutate])

  if (isPending) {
    return <ContentLayout title='Cargado item...'>
      <Loader2 className='size-24 animate-spin flex justify-center  items-center' />
    </ContentLayout>
  }

  return (
    <ContentLayout title={`Vista de Articulo`}>
      <h1 className='text-center font-bold text-5xl p-1'>Gestión de Articulo</h1>
      <p className='text-muted-foreground text-sm text-center mb-6 italic'>Aquí puede ver los detalles de un articulo/componente en especifíco</p>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <div className="max-w-7xl flex flex-col lg:flex-row gap-2 justify-center items-center w-full pb-6">
          {/* serial */}
          <div className='flex flex-col gap-2'>
            <Label>Serial</Label>
            <Input defaultValue={data?.article.serial} className='w-[180px] disabled:opacity-100' disabled placeholder="EJ: 234ABAC" />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Condición</Label>
            <Input disabled defaultValue={data?.article.condition} className='w-[180px] disabled:opacity-100' placeholder="EJ: 234ABAC" />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Fecha de Fabricación</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !data?.shell_time.fabrication_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data?.shell_time.fabrication_date ? format(data?.shell_time.fabrication_date, "PPP", {
                    locale: es,
                  }) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  disabled
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* CADUCATE */}
          <div className='flex flex-col gap-2'>
            <Label>Fecha de Caducidad</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !data?.shell_time.caducate_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data?.shell_time.caducate_date ? format(data?.shell_time.caducate_date, "PPP", {
                    locale: es,
                  }) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  disabled
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-12 justify-center max-w-6xl">
          <div className="grid grid-cols-2 gap-6 h-[230px]">
            {/* brand */}
            <div className="flex flex-col gap-2">
              <Label>Marca</Label>
              <Input disabled className='disabled:opacity-100' defaultValue={data?.article.brand} />
            </div>
            {/* zone */}
            <div className="flex flex-col gap-2">
              <Label>Zona de Ubicación</Label>
              <Input disabled className='disabled:opacity-100' defaultValue={data?.article.zone} />
            </div>
            {/* CALENDAR */}
            <div className='flex flex-col gap-2'>
              <Label>Fecha de Calendario</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !data?.hard_time.calendary_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data?.hard_time.calendary_date ? format(data?.hard_time.calendary_date, "PPP", {
                      locale: es,
                    }) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    disabled
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* hours date */}
            <div className='flex flex-col gap-2'>
              <Label>Horas Límite</Label>
              <Input disabled className='disabled:opacity-100' defaultValue={data?.hard_time.hour_date} />

            </div>
            {/* cycles date */}
            <div className='flex flex-col gap-2'>
              <Label>Ciclos Límite</Label>
              <Input disabled className='disabled:opacity-100' defaultValue={data?.hard_time.cycle_date} />
            </div>
            {/* batch */}
            <div className="flex flex-col gap-2">
              <Label>Número de Lote</Label>
              <Input disabled className='disabled:opacity-100' defaultValue={data?.article.part_number} />
            </div>
          </div>
          <div className="flex flex-row justify-center gap-6 lg:flex-col max-w-7xl space-y-0">
            {/* Description */}
            <div className='flex gap-2'>
              <div className='flex flex-col gap-2 mr-12'>
                <Label>Descripcion</Label>
                <Textarea defaultValue={data?.article.description} defaultChecked disabled className='disabled:opacity-100' rows={5} placeholder="EJ: Motor V8 de..." />
              </div>
              <div className='flex flex-col gap-2'>
                <Label>Imagen</Label>
                <Image src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`} alt='imagen de articulo' width={120} height={120} className='border-2 border-black rounded-lg' />
              </div>
            </div>
            <div className="flex flex-row-reverse gap-4 items-center  justify-center">
              <div className='flex flex-col lg:flex-row gap-2'>
                <CertificatesDialog serial={data?.article.serial} certificates={data?.article.certificates} />
              </div>
              {/* isFather */}
              <div className="flex items-center space-x-2">
                <Checkbox id="isFather" disabled defaultChecked={data?.isFather} className='disabled:opacity-100' />
                <label
                  htmlFor="isFather"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
                >
                  ¿Es componente padre?
                </label>
              </div>
            </div>
          </div>

        </div>
        {
          data?.childrens && (
            <>
              <h1 className='font-bold text-2xl italic text-center my-2'>Subcomponentes - {data.article.serial}</h1>
              <div className='grid grid-cols-1 md:grid-cols-4 max-w-6xl mt-4 gap-4'>
                {
                  data?.childrens.map((c, index) => (
                    <ChildrenInfoCard key={c.child_component_id} c={c} index={index} />
                  ))
                }
              </div>
            </>
          )
        }
      </div>
    </ContentLayout >
  )
}

export default ArticlePage
