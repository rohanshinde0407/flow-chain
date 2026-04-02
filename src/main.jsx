import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("FlowChain: main.jsx loaded");
const rootElement = document.getElementById('root');
console.log("FlowChain: root element:", rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("FlowChain: render called");
} else {
  console.error("FlowChain: root element NOT FOUND");
}
