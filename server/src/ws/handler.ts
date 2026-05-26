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
  type: "join-room" | "chat" | "leave-room" | "typing";
  name: string;
  room: string;
  text?: string;
  timestamp?: string;
}

const rooms = new Map<string, Set<ChatSocket>>();

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
        case "join-room": {
          if (socket.currentRoom) {
            rooms.get(socket.currentRoom)?.delete(socket);
          }
          if (!rooms.has(msg.room)) rooms.set(msg.room, new Set());
          rooms.get(msg.room)!.add(socket);
          socket.currentRoom = msg.room;
          socket.userName = msg.name;

          // send exiting members to the new joiner
          const existingMembers = [...rooms.get(msg.room)!]
            .filter((s) => s !== socket && s.userName)
            .map((s) => s.userName!);

          socket.send();

          // send last 50 messages from DB on join
          const history = await db
            .select()
            .from(messages)
            .where(eq(messages.room, msg.room))
            .orderBy(messages.timestamp)
            .limit(50);

          socket.send(JSON.stringify({ type: "history", messages: history }));

          broadcastToRoom(msg.room, {
            type: "join",
            name: msg.name,
            room: msg.room,
          });
          break;
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
