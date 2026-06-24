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
  type:
    | "join-channel"
    | "chat"
    | "leave-channel"
    | "typing"
    | "join-server"
    | "leave-server";
  name: string;
  channelId: number;
  serverId: number;
  text?: string;
  timestamp?: string;
}

//channels map uses ChannelId as key
const channels = new Map<number, Set<ChatSocket>>();
const serverPresence = new Map<number, Set<ChatSocket>>(); // presence for user in server

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
        // called when user selects a server
        case "join-server": {
          if (!msg.serverId) return;

          // leave previous server presence if switching
          if (socket.currentServer && socket.currentServer !== msg.serverId) {
            serverPresence.get(socket.currentServer)?.delete(socket);
            broadcastToServer(socket.currentServer, {
              type: "server-member-left",
              name: socket.userName,
            });
          }

          if(!serverPresence.has(msg.serverId)){
            serverPresence.set(msg.serverId, new Set());
          }
          serverPresence.get(msg.serverId)!.add(socket);
          socket.currentServer = msg.serverId;
          socket.userName = msg.name;

          // send current online members of this server to the joining user
          const onlineMembers = [...serverPresence.get(msg.serverId)!]
            .filter(s => s !=== socket && s.userName)
            .map(s => s.userName!);

          socket.send(JSON.stringify({
            type: 'server-members',
            members: onlineMembers,
          }));

          // tell everyone else in the server this user came online
          broadcastToServerExcludingSender(socket, msg.serverId, {
            type: 'server-member-joined',
            name: msg.name,
          });
          break;
        }

        //update join-room -> join-channel
        case "join-channel": {
          if(!msg.channelId) return;

          // leave old channel
          if (socket.currentChannel) {
            channels.get(socket.currentChannel)?.delete(socket);
          }

          if (!channels.has(msg.channelId))
            channels.set(msg.channelId, new Set());
          channels.get(msg.channelId)!.add(socket);
          socket.currentChannel = msg.channelId;
          socket.userName = msg.name;

          // send message history only - members come from server presence now
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


        case "leave-server": {
          if(socket.currentServer){
            serverPresence.get(socket.currentServer)?.delete(socket);
            broadcastToServer(socket.currentServer, {
              type: 'server-member-left',
              name: socket.userName,
            });
            socket.currentServer = undefined;
          }
          break;
        }
      }
    });


    socket.on("close", () => {
      //clean up channel presence
      if (socket.currentChannel) {
        channels.get(socket.currentChannel)?.delete(socket);
        broadcastToChannel(socket.currentChannel, {
          type: "leave",
          name: socket.userName ?? "unknown",
          channelId: socket.currentChannel,
        });
      }
      // clean up server presence
      if(socket.currentServer){
        serverPresence.get(socket.currentServer)?.delete(socket);
        broadcastToServer(socket.currentServer, {
          type: 'server-member-left',
          name: socket.userName ?? 'unknown',
        })
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


function broadcastToServer(serverId: number, msg: object){
  serverPresence.get(serverId)?.forEach((client) => {
    if(client.readyState === WebSocket.OPEN){
      client.send(JSON.stringify(msg));
    }
  });
}

function broadcastToServerExcludingSender(sender: ChatSocket, serverId: number, msg: object) {
  serverPresence.get(serverId)?.forEach((client) => {
    if(client !== sender && sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  })
}