import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1️⃣ Import Tailwind first
import './App.css';  // Tailwind imports

// 2️⃣ Import minimal reset styles after
import './index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
