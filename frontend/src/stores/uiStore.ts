import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';
type SidebarState = 'expanded' | 'collapsed';

interface UIState {
  theme: ThemeMode;
  sidebar: SidebarState;
  language: string;
  notifPanelOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebar: (s: SidebarState) => void;
  setLanguage: (l: string) => void;
  setNotifPanel: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebar: 'expanded',
      language: 'ar',
      notifPanelOpen: false,
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      toggleSidebar: () => set({ sidebar: get().sidebar === 'expanded' ? 'collapsed' : 'expanded' }),
      setSidebar: (s) => set({ sidebar: s }),
      setLanguage: (l) => set({ language: l }),
      setNotifPanel: (open) => set({ notifPanelOpen: open }),
    }),
    { name: 'ui-storage' },
  ),
);
