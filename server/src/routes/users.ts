import { Router } from "express";
import { db } from "../db";
import { servers, serverMembers } from "../db/schema";
import { eq, inArray } from "drizzle-orm";

const router = Router();

// GET /api/users/:userName/servers
router.get("/:userName/servers", async (req, res) => {
  const { userName } = req.params;
  const memberships = await db
    .select()
    .from(serverMembers)
    .where(eq(serverMembers.userName, userName));

  const serverIds = memberships.map((m) => m.serverId);
  if (serverIds.length === 0) {
    res.json([]);
    return;
  }

  const joined = await db
    .select()
    .from(servers)
    .where(inArray(servers.id, serverIds));

  res.json(joined);
});

export default router;
