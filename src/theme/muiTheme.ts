import { createTheme } from '@mui/material/styles';
import {
  COLOR_BG,
  COLOR_BG_RAISED,
  COLOR_INK,
  COLOR_INK_MUTED,
  COLOR_GAIN,
  COLOR_LOSS,
  FONT_BODY,
  FONT_DISPLAY,
} from './editorialTokens';

export const editorialTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: COLOR_BG, paper: COLOR_BG_RAISED },
    text: { primary: COLOR_INK, secondary: COLOR_INK_MUTED },
    success: { main: COLOR_GAIN },
    error: { main: COLOR_LOSS },
    primary: { main: COLOR_INK },
  },
  typography: {
    fontFamily: FONT_BODY,
    h1: { fontFamily: FONT_DISPLAY, fontWeight: 400, letterSpacing: '-0.02em' },
    h2: { fontFamily: FONT_DISPLAY, fontWeight: 400, letterSpacing: '-0.02em' },
    h3: { fontFamily: FONT_DISPLAY, fontWeight: 400, letterSpacing: '-0.01em' },
    h4: { fontFamily: FONT_DISPLAY, fontWeight: 400 },
    h5: { fontFamily: FONT_DISPLAY, fontWeight: 500 },
    h6: { fontFamily: FONT_DISPLAY, fontWeight: 500 },
    body1: { fontFamily: FONT_BODY },
    body2: { fontFamily: FONT_BODY },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 4 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});
