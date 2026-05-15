import axiosInstance from '@/lib/axios';
import { Notification } from '@/types/notifications/types';

export const fetchNotifications = async (
  company: string
): Promise<Notification[]> => {
  if (!company) {
    throw new Error('Company is required to fetch notifications');
  }

  const { data } = await axiosInstance.get(
    `/${company}/notifications`
  );

  return data;
};