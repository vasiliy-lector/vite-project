import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

export const app = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: theme.colorBackground,
  color: theme.colorText,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 24px',
  borderBottom: `1px solid ${theme.colorCardBorder}`,
});

export const nav = style({
  display: 'flex',
  gap: 16,
});

export const navLink = style({
  fontSize: 14,
  color: theme.colorMuted,
  textDecoration: 'none',
});

export const navLinkActive = style({
  fontSize: 14,
  color: theme.colorText,
  fontWeight: 600,
  textDecoration: 'none',
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

export const main = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 32,
});