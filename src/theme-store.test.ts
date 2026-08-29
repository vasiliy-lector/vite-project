import { resetThemeStore, useThemeStore } from '@/theme-store';

describe('useThemeStore', () => {
  beforeEach(() => {
    resetThemeStore();
  });

  it('по умолчанию светлая тема', () => {
    expect(useThemeStore.getState().isDark).toBe(false);
  });

  it('переключает тему туда и обратно', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().isDark).toBe(true);
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().isDark).toBe(false);
  });
});