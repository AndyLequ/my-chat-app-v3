import { createContext, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import type { AppState, ActionType, ChatContextType } from "../types";

const initialState: AppState = {
  messages: [],
  name: "",
  text: "",
  connected: false,
  nameSet: false,
  currentRoom: "",
};

function reducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_TEXT":
      return { ...state, text: action.payload };
    case "SET_CONNECTED":
      return { ...state, connected: action.payload };
    case "SET_NAME_CONFIRMED":
      return { ...state, nameSet: true };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "CLEAR_TEXT":
      return { ...state, text: "" };
    case "SET_ROOM":
      return { ...state, currentRoom: action.payload };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };
    default:
      return state;
  }
}

export const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  return (
    <ChatContext.Provider value={{ ...state, dispatch, socketRef, bottomRef }}>
      {children}
    </ChatContext.Provider>
  );
}
