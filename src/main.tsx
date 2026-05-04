import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { editorialTheme } from './theme/muiTheme';
import { I18nProvider } from './i18n/I18nProvider';
import { SidebarProvider } from './contexts/SidebarContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={editorialTheme}>
      <CssBaseline />
      <I18nProvider>
        <SidebarProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SidebarProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
