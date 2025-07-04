'use client';
import { ContentLayout } from '@/components/layout/ContentLayout';
import DashboardTabs from '@/components/misc/DashboardTabs';
import { useCompanyStore } from '@/stores/CompanyStore';
import { redirect } from 'next/navigation';

const DashboardPage =  () => {

    const {selectedCompany, selectedStation} = useCompanyStore();

    if(!selectedCompany || !selectedStation){
      redirect('/inicio');
    }

    return (
    <ContentLayout title='Dashboard / Transmandu'>
      <DashboardTabs/>
    </ContentLayout>
  )
}

export default DashboardPage
