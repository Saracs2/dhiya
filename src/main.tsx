import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LangProvider } from './i18n/LangProvider';
import { SimulationProvider } from './state/SimulationProvider';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <SimulationProvider>
        <App />
      </SimulationProvider>
    </LangProvider>
  </StrictMode>,
);
