import { createContext, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import type { AppState, ActionType, ChatContextType } from "../types";

const initialState: AppState = {
  messages: [],
  members: [],
  name: "",
  text: "",
  connected: false,
  nameSet: false,
  currentServer: null,
  currentChannel: null,
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
    case "SET_SERVER":
      return { ...state, currentServer: action.payload };
    case "SET_CHANNEL":
      return { ...state, currentChannel: action.payload, messages: [] };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };
    case "SET_MEMBER_LIST":
      return { ...state, members: action.payload };
    case "ADD_MEMBER":
      if (state.members.find((m) => m.name === action.payload)) return state;
      return {
        ...state,
        members: [...state.members, { name: action.payload, online: true }],
      };
    case "REMOVE_MEMBER":
      return {
        ...state,
        members: state.members.filter((m) => m.name !== action.payload),
      };
    case "SET_MEMBER_ONLINE":
      return {
        ...state,
        members: state.members.map((m) =>
          m.name === action.payload ? { ...m, online: true } : m,
        ),
      };
    case "SET_MEMBER_OFFLINE":
      return {
        ...state,
        members: state.members.map((m) =>
          m.name === action.payload ? { ...m, online: false } : m,
        ),
      };
    case "SERVER_DELETED":
      return {
        ...state,
        currentServer:
          state.currentServer?.id === action.payload
            ? null
            : state.currentServer,
        currentChannel:
          state.currentServer?.id === action.payload
            ? null
            : state.currentChannel,
        messages:
          state.currentServer?.id === action.payload ? [] : state.messages,
        members:
          state.currentServer?.id === action.payload ? [] : state.members,
      };

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
