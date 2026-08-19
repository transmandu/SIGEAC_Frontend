"use client";

import { CreateMeetingMinuteForm } from '@/components/forms/general/CreateMeetingMinuteForm';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useRouter } from 'next/navigation';
import React from 'react';
export default function CreateMeetingMinutePage() {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  return (
    <div className="w-full max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-center text-foreground mb-6">
        Minuta de Reunion
      </h1>

      <CreateMeetingMinuteForm onClose={() =>
        router.push(
          `/${selectedCompany?.slug}/sms/promocion/minutas_reunion`,
        )
      } />

    </div>
  );
}
