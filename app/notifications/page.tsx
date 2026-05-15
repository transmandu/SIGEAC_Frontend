'use client';

import { useCompanyStore } from '@/stores/CompanyStore';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';

export default function NotificationsPage() {
  const { selectedCompany } = useCompanyStore();

  const { notifications } = useNotifications(
    selectedCompany?.slug
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Notificaciones
      </h1>

      <div className="mt-4 space-y-2">
        {notifications.map(n => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}