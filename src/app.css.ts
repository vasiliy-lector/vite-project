import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

export const app = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 32,
  minHeight: '100vh',
  background: theme.colorBackground,
  color: theme.colorText,
});

export const themeToggle = style({
  padding: '8px 16px',
  fontSize: 14,
  fontFamily: 'inherit',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
  background: 'transparent',
  color: theme.colorMuted,
  cursor: 'pointer',
  ':hover': {
    color: theme.colorText,
  },
});
