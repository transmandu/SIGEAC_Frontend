import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface useGuestSidebarToggleStore {
  isOpen: boolean;
  setIsOpen: () => void;
}

export const useGuestSidebarToggle = create(
  persist<useGuestSidebarToggleStore>(
    (set, get) => ({
      isOpen: false,
      setIsOpen: () => {
        set({ isOpen: !get().isOpen });
      }
    }),
    {
      name: 'guestSidebarOpen',
      storage: createJSONStorage(() => localStorage)
    }
  )
);