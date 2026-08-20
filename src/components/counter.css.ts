import { style } from '@vanilla-extract/css';
import { theme } from '../styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
  padding: '40px 48px',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
});

export const title = style({
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
});

export const value = style({
  fontSize: 56,
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
  color: theme.colorCounter,
});

export const controls = style({
  display: 'flex',
  gap: 12,
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
  ':active': {
    transform: 'translateY(1px)',
  },
});
