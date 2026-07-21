"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.notifyServerDeleted = notifyServerDeleted;
const ws_1 = require("ws");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
//channels map uses ChannelId as key
const channels = new Map();
const serverPresence = new Map(); // presence for user in server
function setupWebSocket(wss) {
    wss.on("connection", (rawSocket) => {
        const socket = rawSocket;
        socket.isAlive = true;
        socket.on("pong", () => {
            socket.isAlive = true;
        });
        socket.on("message", async (raw) => {
            let msg;
            try {
                msg = JSON.parse(raw.toString());
            }
            catch {
                return;
            }
            switch (msg.type) {
                // called when user selects a server
                case "join-server": {
                    if (!msg.serverId)
                        return;
                    // leave previous server presence if switching
                    if (socket.currentServer && socket.currentServer !== msg.serverId) {
                        serverPresence.get(socket.currentServer)?.delete(socket);
                        broadcastToServer(socket.currentServer, {
                            type: "server-member-left",
                            name: socket.userName,
                        });
                    }
                    if (!serverPresence.has(msg.serverId)) {
                        serverPresence.set(msg.serverId, new Set());
                    }
                    serverPresence.get(msg.serverId).add(socket);
                    socket.currentServer = msg.serverId;
                    socket.userName = msg.name;
                    // fetch ALL members from database
                    const allMembers = await db_1.db
                        .select()
                        .from(schema_1.serverMembers)
                        .where((0, drizzle_orm_1.eq)(schema_1.serverMembers.serverId, msg.serverId));
                    // get who is currently online
                    const onlineNames = new Set([...serverPresence.get(msg.serverId)]
                        .map((s) => s.userName)
                        .filter(Boolean));
                    // send combined list with online status
                    const memberList = allMembers.map((m) => ({
                        name: m.userName,
                        online: onlineNames.has(m.userName),
                    }));
                    socket.send(JSON.stringify({
                        type: "server-members",
                        members: memberList,
                    }));
                    // tell others this user came online
                    broadcastToServerExcludingSender(socket, msg.serverId, {
                        type: "server-member-joined",
                        name: msg.name,
                    });
                    break;
                }
                //update join-room -> join-channel
                case "join-channel": {
                    if (!msg.channelId)
                        return;
                    // leave old channel
                    if (socket.currentChannel) {
                        channels.get(socket.currentChannel)?.delete(socket);
                    }
                    if (!channels.has(msg.channelId))
                        channels.set(msg.channelId, new Set());
                    channels.get(msg.channelId).add(socket);
                    socket.currentChannel = msg.channelId;
                    socket.userName = msg.name;
                    // send message history only - members come from server presence now
                    const history = await db_1.db
                        .select()
                        .from(schema_1.messages)
                        .where((0, drizzle_orm_1.eq)(schema_1.messages.channelId, msg.channelId))
                        .orderBy(schema_1.messages.timestamp)
                        .limit(50);
                    socket.send(JSON.stringify({ type: "history", messages: history }));
                    broadcastToChannel(msg.channelId, { type: "join", name: msg.name });
                    break;
                }
                case "chat": {
                    if (!socket.currentChannel || !msg.text)
                        return;
                    // save to database
                    const [saved] = await db_1.db
                        .insert(schema_1.messages)
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
                    if (socket.currentServer) {
                        serverPresence.get(socket.currentServer)?.delete(socket);
                        broadcastToServer(socket.currentServer, {
                            type: "server-member-offline",
                            name: socket.userName,
                        });
                        socket.currentServer = undefined;
                    }
                    break;
                }
                case "remove-member": {
                    if (!msg.serverId)
                        return;
                    // remove member from DB
                    await db_1.db
                        .delete(schema_1.serverMembers)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serverMembers.serverId, msg.serverId), (0, drizzle_orm_1.eq)(schema_1.serverMembers.userName, msg.name)));
                    // remove from presence
                    serverPresence.get(msg.serverId)?.delete(socket);
                    // tell everyone this person left the server
                    broadcastToServer(msg.serverId, {
                        type: "server-member-removed",
                        name: msg.name,
                    });
                    socket.currentServer = undefined;
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
            if (socket.currentServer) {
                serverPresence.get(socket.currentServer)?.delete(socket);
                broadcastToServer(socket.currentServer, {
                    type: "server-member-offline",
                    name: socket.userName ?? "unknown",
                });
            }
        });
    });
    // heartbeat
    setInterval(() => {
        wss.clients.forEach((rawSocket) => {
            const socket = rawSocket;
            if (!socket.isAlive) {
                socket.terminate();
                return;
            }
            socket.isAlive = false;
            socket.ping();
        });
    }, 30000);
}
// create helper for notifying users when server is deleted, export this so routes can call it
function notifyServerDeleted(serverId) {
    serverPresence.get(serverId)?.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "server-deleted", serverId }));
        }
    });
    serverPresence.delete(serverId);
}
function broadcastToChannel(channelId, msg) {
    channels.get(channelId)?.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}
function broadcastToServer(serverId, msg) {
    serverPresence.get(serverId)?.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}
function broadcastToServerExcludingSender(sender, serverId, msg) {
    serverPresence.get(serverId)?.forEach((client) => {
        if (client !== sender && sender && client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}
