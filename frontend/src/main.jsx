import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/toast.css";
import App from "./App.jsx";
import { initFCM } from "./utils/initFCM";

// Initialize FCM at app startup (registers SW and sets up foreground listener)
initFCM();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
