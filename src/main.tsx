import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initPixel } from './utils/pixel';

const pixelId = import.meta.env.VITE_FB_PIXEL_ID;
if (pixelId) {
  initPixel(pixelId);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
