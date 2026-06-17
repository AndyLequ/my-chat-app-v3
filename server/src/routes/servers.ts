import { Router } from "express";
import { db } from "../db";
import { servers, channels, serverMembers } from "../db/schema";
import { eq, inArray } from "drizzle-orm";

const router = Router();

// get /api/servers - list all servers
router.get("/", async (req, res) => {
  const all = await db.select().from(servers);
  res.json(all);
});

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
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
  const result = await db
    .select()
    .from(channels)
    .where(eq(channels.serverId, serverId));
  res.json(result);
});

router.post("/:id/join", async (req, res) => {
  const serverId = parseInt(req.params.id);
  const { userName } = req.body;
  const [member] = await db
    .insert(serverMembers)
    .values({ serverId, userName })
    .returning();
  res.json(member);
});

router.get("/:id/members", async (req, res) => {
  const serverId = parseInt(req.params.id);
  const results = await db
    .select()
    .from(serverMembers)
    .where(eq(serverMembers.serverId, serverId));
  res.json(results);
});

export default router;
