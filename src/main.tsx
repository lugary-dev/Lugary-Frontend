import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext"; // <--- Importar esto

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider> {/* <--- Envolver AppRouter con ThemeProvider */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);