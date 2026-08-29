import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: 'min(420px, 100%)',
  padding: '32px 40px',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
});

export const sectionTitle = style({
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
});

export const themeRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
});

export const fieldLabel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 14,
});

export const input = style({
  padding: '10px 12px',
  fontSize: 16,
  fontFamily: 'inherit',
  color: theme.colorText,
  background: 'transparent',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
});

export const checkboxRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
});

export const saveButton = style({
  alignSelf: 'flex-start',
  padding: '10px 20px',
  fontSize: 16,
  fontFamily: 'inherit',
  border: 'none',
  borderRadius: theme.borderRadius,
  background: theme.colorButtonBackground,
  color: theme.colorButtonText,
  cursor: 'pointer',
  ':hover': {
    opacity: 0.9,
  },
  ':disabled': {
    opacity: 0.6,
    cursor: 'default',
  },
});

export const statusText = style({
  margin: 0,
  fontSize: 14,
  color: theme.colorMuted,
});

export const errorStatus = style({
  margin: 0,
  fontSize: 14,
  color: theme.colorError,
});

export const errorText = style({
  margin: 0,
  fontSize: 13,
  color: theme.colorError,
});
