import { useThemeStore } from './themeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  it('по умолчанию светлая тема', () => {
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('переключает тему между light и dark', () => {
    const { toggleTheme } = useThemeStore.getState();
    toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
    toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });
});
