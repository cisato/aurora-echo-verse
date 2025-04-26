
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      // This function is called when a new version is available
      console.log('New content is available, please refresh');
    },
    onOfflineReady() {
      // This function is called when the app is ready to work offline
      console.log('App is ready for offline use');
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
