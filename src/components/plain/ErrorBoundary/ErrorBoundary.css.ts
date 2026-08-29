import { style } from '@vanilla-extract/css';
import { theme } from '@/components/shared/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  minHeight: '100vh',
  padding: '40px 48px',
  textAlign: 'center',
  background: theme.colorBackground,
  color: theme.colorText,
});

export const title = style({
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
});

export const message = style({
  margin: 0,
  fontSize: 14,
  color: theme.colorError,
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
