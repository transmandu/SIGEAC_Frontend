'use client'

import { ContentLayout } from '@/components/layout/ContentLayout';
import { useGetCards } from '@/hooks/general/tarjetas/useGetCards';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/types';

const BankAccountsPage = () => {

  const { data: cards, isLoading, error } = useGetCards();
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const params = useParams();
  const account_number = params?.account_number ?? ""; // Asegurar que siempre haya un valor

  useEffect(() => {
    if (cards && account_number) {
      const filterCards = cards.filter((card) => card.bank_account.account_number === account_number);
      setFilteredCards(filterCards);
    }
  }, [cards, account_number]); // Se ejecutará cada vez que `accounts` o `id` cambien

  return (
    <ContentLayout title={'Almacenes'}>
      <h1 className='text-4xl font-bold text-center mb-2'>Control de Tarjetas</h1>
      <p className='text-sm text-muted-foreground text-center'>
        Lleve un control de las diferentes cuentas que se han registrado.
      </p>
      {
        isLoading && (
          <div className='grid mt-72 place-content-center'>
            <Loader2 className='w-12 h-12 animate-spin' />
          </div>
        )
      }
      {
        error && (
          <div className='grid mt-72 place-content-center'>
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar las tarjetas...</p>
          </div>
        )
      }
      {
        cards && (
          <DataTable columns={columns} data={filteredCards} />
        )
      }
    </ContentLayout>
  )
}

export default BankAccountsPage
