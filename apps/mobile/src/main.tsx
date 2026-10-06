import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const base = import.meta.env.BASE_URL; // '/' locally, '/dupont-mobile/' on GitHub Pages
  window.addEventListener('load', () => navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {}));
}
