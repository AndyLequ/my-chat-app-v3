import { useEffect, useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import type { ChatMessage } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL as string;

export function useWebSocket() {
  const ctx = useContext(ChatContext)!;
  const { dispatch, socketRef } = ctx;

  useEffect(() => {
    let mounted = true;
    let reconnectTimer: number | undefined;

    function connect() {
      if (!mounted) return;

      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.addEventListener("open", () => {
        if (!mounted) return;
        dispatch({ type: "SET_CONNECTED", payload: true });
      });

      ws.addEventListener("close", () => {
        if (!mounted) return;
        dispatch({ type: "SET_CONNECTED", payload: false });
        if (reconnectTimer) window.clearTimeout(reconnectTimer);
        reconnectTimer = window.setTimeout(() => {
          if (mounted) connect();
        }, 2000);
      });

      ws.addEventListener("message", (e: MessageEvent) => {
        const msg = JSON.parse(e.data) as ChatMessage;

        switch (msg.type) {
          case "history":
            dispatch({ type: "SET_MESSAGES", payload: msg.messages ?? [] });
            break;

          case "server-members":
            // replace member list with current server online members
            dispatch({ type: "SET_MEMBER_LIST", payload: msg.members ?? [] });
            break;

          case "server-member-online":
            dispatch({ type: "SET_MEMBER_ONLINE", payload: msg.name });
            break;

          case "server-member-offline":
            dispatch({ type: "SET_MEMBER_OFFLINE", payload: msg.name });
            break;

          case "server-member-removed":
            dispatch({ type: "REMOVE_MEMBER", payload: msg.name });
            break;

          case "server-member-joined":
            // someone came online in this server
            dispatch({ type: "ADD_MEMBER", payload: msg.name });
            break;

          case "server-member-left":
            // someone went offline in this server
            dispatch({ type: "REMOVE_MEMBER", payload: msg.name });
            break;

          case "chat":
            dispatch({ type: "ADD_MESSAGE", payload: msg });
            break;

          case "join":
            dispatch({
              type: "ADD_MESSAGE",
              payload: { type: "join", name: msg.name },
            });
            break;

          case "leave":
            dispatch({
              type: "ADD_MESSAGE",
              payload: { type: "leave", name: msg.name },
            });
            break;

          case "server-deleted":
            dispatch({ type: "SERVER_DELETED", payload: msg.serverId! });
            break;
        }
      });
    }

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [dispatch, socketRef]);
}
