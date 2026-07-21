"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;
// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
    }
    if (password.length < 6) {
        res
            .status(400)
            .json({ error: "Password must be at least 6 characters long" });
        return;
    }
    //   check if username already taken
    const existing = await db_1.db
        .select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.username, username))
        .limit(1);
    if (existing.length > 0) {
        res.status(409).json({ error: "Username already exists" });
        return;
    }
    const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
    const [user] = await db_1.db
        .insert(schema_1.users)
        .values({ username, passwordHash })
        .returning();
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: "7d",
    });
    res.status(201).json({ token, username: user.username });
});
// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const [user] = await db_1.db
        .select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.username, username))
        .limit(1);
    if (!user) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }
    const valid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: "7d",
    });
    res.json({ token, username: user.username });
});
// GET /api/auth/me - verify token and user info
router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "No token provided" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        res.json({ id: decoded.id, username: decoded.username });
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});
exports.default = router;
