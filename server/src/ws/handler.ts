import { WebSocketServer, WebSocket } from "ws";
import { db } from "../db";
import { messages } from "../db/schema";
import { eq } from "drizzle-orm";

interface ChatSocket extends WebSocket {
  currentRoom?: string;
  userName?: string;
  isAlive: boolean;
}

interface ChatMessage {
  type: "join-channel" | "chat" | "leave-channel" | "typing";
  name: string;
  channelId: number;
  serverId: number;
  text?: string;
  timestamp?: string;
}

//channels map uses ChannelId as key
const channels = new Map<number, Set<ChatSocket>>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (rawSocket: WebSocket) => {
    const socket = rawSocket as ChatSocket;
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    socket.on("message", async (raw) => {
      let msg: ChatMessage;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      switch (msg.type) {
        //update join-room -> join-channel
        case "join-channel": {
          if (socket.currentChannel) {
            channels.get(socket.currentChannel)?.delete(socket);
          }
          if (!channels.has(msg.channelId))
            channels.set(msg.channelId, new Set());
          channels.get(msg.channelId)!.add(socket);
          socket.currentChannel = msg.channelId;
          socket.currentServer = msg.serverId;
          socket.userName = msg.name;
        }

        case "chat": {
          if (!socket.currentRoom || !msg.text) return;

          // save to database
          const [saved] = await db
            .insert(messages)
            .values({
              name: msg.name,
              text: msg.text,
              room: socket.currentRoom,
            })
            .returning();

          broadcastToRoom(socket.currentRoom, {
            type: "chat",
            id: saved.id.toString(),
            name: saved.name,
            text: saved.text,
            room: saved.room,
            timestamp: saved.timestamp.toISOString(),
          });
          break;
        }

        case "leave-room": {
          if (socket.currentRoom) {
            rooms.get(socket.currentRoom)?.delete(socket);
            broadcastToRoom(socket.currentRoom, {
              type: "leave",
              name: msg.name,
              room: socket.currentRoom,
            });
            socket.currentRoom = undefined;
          }
          break;
        }
      }
    });

    socket.on("close", () => {
      if (socket.currentRoom) {
        rooms.get(socket.currentRoom)?.delete(socket);
        broadcastToRoom(socket.currentRoom, {
          type: "leave",
          name: socket.userName ?? "unknown",
          room: socket.currentRoom,
        });
      }
    });
  });

  // heartbeat
  setInterval(() => {
    wss.clients.forEach((rawSocket) => {
      const socket = rawSocket as ChatSocket;
      if (!socket.isAlive) {
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);
}

function broadcastToRoom(roomName: string, msg: object) {
  rooms.get(roomName)?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}
