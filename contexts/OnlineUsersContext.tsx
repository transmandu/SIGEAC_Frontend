'use client'

import { createContext, ReactNode, useContext } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCompanyStore } from '@/stores/CompanyStore'
import { OnlineUser, PresenceStatus, useOnlineUsers } from '@/hooks/notifications/useOnlineUsers'

interface OnlineUsersContextType {
  onlineUsers: OnlineUser[]
  isUserOnline: (userId: number | string) => boolean
  getPresenceStatus: (userId: number | string) => PresenceStatus
}

const OnlineUsersContext = createContext<OnlineUsersContextType | undefined>(undefined)

export const OnlineUsersProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const { selectedCompany } = useCompanyStore()

  const { onlineUsers, isUserOnline, getPresenceStatus } = useOnlineUsers(
    selectedCompany?.slug,
    isAuthenticated
  )

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, isUserOnline, getPresenceStatus }}>
      {children}
    </OnlineUsersContext.Provider>
  )
}

export const useOnlineUsersContext = (): OnlineUsersContextType => {
  const ctx = useContext(OnlineUsersContext)
  if (!ctx) {
    throw new Error('useOnlineUsersContext must be used within OnlineUsersProvider')
  }
  return ctx
}
