import { useEffect, useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { ChatMessage } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL as string;

export function useWebSocket() {
  const ctx = useContext(ChatContext)!;
  const { dispatch, socketRef } = ctx;

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.addEventListener("open", () => {
        dispatch({ type: "SET_CONNECTED", payload: true });
      });

      ws.addEventListener("close", () => {
        dispatch({ type: "SET_CONNECTED", payload: false });
        setTimeout(connect, 2000);
      });

      ws.addEventListener("message", (e: MessageEvent) => {
        const msg = JSON.parse(e.data) as ChatMessage & {
          messages?: ChatMessage[];
        };

        if (msg.type === "history" && msg.messages) {
          // load message history on room join
          dispatch({ type: "SET_MESSAGES", payload: msg.messages });
        } else if (msg.type === "chat") {
          dispatch({ type: "ADD_MESSAGE", payload: msg });
        } else if (msg.type === "join") {
          dispatch({
            type: "ADD_MESSAGE",
            payload: { type: "join", name: msg.name },
          });
        } else if (msg.type === "leave") {
          dispatch({
            type: "ADD_MESSAGE",
            payload: { type: "leave", name: msg.name },
          });
        }
      });
    }

    connect();
    return () => socketRef.current?.close();
  }, []);
}
