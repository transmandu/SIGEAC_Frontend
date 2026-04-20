'use client';
import CreateHazardNotification from '@/components/forms/mantenimiento/sms/CreateHazardNotification';
import { ContentLayout } from '@/components/layout/ContentLayout';

const Identification = () => {
    return (
        <ContentLayout title={"THIS IS THE FK TTITLE"}>
            <CreateHazardNotification id={2} reportType='VOLUNTARIO' />
        </ContentLayout>
    );
};

// Exporta la función, no su ejecución
export default Identification;
