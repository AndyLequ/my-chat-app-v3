"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /api/users/:userName/servers
router.get("/:userName/servers", async (req, res) => {
    const { userName } = req.params;
    const memberships = await db_1.db
        .select()
        .from(schema_1.serverMembers)
        .where((0, drizzle_orm_1.eq)(schema_1.serverMembers.userName, userName));
    const serverIds = memberships.map((m) => m.serverId);
    if (serverIds.length === 0) {
        res.json([]);
        return;
    }
    const joined = await db_1.db
        .select()
        .from(schema_1.servers)
        .where((0, drizzle_orm_1.inArray)(schema_1.servers.id, serverIds));
    res.json(joined);
});
exports.default = router;
