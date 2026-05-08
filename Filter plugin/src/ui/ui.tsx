import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing root element for UI mount.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
