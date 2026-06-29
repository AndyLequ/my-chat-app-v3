import type { Dispatch, RefObject } from "react";

export interface ChatContextType extends AppState {
  dispatch: Dispatch<ActionType>;
  socketRef: RefObject<WebSocket | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export interface Server {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Channel {
  id: number;
  name: string;
  serverId: number;
}

export interface ChatMessage {
  id?: string;
  type:
    | "chat"
    | "join"
    | "leave"
    | "history"
    | "members"
    | "server-members"
    | "server-member-joined"
    | "server-member-left"
    | "server-deleted";
  name: string;
  text?: string;
  room?: string;
  channelId?: number;
  serverId?: number;
  timestamp?: string;
  members?: string[];
  messages?: ChatMessage[];
}
export interface AppState {
  messages: ChatMessage[];
  members: string[];
  name: string;
  text: string;
  connected: boolean;
  nameSet: boolean;
  currentServer: Server | null;
  currentChannel: Channel | null;
}

export type ActionType =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_TEXT"; payload: string }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_NAME_CONFIRMED" }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "CLEAR_TEXT" }
  | { type: "SET_SERVER"; payload: Server | null }
  | { type: "SET_CHANNEL"; payload: Channel | null }
  | { type: "CLEAR_MESSAGES" }
  | { type: "SET_MEMBER_LIST"; payload: string[] }
  | { type: "ADD_MEMBER"; payload: string }
  | { type: "REMOVE_MEMBER"; payload: string }
  | { type: "SERVER_DELETED"; payload: number };

export interface ChatContextType extends AppState {
  dispatch: React.Dispatch<ActionType>;
  socketRef: React.RefObject<WebSocket | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}
