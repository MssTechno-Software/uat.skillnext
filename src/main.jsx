import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import App from "./App";
import { AccessibilityProvider } from "./accessibility/AccessibilityContext";
import "./index.css";
import "./accessibility/accessibility.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </BrowserRouter>
  </React.StrictMode>
);