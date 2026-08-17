'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { DailyReportForm } from '@/components/forms/aerolinea/desarollo/DailyReportForm';
import { useGetDailyActivityReport } from '@/hooks/aerolinea/desarrollo/useGetDailyActivities';
import { useParams } from 'next/navigation';
import ConfirmCreateActivityReportDialog from '@/components/dialogs/aerolinea/desarollo/CreateActivityReportDialog';
import { useCreateActivityReport } from '@/actions/aerolinea/desarrollo/reportes_diarios/actions';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/components/misc/LoadingPage';
import { PageHeader } from "@/components/layout/PageHeader";

const DailyActivitiesPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ date: string }>();
  const [showDialog, setShowDialog] = useState(false);
  const { createActivityReport } = useCreateActivityReport();
  const { data: report, isLoading: isReportLoading } = useGetDailyActivityReport({ date: params.date, user_id: user?.id?.toString() ?? null });

  useEffect(() => {
    if (!isReportLoading && !report) {
      setShowDialog(true);
    }
  }, [report, isReportLoading]);

  if (isReportLoading || loading) {
    return <LoadingPage />;
  }

  const handleCreateActivityReport = () => {
    createActivityReport.mutate(
      { date: params.date },
      {
        onSuccess: () => {
          window.location.reload();
        }
      }
    );
  };

  return (
    <ContentLayout title="Registro de Actividades">
      <div className="flex flex-col gap-y-2">
        <PageHeader className="mb-4" />
        <h1 className="text-4xl font-bold text-center">Registro de Actividades</h1>
        <p className="text-sm text-muted-foreground text-center italic">
          Aquí puede registrar las actividades realizadas por la Jefatura de Desarrollo.<br />
        </p>

        {report ? (
          <DailyReportForm report_id={report.id} activities_length={report.activities?.length || 0} />
        ) : (
          <ConfirmCreateActivityReportDialog
            open={showDialog}
            onClose={() => setShowDialog(false)}
            onConfirm={handleCreateActivityReport}
            loading={createActivityReport.isPending}
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default DailyActivitiesPage;
