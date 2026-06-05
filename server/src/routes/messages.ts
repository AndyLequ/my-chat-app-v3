import { Router } from "express";
import { db } from "../db";
import { messages } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/messages/:channelId — fetch message history
router.get("/:channelId", async (req, res) => {
  const channelId = parseInt(req.params.channelId);

  if (isNaN(channelId)) {
    res.status(400).json({ error: "Invalid channel ID" });
    return;
  }

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(messages.timestamp)
    .limit(50);
  res.json(history);
});

export default router;
