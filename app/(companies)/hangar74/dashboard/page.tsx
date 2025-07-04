'use client';
import { ContentLayout } from '@/components/layout/ContentLayout';
import DashboardTabs from '@/components/misc/DashboardTabs';

const DashboardPage =  () => {
  return (
  <ContentLayout title='Dashboard / Hangar74'>
    <DashboardTabs/>
  </ContentLayout>
)
}

export default DashboardPage
