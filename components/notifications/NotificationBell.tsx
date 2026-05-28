'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useCompanyStore } from '@/stores/CompanyStore';

import NotificationDropdown from './NotificationDropdown';
import { useNotificationEffects } from '@/hooks/sistema/useNotificationEffects';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationBell() {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth()
  const { notifications, unreadCount } =
    useNotifications(selectedCompany?.slug, user?.id);

  const [open, setOpen] = useState(false);

  useNotificationEffects({
    notifications,
    unreadCount,
    open,
  });

  return (
    <div className="relative">
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setOpen(prev => !prev)}
              className="relative rounded-full w-8 h-8 bg-background"
              variant="outline"
              size="icon"
            >
              <Bell className="w-[1.2rem] h-[1.2rem]" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full">
                  {unreadCount > 9 ? '+9' : unreadCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent side="bottom">
            Notificaciones
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {open && (
        <NotificationDropdown onClose={() => setOpen(false)} />
      )}
    </div>
  );
}