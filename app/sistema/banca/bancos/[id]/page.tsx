'use client'

import { ContentLayout } from '@/components/layout/ContentLayout';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useGetBankAccounts } from '@/hooks/general/cuentas_bancarias/useGetBankAccounts';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BankAccount } from '@/types';
import LoadingPage from '@/components/misc/LoadingPage';
import { useCompanyStore } from '@/stores/CompanyStore';

const BankAccountsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const params = useParams();
  const id = params?.id ?? ""; // Asegurar que siempre haya un valor
  const {
    data: accounts,
    isLoading,
    error,
  } = useGetBankAccounts();
  const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    if (accounts && id) {
      const filterAcc = accounts.filter((acc) => acc.bank.id.toString() === id);
      setFilteredAccounts(filterAcc);
    }
  }, [accounts, id]); // Se ejecutará cada vez que `accounts` o `id` cambien

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Almacenes">
      <h1 className="text-4xl font-bold text-center mb-2">Control de Cuentas</h1>
      <p className="text-sm text-muted-foreground text-center">
        Lleve un control de las diferentes cuentas que se han registrado.
      </p>

      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los almacenes...
          </p>
        </div>
      )}

      <DataTable columns={columns} data={filteredAccounts} />
    </ContentLayout>
  );
};

export default BankAccountsPage;
