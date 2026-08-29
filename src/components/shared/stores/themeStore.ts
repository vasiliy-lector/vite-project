import { create } from 'zustand';

export type Theme = 'light' | 'dark';

type ThemeStore = {
  theme: Theme;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>()((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
