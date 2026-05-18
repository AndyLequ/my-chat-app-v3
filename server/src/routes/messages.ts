import { Router } from "express";
import { db } from "../db";
import { messages } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/messages/:room — fetch message history
router.get("/:room", async (req, res) => {
  const { room } = req.params;
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.room, room))
    .orderBy(messages.timestamp)
    .limit(50);
  res.json(history);
});

export default router;
