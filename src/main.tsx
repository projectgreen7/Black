import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// --- ATL
const allowedDomain = "trustwalletonline-831b.up.railway.app"; 

if (typeof window !== 'undefined' && window.location.hostname !== allowedDomain && window.location.hostname !== 'localhost') {
  document.documentElement.innerHTML = "<h1 style='color:red; text-align:center; margin-top:20vh; font-family:sans-serif;'>UNAUTHORIZED USAGE</h1>";
  throw new Error("Execution stopped.");
}

// Block save (
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
    e.preventDefault();
  }
});
// Block right-click
document.addEventListener('contextmenu', (e) => e.preventDefault());
// --- END LOCK ---

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
