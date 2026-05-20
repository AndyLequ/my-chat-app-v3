import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChatProvider } from "./context/ChatContext";
import { App } from "./App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </StrictMode>,
);
