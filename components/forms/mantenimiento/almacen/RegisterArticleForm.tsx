'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select'
import CreateConsumableForm from './CreateConsumableForm';
import CreateToolForm from './CreateToolForm';
import CreateComponentForm from './CreateComponentForm';
import { Article, Batch, ComponentArticle, ConsumableArticle, Convertion, ToolArticle } from '@/types';

interface EditingArticle extends Article {
  batches: Batch,
  tool?: {
    id: number,
    serial: string,
    isSpecial: boolean,
    article_id: number,
  }
  component?: {
    serial: string,
    hard_time: {
      hour_date: string,
      cycle_date: string,
      calendary_date: string,
    },
    shell_time: {
      caducate_date: string,
      fabrication_date: string,
    }
  },
  consumable?: {
    article_id: number,
    is_managed: boolean,
    convertions: Convertion[],
    quantity: number,
    shell_time: {
      caducate_date: Date,
      fabrication_date: string,
      consumable_id: string,
    }
  },
}

interface IRegisterArticleProps {
  isEditing?: boolean,
  initialData?: EditingArticle,
  category?: string,
}

const RegisterArticleForm = ({ isEditing = false, initialData }: IRegisterArticleProps) => {

  const [type, setType] = useState(initialData?.batches.category.toLowerCase() ?? "consumible");
  function handleTypeSelect(data: string) {
    setType(data);
  }
  return (
    <div className='space-y-3 mb-4'>
      <h1 className='font-bold text-3xl'>{isEditing ? "Confirmacion de Articulo" : "Ingreso de Articulo"}</h1>
      {
        !isEditing && <p className='text-sm text-muted-foreground'>Seleccione el tipo de articulo a registrar:</p>
      }
      <Select disabled={isEditing} defaultValue={initialData?.batches.category.toLowerCase()} onValueChange={handleTypeSelect}>
        <SelectTrigger className="w-[230px]">
          <SelectValue placeholder='Seleccionar...' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="consumible">Consumible</SelectItem>
          <SelectItem value="herramienta">Herramienta</SelectItem>
          <SelectItem value="componente">Componente</SelectItem>
        </SelectContent>
      </Select>
      {
        type === 'consumible' && <CreateConsumableForm isEditing={isEditing} initialData={initialData} />
      }
      {
        type === 'herramienta' && <CreateToolForm isEditing={isEditing} initialData={initialData} />
      }
      {
        type === 'componente' && <CreateComponentForm isEditing={isEditing} initialData={initialData} />
      }
    </div>
  )
}
export default RegisterArticleForm
