import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App.tsx'
import './index.css'

// Polyfill para Buffer - ensure it's available globally
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

// Ensure process is defined
if (typeof globalThis.process === 'undefined') {
  globalThis.process = { env: {} } as any;
}

createRoot(document.getElementById("root")!).render(<App />);
