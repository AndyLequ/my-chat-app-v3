import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { App } from "./App";
import { AuthScreen } from "./components/AuthScreen";
import "./styles/index.css";

function Root() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <AuthScreen />;

  return (
    <ChatProvider>
      <App />
    </ChatProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
);
