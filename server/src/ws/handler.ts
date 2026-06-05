import { WebSocketServer, WebSocket } from "ws";
import { db } from "../db";
import { messages } from "../db/schema";
import { eq } from "drizzle-orm";

interface ChatSocket extends WebSocket {
  currentChannel?: number;
  currentServer?: number;
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

          //send existing members
          const existingMembers = [...channels.get(msg.channelId)!]
            .filter((s) => s !== socket && s.userName)
            .map((s) => s.userName!);
          socket.send(
            JSON.stringify({ type: "members", members: existingMembers }),
          );

          // send message history for this channel
          const history = await db
            .select()
            .from(messages)
            .where(eq(messages.channelId, msg.channelId))
            .orderBy(messages.timestamp)
            .limit(50);
          socket.send(JSON.stringify({ type: "history", messages: history }));

          broadcastToChannel(msg.channelId, { type: "join", name: msg.name });
          break;
        }

        case "chat": {
          if (!socket.currentChannel || !msg.text) return;

          // save to database
          const [saved] = await db
            .insert(messages)
            .values({
              name: msg.name,
              text: msg.text,
              channelId: socket.currentChannel,
            })
            .returning();

          broadcastToChannel(socket.currentChannel, {
            type: "chat",
            id: saved.id.toString(),
            name: saved.name,
            text: saved.text,
            channelId: saved.channelId,
            timestamp: saved.timestamp.toISOString(),
          });
          break;
        }

        case "leave-channel": {
          if (socket.currentChannel) {
            channels.get(socket.currentChannel)?.delete(socket);
            broadcastToChannel(socket.currentChannel, {
              type: "leave",
              name: msg.name,
              channelId: socket.currentChannel,
            });
            socket.currentChannel = undefined;
          }
          break;
        }
      }
    });

    socket.on("close", () => {
      if (socket.currentChannel) {
        channels.get(socket.currentChannel)?.delete(socket);
        broadcastToChannel(socket.currentChannel, {
          type: "leave",
          name: socket.userName ?? "unknown",
          channelId: socket.currentChannel,
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

function broadcastToChannel(channelId: number, msg: object) {
  channels.get(channelId)?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}
