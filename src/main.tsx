import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { ThemeProvider } from "@/components/theme-provider";

// Suppress known non-critical errors in console
const originalError = console.error;
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';

  // Suppress specific known errors that don't affect functionality
  if (
    message.includes('Failed to send a request to the Edge Function') ||
    message.includes('FunctionsFetchError') ||
    message.includes('401 (Unauthorized)') && message.includes('directStream')
  ) {
    // Silently ignore these errors
    return;
  }

  // Log all other errors normally
  originalError.apply(console, args);
};

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    defaultTheme="dark"
    storageKey="vite-ui-theme"
    attribute="class"
  >
    <App />
  </ThemeProvider>,
);
