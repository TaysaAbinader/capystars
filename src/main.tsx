import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { registerSW } from 'virtual:pwa-register';

// Automatically register and update the PWA service worker
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, reload to update.');
  },
  onOfflineReady() {
    console.log('App ready to work offline!');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
