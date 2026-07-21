"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const servers_1 = __importDefault(require("./routes/servers"));
const users_1 = __importDefault(require("./routes/users"));
const auth_1 = __importDefault(require("./routes/auth"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const handler_1 = require("./ws/handler");
const messages_1 = __importDefault(require("./routes/messages"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// REST routes
app.use("/api/messages", messages_1.default);
app.use("/api/servers", servers_1.default);
app.use("/api/users", users_1.default);
app.use("/api/auth", auth_1.default);
// WebSocket
(0, handler_1.setupWebSocket)(wss);
const PORT = process.env.PORT ?? 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
