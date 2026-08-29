import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
});

export const title = style({
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
});

export const link = style({
  fontSize: 16,
  color: theme.colorCounter,
  fontWeight: 600,
  textDecoration: 'none',
});