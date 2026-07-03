import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface useHideReadNotificationsStore {
  hideRead: boolean;
  setHideRead: (hideRead: boolean) => void;
}

export const useHideReadNotifications = create(
  persist<useHideReadNotificationsStore>(
    (set) => ({
      hideRead: false,
      setHideRead: (hideRead) => set({ hideRead }),
    }),
    {
      name: 'hideReadNotifications',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
