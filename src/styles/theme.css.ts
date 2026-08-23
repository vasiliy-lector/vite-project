import { createTheme, createThemeContract } from '@vanilla-extract/css';

const themeVars = {
  colorBackground: '',
  colorText: '',
  colorMuted: '',
  colorButtonBackground: '',
  colorButtonText: '',
  colorCounter: '',
  colorCardBorder: '',
  borderRadius: '',
};

export const theme = createThemeContract(themeVars);

const borderRadius = '12px';

export const lightTheme = createTheme(theme, {
  colorBackground: '#f8fafc',
  colorText: '#0f172a',
  colorMuted: '#64748b',
  colorButtonBackground: '#4f46e5',
  colorButtonText: '#ffffff',
  colorCounter: '#4f46e5',
  colorCardBorder: '#e2e8f0',
  borderRadius,
});

export const darkTheme = createTheme(theme, {
  colorBackground: '#0f172a',
  colorText: '#f1f5f9',
  colorMuted: '#94a3b8',
  colorButtonBackground: '#6366f1',
  colorButtonText: '#ffffff',
  colorCounter: '#a5b4fc',
  colorCardBorder: '#334155',
  borderRadius,
});
