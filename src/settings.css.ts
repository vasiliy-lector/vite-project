import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

export const box = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  maxWidth: 480,
  padding: '24px 32px',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
});

export const heading = style({
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
});

export const heading2 = style({
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
});

export const fieldStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const input = style({
  padding: '8px 12px',
  fontSize: 16,
  fontFamily: 'inherit',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
  background: 'transparent',
  color: theme.colorText,
});

export const error = style({
  fontSize: 14,
  color: '#ef4444',
});

export const button = style({
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
});

export const saved = style({
  margin: 0,
  fontSize: 14,
  color: theme.colorMuted,
});