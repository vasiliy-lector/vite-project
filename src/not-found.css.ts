import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

// 404 рендерится вне layout, поэтому фон задаёт сама страница
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

export const code = style({
  margin: 0,
  fontSize: 64,
  fontWeight: 700,
  lineHeight: 1,
  color: theme.colorCounter,
});

export const title = style({
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
});

export const backLink = style({
  color: theme.colorButtonBackground,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});
