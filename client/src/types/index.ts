import type { Dispatch, RefObject } from "react";

export interface ChatContextType extends AppState {
  dispatch: Dispatch<ActionType>;
  socketRef: RefObject<WebSocket | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export interface ChatMessage {
  id?: string;
  type: "chat" | "join" | "leave" | "history";
  name: string;
  text?: string;
  room?: string;
  timestamp?: string;
}

export type ActionType =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_TEXT"; payload: string }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_NAME_CONFIRMED" }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "CLEAR_TEXT" }
  | { type: "SET_ROOM"; payload: string }
  | { type: "CLEAR_MESSAGES" };

export interface AppState {
  messages: ChatMessage[];
  name: string;
  text: string;
  connected: boolean;
  nameSet: boolean;
  currentRoom: string;
}

export interface ChatContextType extends AppState {
  dispatch: React.Dispatch<ActionType>;
  socketRef: React.RefObject<WebSocket | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}
