'use client'

import CreateComponentForm from '@/components/forms/mantenimiento/almacen/CreateComponentForm';
import CreateConsumableForm from '@/components/forms/mantenimiento/almacen/CreateConsumableForm';
import CreateToolForm from '@/components/forms/mantenimiento/almacen/CreateToolForm';
import { ContentLayout } from '@/components/layout/ContentLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useState } from 'react';

const AgregarPage = () => {
  const [type, setType] = useState("consumable");
  function handleTypeSelect(data: string) {
    setType(data);
  }
  return (
    <ContentLayout title='TEST DE AGREGADO'>
      <div className='space-y-3 mb-4'>
        <h1 className='font-bold text-3xl'>Ingreso de Articulo</h1>
        <p className='text-sm text-muted-foreground'>Seleccione el tipo de articulo a registrar:</p>
        <Select defaultValue='consumable' onValueChange={handleTypeSelect}>
          <SelectTrigger className="w-[230px]">
            <SelectValue placeholder='Seleccionar...' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consumable">Consumible</SelectItem>
            <SelectItem value="tool">Herramienta</SelectItem>
            <SelectItem value="component">Componente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {
        type === 'consumable' && <CreateConsumableForm />
      }
      {
        type === 'tool' && <CreateToolForm />
      }
      {
        type === 'component' && <CreateComponentForm />
      }
    </ContentLayout>
  )
}

export default AgregarPage
