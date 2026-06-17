import serversRouter from "./routes/servers";
import userRouter from "./routes/users";

import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import "dotenv/config";
import { setupWebSocket } from "./ws/handler";
import messagesRouter from "./routes/messages";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// REST routes
app.use("/api/messages", messagesRouter);
app.use("/api/servers", serversRouter);
app.use("/api/users", userRouter);
// WebSocket
setupWebSocket(wss);

const PORT = process.env.PORT ?? 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
