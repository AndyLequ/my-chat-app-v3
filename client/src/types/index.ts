export interface ChatMessage {
  id?: string;
  type: "chat" | "join" | "leave" | "history";
  name: string;
  text?: string;
  room?: string;
  timestamp?: string;
}

export interface AppState {
  messages: ChatMessage[];
  name: string;
  text: string;
  connected: boolean;
  nameSet: boolean;
  currentRoom: string;
}
