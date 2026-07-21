"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const handler_1 = require("../ws/handler");
const router = (0, express_1.Router)();
// get /api/servers - list all servers
router.get("/", async (req, res) => {
    const all = await db_1.db.select().from(schema_1.servers);
    res.json(all);
});
router.post("/", async (req, res) => {
    try {
        const { name, description } = req.body;
        // checking if a server with the same name already exists
        const existing = await db_1.db
            .select()
            .from(schema_1.servers)
            .where((0, drizzle_orm_1.eq)(schema_1.servers.name, name))
            .limit(1);
        if (existing.length > 0) {
            res
                .status(409)
                .json({ error: "A server with that name already exists." });
            return;
        }
        const [server] = await db_1.db
            .insert(schema_1.servers)
            .values({ name, description })
            .returning();
        await db_1.db.insert(schema_1.channels).values([
            { name: "general", serverId: server.id },
            { name: "random", serverId: server.id },
        ]);
        res.status(201).json(server);
    }
    catch (err) {
        const error = err;
        if (error.code === "23505") {
            return res.status(409).json({
                error: "A server with that name already exists.",
            });
        }
        console.error("Error creating server:", err);
        return res.status(500).json({ error: "Failed to create server." });
    }
});
router.get("/:id/channels", async (req, res) => {
    const serverId = parseInt(req.params.id);
    if (isNaN(serverId)) {
        res.status(400).json({ error: "Invalid server ID" });
        return;
    }
    const result = await db_1.db
        .select()
        .from(schema_1.channels)
        .where((0, drizzle_orm_1.eq)(schema_1.channels.serverId, serverId));
    res.json(result);
});
router.post("/:id/join", async (req, res) => {
    const serverId = parseInt(req.params.id);
    const { userName } = req.body;
    // check if this specific user is already a member
    const existing = await db_1.db
        .select()
        .from(schema_1.serverMembers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serverMembers.serverId, serverId), (0, drizzle_orm_1.eq)(schema_1.serverMembers.userName, userName)))
        .limit(1);
    if (existing.length > 0) {
        res.json(existing[0]); // already a member
        return;
    }
    const [member] = await db_1.db
        .insert(schema_1.serverMembers)
        .values({ serverId, userName })
        .returning();
    res.json(member);
});
router.get("/:id/members", async (req, res) => {
    const serverId = parseInt(req.params.id);
    if (isNaN(serverId)) {
        res.status(400).json({ error: "Invalid server ID" });
        return;
    }
    const results = await db_1.db
        .select()
        .from(schema_1.serverMembers)
        .where((0, drizzle_orm_1.eq)(schema_1.serverMembers.serverId, serverId));
    res.json(results);
});
router.delete("/:id", async (req, res) => {
    const serverId = parseInt(req.params.id);
    if (isNaN(serverId)) {
        res.status(400).json({ error: "Invalid server ID" });
        return;
    }
    // delete in order to respect foreign key constraints
    // messages -> channels -> serverMembers -> server
    const serverChannels = await db_1.db
        .select()
        .from(schema_1.channels)
        .where((0, drizzle_orm_1.eq)(schema_1.channels.serverId, serverId));
    const channelIds = serverChannels.map((c) => c.id);
    if (channelIds.length > 0) {
        await db_1.db.delete(schema_1.messages).where((0, drizzle_orm_1.inArray)(schema_1.messages.channelId, channelIds));
    }
    await db_1.db.delete(schema_1.channels).where((0, drizzle_orm_1.eq)(schema_1.channels.serverId, serverId));
    await db_1.db.delete(schema_1.serverMembers).where((0, drizzle_orm_1.eq)(schema_1.serverMembers.serverId, serverId));
    await db_1.db.delete(schema_1.servers).where((0, drizzle_orm_1.eq)(schema_1.servers.id, serverId));
    (0, handler_1.notifyServerDeleted)(serverId);
    res.status(200).json({ success: true });
});
exports.default = router;
