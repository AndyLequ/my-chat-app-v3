"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /api/messages/:channelId — fetch message history
router.get("/:channelId", async (req, res) => {
    const channelId = parseInt(req.params.channelId);
    if (isNaN(channelId)) {
        res.status(400).json({ error: "Invalid channel ID" });
        return;
    }
    const history = await db_1.db
        .select()
        .from(schema_1.messages)
        .where((0, drizzle_orm_1.eq)(schema_1.messages.channelId, channelId))
        .orderBy(schema_1.messages.timestamp)
        .limit(50);
    res.json(history);
});
exports.default = router;
