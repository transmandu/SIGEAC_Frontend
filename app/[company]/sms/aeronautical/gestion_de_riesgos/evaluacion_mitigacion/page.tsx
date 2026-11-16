"use client";

import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useGetHazardNotifications } from "@/hooks/sms/mantenimiento/useGetHazardNotifications";
import { useGetHazardNotificationByReportNumber } from "@/hooks/sms/mantenimiento/useGetHazardNotificationByReportNumber";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useOnChange } from "@/hooks/useOnChange";

import { EvaluationWorkflowPanel } from "./_components/evaluation-workflow-panel";
import { NotificationSelectionPanel } from "./_components/notification-selection-panel";
import {
  getNotificationReportNumber,
  sortByNewestDate,
} from "./_components/workflow-helpers";

const EvaluationMitigationPage = () => {
  const params = useParams<{ company: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug || params.company;

  const [selectedNotificationId, setSelectedNotificationId] = useState<
    number | null
  >(null);
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);
  const reportNumberParam = searchParams.get("report_number");

  const {
    data: notifications,
    isLoading,
    isError,
  } = useGetHazardNotifications(companySlug);

  const { data: notificationFromUrl } = useGetHazardNotificationByReportNumber(
    companySlug,
    reportNumberParam,
  );

  const sortedNotifications = useMemo(
    () => sortByNewestDate(notifications || []),
    [notifications],
  );

  const notificationFromUrlId = notificationFromUrl?.id;
  useOnChange([notificationFromUrlId], () => {
    if (notificationFromUrlId) setSelectedNotificationId(notificationFromUrlId);
  });

  const selectedNotification =
    sortedNotifications.find(
      (notification) => notification.id === selectedNotificationId,
    ) ||
    notificationFromUrl ||
    null;

  const currentMitigationPlan = selectedNotification?.mitigation_plan || null;
  const currentPlanAnalysis =
    selectedNotification?.analysis || currentMitigationPlan?.analysis || null;
  const currentPostMitigationAnalysis = currentMitigationPlan?.analysis || null;
  const currentMeasures = currentMitigationPlan?.measures || [];

  const syncNotificationToUrl = (notificationId: number) => {
    const notification = sortedNotifications.find(
      (item) => item.id === notificationId,
    );

    if (!notification) {
      return;
    }

    const query = new URLSearchParams(searchParams.toString());
    query.set("report_number", getNotificationReportNumber(notification));

    router.replace(`${pathname}?${query.toString()}`);
  };

  const handleSelectNotification = (notificationId: number) => {
    setSelectedNotificationId(notificationId);
    syncNotificationToUrl(notificationId);
    setIsNotificationSheetOpen(false);
  };

  return (
    <ContentLayout title="Evaluación y mitigación">
      <PageHeader className="mb-6" />

      {!selectedNotification ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">
                Seleccione una notificación
              </h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Elija la notificación de peligro para desarrollar el plan, las
                medidas y el seguimiento.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setIsNotificationSheetOpen(true)}
            >
              Seleccionar notificación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <EvaluationWorkflowPanel
          key={selectedNotification.id}
          company={companySlug}
          selectedNotification={selectedNotification}
          currentMitigationPlan={currentMitigationPlan}
          currentPlanAnalysis={currentPlanAnalysis}
          currentPostMitigationAnalysis={currentPostMitigationAnalysis}
          currentMeasures={currentMeasures}
          onChangeNotification={() => setIsNotificationSheetOpen(true)}
        />
      )}

      <Sheet
        open={isNotificationSheetOpen}
        onOpenChange={setIsNotificationSheetOpen}
      >
        <SheetContent
          side="left"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>Seleccionar notificación</SheetTitle>
            <SheetDescription>
              Elija la notificación de peligro que desea evaluar o editar.
            </SheetDescription>
          </SheetHeader>

          <NotificationSelectionPanel
            notifications={sortedNotifications}
            selectedNotificationId={selectedNotificationId}
            isLoading={isLoading}
            isError={isError}
            onSelectNotification={handleSelectNotification}
            hideHeader
            showSticky={false}
            className="border-0 bg-transparent shadow-none"
            contentClassName="px-0"
          />
        </SheetContent>
      </Sheet>
    </ContentLayout>
  );
};

export default EvaluationMitigationPage;
