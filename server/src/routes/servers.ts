import { Router } from "express";
import { db } from "../db";
import { servers, channels, serverMembers, messages } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { notifyServerDeleted } from "../ws/handler";

const router = Router();

// get /api/servers - list all servers
router.get("/", async (req, res) => {
  const all = await db.select().from(servers);
  res.json(all);
});

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    // checking if a server with the same name already exists
    const existing = await db
      .select()
      .from(servers)
      .where(eq(servers.name, name))
      .limit(1);

    if (existing.length > 0) {
      res
        .status(409)
        .json({ error: "A server with that name already exists." });
      return;
    }

    const [server] = await db
      .insert(servers)
      .values({ name, description })
      .returning();

    await db.insert(channels).values([
      { name: "general", serverId: server.id },
      { name: "random", serverId: server.id },
    ]);

    res.status(201).json(server);
  } catch (err) {
    const error = err as { code?: string };

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

  const result = await db
    .select()
    .from(channels)
    .where(eq(channels.serverId, serverId));
  res.json(result);
});

router.post("/:id/join", async (req, res) => {
  const serverId = parseInt(req.params.id);
  const { userName } = req.body;

  // check if this specific user is already a member
  const existing = await db
    .select()
    .from(serverMembers)
    .where(
      eq(serverMembers.serverId, serverId) &&
        eq(serverMembers.userName, userName),
    )
    .limit(1);

  if (existing.length > 0) {
    res.json(existing[0]); // already a member
    return;
  }

  const [member] = await db
    .insert(serverMembers)
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

  const results = await db
    .select()
    .from(serverMembers)
    .where(eq(serverMembers.serverId, serverId));
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
  const serverChannels = await db
    .select()
    .from(channels)
    .where(eq(channels.serverId, serverId));

  const channelIds = serverChannels.map((c) => c.id);

  if (channelIds.length > 0) {
    await db.delete(messages).where(inArray(messages.channelId, channelIds));
  }

  await db.delete(channels).where(eq(channels.serverId, serverId));

  await db.delete(serverMembers).where(eq(serverMembers.serverId, serverId));

  await db.delete(servers).where(eq(servers.id, serverId));

  notifyServerDeleted(serverId);

  res.status(200).json({ success: true });
});

export default router;
