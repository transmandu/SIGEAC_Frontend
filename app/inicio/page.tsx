'use client';

import CompanySelect from '@/components/selects/CompanySelectMobile';
import { useCompanyStore } from '@/stores/CompanyStore';
import { PlaneTakeoff } from 'lucide-react';
import { useRouter } from 'next/navigation';
const HomePage = () => {
  const router = useRouter();
  const { selectedCompany, selectedStation } = useCompanyStore()
  if (selectedCompany && selectedStation) {
    return router.push(`/${selectedCompany.toLowerCase().split(" ").join("")}/dashboard`)
  }
  return (
    <div className='flex justify-end h-[650px]'>
      <div className='flex justify-center items-center max-w-sm mx-auto'>
        <div className='flex flex-col items-center justify-center gap-2'>
          <PlaneTakeoff className='size-32' />
          <h1 className='text-6xl font-bold text-center'>¡Bienvenido a SIGEAC!</h1>
          <p className='text-muted-foreground text-center'>Por favor, seleccione una <strong>empresa</strong> y una <strong>estación</strong> para comenzar.</p>
          <CompanySelect />
        </div>
      </div>
    </div>
  )
}

export default HomePage
