"use client";

import { CreateMeetingMinuteForm } from '@/components/forms/general/CreateMeetingMinuteForm';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useRouter } from 'next/navigation';
import React from 'react';
export default function CreateMeetingMinutePage() {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Minuta de Reunion
      </h1>

      {/* Aquí estás convocando tu componente */}
      <CreateMeetingMinuteForm onClose={() =>
        router.push(
          `/${selectedCompany?.slug}/sms/promocion/minutas_reunion`,
        )
      } />

    </div>
  );
}
