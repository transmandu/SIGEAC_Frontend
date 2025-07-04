'use client';

import CompanySelect from '@/components/selects/CompanySelectMobile';
import { useCompanyStore } from '@/stores/CompanyStore';
import { PlaneTakeoff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const HomePage = () => {
  const router = useRouter();
  const { selectedCompany, selectedStation } = useCompanyStore();

  useEffect(() => {
    if (selectedCompany && selectedStation) {
      const companyPath = selectedCompany.toLowerCase().split(" ").join("");
      router.push(`/${companyPath}/dashboard`);
    }
  }, [selectedCompany, selectedStation, router]);

  if (selectedCompany && selectedStation) {
    // Retornamos null mientras se procesa la redirección
    return null;
  }

  return (
    <div className='flex justify-end h-[650px]'>
      <div className='flex justify-center items-center max-w-sm mx-auto'>
        <div className='flex flex-col items-center justify-center gap-2'>
          <PlaneTakeoff className='size-32' />
          <h1 className='text-6xl font-bold text-center'>¡Bienvenido a SIGEAC!</h1>
          <p className='text-muted-foreground text-center'>
            Por favor, seleccione una <strong>empresa</strong> y una <strong>estación</strong> para comenzar.
          </p>
          <CompanySelect />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
