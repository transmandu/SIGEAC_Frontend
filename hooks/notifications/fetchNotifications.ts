import axiosInstance from '@/lib/axios'
import { Notification } from '@/types/notifications/types'

export const fetchNotifications = async (
  company: string
): Promise<Notification[]> => {
  const trimmed = company?.trim()

  if (!trimmed) {
    throw new Error('Company is required to fetch notifications')
  }

  const { data } = await axiosInstance.get(
    `/${trimmed}/notifications`
  )

  return data
}