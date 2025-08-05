'use client';
import CompanySelect from '@/components/selects/CompanySelect';
import { PlaneTakeoff } from 'lucide-react';

const HomePage = () => {
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
